import React, { useContext, useState } from "react";
import ThemeContext from "../contexts/ThemeContext";

const RentalCards = ({ rental, updateRental }) => {
    const { theme, icons } = useContext(ThemeContext);
    const [name, setName] = useState(rental.name);
    const [status, setStatus] = useState(rental.status);

    const handleSave = () => {
        updateRental(rental.id, { name, status, propertyDetails, rentFee, rentFrequency });
        setIsEditing(false);
      };

  return (
    <div className="relative w-96 md:w-4xl mb-6">
        {/* Black shadow behind the card */}
        <div className="absolute inset-0 bg-ellBlack rounded-2xl translate-x-1 md:translate-x-1.5 translate-y-1 md:translate-y-1.5"></div>
        {/* Main card */}
        <div className="relative h-56 w-full md:w-4xl rounded-2xl bg-ellWhite border-2 border-ellGray">
            <div className="flex-row flex py-3 pl-3">
                <img src="./img/sampleImage.jpg" width="100" height="40" alt="image" className="border-2 border-ellGray rounded-md"/>
                <div className="flex items-center pl-6 font-prompt font-semibold text-ellPrimary text-md md:text-xl md:w-184 w-56">
                    {rental.name}
                </div>  
                <div className="flex items-center md:items-start mr-3 active:scale-98">
                    <img src={icons.dot} alt="dot" className="hover:bg-ellDarkGray active:bg-ellDarkGray rounded-full p-0 md:p-1 w-6 md:w-9 h-6 md:h-9"/>    
                </div>
            </div>
            <div className="flex flex-row">
                <div className="flex flex-col flex-grow pl-3">
                    {/* Rental Location */}
                    <div className="font-prompt text-ellPrimary text-sm md:text-lg min-h-22 w-full md:w-lg">
                        {rental.propertyDetails}
                    </div>
                    {/* Rental Description */}
                    <div className="flex flex-row items-center font-prompt text-ellPrimary text-lg">
                        <div className={`rounded-full border-2 border-ellGray h-5 w-5 mr-2 ${rental.status === "available" ? "bg-ellGreen" : "bg-ellRed"}`}></div>
                        {rental.status === "available" ? "ว่าง" : "ไม่ว่าง"}
                    </div>
                </div>
                <div className="flex flex-col items-center justify-end pr-3 pb-1">
                    {/* Rental Price */}
                    <div className="font-prompt text-ellPrimary font-semibold text-md md:text-lg">
                        {rental.rentFee}/{rental.rentFrequency}
                    </div>
                    {/* Rental Description */}
                    <button className="flex flex-row bg-ellBlack rounded-full items-center justify-center font-prompt text-ellSecondary h-8 w-30 md:w-48 text-sm md:text-lg cursor-pointer hover:scale-101 active:scale-98">
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
