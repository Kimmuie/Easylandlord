import React, { useContext, useState, useEffect } from 'react'
import ThemeContext from "../contexts/ThemeContext";
import RentalCards from '../components/rentalCards'
import ManagementBar from '../components/managementBar'
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../components/firebase';
import { useAuth } from '../contexts/AuthContext'; 
import Adbanner from '../components/Adbanner';

const Management = () => {
  const { currentUser } = useAuth();
  const { theme, icons } = useContext(ThemeContext);
  const [rentals, setRentals] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [filteredRentals, setFilteredRentals] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchName, setSearchName] = useState("");

  const handleFilterChange = (filter) => {
    setCurrentFilter(filter);
  };

  const handleTagFilterChange = (tags) => {
    setSelectedTags(tags);
  };

  const handleSearchChange = (search) => {
    setSearchName(search);
  };


  useEffect(() => {
    if (!currentUser) {
        console.error("User not logged in");
        return;
    }
    const userDocRef = doc(db, "users", currentUser.email);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const userData = docSnap.data();
            console.log("Firebase userData:", userData);
            if (userData.rental && Array.isArray(userData.rental)) { 
                setRentals(userData.rental);
            } else {
                setRentals([]);
                console.warn("userData.rental is not an array or is missing.", userData.rental);
            }
        } else {
            console.log("User document does not exist for:", currentUser.email);
            setRentals([]);
        }
    }, (error) => {
        console.error("Error fetching rentals from Firestore:", error);
        setRentals([]);
    });
    return () => unsubscribe();
}, [currentUser]);

useEffect(() => {
    let result = [...rentals];
    // Search Filter
    if (searchName && searchName.trim() !== ""){
        result = result.filter(rental => {
            if (!rental || typeof rental.name !== 'string') { 
                console.error("Malformed rental object or missing name for search:", rental);
                return false;
            }
            return rental.name.toLowerCase().includes(searchName.toLowerCase());
        });
    }
    // Status Filter
    if (currentFilter === 'available') {
        result = result.filter(rental => rental && rental.status === "available");
    } else if (currentFilter === 'unavailable') {
        result = result.filter(rental => rental && rental.status === "unavailable");
    }
    // Tag Filter
    if (selectedTags.length > 0) {
        result = result.filter(rental => {
            if (!rental || !rental.tag) { 
                console.error("Malformed rental object or missing tag for filter:", rental);
                return false; 
            }
            return selectedTags.includes(rental.tag);
        });
    }
    result.sort((a, b) => b.zindex - a.zindex);
    console.log("filteredRentals (before setting state):", result);
    setFilteredRentals(result);
}, [currentFilter, rentals, selectedTags, searchName]);

  const updateRental = async (rentalId, updateData) => {
    try {
      if (!currentUser) {
        console.error("User not logged in");
        return;
      }
      
      const userDocRef = doc(db, "users", currentUser.email);
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
    <div className='flex flex-row justify-between w-full'>
        <div className='xl:fixed w-50 h-full justify-center hidden xl:flex'>
          <Adbanner 
            dataAdSlot="2654056216"
            dataAdFormat="auto"
          />
        </div>
        <div className=" w-full h-fit bg-ellWhite flex items-center flex-col">
          <ManagementBar
            currentFilter={currentFilter} 
            handleFilterChange={handleFilterChange} 
            selectedTags={selectedTags}
            onTagFilterChange={handleTagFilterChange}
            handleSearch={handleSearchChange}
          />
          {filteredRentals.length === 0 ? (
            <div className="h-screen pointer-events-none absolute flex flex-col justify-center items-center">
              <img src={icons.inbox} width="90" height="90" alt="inbox" />
              <div className="font-prompt text-ellPrimary font-semibold text-lg">ไม่พบอสังหาริมทรัพย์</div>   
            </div>
          ) : (
            filteredRentals.map((rental) => (
            <RentalCards 
              key={rental.id} 
              rental={rental} 
              updateRental={updateRental} 
              className="flex flex-col"
            />
          ))
        )}
          <div className="w-full flex justify-center xl:hidden">
            <Adbanner
              dataAdSlot="2654056216"
              dataAdFormat="horizontal"
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default Management
