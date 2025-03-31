import React, { useState, useEffect, useContext } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import SignIn from '../components/signIn';
import SignOut from '../components/signout';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../components/firebase';
import ThemeContext from '../contexts/ThemeContext';

const Account = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isTheme, setIsTheme] = useState(false);
  const [user, setUser] = useState(localStorage.getItem("email") || null);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [currentTheme, setCurrentTheme] = useState('light'); // Default theme
  const { setTheme } = useContext(ThemeContext);

  const themes = {
    light: { background: '#F7F7F7', text: '#333333' },
    dark: { background: '#333333', text: '#F7F7F7' },
    blue: { background: '#2D336B', text: '#F7F7F7' }
  };
  const themeIcons = {
    light: {
      theme: "./img/theme-light.svg",
      help: "./img/help-light.svg",
    },
    dark: {
      theme: "./img/theme-dark.svg",
      help: "./img/help-dark.svg",
    },
    blue: {
      theme: "./img/theme-dark.svg",
      help: "./img/help-dark.svg",
    }
  };

  // Initialize with light theme icons (our default)
  const [icons, setIcons] = useState(themeIcons.light);

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          const docRef = doc(db, "users", user);
          const docSnap = await getDoc(docRef);
  
          if (docSnap.exists()) {
            const data = docSnap.data();
            setName(data.name || '');
            setNumber(data.number || '');
            if (data.theme) {
              setCurrentTheme(data.theme);
              applyTheme(data.theme);
              updateIcons(data.theme);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    
    loadUserData();
    
    // Check local storage for theme (fallback if not logged in)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
      updateIcons(savedTheme);
    }
  }, [user]);

  const updateIcons = (themeName) => {
    // Update all icons based on the selected theme
    setIcons(themeIcons[themeName]);
  };

  const applyTheme = (themeName) => {
    const theme = themes[themeName];
    if (!theme) return;
    
    document.documentElement.style.setProperty('--color-ellWhite', themeName === 'dark' ? '#333333' : '#F7F7F7');
    document.documentElement.style.setProperty('--color-ellBlack', themeName === 'dark' ? '#F7F7F7' : '#333333');
    
    if (themeName === 'blue') {
      document.documentElement.style.setProperty('--color-ellWhite', '#2D336B');
      document.documentElement.style.setProperty('--color-ellBlack', '#F7F7F7');
    }
    localStorage.setItem('theme', themeName);
  };

  const changeTheme = async (themeName) => {
    applyTheme(themeName);
    setCurrentTheme(themeName);
    updateIcons(themeName);
    
    // Save to Firestore if user is logged in
    if (user) {
      try {
        await setDoc(doc(db, "users", user), {
          name: name,
          number: number,
          theme: themeName
        }, { merge: true });
      } catch (error) {
        console.error("Error saving theme preference:", error);
      }
    }
  };

  // Toggle theme dropdown
  const toggleThemeDropdown = () => {
    setIsTheme(prev => !prev);
  };

  // Save profile function
  const handleSave = async () => {
    if (user) {
      try {
        await setDoc(doc(db, "users", user), {
          name,
          number,
          theme: currentTheme
        }, { merge: true });
        
        console.log("Profile saved:", name, number, currentTheme);
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    } else {
      alert("Please sign in first.");
    }
  };

  return (
    <>
      <div className="w-full h-screen bg-ellWhite flex items-center flex-col">
        {/* Profile */}
        <div className=" items-center justify-center flex-col w-full px-4 md:w-3xl border-b border-b-ellDarkGray">
          <div className="flex justify-end w-full md:w-3xl pt-6">
            {isEditing ? (
              <button className="font-prompt text-ellGreen bg-ellLime rounded-2xl px-4 py-1 text-sm cursor-pointer"
                onClick={handleSave}>บันทึก</button>
            ) : (
              <button className="font-prompt text-ellRed text-sm px-4 py-1 cursor-pointer"
                onClick={() => setIsEditing(true)}>ดูโปรไฟล์</button>
            )}
          </div>
          {isEditing ? (
            // Editing
            <div className="flex justify-center flex-col items-center w-full md:w-3xl pt-4 pb-6">
              <img src="./img/iconSubstitute.png" width="87" height="87" alt="icon" className="border-2 border-ellBlack rounded-full" />
              <input
                type="text"
                placeholder="กรุณากรอกชื่อ"
                maxLength={32}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-2 border-ellGray rounded-md px-4 py-2 m-2 w-80 font-prompt text-ellBlack text-lg"
              />
              <input
                type="text"
                placeholder="กรุณากรอกเบอร์โทรศัพท์"
                maxLength={15}
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="border-2 border-ellGray rounded-md px-4 py-2 m-2 mb-6 w-80 font-prompt text-ellBlack text-lg"
              />
              {!user ? <SignIn setUser={setUser} /> : <SignOut setUser={setUser} />}
            </div>
          ) : (
            // Default
            <div className="flex items-center w-3xl pt-4 pb-6">
              <img src="./img/iconSubstitute.png" width="87" height="87" alt="icon" className="border-2 border-ellBlack rounded-full" />
              <div className="pl-6">
                <div className="font-prompt text-ellBlack text-lg font-semibold">{name || "ชื่อผู้ใช้"}</div>
                <div className="flex items-center">
                  <img src="./img/phone.svg" width="25" height="25" alt="phone" />
                  <div className="font-prompt text-ellDarkGray text-sm pl-2">{number || "เบอร์โทรศัพท์"}</div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Theme */}
        <div className="w-full md:w-3xl border-b border-b-ellDarkGray cursor-pointer"
             onClick={toggleThemeDropdown}>
          <div className="flex-row flex items-center justify-start w-3xl py-6 pl-6 hover:pl-12 duration-300 ease-in-out">
            <img src={icons.theme} width="40" height="40" alt="theme" />
            <div className="flex-row flex items-center pl-8 font-prompt font-semibold text-ellBlack text-lg">ธีมสี</div>
          </div>
          <div className={`transition-all duration-500 ease-in-out overflow-hidden 
                      ${isTheme ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="flex flex-row justify-center mt-4">
              <button 
                className={`ml-4.5 mb-4.5 rounded-full border-2 ${currentTheme === 'light' ? 'border-ellRed' : 'border-ellGray hover:border-ellRed'} h-16 w-16 bg-[#F7F7F7]`}
                onClick={(e) => {
                  e.stopPropagation();
                  changeTheme('light');
                  setTheme("light")
                }}
              ></button>
              <button 
                className={`ml-4.5 mb-4.5 rounded-full border-2 ${currentTheme === 'dark' ? 'border-ellRed' : 'border-ellGray hover:border-ellRed'} h-16 w-16 bg-[#333333]`}
                onClick={(e) => {
                  e.stopPropagation();
                  changeTheme('dark');
                  setTheme("dark")
                }}
              ></button>
              <button 
                className={`ml-4.5 mb-4.5 rounded-full border-2 ${currentTheme === 'blue' ? 'border-ellRed' : 'border-ellGray hover:border-ellRed'} h-16 w-16 bg-[#2D336B]`}
                onClick={(e) => {
                  e.stopPropagation();
                  changeTheme('blue');
                  setTheme("blue")
                }}
              ></button>
            </div>
          </div>
        </div>
        {/* Help */}
        <div className="w-full md:w-3xl border-b border-b-ellDarkGray cursor-pointer">
          <div className="flex-row flex items-center justify-start w-3xl py-6 pl-6 hover:pl-12 duration-300 ease-in-out">
            <img src={icons.help} width="40" height="40" alt="help" />
            <div className="flex-row flex items-center pl-8 font-prompt font-semibold text-ellBlack text-lg">ช่วยเหลือ</div>
          </div>
        </div>
        {user ? (
          // Logout Button
          <div className="w-full md:w-3xl border-b border-b-ellDarkGray cursor-pointer">
            <div className="flex-row flex items-center justify-start w-3xl py-6 pl-7 hover:pl-12 duration-300 ease-in-out">
              <img src="./img/logout.svg" width="35" height="35" alt="Logout" />
              <div className="flex-row flex items-center pl-8 font-prompt font-semibold text-ellRed text-lg">ออกจากระบบ</div>
            </div>
          </div>
        ) : (
          // Login Button
          <div className="items-center justify-center w-full md:w-3xl border-b border-b-ellDarkGray cursor-pointer">
            <div className="flex-row flex items-center justify-start w-3xl py-6 pl-6 hover:pl-12 duration-300 ease-in-out">
              <img src="./img/login.svg" width="40" height="40" alt="Login" />
              <div className="flex-row flex items-center pl-8 font-prompt font-semibold text-ellGreen text-lg">เข้าสู่ระบบ</div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 w-full bg-ellBlack py-3 border-t border-ellDarkGray text-center font-prompt text-ellWhite text-sm z-10">
        © {new Date().getFullYear()} Easylandlord. All Rights Reserved.
      </div>
    </>
  );
};

export default Account;