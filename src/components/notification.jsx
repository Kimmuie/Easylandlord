import React, { useState, useEffect, useRef, forwardRef, useContext } from "react";
import ThemeContext from '../contexts/ThemeContext';
import { doc, getDoc, onSnapshot, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '../components/firebase';

const Notification = forwardRef((props, ref) => {
  const { theme, icons } = useContext(ThemeContext);
  const [user, setUser] = useState(localStorage.getItem("email") || null);
  const [notification, setNotification] = useState([]);
  const [allNotification, setallNotification] = useState([]);
  const [ clear, setClear ] = useState(false);

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
    
  const handleDelete = async (notiId) => {
  if (!notiId || !user) return;

  try {
    const userDocRef = doc(db, "users", user);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists() && Array.isArray(docSnap.data().notification)) {
      const currentNoti = docSnap.data().notification;
      const updatedNoti = currentNoti.filter(n => n.id !== notiId);

      await updateDoc(userDocRef, {
        notification: updatedNoti
      });

      console.log("Notification deleted successfully");
    }
  } catch (error) {
    console.error("Error deleting notification:", error);
  }
};


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
        <div className="h-12 w-full flex flex-row items-center justify-between border-b-1 border-b-ellGray text-ellPrimary text-lg font-prompt font-semibold p-4">
          <span>การแจ้งเตือน</span>
          <button className={`border-2 border-ellGray hover:border-ellPrimary rounded-2xl py-1 mr-2 w-25 md:w-22 font-prompt font-medium text-base text-ellPrimary cursor-pointer ${clear ? 'bg-ellPrimary text-ellTertiary border-transparent' : ""}`}
            onClick={() => setClear(prev => !prev)}>ล้าง</button>
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
              <img src={noti.image || "./img/sampleImage.jpg"} alt="icon" className="w-18 h-18 object-cover border-2 border-ellBlack rounded-full" />
              <div className="flex flex-col w-full ml-3">
                <div className="font-prompt font-semibold text-ellPrimary flex justify-between">
                  {noti.header}
                  <span className={`font-prompt font-semibold text-xs h-4 text-[#F7F7F7] bg-ellRed rounded px-1 ${clear && "mr-3"} ${noti.readed && "hidden"}`}>NEW</span>
                </div>
                <div className="h-10 font-prompt text-sm text-ellPrimary">{noti.description}</div>
                <div className={`font-prompt text-xs text-ellDarkGray mt-3 flex justify-end ${clear && "mr-3"}`}>{noti.date}</div>
              </div>
              {clear && <img src="./img/trash-light.svg" width="30" height="30" alt="trash" className="bg-ellRed rounded cursor-pointer hover:scale-102 active:scale-98"
              onClick={() => handleDelete(noti.id)}/>}
            </div>
        ))
      )}
      </div>
      </div>
    </>
  );
})

export default Notification;
