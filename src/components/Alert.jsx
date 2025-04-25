// Alert.jsx
import React, { useEffect, useRef } from "react";

const Alert = ({ onConfirm, onCancel, Header, Description }) => {
  const alertBoxRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (alertBoxRef.current && !alertBoxRef.current.contains(event.target)) {
              onCancel();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center p-4 animate-fadeDown z-90">
      <div className="border-1 border-[#333333] border-t-8 border-t-ellRed  bg-ellPrimary rounded-sm shadow-lg max-w-sm w-full flex flex-col h-fit" ref={alertBoxRef}>
        <div className="flex flex-row justify-start items-center h-full mt-3 ml-3">
          <img src="/img/alert.svg" width="40" height="40" alt="alert"/>
          <h3 className="text-lg font-prompt font-semibold text-ellWhite ml-4">{Header}</h3>
        </div>
        <span className="text-ellWhite mt-3 mx-4 h-full text-md font-prompt font-medium">{Description}</span>
        <div className="flex justify-end gap-2 mt-4  border-t-1 border-t-[#333333] p-2">
          <button
            onClick={onCancel}
            className="bg-[#8E8E8E] text-[#F7F7F7] hover:scale-101 active:scale-98 font-medium py-2 px-4 rounded cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-ellRed text-[#F7F7F7] hover:scale-101 active:scale-98 font-medium py-2 px-4 rounded cursor-pointer"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;