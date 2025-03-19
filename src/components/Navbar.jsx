import React from 'react';

const Navbar = () => {
  return (
    <div className="relative flex w-full h-20 bg-primeWhite items-center px-4 drop-shadow-md">
      <img src="./img/signBlue.png" width="140" height="140" alt="signLogo" />
      <div className="flex-8 flex justify-end">
        <button className="text-primeBlack text-lg font-ibarra font-semibold">About</button>
        <button className="text-primeBlack text-lg font-ibarra font-semibold">Experience</button>
        <button className="text-primeBlack text-lg font-ibarra font-semibold">Project</button>
        <button className="text-primeBlack text-lg font-ibarra font-semibold">Contact</button>
      </div>
      <img src="./img/Sun.png" width="56" height="56"/>
    </div>
  );
};

export default Navbar;