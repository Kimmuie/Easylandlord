import React, { useState, useContext, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import ThemeContext from "../contexts/ThemeContext";
import Notification from "./notification";
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../components/firebase';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  const [readed, setReaded] = useState(false);
  const [user, setUser] = useState(localStorage.getItem("email") || null);
  const notiOpenBoxRef = useRef(null);
  const location = useLocation();
  const { theme, icons } = useContext(ThemeContext);
  const menuItems = [
    { name: "บริหาร", paths: ["/management", "/"] },
    { name: "การเงิน", paths: ["/financial"] },
    { name: "แผนที่", paths: ["/map"] },
    { name: "บัญชี", paths: ["/account"] },
  ];

  useEffect(() => {
    setInterval(() => {
      checkReaded();
    }, 30000);

    setTimeout(() => {
      checkReaded();
    }, 3000);

    function handleClickOutside(event) {
        if (notiOpenBoxRef.current && !notiOpenBoxRef.current.contains(event.target)) {
          setReaded(false);
          setNotiOpen(false);
          updateAllNotifications({readed: true});
        }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
    
  const updateAllNotifications = async (fieldsToUpdate) => {
    if (user) {
      try {
        const userDocRef = doc(db, "users", user);
        const docSnap = await getDoc(userDocRef);
  
        if (docSnap.exists()) {
          const userData = docSnap.data();
  
          if (Array.isArray(userData.notification)) {
            const updatedNotifications = userData.notification.map(notification => ({
              ...notification,
              ...fieldsToUpdate
            }));
  
            await updateDoc(userDocRef, { notification: updatedNotifications });
  
            console.log("All notifications updated successfully");
          }
        }
      } catch (error) {
        console.error("Error updating notifications:", error);
      }
    }
  };

  const checkReaded = async () => {
    try {
      const userDocRef = doc(db, "users", user);
      const docSnap = await getDoc(userDocRef);
      
      if (!docSnap.exists()) {
        console.log("User document doesn't exist");
        return;
      }
      
      const userData = docSnap.data();
      const existingNotifications = userData.notification || [];
      
      if (existingNotifications.some( notification => notification.readed === false)){
        console.log("Have unread Notification");
        setReaded(true);
      } else {
        console.log("All Notification readed");
        setReaded(false);
      }
    } catch (error) {
      console.error("Error checking notification status:", error);
    }
  };
  return (
    <>
      <div className="relative flex w-full h-20 bg-ellWhite items-center border-b border-b-ellDarkGray z-40">
        <div className="flex w-full items-center justify-between pl-6 pr-6">
          <div className="hidden md:flex flex-row items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
            <img src={icons.logo} width="40" height="40" alt="logoEasylandlord" />
            <div className="text-ellPrimary text-lg font-inter font-semibold">Easylandlord</div>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 gap-6">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.paths[0]}
                className={({ isActive }) =>
                  `relative text-lg font-prompt text-ellPrimary font-semibold ${
                    item.paths.includes(location.pathname)
                      ? "text-ellPrimary cursor-default pointer-events-none"
                      : "hover:text-ellRed"
                  }`
                }
              >
                {item.name}
                <div className="flex justify-center">
                  {item.paths.includes(location.pathname) && (
                    <div className="absolute w-15 h-2 bg-ellPrimary mt-4.5"></div>
                  )}
                </div>
              </NavLink>
            ))}
          </div>

          {/* Notification */}
          <div className="relative inline-block">
            {notiOpen && (
              <Notification ref={notiOpenBoxRef}/>
            )}
            <div>
              <button className={`hover:animate-wiggle cursor-pointer ${notiOpen && "pointer-events-none"}`} onClick={() => setNotiOpen(true)}>
                <div className={`absolute rounded-full border-4 border-ellWhite h-5 w-5 bg-ellRed right-0 ${!readed && "hidden"}`} ></div>
                <img src={icons.notification} width="40" height="40" alt="notifications" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Icon */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMenuOpen(!menuOpen)}>
              <img src={menuOpen ? icons.menuOpen : icons.menuClose} width="40" height="40" alt="menu icon" />
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
        <div className="fixed top-20 left-0 w-full bg-ellWhite flex flex-col items-center md:hidden z-40 animate-fadeDown">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.paths[0]}
              className="w-full text-center text-ellPrimary py-2 text-lg font-prompt font-semibold border-b border-ellGray"
              onClick={() => setMenuOpen(false)}
            >
              {item.name}
              <div className="flex justify-center">
                {item.paths.includes(location.pathname) && (
                  <div className="absolute w-15 h-1.5 mt-0.5 bg-ellPrimary"></div>
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
