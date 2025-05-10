import React, { useState, useEffect, useRef, forwardRef, useContext } from "react";
import ThemeContext from '../contexts/ThemeContext';
import { doc, updateDoc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../components/firebase';

const Notification = forwardRef((props, ref) => {
  const { theme, icons } = useContext(ThemeContext);
  const [user, setUser] = useState(localStorage.getItem("email") || null);
  const [notification, setNotification] = useState([]);
  const [allNotification, setallNotification] = useState([]);

  useEffect(() => { 
    if (!user) {
      console.error("User not logged in");
      return;
    }
    const markAllAsRead = async () => {
      await updateAllNotifications({ 
        readed: true, 
      });
    };
    
    markAllAsRead();
  }, [user]);
  
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

  useEffect(() => { 
    if (!user) {
      console.error("User not logged in");
      return;
    }
    const userDocRef = doc(db, "users", user);
    
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.notification) {
          setNotification(userData.notification);
        }
      }
    }, (error) => {
      console.error("Error fetching notifications:", error);
    });
    
    return () => unsubscribe();
  }, [user]);
    
    useEffect(() => {
      let result = [...(Array.isArray(notification) ? notification : [])].sort((a, b) => {
        const idA = a.id ? parseInt(a.id.replace("noti_", ""), 10) : 0;
        const idB = b.id ? parseInt(b.id.replace("noti_", ""), 10) : 0;
        return idB - idA;
      });
        
      setallNotification(result);
    }, [notification]);
  

  return (
    <>
      <div className="md:absolute fixed flex flex-col md:w-sm w-screen md:h-[80vh] h-screen bg-ellWhite border-1 border-ellGray z-100 rounded-bl-2xl right-0 md:top-15.5 top-20 animate-fadeDown" ref={ref}>
        <div className="h-12 w-full flex flex-row items-center justify-center border-b-1 border-b-ellGray text-ellPrimary text-lg font-prompt font-semibold p-4">
        การแจ้งเตือน
        </div>
        <div className="w-full overflow-y-auto">
        {allNotification.length === 0 ? (
          <div className="h-full w-full pointer-events-none absolute flex flex-col justify-center items-center">
            <img src={icons.inbox} width="90" height="90" alt="inbox" />
            <div className="font-prompt text-ellPrimary font-semibold text-lg">ไม่พบการแจ้งเตือน</div>   
          </div>
         ) : (
          allNotification.map((noti) => (
            <div 
              key={noti.id} 
              className="p-3 border-b border-ellDarkGray flex flex-row"
            >
              <img src="./img/iconSubstitute.png" alt="icon" className="w-18 h-18 border-2 border-ellBlack rounded-full" />
              <div className="flex flex-col w-full ml-3">
                <div className="font-prompt font-semibold text-ellPrimary">{noti.header}</div>
                <div className="h-10 font-prompt text-sm text-ellPrimary">{noti.description}</div>
                <div className="font-prompt text-xs text-ellDarkGray mt-3 flex justify-end">{noti.date}</div>
              </div>
            </div>
        ))
      )}
      </div>
      </div>
    </>
  );
})

export default Notification;
