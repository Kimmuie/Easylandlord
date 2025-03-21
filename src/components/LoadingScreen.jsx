import React, { useState, useEffect } from "react";

const LoadingScreen = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`absolute flex flex-col w-full h-screen items-center justify-center z-50 
        bg-ellBlack transition-all duration-1000 ease-in-out
        ${isVisible ? "translate-y-0" : "-translate-y-full"}
      `}>
      <img src="./img/wHome.svg" width="90" height="90" alt="Loading..." />
      <div className="text-ellWhite text-lg font-inter font-extrabold">Easylandlord</div>
    </div>
  );
};

export default LoadingScreen;
