import React, { useState, useEffect } from 'react'
import RentalCards from '../components/rentalCards'
import ManagementBar from '../components/managementBar'
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../components/firebase';

const Management = () => {
  const [rentals, setRentals] = useState([]);

  useEffect(() => { 
    const userEmail = localStorage.getItem("email");

    if (!userEmail) {
      console.error("User not logged in");
      return;
    }
        
    const userDocRef = doc(db, "users", userEmail);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.rental) {
          setRentals(userData.rental);
        }
      }
    }, (error) => {
        console.error("Error fetching rentals:", error);
      });
      return () => unsubscribe();
  }, []);

  const updateRental = async (rentalId, updateData) => {
    try {
      const userEmail = localStorage.getItem("email");
      
      if (!userEmail) {
        console.error("User not logged in");
        return;
      }
      
      const userDocRef = doc(db, "users", userEmail);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const updatedRentals = userData.rental.map(rental => 
          rental.id === rentalId ? { ...rental, ...updateData } : rental
        );
        
        await updateDoc(userDocRef, {
          rental: updatedRentals
        });
      }
    } catch (error) {
      console.error("Error updating rental:", error);
    }
  };
  return (
    <>
      <div className="w-full h-fit bg-ellWhite flex items-center flex-col">
        <ManagementBar/>
        {rentals.map((rental) => (
          <RentalCards 
            key={rental.id} 
            rental={rental} 
            updateRental={updateRental} 
          />
        ))}
      </div>
    </>
  )
}

export default Management
