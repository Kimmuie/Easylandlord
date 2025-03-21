import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const Navbar = () => {
  const menuItems = [
    { name: "บริหาร", paths: ["/management", "/"] },
    { name: "การเงิน", paths: ["/financial"] },
    { name: "บ้านเช่า", paths: ["/rental"] },
    { name: "บัญชี", paths: ["/account"] },
  ];
  
  const location = useLocation();
  
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
            <NavLink
              key={item.name}
              to={item.paths[0]}
              className={({ isActive }) =>
                `relative text-lg font-prompt font-semibold ${
                  item.paths.includes(location.pathname) ? "text-ellBlack" : "text-ellBlack hover:text-ellRed"
                }`
              }
            >
              {item.name}
              <div className="flex justify-center">
                {item.paths.includes(location.pathname) && (
                  <div className="absolute w-15 h-2 bg-ellBlack mt-4.5"></div>
                )}
              </div>
            </NavLink>
          ))}
        </div>
        {/* Notification */}
        <div>
          <button>
          <img src="./img/notification.svg" width="40" height="40" alt="notifications" />
          <div className="bg"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
