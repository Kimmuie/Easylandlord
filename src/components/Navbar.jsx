import React, { useState } from "react";

const Navbar = () => {
  const [active, setActive] = useState("บริหาร");
  const menuItems = ["บริหาร", "การเงิน", "บ้านเช่า", "บัญชี"];

  return (
    <div className="relative flex w-full h-20 bg-ellWhite items-center drop-shadow-md">
      <div className="flex w-full items-center justify-between pl-6 pr-6">
        <div className="flex flex-row items-center gap-2">
          <img src="./img/bHome.svg" width="40" height="40" alt="logoEasylandlord" />
          <div className="text-ellBlack text-lg font-inter font-semibold">Easylandlord</div>
        </div>

        {/* Navigation */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex gap-6">
          {menuItems.map((item) => (
            <button
              key={item}
              className={`relative text-lg font-prompt font-semibold ${
                active === item ? "text-ellBlack" : "text-ellBlack hover:text-ellRed cursor-pointer"
              }`}
              onClick={() => setActive(item)}
            >
              {item}
              <div className="flex justify-center">
              {active === item && <div className="absolute w-15 h-2 bg-ellBlack" style={{ marginTop: "18px"}}></div>}
              </div>
            </button>
          ))}
        </div>
        {/* Notification */}
        <div>
          <button>
          <img src="./img/notification.svg" width="40" height="40" alt="notifications" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
