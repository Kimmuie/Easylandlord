import React, { useState, useEffect, useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../components/firebase";
import ThemeContext from "../contexts/ThemeContext";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme } = useContext(ThemeContext);
  const location = useLocation();

  const themeIcons = {
    light: {
      logo: "./img/bHome.svg",
      notification: "./img/notification-light.svg",
      menuClose: "./img/menuClose-light.svg",
      menuOpen: "./img/menuOpen-light.svg",
    },
    dark: {
      logo: "./img/wHome.svg",
      notification: "./img/notification-dark.svg",
      menuClose: "./img/menuClose-dark.svg",
      menuOpen: "./img/menuOpen-dark.svg",
    },
    blue: {
      logo: "./img/wHome.svg",
      notification: "./img/notification-dark.svg",
      menuClose: "./img/menuClose-dark.svg",
      menuOpen: "./img/menuOpen-dark  .svg",
    },
  };

  const icons = themeIcons[theme] || themeIcons.light;

  const menuItems = [
    { name: "บริหาร", paths: ["/management", "/"] },
    { name: "การเงิน", paths: ["/financial"] },
    { name: "บ้านเช่า", paths: ["/rental"] },
    { name: "บัญชี", paths: ["/account"] },
  ];

  return (
    <>
    <div className="relative flex w-full h-20 bg-ellWhite items-center border-b border-b-ellDarkGray z-40">
      <div className="flex w-full items-center justify-between pl-6 pr-6">
        <div className="hidden md:flex flex-row items-center gap-2">
          <img src={icons.logo} width="40" height="40" alt="logoEasylandlord" />
          <div className="text-ellBlack text-lg font-inter font-semibold">Easylandlord</div>
        </div>

        {/*Desktop Navigation */}
        <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 gap-6">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.paths[0]}
              className={({ isActive }) =>
                `relative text-lg font-prompt text-ellBlack font-semibold ${
                  item.paths.includes(location.pathname) ? "text-ellBlack cursor-default pointer-events-none" : "hover:text-ellRed"
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
          <button className="hover:animate-wiggle cursor-pointer">
          <img src={icons.notification} width="40" height="40" alt="notifications" />
          <div className="bg"></div>
          </button>
        </div>
        {/* Mobile Menu Icon */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            <img
              src={menuOpen ? icons.menuOpen : icons.menu}
              width="40"
              height="40"
              alt="menu icon"
            />
          </button>
        </div>
      </div>
    </div>
    {/* Gray Overlay When Mobile Menu is Open */}
    {menuOpen && (
        <div
          className="fixed inset-0 bg-ellDarkGray opacity-50 z-30"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}
      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="fixed top-20 left-0 w-full bg-white flex flex-col items-center md:hidden z-40">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.paths[0]}
              className="w-full text-center py-2 text-lg font-prompt font-semibold border-b border-ellGray"
              onClick={() => setMenuOpen(false)}
            >
              {item.name}
              <div className="flex justify-center">
                {item.paths.includes(location.pathname) && (
                  <div className="absolute w-15 h-1.5 mt-0.5 bg-ellBlack"></div>
                )}
              </div>
            </NavLink>
          ))}
        </div>
      )}
    </>
  );
};

export default Navbar;
