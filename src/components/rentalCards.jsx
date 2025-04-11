import React, { useContext, useState } from "react";
import ThemeContext from "../contexts/ThemeContext";
import { useNavigate } from 'react-router-dom';

const RentalCards = ({ rental, updateRental }) => {
    const navigate = useNavigate();
    const { theme, icons } = useContext(ThemeContext);
    const [name, setName] = useState(rental.name);
    const [status, setStatus] = useState(rental.status);

    const handleDetailClick = () => {
        navigate(`/management/${rental.id}`);
      };

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
                <div className="flex flex-grow">
                    <img src="./img/sampleImage.jpg" width="100" height="40" alt="image" className="border-2 border-ellGray rounded-md"/>
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
                    <div className="font-prompt text-ellPrimary text-sm md:text-lg min-h-22 w-full md:w-md">
                        {rental.location}
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
