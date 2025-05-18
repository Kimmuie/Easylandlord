import React, { useState, useEffect } from 'react';
import UploadImage from './uploadImage';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../components/firebase';

const ExtendImage = ({ currentUpload, isEditing }) => {
  const { currentUser } = useAuth();
  const [uploadedRentalImages, setUploadedRentalImages] = useState(Array(21).fill(null));
  const [rentalImages, setRentalImages] = useState(Array(21).fill(""));
  const { rentalId } = useParams();

  // Handle new upload from parent component
  const handleUploadToFirstEmptySlot = (uploadUrl) => {
    if (!uploadUrl) return;
    for (let i = 6; i <= 20; i++) {
      if (rentalImages[i] === "" && uploadedRentalImages[i] === null) {
        const newUploaded = [...uploadedRentalImages];
        newUploaded[i] = uploadUrl;
        setUploadedRentalImages(newUploaded);
        saveSpecificImage(i, uploadUrl);
        break;
      }
    }
  };
  
  // Function to save a specific image at a specific index
  const saveSpecificImage = async (index, imageUrl) => {
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
              const imageKey = `rentalImage${index}`;
              updatedRental[imageKey] = imageUrl;
              return updatedRental;
            }
            return r;
          });
          
          await updateDoc(userDocRef, {
            rental: updatedRentals
          });
          console.log(`Image at index ${index} saved successfully`);
        }
      }
    } catch (error) {
      console.error("Error saving specific image:", error);
    }
  };

  useEffect(() => {
    if (currentUpload) {
      handleUploadToFirstEmptySlot(currentUpload);
    }
  }, [currentUpload]);

  // Fetch existing rental images on component mount
  useEffect(() => {
    const fetchRentalImages = async () => {
      if (!currentUser) return;

      try {
        const userDocRef = doc(db, "users", currentUser.email);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          const rentalData = userData.rental?.find(r => r.id === rentalId);

          if (rentalData) {
            const imageArray = Array(21).fill("");
            for (let i = 5; i <= 20; i++) {
              const key = `rentalImage${i}`;
              if (rentalData[key]) {
                imageArray[i] = rentalData[key];
              }
            }
            setRentalImages(imageArray);
          }
        }
      } catch (error) {
        console.error("Failed to fetch rental images:", error);
      }
    };
    
    fetchRentalImages();
  }, [currentUser, rentalId]);

  // Re-enable these functions for direct upload and delete functionality
  const handleUpload = (url, index) => {
    const newUploaded = [...uploadedRentalImages];
    newUploaded[index] = url;
    setUploadedRentalImages(newUploaded);
    saveSpecificImage(index, url);
  };

  const handleDelete = (index) => {
    const newUploaded = [...uploadedRentalImages];
    newUploaded[index] = '/img/sampleImage.jpg';
    setUploadedRentalImages(newUploaded);
    saveSpecificImage(index, "");
  };

  return (
    <div className="grid grid-cols-2">
      {Array.from({ length: 16 }, (_, i) => {
        const index = i + 5;
        const uploaded = uploadedRentalImages[index];
        const rental = rentalImages[index];
        return (
          <div key={index} className="relative inline-block animate-fadeDown">
            {(uploaded || rental) && (
              <img 
                src={uploaded || rental || "/img/sampleImage.jpg"}
                className="object-cover border-1 border-ellTertiary md:w-112 w-full md:h-60 h-30"
              />
            )}
            {(uploaded || rental) && isEditing && (
              <div className="absolute right-1 bottom-1 flex flex-row">
                <UploadImage onUploadSuccess={(url) => handleUpload(url, index)}>
                  <button className="cursor-pointer rounded h-9 w-9 bg-blue-500 mr-1 flex items-center justify-center hover:scale-102 active:scale-97">
                    <img src="/img/plus-light.svg" alt="edit" className="w-7" />
                  </button>
                </UploadImage>
                <button
                  className="cursor-pointer rounded h-9 w-9 bg-ellRed flex items-center justify-center hover:scale-102 active:scale-97"
                  onClick={() => handleDelete(index)}
                >
                  <img src="/img/trash-light.svg" alt="delete" className="w-7" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ExtendImage;