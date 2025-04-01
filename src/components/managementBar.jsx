import React, { useContext } from "react";
import ThemeContext from "../contexts/ThemeContext";

const ManagementBar = () => {
    const { theme, icons } = useContext(ThemeContext);

    return (
        <div className="flex w-4xl mb-4.5">
            <div className="flex mt-4.5">
                <input 
                    type="text" 
                    placeholder="ค้นหาบ้านเช่าของคุณ" 
                    maxLength={32}
                    className="border-2 border-ellGray rounded-2xl px-4 py-2  min-w-128 font-prompt text-ellPrimary text-lg mr-2"
                />
                <button className="border-2 border-ellGray hover:border-ellBlack rounded-2xl py-2 mr-2 w-22 font-prompt text-ellPrimary cursor-pointer">ทั้งหมด</button>
                <button className="border-2 border-ellGray hover:border-ellBlack rounded-2xl py-2 mr-2 w-22 font-prompt text-ellPrimary flex flex-row justify-center items-center cursor-pointer">
                    <div className="rounded-full border-2 border-ellGray h-5 w-5 bg-ellRed mr-2"></div>
                    ไม่ว่าง
                </button>
                <button className="border-2 border-ellGray hover:border-ellBlack rounded-2xl py-2 mr-2 w-22 font-prompt text-ellPrimary flex flex-row justify-center items-center cursor-pointer">
                    <div className="rounded-full border-2 border-ellGray h-5 w-5 bg-ellGreen mr-2"></div>
                    ว่าง
                </button>
            </div>
            <button className="bg-ellBlack rounded-b-full w-20 flex flex-row justify-center items-center cursor-pointer">
                <img src={icons.plus} width="40" height="40" alt="add"/>
            </button>

        </div>
  );
};

export default ManagementBar;
