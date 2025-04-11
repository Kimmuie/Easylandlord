import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../components/firebase';

const RentalDetail = () => {
    const navigate = useNavigate();
  const { rentalId } = useParams();
  const [ rental, setRental ] = useState(null);
  const [ loading, setLoading ] = useState(true);

  const handleBackClick = () => {
    navigate(`/`);
  };

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

  if (!rental) {
    return <div>Rental not found</div>;
  }

  return (
    <>
    <img src="/img/back-light.svg" width="55" height="40" alt="bed" className='fixed m-3 cursor-pointer hover:border-1 hover:border-ellPrimary p-2 rounded-full'
      onClick={handleBackClick}/>
    <div className="flex flex-col items-center w-full h-screen bg-ellWhite">
      <div className="flex flex-row justify-between md:w-4xl w-full my-4 md:mx-0 px-2">
        <div className="flex flex-row items-center font-prompt text-ellPrimary text-lg">
            <div className={`rounded-full border-2 border-ellGray h-5 w-5 mr-2 ${rental.status === "available" ? "bg-ellGreen" : "bg-ellRed"}`}></div>
            {rental.status === "available" ? "ว่าง" : "ไม่ว่าง"}
        </div>
        <button className="font-prompt text-ellGreen bg-ellLime rounded-2xl px-4 py-1 text-sm cursor-pointer">บันทึก</button>
      </div>
      <div className='flex flex-row'>
        <img src="/img/sampleImage.jpg" alt="image" className="pl-2 md:w-152 w-72 md:h-70 h-50 border-1 border-ellTertiary rounded-l-2xl"/>
        <div className='flex flex-col'>
          <img src="/img/sampleImage.jpg" alt="image" className="pr-2 w-72 md:h-35 h-25 border-1 border-ellTertiary rounded-tr-2xl"/>
          <img src="/img/sampleImage.jpg" alt="image" className="pr-2 w-72 md:h-35 h-25 border-1 border-ellTertiary rounded-br-2xl"/>
        </div>
      </div>
      <div className='flex flex-col md:flex-row md:w-fit w-full p-4'>
        <div className="flex flex-col justify-between w-md">
          <div className="flex items-center font-prompt font-semibold text-ellPrimary text-md md:text-xl md:w-184 w-56">
              {rental.name}
          </div>  
          <div className="font-prompt text-ellPrimary text-sm md:text-lg min-h-16 w-100 md:w-110">
              {rental.location}
          </div>
        </div>
        <div className='flex md:flex-col flex-col-reverse gap-2 md:w-md w-full'>
          <div className="flex flex-row gap-2">
            <div className="w-36 flex flex-row items-center justify-center font-prompt text-ellTertiary bg-ConstantGray rounded-md text-md font-semibold cursor-pointer">
              <img src="/img/bed.svg" width="35" height="40" alt="bed" className='mr-2'/>
              {rental.bedroom} ห้องนอน
            </div>
            <div className="w-36 flex flex-row items-center justify-center font-prompt text-ellTertiary bg-ConstantGray rounded-md text-md font-semibold cursor-pointer">
              <img src="/img/bath.svg" width="30" height="40" alt="bed" className='mr-2'/>
              {rental.restroom} ห้องน้ำ
            </div>
            <div className="w-36 flex flex-row items-center justify-center font-prompt text-ellTertiary bg-ConstantGray rounded-md text-md font-semibold cursor-pointer">
              <img src="/img/ruler.svg" width="33" height="40" alt="bed" className='mr-2'/>
              {rental.squareMetre} ตร.ม
            </div>
          </div>
          <div className="flex font-prompt font-semibold text-ellPrimary text-md md:text-xl md:justify-end justify-start">
            {rental.rentFee}/{rental.rentFrequency}
          </div>
        </div>
      </div>
      <div className='flex flex-col items-start justify-start md:w-4xl w-full'>
        <div className="flex font-prompt font-semibold text-ellPrimary text-md md:text-xl md:justify-end justify-start">รายละเอียดของอสังหาฯ</div>
        <div className="w-36 flex flex-row items-center justify-start font-prompt text-ellPrimary text-md font-semibold cursor-pointer ml-1 mt-1">
          <img src="/img/Home-light.svg" width="30" height="30" alt="bed" className='mr-2'/>
          {rental.squareMetre} ตร.ม
        </div>
        <div className="w-36 flex flex-row items-center justify-start font-prompt text-ellPrimary text-md font-semibold cursor-pointer ml-1 mt-1">
          <img src="/img/Home-light.svg" width="30" height="30" alt="bed" className='mr-2'/>
          {rental.squareMetre} ตร.ม
        </div>
        <div className="w-36 flex flex-row items-center justify-start font-prompt text-ellPrimary text-md font-semibold cursor-pointer ml-1 mt-1">
          <img src="/img/Home-light.svg" width="30" height="30" alt="bed" className='mr-2'/>
          {rental.squareMetre} ตร.ม
        </div>
        <div className="w-36 flex flex-row items-center justify-start font-prompt text-ellPrimary text-md font-semibold cursor-pointer ml-1 mt-1">
          <img src="/img/Home-light.svg" width="30" height="30" alt="bed" className='mr-2'/>
          {rental.squareMetre} ตร.ม
        </div>
      </div>
    </div>
    </>
  )
}

export default RentalDetail