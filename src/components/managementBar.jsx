import React, { useContext, useState } from "react";
import ThemeContext from "../contexts/ThemeContext";
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import { db } from "../components/firebase";

const ManagementBar = () => {
    const { theme, icons } = useContext(ThemeContext);
    const [currentFilter, setCurrentFilter] = useState('all');
    
    const handleFilterChange = (filter) => {
        setCurrentFilter(filter);
    };

    const handleCreateRental = async () => {
        try {
            const userEmail = localStorage.getItem("email");
            const userDocRef = doc(db, "users", userEmail);
            const docSnap = await getDoc(userDocRef);
            
            if (!userEmail) {
                console.error("User not logged in");
                return;
            }
            const userData = docSnap.data()
            const rentalCount = userData.rental ? userData.rental.length : 0;
            const newRental = {
                id: Date.now().toString(),
                name: "Untitle " + (rentalCount + 1),
                status: "available",
                location: "",
                rentFee: 0,
                rentFrequency: "เดือน",
                bedroom: 0,
                restroom: 0,
                squareMetre: 0,
                propertyDetails: "",
                tenantName: "",
                tenantNumber: "",
                createdAt: Timestamp.now()
            };
            
            await updateDoc(userDocRef, {
                rental: arrayUnion(newRental)
            });
            
            console.log("New rental added to user document:", newRental);
        } catch (error) {
            console.error("Error creating rental:", error);
        }
    };
    
    return (
        <div className="flex w-xl md:w-4xl mb-4.5 justify-center">
            <div className="relative flex-col md:flex-row md:flex">
                <div className="flex mt-4.5">
                    <input 
                        type="text" 
                        placeholder="ค้นหาบ้านเช่าของคุณ"   
                        maxLength={32}
                        className="border-2 border-ellGray rounded-2xl px-4 py-2 min-w-96 md:min-w-128 font-prompt text-ellPrimary text-lg mr-2"
                    />
                </div>
                <div className="flex justify-center">
                    <button className={`mt-4.5 border-2 border-ellGray hover:border-ellPrimary rounded-2xl py-2 mr-2 w-22 font-prompt text-ellPrimary ${currentFilter === 'all' ? 'bg-ellPrimary text-ellTertiary border-transparent cursor-default' : "cursor-pointer"}`}
                            onClick={() => handleFilterChange("all")}>ทั้งหมด</button>
                    <button className={`mt-4.5 border-2 border-ellGray hover:border-ellPrimary rounded-2xl py-2 mr-2 w-22 font-prompt text-ellPrimary flex flex-row justify-center items-center ${currentFilter === 'unavailable' ? 'bg-ellPrimary text-ellTertiary border-transparent cursor-default' : "cursor-pointer"}`}
                            onClick={() => handleFilterChange("unavailable")}>
                        <div className="rounded-full border-2 border-ellGray h-5 w-5 bg-ellRed mr-2"></div>
                        ไม่ว่าง
                    </button>
                    <button className={`mt-4.5 border-2 border-ellGray hover:border-ellPrimary rounded-2xl py-2 mr-2 w-22 font-prompt text-ellPrimary flex flex-row justify-center items-center ${currentFilter === 'available' ? 'bg-ellPrimary text-ellTertiary border-transparent cursor-default' : "cursor-pointer"}`}
                            onClick={() => handleFilterChange("available")}>
                        <div className="rounded-full border-2 border-ellGray h-5 w-5 bg-ellGreen mr-2"></div>
                        ว่าง
                    </button>
                    <button className="md:flex hidden mt-0 bg-ellBlack rounded-b-full w-20  flex-row justify-center items-center cursor-pointer"
                            onClick={() => handleCreateRental()}>
                        <img src={icons.plus} width="40" height="40" alt="add"/>
                    </button>
                    <button className="md:hidden flex mt-4.5 bg-ellBlack rounded-full w-22  flex-row justify-center items-center cursor-pointer active:scale-98"
                            onClick={() => handleCreateRental()}>
                        <img src={icons.plus} width="40" height="40" alt="add"/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManagementBar;