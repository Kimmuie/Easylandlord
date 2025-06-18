import React, { useContext, useState, useEffect } from "react";
import ThemeContext from "../contexts/ThemeContext";
import { db } from '../components/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext'; 
import { useParams, useNavigate } from 'react-router-dom';

const RentalCards = ({ rental }) => {
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
    <div className="relative w-96 xl:w-4xl md:w-3xl mb-6 flex flex-col">
        {/* Black shadow behind the card */}
        <div className="absolute inset-0 bg-ellBlack rounded-2xl translate-x-1 md:translate-x-1.5 translate-y-1 md:translate-y-1.5"></div>
        {/* Main card */}
        <div className="relative h-56 w-full xl:w-4xl md:w-3xl rounded-2xl bg-ellWhite border-2 border-ellGray">
            <div className="flex-row flex py-3 pl-3">
                <div className="flex flex-grow">
                    <img src={rental.coverRental || rental.rentalImage0 || "./img/sampleImage.jpg"} alt="image" className="h-15 w-25 object-cover border-2 border-ellGray rounded-md"/>
                    <div className="flex items-center pl-6 font-prompt font-semibold text-ellPrimary text-md md:text-xl w-lg">
                        {rental.name}
                    </div>  
                </div>
                <div className="flex justify-end">
                    <div className="flex justify-center rounded-sm mr-3 px-1 font-prompt text-ellSecondary text-md md:text-lg bg-ellBlack h-8">
                        {rental.tag}
                    </div>
                </div>
            </div>
            <div className="flex flex-row">
                <div className="flex flex-col flex-grow pl-3">
                    {/* Rental Location */}
                    <div className="font-prompt text-ellPrimary text-sm md:text-lg min-h-22 w-full md:w-md break-all">
                        {rental.location}
                    </div>
                    {/* Rental Description */}
                    <div className="flex flex-row items-center font-prompt text-ellPrimary text-lg">
                        <div className={`rounded-full border-2 border-ellGray h-5 w-5 mr-2 ${rental.status === "available" ? "bg-ellGreen" : "bg-ellRed"}`}></div>
                        {rental.status === "available" ? "ว่าง" : "ไม่ว่าง"}
                        {rental.status === "unavailable" && 
                        <div className="font-prompt text-ellPrimary text-lg ml-12">
                            มัดจำคงเหลือ 
                            <span className={`ml-2 ${totalDeposit.toLocaleString() >= rental.billDeposit ? "text-ellGreen" : "text-ellRed"} `}>{totalDeposit.toLocaleString()}/{rental.billDeposit || "0"}</span>
                        </div>
                        }
                    </div>
                </div>
                <div className="flex flex-col items-center justify-end pr-3 pb-1">
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
