import React, { useState, useEffect } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import SignIn from '../components/signIn'
import SignOut from '../components/signout'
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../components/firebase'

const Account = () => {

  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [user, setUser] = useState(localStorage.getItem("email") || null);
  const [name , setName] = useState('')
  const [number , setNumber] = useState('')

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const docRef = doc(db, "users", user);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || '');
          setNumber(data.number || '');
        }
      };

      fetchUserData();
    }
  }, [user]);

  const handleSave = async () => {
    if (user) {
      try {
        await setDoc(doc(db, "users", user), {
          name,
          number,
        });
        alert("Profile updated successfully!");
        console.log(name)
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
    <div className="w-full h-full bg-ellWhite flex items-center flex-col">
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
            <img src="./img/iconSubstitute.png" width="87" height="87" alt="icon" className="border-2 rounded-full"/>
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
            <img src="./img/iconSubstitute.png" width="87" height="87" alt="icon" className="border-2 rounded-full"/>
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
      {/* Notification */}
      <div className=" items-center justify-center w-full md:w-3xl border-b border-b-ellDarkGray cursor-pointer">
        <div className="flex-row flex items-center justify-start w-3xl py-6 pl-6 hover:pl-12 duration-300 ease-in-out">
        <img src="./img/help.svg" width="40" height="40" alt="notifications" />
          <div className="flex-row flex items-center pl-6">
            <div className="font-prompt font-semibold text-ellBlack text-lg pl-2">ช่วยเหลือ</div>
          </div>
        </div>
      </div>
      {user ? (
        // Logout Button
        <div className="items-center justify-center w-full md:w-3xl border-b border-b-ellDarkGray cursor-pointer">
          <div className="flex-row flex items-center justify-start w-3xl py-6 pl-7 hover:pl-12 duration-300 ease-in-out">
            <img src="./img/logout.svg" width="35" height="35" alt="Logout" />
            <div className="flex-row flex items-center pl-6">
              <div className="font-prompt font-semibold text-ellRed text-lg pl-2">
                ออกจากระบบ
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Login Button
        <div className="items-center justify-center w-full md:w-3xl border-b border-b-ellDarkGray cursor-pointer">
          <div className="flex-row flex items-center justify-start w-3xl py-6 pl-6 hover:pl-12 duration-300 ease-in-out">
            <img src="./img/login.svg" width="40" height="40" alt="Login" />
            <div className="flex-row flex items-center pl-6">
              <div className="font-prompt font-semibold text-ellGreen text-lg pl-2">
                เข้าสู่ระบบ
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}

export default Account