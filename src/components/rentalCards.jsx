import React, { useContext, useState, useEffect } from "react";
import ThemeContext from "../contexts/ThemeContext";
import { db } from '../components/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext'; 
import { useParams, useNavigate } from 'react-router-dom';

const RentalCards = ({ rental, selectedAppearanceTags }) => {
  const { currentUser } = useAuth();
  const { rentalId } = useParams();
    const navigate = useNavigate();
    const { theme, icons } = useContext(ThemeContext);
    const [records, setRecords] = useState([]);
    const [depositLeft, setDepositLeft] = useState(0);
    const [totalDeposit, setTotalDeposit] = useState(0);

    const handleDetailClick = async () => {
        try {
            if (!currentUser) {
                console.error("User not logged in");
                return;
            }
            
            const userDocRef = doc(db, "users", currentUser.email);
            const docSnap = await getDoc(userDocRef);
            const userData = docSnap.data();
            
            // Find the highest current index
            const maxIndex = Math.max(0, ...userData.rental?.map(r => r.zindex || 0) || []);
            
            // Update the rental array - set clicked rental to highest index + 1
            const updatedRentals = userData.rental.map(r => {
                if (r.id === rental.id) {
                    return { ...r, zindex: maxIndex + 1 };
                }
                return r;
            });
            
            // Update Firestore
            await updateDoc(userDocRef, {
                rental: updatedRentals
            });
            
            // Navigate to the detail page
            navigate(`/management/${rental.id}`);
            
        } catch (error) {
            console.error("Error updating rental index:", error);
            // Still navigate even if update fails
            navigate(`/management/${rental.id}`);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const calculateTotalDeposit = (financialRecords) => {
        const depositSum = financialRecords
            .filter(record => record.transactionCode && record.transactionCode.includes("ค่ามัดจำ"))
            .reduce((sum, record) => {
                // Convert rentalRate to number, handle both string and number formats
                const rate = typeof record.rentalRate === 'string' 
                    ? parseFloat(record.rentalRate.replace(/,/g, ''))
                    : parseFloat(record.rentalRate) || 0;
                return sum + rate;
            }, 0);
        
        return depositSum;
    };

const fetchRecords = async () => {
    try {
        const userDocRef = doc(db, "users", currentUser.email);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.rental) {
                if (rental.financialHistory) {
                    const depositTotal = calculateTotalDeposit(rental.financialHistory);
                    setTotalDeposit(depositTotal);
                    console.log(`Total deposit amount: ${depositTotal}`);
                } else {
                    console.log(`Rental with ID ${rental} not found or has no financial history`);
                    setTotalDeposit(0);
                }
            }
        } else {
            console.log("User document does not exist");
            setTotalDeposit(0);
        }
    } catch (error) {
        console.error("Error fetching records:", error);
        setTotalDeposit(0);
    }
};

  return (
    <div className={`relative mb-6 flex flex-col ${selectedAppearanceTags == "list" ? "w-96  md:w-3xl xl:w-4xl" : "w-32 md:w-60 xl:w-70"}`}>
        {/* Black shadow behind the card */}
        <div className={`absolute inset-0 bg-ellBlack rounded-2xl ${selectedAppearanceTags == "list" ? "translate-x-1 md:translate-x-1.5 translate-y-1 md:translate-y-1.5" : "translate-x-1 translate-y-1"}`}></div>
        {/* Main card */}
        <div className={`relative md:h-56 h-72 rounded-2xl bg-ellWhite border-2 border-ellGray  ${selectedAppearanceTags == "list" ? " w-full md:w-3xl xl:w-4xl" : " w-33 md:w-60 xl:w-70 flex items-center flex-col"}`}>
            <div className={`flex-row flex py-3 ${selectedAppearanceTags == "list" ? "pl-3 md:pl-3" : "pl-0 md:pl-3"}`}>
                <div className={`flex ${selectedAppearanceTags == "list" ? "flex-grow" : "md:flex-row flex-col"}`}>
                    <div className="flex flex-col">
                    <img src={rental.coverRental || rental.rentalImage0 || "./img/sampleImage.jpg"} alt="image" className="h-15 w-25 object-cover border-2 border-ellGray rounded-md"/>
                    {selectedAppearanceTags == "grid" &&
                        <div className="flex justify-center rounded-sm px-1 font-prompt text-ellSecondary text-sm bg-ellBlack h-5">
                            {rental.tag}
                        </div>
                    }
                    </div>
                    <div className={`flex font-prompt items-center font-semibold text-ellPrimary text-md break-all ${selectedAppearanceTags == "list" ? " pl-6 w-full xl:w-lg md:text-xl" : "md:text-sm justify-center pl-2 w-24 xl:w-45"}`}>
                        {rental.name}
                    </div>  
                </div>
                {selectedAppearanceTags == "list" ? (
                <div className="flex justify-end">
                    <div className="flex justify-center rounded-sm mr-3 px-1 font-prompt text-ellSecondary text-md md:text-lg bg-ellBlack h-8">
                        {rental.tag}
                    </div>
                </div>
                ):(
                <div className="flex justify-end">
                    <div className={`rounded-full border-2 border-ellGray h-5 w-5 xl:mr-3 mr-0 absolute md:relative ${rental.status === "available" ? "bg-ellGreen" : "bg-ellRed"}`}></div>
                </div>
                )}
            </div>
            <div className={`flex flex-row flex-grow ${selectedAppearanceTags == "list" ? "" : "justify-center"}`}>
                {selectedAppearanceTags == "list" &&
                <div className="flex flex-col flex-grow pl-3">
                    {/* Rental Location */}
                        <div className="font-prompt text-ellPrimary text-sm md:text-lg md:min-h-22 min-h-40 w-full md:w-md break-all">
                            {rental.location}
                        </div>
                    {/* Rental Description */}
                    <div className="flex flex-row items-center font-prompt text-ellPrimary text-lg">
                        <div className={`rounded-full border-2 border-ellGray h-5 w-5 mr-2 ${rental.status === "available" ? "bg-ellGreen" : "bg-ellRed"}`}></div>
                        {rental.status === "available" ? "ว่าง" : "ไม่ว่าง"}
                        {rental.status === "unavailable" && 
                        <>
                        <div className="font-prompt text-ellPrimary text-lg ml-12 md:block hidden">
                            มัดจำคงเหลือ 
                            <span className={`ml-2 ${totalDeposit.toLocaleString() >= rental.billDeposit ? "text-ellGreen" : "text-ellRed"} `}>{totalDeposit.toLocaleString()}/{rental.billDeposit || "0"}</span>
                        </div>
                        <div className="font-prompt text-ellPrimary text-lg flex flex-col ml-12 md:hidden">
                            <span className={`ml-2 ${totalDeposit.toLocaleString() >= rental.billDeposit ? "text-ellGreen" : "text-ellRed"} `}>{totalDeposit.toLocaleString()}/{rental.billDeposit || "0"}</span>
                        </div>
                        </>
                        }
                    </div>
                </div>
                }
                <div className={`flex flex-col items-center justify-end ${selectedAppearanceTags == "list" ? "pb-1 pr-3 " : "pb-4 md:pr-3 pr-0"}`}>
                    {/* Rental Price */}
                    <div className="font-prompt text-ellPrimary font-semibold text-md md:text-lg">
                        {rental.rentFee}/{rental.rentFrequency}
                    </div>
                    {/* Rental Description */}
                    <button className="flex flex-row bg-ellBlack rounded-full items-center justify-center font-prompt text-ellSecondary h-8 w-30 md:w-48 text-sm md:text-lg cursor-pointer hover:scale-101 active:scale-98"
                        onClick={handleDetailClick}>
                        <img src={icons.info} alt="info" className="m-1 w-5 md:w-6 h-5 md:h-6"/>
                        ดูรายละเอียด
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default RentalCards;
