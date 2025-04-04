import React, { useState } from "react";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import Alert from "./Alert";

const SignOut = ({ setUser }) => {
  const [value, setValue] = useState(localStorage.getItem("email") || "");
    const [showAlert, setShowAlert] = useState(false);

  const handleSignout = () => {
    setShowAlert(true);
  };
  
  const confirmSignout = () => {
    signOut(auth)
      .then(() => {
        localStorage.removeItem("email");
        setUser(null);
        console.log("Log Out Success");
        setShowAlert(false);
      })
      .catch((error) => console.error("Logout Failed", error));
  };

  return (
    <>
    <button
      onClick={handleSignout}
      className="flex flex-row items-center gap-2 font-prompt text-ellRed bg-ellWhite border hover:bg-ellRed hover:text-ellWhite border-ellRed rounded-full px-4 py-2 text-lg cursor-pointer">
      <img src="./img/google.svg" width="30" height="30" alt="google" className="stroke-3 stroke-ellWhite"/>
      Sign Out with Google
    </button>
      {showAlert && (
        <Alert
        onConfirm={confirmSignout} 
        onCancel={() => setShowAlert(false)} 
        />
      )}
    </>
  );
};

export default SignOut;
