import React, { useState, useEffect, useContext } from "react";
import ThemeContext from "../contexts/ThemeContext";

const LoadingScreen = () => {
  const { theme, icons } = useContext(ThemeContext);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  
  return (
    <div
      className={`absolute flex flex-col w-full h-screen items-center justify-center z-50 
        bg-ellBlack transition-transform duration-1000 ease-in-out
        ${isVisible ? "translate-y-0" : "-translate-y-full"}
      `}>
      <img src={icons.loading} width="90" height="90" alt="Loading..." />
      <div className="text-ellSecondary text-lg font-inter font-extrabold">Easylandlord</div>
    </div>
  );
};

export default LoadingScreen;
