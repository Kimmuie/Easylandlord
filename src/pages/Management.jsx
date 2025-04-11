import React, { useState, useEffect } from 'react'
import RentalCards from '../components/rentalCards'
import ManagementBar from '../components/managementBar'
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../components/firebase';

const Management = () => {
  const [rentals, setRentals] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [filteredRentals, setFilteredRentals] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const handleFilterChange = (filter) => {
    setCurrentFilter(filter);
  };

  const handleTagFilterChange = (tags) => {
    setSelectedTags(tags);
  };

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

  useEffect(() => {
    let statusFiltered = rentals;
    if (currentFilter === 'available') {
      statusFiltered = rentals.filter(rental => rental.status === "available");
    } else if (currentFilter === 'unavailable') {
      statusFiltered = rentals.filter(rental => rental.status === "unavailable");
    }
    if (selectedTags.length > 0) {
      setFilteredRentals(statusFiltered.filter(rental => selectedTags.includes(rental.tag)));
    } else {
      setFilteredRentals(statusFiltered);
    }
  }, [currentFilter, rentals, selectedTags]);

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
        <ManagementBar
          currentFilter={currentFilter} 
          handleFilterChange={handleFilterChange} 
          selectedTags={selectedTags}
          onTagFilterChange={handleTagFilterChange}
        />
        {filteredRentals.map((rental) => (
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
