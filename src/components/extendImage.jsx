import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../components/firebase';

const SortableImageGallery = ({ currentUpload, isEditing }) => {
  const { currentUser } = useAuth();
  const { rentalId } = useParams();
  
  const [images, setImages] = useState(Array(20).fill(""));
  const [showAll, setShowAll] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Handle new upload - add to first empty slot
  const handleUploadToFirstEmptySlot = (uploadUrl) => {
    if (!uploadUrl) return;
    
    const emptyIndex = images.findIndex(img => img === "");
    if (emptyIndex !== -1) {
      const newImages = [...images];
      newImages[emptyIndex] = uploadUrl;
      setImages(newImages);
      saveAllImages(newImages);
    }
  };

  // Save all images to Firebase
  const saveAllImages = async (imageArray) => {
    if (!currentUser) return;
    
    try {
      const userDocRef = doc(db, "users", currentUser.email);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        
        if (userData.rental) {
          const updatedRentals = userData.rental.map(r => {
            if (r.id === rentalId) {
              const updatedRental = { ...r };
              // Save images as rentalImage0, rentalImage1, etc.
              imageArray.forEach((img, index) => {
                updatedRental[`rentalImage${index}`] = img;
              });
              return updatedRental;
            }
            return r;
          });
          
          await updateDoc(userDocRef, {
            rental: updatedRentals
          });
          console.log('All images saved successfully');
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

        if (docSnap.exists()) {
          const userData = docSnap.data();
          const rentalData = userData.rental?.find(r => r.id === rentalId);

          if (rentalData) {
            const imageArray = Array(20).fill("");
            for (let i = 0; i < 20; i++) {
              const key = `rentalImage${i}`;
              if (rentalData[key]) {
                imageArray[i] = rentalData[key];
              }
            }
            setImages(imageArray);
          }
        }
      } catch (error) {
        console.error("Failed to fetch images:", error);
      }
    };
    
    fetchImages();
  }, [currentUser, rentalId]);

  // Handle new upload from parent
  useEffect(() => {
    if (currentUpload) {
      handleUploadToFirstEmptySlot(currentUpload);
    }
  }, [currentUpload]);

  // Delete image
  const handleDelete = (index) => {
    const newImages = [...images];
    newImages[index] = "";
    setImages(newImages);
    saveAllImages(newImages);
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    if (!isEditing) return; // Prevent dragging when not editing
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    if (!isEditing) return; // Prevent drop when not editing
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    if (!isEditing) return; // Prevent drop when not editing
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    
    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    
    // Remove dragged item
    newImages.splice(draggedIndex, 1);
    // Insert at new position
    newImages.splice(dropIndex, 0, draggedImage);
    
    setImages(newImages);
    setDraggedIndex(null);
    saveAllImages(newImages);
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
                  opacity: draggedIndex === actualIndex ? 0.5 : 1
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
                      <div className="absolute top-2 right-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDelete(actualIndex)}
                          className="bg-ellRed text-white p-2 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                        >
                          <img src="/img/trash-light.svg" alt="delete" className="w-6 lg:w-8 h-6 lg:h-8" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="text-2xl mb-2">+</div>
                      <div className="text-sm">Add Image</div>
                    </div>
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