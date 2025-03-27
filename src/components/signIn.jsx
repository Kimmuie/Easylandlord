import React, { useState } from "react";
import { auth, provider } from "./firebase";
import { signInWithPopup } from "firebase/auth";

const SignIn = () => {
  const [value, setValue]= useState('')
  const handleClick = () => {
    signInWithPopup(auth, provider).then((data) => {
      localStorage.setItem("email", data.user.email);
      setValue(data.user.email);
      console.log("Log In Success")
    });
  };

  return (
    <button 
      onClick={handleClick} 
      className="flex flex-row items-center gap-2 font-prompt text-ellBlack bg-ellWhite border hover:bg-ellBlack hover:text-ellWhite border-ellDarkGray rounded-full px-4 py-2 text-lg cursor-pointer">
        <img src="./img/google.svg" width="30" height="30" alt="google" />
        Sign in with Google
    </button>
  );
};

export default SignIn;
