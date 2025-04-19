// Alert.jsx
import React, { useEffect, useRef } from "react";

const Alert = ({ onConfirm, onCancel }) => {
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
      <div className="border-2 border-ellBlack border-dotted drop-shadow-lg bg-ellPrimary rounded-lg shadow-lg p-4 max-w-sm w-full" ref={alertBoxRef}>
        <h3 className="text-lg font-medium text-ellWhite mb-4">Do you want to confirm this action?</h3>
        
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onCancel}
            className="bg-[#D6D6D6] text-[#333333] hover:scale-101 active:scale-98 font-medium py-2 px-4 rounded cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-ellRed text-ellWhite hover:scale-101 active:scale-98 font-medium py-2 px-4 rounded cursor-pointer"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;