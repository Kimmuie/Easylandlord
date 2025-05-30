import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../components/firebase';

const ShareImageGallery = ({ }) => {
  const { id } = useParams();
  const [images, setImages] = useState(Array(20).fill(""));
  const [coverImage, setCoverImage] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [rental, setRental] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [sharedData, setSharedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

  // Fetch existing images on component mount
  useEffect(() => {
    const fetchSharedData = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'sharedRentals', id));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSharedData(data);
          setRental(data.rental); // Set the rental state
          
          // Process images from the rental data
          if (data.rental) {
            setCoverImage(data.rental.coverRental || "");
            const imageArray = Array(20).fill("");
            
            for (let i = 0; i < 20; i++) {
              const key = `rentalImage${i}`;
              if (data.rental[key]) {
                imageArray[i] = data.rental[key];
              }
            }
            
            setImages(imageArray);
          }
          
          setIsInitialized(true);
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch shared data:", error);
        setLoading(false);
        setIsInitialized(true);
      }
    };
    
    fetchSharedData();
  }, [id]);

  // Get images to display - filter out empty images when not editing
  const nonEmptyImages = images.filter(img => img && img !== "");
  const displayImages = showAll 
    ? nonEmptyImages 
    : images.slice(0, 2);
  const hasMoreImages = nonEmptyImages.length > 2;

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="lg:w-4xl md:w-full">
      {/* Image Grid Container */}
      <div className="relative">
        {/* Image Grid */}
        <div className={`grid gap-4 ${showAll ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-2' : 'grid-cols-2 md:grid-cols-2 lg:grid-cols-2'}`}>
          {displayImages.map((image, index) => {
            const actualIndex = showAll ? images.findIndex(img => img === image) : index;
            const hasImage = image && image !== "";
            return (
              <div key={actualIndex} className="relative group bg-gray-100 border-2 border-ellGray rounded-lg overflow-hidden">
                {hasImage ? (
                  <>
                    <img
                      src={image}
                      alt={`Rental image ${actualIndex + 1}`}
                      className="w-full h-40 md:h-60 lg:h-80 object-cover"
                    />
                  </>
                ) : (
                  <div className="w-full h-40 md:h-60 lg:h-80 flex items-center justify-center text-gray-400"> Empty</div>
                )}
                
                {/* Image index indicator */}
                {hasImage && (
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {actualIndex + 1}
                  </div>
                )}

                {/* Show More/Less Button - positioned on second image */}
                {index === 1 && hasMoreImages && !showAll && (
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
        {hasMoreImages && showAll && (
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

export default ShareImageGallery;