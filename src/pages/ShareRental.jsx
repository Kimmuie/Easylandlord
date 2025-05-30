import React, { useState, useEffect, useContext, useRef } from 'react';
import ThemeContext from "../contexts/ThemeContext";
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../components/firebase';
import ShareImageGallery from '../components/shareImage';
import {formatToThaiBuddhist, formatForStorage, formatIsoToThaiBuddhist, flatpickrThaiBuddhistFormatter} from "../components/dateUtils"

const ShareRental = () => {
  const { id } = useParams();
  const [sharedData, setSharedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme, icons } = useContext(ThemeContext);
  const [rental, setRental] = useState(null);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showTagBox, setShowTagBox] = useState(false);
  const [userIconImage, setUserIconImage] = useState("");
  const [uploadedExtendImage, setUploadedExtendImage] = useState(null);
  const [currentImageShow, setCurrentImageShow] = useState('2');
  const [currentImage, setCurrentImage] = useState(currentImageShow);

  // Get from firebase User DB
  useEffect(() => {
    const fetchSharedData = async () => {
      const docSnap = await getDoc(doc(db, 'sharedRentals', id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSharedData(data);
        setRental(data.rental); // Set the rental state
      }
      setLoading(false);
    };

    fetchSharedData();
  }, [id]);
  
  const getFixedIconPath = (iconPath) => {
    return iconPath ? iconPath.replace(/^\./, '') : '';
  };

  const iconError = getFixedIconPath(icons.error);
  const iconBack = getFixedIconPath(icons.back);
  const iconTrash = getFixedIconPath(icons.trash);
  const iconCheck = getFixedIconPath(icons.check);
  const iconEdit = getFixedIconPath(icons.edit);
  const iconSave = getFixedIconPath(icons.save);
  const iconMegaphone = getFixedIconPath(icons.megaphone);
  const iconFurniture = getFixedIconPath(icons.furniture);
  const iconConditioner = getFixedIconPath(icons.conditioner);
  const iconHeater = getFixedIconPath(icons.heater);
  const iconWashing = getFixedIconPath(icons.washing);
  const iconBath = getFixedIconPath(icons.bath);
  const iconCctv = getFixedIconPath(icons.cctv);
  const iconElevator = getFixedIconPath(icons.elevator);
  const iconBalcony = getFixedIconPath(icons.balcony);
  const iconGarden = getFixedIconPath(icons.garden);
  const iconParking = getFixedIconPath(icons.parking);
  const iconPool = getFixedIconPath(icons.pool);;
  const iconRemove = getFixedIconPath(icons.remove);

  // Define propertyMapping before the conditional return
  const propertyMapping = {
    วันประกาศ: { id: 1, name: `วันประกาศ ${sharedData?.rental?.createdAt || ''}`, icon: iconMegaphone },
    ตกแต่งครบ: { id: 2, name: "ตกแต่งครบ", icon: iconFurniture },
    เครื่องปรับอากาศ: { id: 3, name: "เครื่องปรับอากาศ", icon: iconConditioner },
    เครื่องทำน้ำอุ่น: { id: 4, name: "เครื่องทำน้ำอุ่น", icon: iconHeater },
    เครื่องซักผ้า: { id: 5, name: "เครื่องซักผ้า", icon: iconWashing },
    อ่างอาบน้ำ: { id: 6, name: "อ่างอาบน้ำ", icon: iconBath },
    กล้องวงจรปิด: { id: 7, name: "กล้องวงจรปิด", icon: iconCctv },
    ลิฟต์: { id: 8, name: "ลิฟต์", icon: iconElevator },
    ระเบียง: { id: 9, name: "ระเบียง", icon: iconBalcony },
    สวน: { id: 10, name: "สวน", icon: iconGarden },
    ลานจอดรถ: { id: 11, name: "ลานจอดรถ", icon: iconParking },
    สระว่ายน้ำ: { id: 12, name: "สระว่ายน้ำ", icon: iconPool },
  }

  if (loading) {
    return <div className='bg-ellWhite h-screen w-screen text-ellPrimary text-lg font-prompt font-semibold'>Loading...</div>;
  }

  if (!sharedData) {
    return <div className='bg-ellWhite h-screen w-screen flex flex-col items-center justify-center text-ellPrimary text-lg font-prompt font-semibold'>
      <img src={iconError} width="55" height="40" alt="error" />
      Rental not found
    </div>;
  }

  // Fix the conditional check - remove the rental check and make propertyDetails optional
  if (!sharedData.rental) return null;

  const rentalDetail = Object.entries(sharedData.rental.propertyDetails || {})
  .filter(([key, value]) => value === true)
  .map(([key]) => ({
    id: propertyMapping[key].id,
    name: propertyMapping[key].name,
    icon: propertyMapping[key].icon,
  }))
  .sort((a, b) => a.id - b.id);

  return (
    <>
      <div id="capture-area" className="overflow-y-auto overflow-x-hidden flex flex-col items-center w-full min-h-screen bg-ellWhite">
        <div className="flex flex-row justify-between xl:w-4xl md:w-2xl w-full my-4 md:mx-0 px-2">
          <div className="flex flex-row items-center font-prompt text-ellPrimary text-lg w-30">
            <div className={`rounded-full border-2 border-ellGray h-5 w-5 mr-2 ${sharedData.rental.status === "available" ? "bg-ellGreen" : "bg-ellRed"}`}></div>
            {sharedData.rental.status === "available" ? "ว่าง" : "ไม่ว่าง"}
          </div>
          <button className={`flex justify-center rounded-sm px-1 font-prompt text-ellSecondary text-md md:text-lg bg-ellBlack h-8 ${showTagBox && "pointer-events-none"}`}
            onClick={() => setShowTagBox(prev => !prev)}>
            {sharedData.rental.tag}
          </button>
        </div>
        <div className="flex flex-col xl:pl-2 md:pl-4 pl-2 xl:pr-2 md:pr-4 pr-2">
        <ShareImageGallery/>
      </div>
        <div className={`flex flex-col xl:flex-row xl:w-fit md:w-full w-full pt-4 xl:px-0 px-4 ${isEditing ? "pb-1" : "pb-0"}`}>
          <div className="flex flex-col xl:w-md md:w-full w-full">
            <div className="flex items-center font-prompt font-semibold text-ellPrimary text-md md:text-xl xl:w-184 md:w-4xl w-56">
              {sharedData.rental.name}
            </div>
            <div className="font-prompt text-ellPrimary text-sm md:text-lg mt h-full w-100 md:w-4xl xl:w-110 break-all">
              {sharedData.rental.location}
            </div>
          </div>
          <div className='flex xl:flex-col flex-col-reverse gap-2 xl:w-md w-full'>
            <div className="flex flex-row gap-2">
              <div className='flex flex-col w-full'>
                <div className='flex flex-row gap-2 xl:w-md w-full'>
                  <div className="xl:w-full md:w-full w-full flex flex-row items-center justify-center font-prompt text-[#333333] bg-ConstantGray rounded-md xl:text-md text-sm font-semibold">
                    <img src="/img/bed.svg" width="35" height="40" alt="bed" className='mr-2' />
                    {sharedData.rental.bedroom} ห้องนอน
                  </div>
                  <div className="xl:w-full md:w-full w-full flex flex-row items-center justify-center font-prompt text-[#333333] bg-ConstantGray rounded-md xl:text-md text-sm font-semibold">
                    <img src="/img/bath.svg" width="30" height="40" alt="bath" className='mr-2' />
                    {sharedData.rental.restroom} ห้องน้ำ
                  </div>
                </div>
                <div className='flex flex-row  gap-2 mt-2'>
                  <div className="xl:w-full md:w-full w-full flex flex-row items-center justify-center font-prompt text-[#333333] bg-ConstantGray rounded-md xl:text-md text-sm font-semibold">
                    <img src="/img/ruler.svg" width="33" height="40" alt="ruler" className='mr-2' />
                    ขนาดอาคาร {sharedData.rental.squareMetreB || 0} {sharedData.rental.areaUnitB || "ตร.ม"}
                  </div>
                  <div className="xl:w-full md:w-full w-full flex flex-row items-center justify-center font-prompt text-[#333333] bg-ConstantGray rounded-md xl:text-md text-sm font-semibold">
                    <img src="/img/ruler.svg" width="33" height="40" alt="ruler" className='mr-2' />
                    ขนาดที่ดิน {sharedData.rental.squareMetre || 0} {sharedData.rental.areaUnit || "ตร.ม"}
                  </div>
                </div>
                <div className='flex flex-row gap-2 xl:w-md w-full mt-2'>
                  <div className="xl:w-full md:w-full w-full flex flex-row items-center justify-center font-prompt text-[#333333] bg-ConstantGray rounded-md xl:text-md text-sm font-semibold">
                    <img src="/img/electric-dark.svg" width="35" height="40" alt="bed" className='mr-2' />
                    {sharedData.rental.electricNumber || "เลขที่ผู้ใช้ไฟฟ้า"}
                  </div>
                  <div className="xl:w-full md:w-full w-full flex flex-row items-center justify-center font-prompt text-[#333333] bg-ConstantGray rounded-md xl:text-md text-sm font-semibold">
                    <img src="/img/water-dark.svg" width="30" height="40" alt="bath" className='mr-2' />
                    {sharedData.rental.waterNumber || "เลขที่ผู้ใช้น้ำ"} 
                  </div>
                </div>
              </div>
            </div>
            <div className="flex font-prompt font-semibold text-ellPrimary text-md md:text-xl items-center xl:justify-end justify-start">
                  {sharedData.rental.rentFee}/{sharedData.rental.rentFrequency}
            </div>
          </div>
        </div>
        <div className='flex flex-col items-start justify-start xl:w-4xl w-full xl:px-0 px-4 flex-grow'>
          <div className='flex flex-row items-center w-full mb-2'>
            <div className="flex font-prompt font-semibold text-ellPrimary text-md md:text-xl md:justify-end justify-start">รายละเอียดของอสังหาฯ</div>
          </div>
          <div className="grid xl:grid-cols-3 md:grid-cols-4 grid-cols-6 w-full  [writing-mode:vertical-lr]">
            {rentalDetail.map((item) => (
              <div
                key={item.id}
                className="[writing-mode:horizontal-tb] flex flex-row items-center justify-start font-prompt text-ellPrimary text-md font-semibold pb-1"
              >
                <img
                  src={item.icon}
                  width="28"
                  height="28"
                  alt="propertyIcon"
                  className="mr-2"
                />
                {item.name}
              </div>
            ))}
          </div>         
          <div className={`font-prompt text-ellPrimary text-sm md:text-lg my-2 w-100 md:w-4xl xl:w-full break-all ${rentalDetail.length === 0 ? "min-h-27" : ""}`}>
            {sharedData.rental.message}
          </div>
          <div className='flex xl:flex-row flex-col-reverse w-full xl:w-4xl mb-4 mt-4 md:mt-auto xl:mt-auto self-center '>
            <div className="bg-ellWhite xl:h-20 h-22 w-full md:w-full xl:w-full flex flex-row items-center justify-start rounded-xl border-2 border-ConstantGray p-2">
              <img src={sharedData.userIconImage || "/img/iconSubstitute.png"} alt="icon" className="w-16 h-16 object-cover border-2 border-ellPrimary rounded-full ml-3" />
              <div className='flex flex-col ml-3'>
                <div className="flex justify-center font-prompt text-ellLime bg-ellGreen rounded-2xl px-4 py-0.75 text-xs">เจ้าของ{sharedData.rental.tag === 'ไม่ได้ระบุแท็ก' ? '' : sharedData.rental.tag}</div>
                <span className='text-ellPrimary font-prompt text-md font-semibold'>{sharedData.name}</span>
                <span className='text-ellPrimary font-prompt opacity-80 text-sm'>{sharedData.number}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ShareRental