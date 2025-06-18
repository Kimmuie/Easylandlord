import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../components/firebase';

const SortableImageGallery = ({ currentUpload, uploadQueue, isEditing }) => {
  const { currentUser } = useAuth();
  const { rentalId } = useParams();
  const [images, setImages] = useState(Array(20).fill(""));
  const [coverImage, setCoverImage] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [rental, setRental] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Store the latest images state in a ref to avoid stale closure issues
  const latestImagesRef = useRef(images);
  const latestCoverImageRef = useRef(coverImage);

  // Update refs whenever state changes
  useEffect(() => {
    latestImagesRef.current = images;
  }, [images]);

  useEffect(() => {
    latestCoverImageRef.current = coverImage;
  }, [coverImage]);

  // Modified save effect with better conditions
useEffect(() => {
  if (isInitialized && isEditing === false && hasUnsavedChanges && isMountedRef.current) {
    const timeoutId = setTimeout(async () => {
      if (isMountedRef.current) {
        try {
          await saveAllImages(latestImagesRef.current);
          if (latestCoverImageRef.current) {
            await saveCoverImage();
          }
          setHasUnsavedChanges(false); // Set after everything is saved
        } catch (error) {
          console.error("Failed to save data:", error);
        }
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }
}, [isEditing, isInitialized, hasUnsavedChanges]);



  const handlePinBackground = (index) => {
    setCoverImage(images[index]);
    setHasUnsavedChanges(true);
  };

  const saveCoverImage = async () => {
    if (currentUser) {
      try {
        const userDocRef = doc(db, "users", currentUser.email);
        const docSnap = await getDoc(userDocRef);
  
        if (docSnap.exists()) {
          const userData = docSnap.data();
  
          if (userData.rental) {
            const updatedRentals = userData.rental.map(r =>
              r.id === rentalId ? { ...r, 
              coverRental: coverImage,
            } : r
            );
            await updateDoc(userDocRef, {
              rental: updatedRentals 
            });
          
            setRental(prevRental => ({
              ...prevRental,
              coverRental: coverImage,
            }));
          
            console.log("Cover image saved successfully");
          }
        }
      } catch (error) {
        console.error("Error updating rental cover:", error);
      }
    }
  }

  // FIXED: Handle multiple uploads by batch processing
  const handleMultipleUploads = (urls) => {
    if (!Array.isArray(urls) || urls.length === 0) return;

    setImages(prevImages => {
      const newImages = [...prevImages];
      let emptySlotIndex = 0;
      
      urls.forEach(url => {
        const actualUrl = typeof url === "object" && url.url ? url.url : url;
        if (!actualUrl) return;
        
        // Find next empty slot starting from current position
        while (emptySlotIndex < newImages.length && newImages[emptySlotIndex] !== "") {
          emptySlotIndex++;
        }
        
        if (emptySlotIndex < newImages.length) {
          newImages[emptySlotIndex] = actualUrl;
          emptySlotIndex++; // Move to next slot for next image
        }
      });
      
      return newImages;
    });
    setHasUnsavedChanges(true);
  };

  // Handle single upload - add to first empty slot
  const handleUploadToFirstEmptySlot = (uploadUrl) => {
    if (!uploadUrl) return;

    const url = typeof uploadUrl === "object" && uploadUrl.url ? uploadUrl.url : uploadUrl;
    const emptyIndex = images.findIndex(img => img === "");
    if (emptyIndex !== -1) {
      const newImages = [...images];
      newImages[emptyIndex] = url;
      setImages(newImages);
      setHasUnsavedChanges(true);
    }
  };

  // Save all images to Firebase
  const saveAllImages = async (imageArray) => {
    if (!currentUser || !isMountedRef.current) return;
    
    console.log("Saving images array:", imageArray);
    
    try {
      const userDocRef = doc(db, "users", currentUser.email);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists() && isMountedRef.current) {
        const userData = docSnap.data();
        
        if (userData.rental) {
          const updatedRentals = userData.rental.map(r => {
            if (r.id === rentalId) {
              const updatedRental = { ...r };
              
              // Clear all existing rental images first
              for (let i = 0; i < 20; i++) {
                updatedRental[`rentalImage${i}`] = "";
              }
              
              // Save images in their new positions
              imageArray.forEach((img, index) => {
                updatedRental[`rentalImage${index}`] = img || "";
              });
              
              console.log("Updated rental object:", updatedRental);
              return updatedRental;
            }
            return r;
          });
          
          if (isMountedRef.current) {
            await updateDoc(userDocRef, {
              rental: updatedRentals
            });
            console.log('All images saved successfully with new positions');
          }
        }
      }
    } catch (error) {
      console.error("Error saving images:", error);
    }
  };

  // Fetch existing images on component mount
  useEffect(() => {
    const fetchImages = async () => {
      if (!currentUser) return;

      try {
        const userDocRef = doc(db, "users", currentUser.email);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists() && isMountedRef.current) {
          const userData = docSnap.data();
          const rentalData = userData.rental?.find(r => r.id === rentalId);

          if (rentalData) {
            setCoverImage(rentalData.coverRental || "");
            const imageArray = Array(20).fill("");
            
            for (let i = 0; i < 20; i++) {
              const key = `rentalImage${i}`;
              if (rentalData[key]) {
                imageArray[i] = rentalData[key];
              }
            }
            
            if (isMountedRef.current) {
              setImages(imageArray);
              setIsInitialized(true);
              console.log("Loaded images from Firebase:", imageArray);
            }
          } else if (isMountedRef.current) {
            setIsInitialized(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch images:", error);
        if (isMountedRef.current) {
          setIsInitialized(true);
        }
      }
    };
    
    fetchImages();
  }, [currentUser, rentalId]);

  // FIXED: Better upload queue processing
  const processedUploadsRef = useRef(new Set());
  const lastUploadQueueLengthRef = useRef(0);

  useEffect(() => {
    if (Array.isArray(uploadQueue) && isInitialized) {
      // Check if new items were added to the queue
      if (uploadQueue.length > lastUploadQueueLengthRef.current) {
        const newUploads = uploadQueue.slice(lastUploadQueueLengthRef.current);
        const validNewUploads = [];
        
        newUploads.forEach((item) => {
          const url = typeof item === "string" ? item : item?.url;
          if (url && !processedUploadsRef.current.has(url)) {
            processedUploadsRef.current.add(url);
            validNewUploads.push(url);
          }
        });
        
        if (validNewUploads.length > 0) {
          console.log(`Processing ${validNewUploads.length} new uploads:`, validNewUploads);
          if (validNewUploads.length === 1) {
            handleUploadToFirstEmptySlot(validNewUploads[0]);
          } else {
            handleMultipleUploads(validNewUploads);
          }
        }
      }
      
      lastUploadQueueLengthRef.current = uploadQueue.length;
    }
  }, [uploadQueue, isInitialized]);

  // Delete image
  const handleDelete = (index) => {
    const newImages = [...images];
    newImages[index] = "";
    setImages(newImages);
    setHasUnsavedChanges(true);
  };

  // FIXED: Improved drag and drop handlers
  const handleDragStart = (e, index) => {
    if (!isEditing || !images[index]) return; // Prevent dragging empty slots
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e) => {
    if (!isEditing) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    if (!isEditing) return;
    e.preventDefault();
    
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (dragIndex === dropIndex || draggedIndex === null) {
      setDraggedIndex(null);
      return;
    }
    
    console.log(`Moving image from position ${dragIndex} to position ${dropIndex}`);
    
    const newImages = [...images];
    const draggedImage = newImages[dragIndex];
    const droppedImage = newImages[dropIndex];
    
    // Swap the images
    newImages[dragIndex] = droppedImage;
    newImages[dropIndex] = draggedImage;
    
    console.log("New images order:", newImages);
    
    setImages(newImages);
    setDraggedIndex(null);
    setHasUnsavedChanges(true);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  useEffect(() => {
    if (isEditing) {
      setShowAll(true)
    } else {
      setShowAll(false)
    }
  }, [isEditing]);

  // Get images to display - filter out empty images when not editing
  const nonEmptyImages = images.filter(img => img && img !== "");
  const displayImages = showAll 
    ? (isEditing ? images : nonEmptyImages) 
    : images.slice(0, 2);
  const hasMoreImages = nonEmptyImages.length > 2;

  return (
    <div className="lg:w-4xl md:w-full">      
      {/* Image Grid Container */}
      <div className="relative">
        {/* Image Grid */}
        <div className={`grid gap-4 ${showAll ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-2' : 'grid-cols-2 md:grid-cols-2 lg:grid-cols-2'}`}>
          {displayImages.map((image, index) => {
            const actualIndex = showAll ? (isEditing ? index : images.findIndex(img => img === image)) : index;
            const hasImage = image && image !== "";
            return (
              <div
                key={isEditing ? actualIndex : `${actualIndex}-${image}`}
                className="relative group bg-gray-100 border-2 border-ellGray rounded-lg overflow-hidden"
                draggable={isEditing && hasImage}
                onDragStart={(e) => handleDragStart(e, actualIndex)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, actualIndex)}
                onDragEnd={handleDragEnd}
                style={{
                  cursor: isEditing && hasImage ? 'move' : 'default',
                  opacity: draggedIndex === actualIndex ? 0.5 : 1,
                  border: draggedIndex === actualIndex ? '2px dashed #3B82F6' : undefined
                }}
              >
                {hasImage ? (
                  <>
                    <img
                      src={image}
                      alt={`Rental image ${actualIndex + 1}`}
                      className="w-full h-40 md:h-60 lg:h-80 object-cover"
                    />
                    {isEditing && (
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => handlePinBackground(actualIndex)}
                          className={`mr-1 ${image === coverImage ? "bg-ellRed" : "bg-blue-500"}  text-white p-1 rounded shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer`}
                        >
                          <img src="/img/pin-light.svg" alt="pin" className="w-6 lg:w-7 h-6 lg:h-7" />
                        </button>
                        <button
                          onClick={() => handleDelete(actualIndex)}
                          className="bg-ellRed text-white p-1 rounded shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                        >
                          <img src="/img/trash-light.svg" alt="delete" className="w-6 lg:w-7 h-6 lg:h-7" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    {isEditing ? "Drop image here" : "Add Image"}
                  </div>
                )}
                
                {/* Image index indicator */}
                {hasImage && (
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {actualIndex + 1}
                  </div>
                )}

                {/* Show More/Less Button - positioned on second image */}
                {!isEditing && index === 1 && hasMoreImages && !showAll && (
                  <div className="absolute bottom-2 right-2">
                    <button
                      onClick={() => setShowAll(prev => !prev)}
                      className="px-3 py-1 bg-black bg-opacity-70 hover:bg-opacity-90 text-white text-xs rounded font-prompt transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      +{nonEmptyImages.length - 2} more
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {!isEditing && hasMoreImages && showAll && (
          <div className="relative flex justify-center mt-2">
            <button
              onClick={() => setShowAll(prev => !prev)}
              className="px-3 py-1 bg-black bg-opacity-70 hover:bg-opacity-90 text-white text-xs rounded font-prompt transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Show Less
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SortableImageGallery;