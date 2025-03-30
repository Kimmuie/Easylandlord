import React from "react";

const RentalCards = () => {
  return (
    <div className="relative w-4xl mb-6">
        {/* Black shadow behind the card */}
        <div className="absolute inset-0 bg-ellBlack rounded-2xl translate-x-1.5 translate-y-1.5"></div>
        {/* Main card */}
        <div className="relative h-50 w-4xl rounded-2xl bg-ellWhite border-2 border-ellGray">
            <div className="flex-row flex py-3 pl-3">
                <img src="./img/sampleImage.jpg" width="100" height="40" alt="image" className="border-2 border-ellGray rounded-md"/>
                <div className="flex-row flex items-center pl-6">
                    <div className="font-prompt font-semibold text-ellBlack text-xl pl-1">
                    Rental Name
                    </div>
                </div>  
            </div>
            <div className="flex flex-row">
                <div className="flex flex-col flex-grow pl-3">
                    {/* Rental Location */}
                    <div className="font-prompt text-ellBlack text-lg h-18 w-lg">
                        Rental Location Rental Location Rental Location Rental Location Rental Location Rental Location Rental Location 
                    </div>
                    {/* Rental Description */}
                    <div className="flex flex-row items-center font-prompt text-ellBlack text-lg">
                        <div className="rounded-full border-2 border-ellGray h-5 w-5 bg-ellGreen mr-2"></div>
                        ว่าง
                    </div>
                </div>
                <div className="flex flex-col items-center justify-end pr-3 pb-1">
                    {/* Rental Price */}
                    <div className="font-prompt text-ellBlack font-semibold text-lg">
                        6,000THB/เดือน
                        
                    </div>
                    {/* Rental Description */}
                    <button className="flex flex-row bg-ellBlack rounded-full items-center justify-center font-prompt text-ellWhite h-8 w-48 text-lg cursor-pointer">
                        <img src="./img/info.svg" width="25" height="25" alt="info" className="m-1"/>
                        ดูรายละเอียด
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default RentalCards;
