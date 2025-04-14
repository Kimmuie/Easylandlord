import React, { useState, useEffect, useContext } from 'react';
import ThemeContext from "../contexts/ThemeContext";
import { useParams, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../components/firebase';

const RentalDetail = () => {
  const { theme, icons } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { rentalId } = useParams();
  const [ rental, setRental ] = useState(null);
  const [ loading, setLoading ] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [user, setUser] = useState(localStorage.getItem("email") || null);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');

  const handleBackClick = () => {
    navigate(`/`);
  };

  const handleDelete = () => {
    setShowAlert(true);
  };

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
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        }
      };
      
      loadUserData();
    }, [user]);

  useEffect(() => {
    const fetchRentalDetail = async () => {
      try {
        const userEmail = localStorage.getItem("email");
        if(!userEmail){
          console.log("User Not logged in");
          return;
        }
        const userDocRef = doc(db, "users", userEmail);
        const docSnap = await getDoc(userDocRef);
        if(docSnap.exists()) {
          const userData = docSnap.data();
          if(userData.rental){
            const currentRental = userData.rental.find(r => r.id === rentalId);
            if(currentRental){
              setRental(currentRental);
            }
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching rental details:", error);
        setLoading(false);
      }
    };

    fetchRentalDetail();
  }, [rentalId]);


  const getFixedIconPath = (iconPath) => {
    return iconPath ? iconPath.replace(/^\./, '') : '';
  };

  const iconError = getFixedIconPath(icons.error);
  const iconBack = getFixedIconPath(icons.back);
  const iconTrash = getFixedIconPath(icons.trash);
  const iconEdit = getFixedIconPath(icons.edit);
  const iconSave = getFixedIconPath(icons.save);

  const rentalDetail = [
    { id: 1, squareMetre: 35 },
    { id: 2, squareMetre: 42 },
    { id: 3, squareMetre: 28 },
    { id: 4, squareMetre: 50 },
    { id: 5, squareMetre: 45 },
    { id: 6, squareMetre: 32 },
    { id: 7, squareMetre: 38 },
    { id: 8, squareMetre: 55 },
    { id: 9, squareMetre: 40 },
    { id: 10, squareMetre: 36 },
    { id: 11, squareMetre: 48 },
    { id: 12, squareMetre: 33 }
  ];
  
  if (loading) {
    return <div className='bg-ellWhite h-screen w-screen text-ellPrimary text-lg font-prompt font-semibold'>Loading...</div>;
  }
  
  if (!rental) {
    return <div className='bg-ellWhite h-screen w-screen flex flex-col items-center justify-center text-ellPrimary text-lg font-prompt font-semibold'>      
    <img src={iconError} width="55" height="40" alt="error"/>
    Rental not found
    <button onClick={handleBackClick} className="bg-[#D6D6D6] text-[#333333] hover:scale-101 active:scale-98 font-medium py-2 px-4 rounded-md cursor-pointer">กลับไปยังหน้าแรก</button>
    </div>;
  }

  return (
    <>
    <div className="bg-ellWhite md:bg-transparent h-20 md:h-0 flex justify-between md:block items-center md:border-0 border-b border-b-ellDarkGray z-40 hiddenLandscapePhone">
      <img src={iconBack} width="55" height="40" alt="back"
        className='md:top-2 left-2 md:absolute relative m-0 md:m-3 cursor-pointer border-1 border-transparent active:border-ellPrimary hover:border-ellPrimary p-2 rounded-full hiddenLandscapePhone z-20'
        onClick={handleBackClick}/>
        <div className='absolute md:hidden flex justify-center w-full z-10'>
          <span className='text-ellPrimary text-lg font-prompt font-semibold'>ดูรายละเอียด</span>
        </div>
        <img src={iconTrash} width="55" height="40" alt="trash"
        className='md:top-2 right-2 md:absolute relative m-0 md:m-3 cursor-pointer border-1 border-transparent active:border-ellPrimary hover:border-ellPrimary p-2 rounded-full hiddenLandscapePhone z-20'
        onClick={handleDelete}/>
    </div>
    {showAlert && (
        <Alert
        onConfirm={handleBackClick} 
        onCancel={() => setShowAlert(false)} 
        />
      )}
  <div className="TooltipMain fixed bottom-2 right-2 flex flex-col items-center justify-center z-50">
    <div className="mb-2 flex text-center justify-center bg-ellBlack p-1 rounded-lg font-prompt text-ellSecondary text-sm z-20 Tooltip">แก้ไข</div>
    <div className="absolute mb-12 w-4 h-4 bg-ellBlack rotate-45 z-10 Tooltip"></div>
    <img src={iconEdit} width="55" height="40" alt="edit"
      className='relative m-0 md:m-3 cursor-pointer bg-ellBlack border-1 border-transparent active:scale-98 hover:scale-105 p-2 rounded-full z-20'
      onClick={handleDelete}/>
  </div>
    <div className="overflow-y-auto overflow-x-hidden flex flex-col items-center w-full min-h-screen bg-ellWhite">
      <div className="flex flex-row justify-between md:w-4xl w-full my-4 md:mx-0 px-2">
        <div className="flex flex-row items-center font-prompt text-ellPrimary text-lg">
            <div className={`rounded-full border-2 border-ellGray h-5 w-5 mr-2 ${rental.status === "available" ? "bg-ellGreen" : "bg-ellRed"}`}></div>
            {rental.status === "available" ? "ว่าง" : "ไม่ว่าง"}
        </div>
        <div className="flex justify-center rounded-sm px-1 font-prompt text-ellSecondary text-md md:text-lg bg-ellBlack h-8">
          {rental.tag}
        </div>
      </div>
      <div className='flex flex-row xl:pl-2 md:pl-4 pl-2 xl:pr-2 md:pr-4 pr-2'>
        <img src="/img/sampleImage.jpg" alt="image" className="md:w-152 w-72 md:h-70 h-50 border-1 border-ellTertiary rounded-l-2xl"/>
        <div className='flex flex-col'>
          <img src="/img/sampleImage.jpg" alt="image" className="w-72 md:h-35 h-25 border-1 border-ellTertiary rounded-tr-2xl"/>
          <img src="/img/sampleImage.jpg" alt="image" className="w-72 md:h-35 h-25 border-1 border-ellTertiary rounded-br-2xl"/>
        </div>
      </div>
      <div className='flex flex-col xl:flex-row xl:w-fit w-full p-4'>
        <div className="flex flex-col justify-between w-md">
          <div className="flex items-center font-prompt font-semibold text-ellPrimary text-md md:text-xl xl:w-184 md:w-4xl w-56">
              {rental.name}
          </div>  
          <div className="font-prompt text-ellPrimary text-sm md:text-lg min-h-16 w-100 md:w-4xl xl:w-110">
              {rental.location}
          </div>
        </div>
        <div className='flex xl:flex-col flex-col-reverse gap-2 xl:w-md w-full'>
          <div className="flex flex-row gap-2">
            <div className="xl:w-36 md:w-full w-full flex flex-row items-center justify-center font-prompt text-[#333333] bg-ConstantGray rounded-md xl:text-md text-sm font-semibold">
              <img src="/img/bed.svg" width="35" height="40" alt="bed" className='mr-2'/>
              {rental.bedroom} ห้องนอน
            </div>
            <div className="xl:w-36 md:w-full w-full flex flex-row items-center justify-center font-prompt text-[#333333] bg-ConstantGray rounded-md xl:text-md text-sm font-semibold">
              <img src="/img/bath.svg" width="30" height="40" alt="bath" className='mr-2'/>
              {rental.restroom} ห้องน้ำ
            </div>
            <div className="xl:w-36 md:w-full w-full flex flex-row items-center justify-center font-prompt text-[#333333] bg-ConstantGray rounded-md xl:text-md text-sm font-semibold">
              <img src="/img/ruler.svg" width="33" height="40" alt="ruler" className='mr-2'/>
              {rental.squareMetre} ตร.ม
            </div>
          </div>
          <div className="flex font-prompt font-semibold text-ellPrimary text-md md:text-xl xl:justify-end justify-start">
            {rental.rentFee}/{rental.rentFrequency}
          </div>
        </div>
      </div>
      <div className='flex flex-col items-start justify-start xl:w-4xl w-full xl:px-0 px-4 flex-grow'>
        <div className="flex font-prompt font-semibold text-ellPrimary text-md md:text-xl md:justify-end justify-start">รายละเอียดของอสังหาฯ</div>
        <div className="grid grid-cols-2 xl:grid-cols-4	 md:grid-cols-3 w-full min-h-27">
          {rentalDetail.map((rental) => (
            <div key={rental.id} className="w-full flex flex-row items-center justify-start font-prompt text-ellPrimary text-md font-semibold pb-1 ">
              <img src="/img/Home-light.svg" width="30" height="30" alt="bed" className="mr-2" />
              {rental.squareMetre} ตร.ม
            </div>
          ))}
        </div>
        <div className='flex xl:flex-row flex-col-reverse w-full xl:w-4xl mb-2 mt-6 md:mt-auto xl:mt-auto self-center'>
          <div className="bg-ellWhite xl:h-20 h-22 w-full md:w-full xl:w-xl flex flex-row items-center justify-start rounded-xl border-2 border-ConstantGray p-2">
            <img src="/img/iconSubstitute.png" width="60" height="60" alt="icon" className="border-2 border-ellPrimary rounded-full ml-3" />
            <div className='flex flex-col ml-3'>
              <div className="flex justify-center font-prompt text-ellGreen bg-ellLime rounded-2xl px-4 py-0.75 text-xs">เจ้าของ{rental.tag}</div>
              <span className='text-ellPrimary font-prompt text-md font-semibold'>{name}</span>
              <span className='text-ellPrimary font-prompt opacity-80 text-sm'>{number}</span>
            </div>
          </div>
          <div className='w-full md:w-full xl:w-xl flex flex-row xl:flex-col justify-between gap-2 xl:pl-2 pl-0 xl:pb-0 pb-2'>
            <div className="w-full xl:h-8.5 h-8 flex items-center justify-between font-prompt text-[#333333] bg-ConstantGray hover:bg-ellDarkGray active:bg-ellDarkGray rounded-md text-md font-semibold cursor-pointer px-2">
              <div className="flex items-center w-full">
                <img src="/img/plus-dark.svg" width="30" height="20" alt="add" />
                <span className="flex-1 text-center">เพิ่มผู้เช่า</span>
              </div>
            </div>
            <div className="w-full xl:h-8.5 h-8 flex items-center justify-between font-prompt text-[#333333] bg-ConstantGray hover:bg-ellDarkGray active:bg-ellDarkGray rounded-md text-md font-semibold cursor-pointer px-2">
              <img src="/img/share.svg" width="35" height="40" alt="share"/>
              <span className='flex-1 text-center'>แชร์หน้านี้</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default RentalDetail