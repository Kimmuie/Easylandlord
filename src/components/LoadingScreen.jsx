import React, { useState, useEffect } from "react";

const LoadingScreen = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const durationArray = [2000, 2050, 2100, 2150, 2200, 2250];
  const randomIndex = Math.floor(Math.random() * durationOptions.length);
  const columns = [
    { id: 1, duration: `duration-${durationArray[randomIndex]}` },
    { id: 2, duration: `duration-${durationArray[randomIndex]}` },
    { id: 3, duration: `duration-${durationArray[randomIndex]}` },
    { id: 4, duration: `duration-${durationArray[randomIndex]}` },
    { id: 5, duration: `duration-${durationArray[randomIndex]}` },
    { id: 6, duration: `duration-${durationArray[randomIndex]}` },
    { id: 7, duration: `duration-${durationArray[randomIndex]}` },
    { id: 8, duration: `duration-${durationArray[randomIndex]}` }
  ];

  return (
    <div className="fixed inset-0 z-40 overflow-hidden">
      {/* GIF overlay on screen */}
      <div 
        className={`absolute inset-0 flex items-center justify-center z-50 transition-transform ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        } duration-2000 ease-in-out`}>
        <img src="./img/sign.gif" width="300" height="300" className="object-contain" alt="Loading..." />
      </div>
      {/* Stagger Animation */}
      <div className="flex h-full w-full">
        {columns.map((column) => (
          <div
            key={column.id}
            className={`flex-1 bg-seconBlue1 transition-transform ${
              isVisible ? "translate-y-0" : "-translate-y-full"
            } ${column.duration} ease-in-out`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default LoadingScreen;