import React, { useState, useEffect } from 'react';
import SignIn from '../components/signIn';
import SignOut from '../components/signout';
import Alert from '../components/Alert';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../components/firebase';
import { useTheme } from '../contexts/ThemeContext'
import { auth } from '../components/firebase';
import { signOut } from "firebase/auth";
import UploadImage from '../components/uploadImage';
import { useAuth } from '../contexts/AuthContext'; 

const Account = () => {
  const HelpCenterAPI = [import.meta.env.VITE_HELPCENTER_RECEIVER_1,import.meta.env.VITE_HELPCENTER_RECEIVER_2];
  const { currentUser, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isTheme, setIsTheme] = useState(false);
  const [isHelp, setIsHelp] = useState(false);
  const [showAlertSignIn, setShowAlertSignIn] = useState(false);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [iconImage, setIconImage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [uploadedImage, setUploadedImage] = useState("");
  const { theme: currentTheme, changeTheme, icons } = useTheme();

  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.email);
          const docSnap = await getDoc(docRef);
  
          if (docSnap.exists()) {
            const data = docSnap.data();
            setName(data.name || '');
            setNumber(data.number || '');
            setIconImage(data.profileImage);
            if (data.theme) {
              changeTheme(data.theme);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    
    loadUserData();
  }, [currentUser, changeTheme, uploadedImage]);

  const handleSignout = () => {
    setShowAlert(true);
  };
  
  const confirmSignout = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        console.log("Log Out Success");
        setShowAlert(false);
      })
      .catch((error) => console.error("Logout Failed", error));
  };

  const handleImageUpload = (url) => {
  console.log('Uploaded Image URL:', url);
  setUploadedImage(url)
};

  const handleSave = async () => {
    if (currentUser) {
      try {
        await setDoc(doc(db, "users", currentUser.email), {
          name,
          number,
          theme: currentTheme,
          profileImage: uploadedImage || iconImage,
        }, { merge: true });
        
        console.log("Profile saved:", name, number, currentTheme, uploadedImage);
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    } else {
      setShowAlertSignIn(true)
    }
  };

  const handleThemeChange = async (themeName) => {
    changeTheme(themeName);
    
    if (currentUser) {
      try {
        await setDoc(doc(db, "users", currentUser.email), {
          name: name,
          number: number,
          theme: themeName
        }, { merge: true });
      } catch (error) {
        console.error("Error saving theme preference:", error);
      }
    }
  };

  return (
    <>
        {showAlertSignIn && (
      <Alert
        onConfirm={() => setShowAlertSignIn(false)}
        onCancel={() => setShowAlertSignIn(false)}
        Header="You need to sign in first before using Easylandlord"
        Description="Please sign in with your Google account to gain access to Easylandlord."          
      />
    )}
    {showAlert && (
      <Alert
      onConfirm={confirmSignout} 
      onCancel={() => setShowAlert(false)} 
      Header="You're about to sign out"
      Description="You can return anytime, by the way your data will remain unchanged."
      />
    )}
    <div className="flex flex-col h-full w-full">
      <div className="w-full h-max bg-ellWhite flex items-center flex-col">
        {/* Profile */}
        <div className=" items-center justify-center flex-col w-full px-4 md:w-3xl border-b border-b-ellDarkGray">
          <div className="flex justify-end w-full md:w-3xl pt-6">
            {isEditing ? (
              <button className="font-prompt text-ellLime bg-ellGreen rounded-2xl px-4 py-1 text-sm cursor-pointer"
                onClick={handleSave}>บันทึก</button>
            ) : (
              <button className="font-prompt text-ellRed text-sm px-4 py-1 cursor-pointer"
                onClick={() => setIsEditing(true)}>ดูโปรไฟล์</button>
            )}
          </div>
          {isEditing ? (
            // Editing
            <div className="flex justify-center flex-col items-center w-full md:w-3xl pt-4 pb-6 animate-fadeDown">
              <UploadImage onUploadSuccess={handleImageUpload}>
                <div className="absolute rounded-full border-4 border-ellWhite h-7 w-7 bg-ellRed bottom-0 right-0 z-10 flex justify-center items-center">
                  <img src="./img/camera-light.svg" alt="edit" className="w-4" />
                </div>
                <img src={uploadedImage || iconImage || "./img/iconSubstitute.png"} width="87" height="87" alt="icon" className="h-26 w-26 object-cover border-2 border-ellPrimary rounded-full hover:opacity-70" />
              </UploadImage>
              <input
                type="text"
                placeholder="กรุณากรอกชื่อ"
                maxLength={32}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-2 border-ellGray rounded-md px-4 py-2 m-2 w-80 font-prompt text-ellPrimary text-lg"
                required
              />
              <input
                type="text"
                placeholder="กรุณากรอกเบอร์โทรศัพท์"
                maxLength={15}
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="border-2 border-ellGray rounded-md px-4 py-2 m-2 mb-6 w-80 font-prompt text-ellPrimary text-lg"
              />
              {!currentUser ? <SignIn setUser={currentUser} /> : <SignOut setUser={currentUser} />}
            </div>
          ) : (
            // Default
            <div className="flex items-center w-3xl pt-4 pb-6">
              <img src={uploadedImage || iconImage || "./img/iconSubstitute.png"} alt="icon" className="h-26 w-26 object-cover border-2 border-ellPrimary rounded-full " />
              <div className="pl-6">
                <div className="font-prompt text-ellPrimary text-lg font-semibold">{name || "ชื่อผู้ใช้"}</div>
                <div className="flex items-center">
                  <img src="./img/phone.svg" width="25" height="25" alt="phone" />
                  <div className="font-prompt text-ellDarkGray text-sm pl-2">{number || "เบอร์โทรศัพท์"}</div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Theme - Changed from button to div */}
        <div className="w-full md:w-3xl border-b border-b-ellDarkGray cursor-pointer"
             onClick={() => setIsTheme(prev => !prev)}>
          <div className="flex-row flex items-center justify-start w-3xl py-6 pl-6 hover:pl-12 duration-300 ease-in-out">
            <img src={icons.theme} width="40" height="40" alt="theme" />
            <div className="flex-row flex items-center pl-8 font-prompt font-semibold text-ellPrimary text-lg">ธีมสี</div>
          </div>
          <div className={`transition-all duration-500 ease-in-out overflow-hidden 
                      ${isTheme ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="flex flex-row justify-center mt-4">
              <button 
                className={`ml-4.5 mb-4.5 rounded-full border-2 cursor-pointer ${currentTheme === 'light' ? 'border-ellGreen' : 'border-ellRed hover:border-ellGreen'} h-16 w-16 bg-[#F7F7F7]`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleThemeChange('light');
                }}
              ></button>
              <button 
                className={`ml-4.5 mb-4.5 rounded-full border-2 cursor-pointer ${currentTheme === 'dark' ? 'border-ellGreen' : 'border-ellRed hover:border-ellGreen'} h-16 w-16 bg-[#333333]`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleThemeChange('dark');
                }}
              ></button>
              <button 
                className={`ml-4.5 mb-4.5 rounded-full border-2 cursor-pointer ${currentTheme === 'blue' ? 'border-ellGreen' : 'border-ellRed hover:border-ellGreen'} h-16 w-16 bg-[#2B334E]`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleThemeChange('blue');
                }}
              ></button>
            </div>
          </div>
        </div>
        {/* Help - Changed from button to div */}
        <div className="w-full md:w-3xl border-b border-b-ellDarkGray cursor-pointer"
            onClick={() => setIsHelp(prev => !prev)}>
          <div className="flex-row flex items-center justify-start w-3xl py-6 pl-6 hover:pl-12 duration-300 ease-in-out">
            <img src={icons.help} width="40" height="40" alt="help" />
            <div className="flex-row flex items-center pl-8 font-prompt font-semibold text-ellPrimary text-lg">ช่วยเหลือ</div>
          </div>
          <div className={`transition-all duration-500 ease-in-out overflow-hidden 
                      ${isHelp ? 'max-h-88 md:max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
            <form action="https://api.web3forms.com/submit" method="POST" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col justify-center items-center">
                <div className='flex flex-col md:flex-row gap-2 items-center w-full'>
                <input type="hidden" name="access_key" value={HelpCenterAPI}/>
                <input
                    type="text"
                    name="subject"
                    placeholder="หัวข้อ"
                    maxLength={40}
                    className="focus:outline-none focus:border-ellPrimary border-2 border-ellGray rounded-md px-4 py-2 w-full font-prompt text-ellPrimary text-lg"
                    onClick={(e) => { e.stopPropagation();}}
                  />
                <input
                    type="email"
                    name="email"
                    placeholder="อีเมล"
                    maxLength={40}
                    className="focus:outline-none focus:border-ellPrimary border-2 border-ellGray rounded-md px-4 py-2 w-full font-prompt text-ellPrimary text-lg"
                    onClick={(e) => { e.stopPropagation();}}
                  />
                  </div>
                  <div className='flex w-full flex-col items-center'>
                    <textarea
                      name="message"
                      placeholder="ข้อความ"
                      maxLength={228}
                      className="focus:outline-none focus:border-ellPrimary focus:ring-0 border-2 border-ellGray rounded-md px-4 py-2 my-2 w-full h-28 font-prompt text-ellPrimary text-lg placeholder:absolute placeholder:top-2 placeholder:left-4 resize-none overflow-hidden"
                      onClick={(e) => { e.stopPropagation(); }}
                    ></textarea>
                    <button 
                    type="submit"
                    className={`mb-2 rounded-2xl cursor-pointer h-14 w-48 bg-ellBlack font-prompt text-ellSecondary text-sm hover:scale-101 active:scale-98 font-semibold`}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >Submit</button>
                </div>
              </div>
            </form>
          </div>
        </div>
        {currentUser ? (
          // Logout Button - Changed from button to div
          <div className="w-full md:w-3xl border-b border-b-ellDarkGray cursor-pointer"
            onClick={handleSignout}>
            <div className="flex-row flex items-center justify-start w-3xl py-6 pl-7 hover:pl-12 duration-300 ease-in-out">
              <img src="./img/logout.svg" width="35" height="35" alt="Logout" />
              <div className="flex-row flex items-center pl-8 font-prompt font-semibold text-ellRed text-lg">ออกจากระบบ</div>
            </div>
          </div>
        ) : (
          // Login Button - Changed from button to div
          <div className="items-center justify-center w-full md:w-3xl border-b border-b-ellDarkGray cursor-pointer"
            onClick={() => setIsEditing(true)}>
            <div className="flex-row flex items-center justify-start w-3xl py-6 pl-6 hover:pl-12 duration-300 ease-in-out">
              <img src="./img/login.svg" width="40" height="40" alt="Login" />
              <div className="flex-row flex items-center pl-8 font-prompt font-semibold text-ellGreen text-lg">เข้าสู่ระบบ</div>
            </div>
          </div>
        )}
      </div>
      <div className="flex-grow "></div>
      <div className="w-full bg-ellBlack py-3 text-center font-prompt text-ellSecondary text-sm pb-7">
        © {new Date().getFullYear()} Easylandlord. All Rights Reserved.
      </div>
    </div>
    </>
  );
};

export default Account;