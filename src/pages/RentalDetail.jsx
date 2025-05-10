import React, { useState, useEffect, useContext, useRef } from 'react';
import ThemeContext from "../contexts/ThemeContext";
import { useParams, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import FinancialHistory from '../components/financialHistory';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../components/firebase';

const RentalDetail = () => {
  const { theme, icons } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { rentalId } = useParams();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAlertDelete, setShowAlertDelete] = useState(false);
  const [showAlertDeleteTenant, setShowAlertDeleteTenant] = useState(false);
  const [showAlertBackEdit, setShowAlertBackEdit] = useState(false);
  const [user, setUser] = useState(localStorage.getItem("email") || null);
  const [rentalName, setRentalName] = useState('');
  const [rentalLocate, setRentalLocate] = useState('');
  const [rentalFee, setRentalFee] = useState('');
  const [rentalBedroom, setRentalBedroom] = useState(0);
  const [rentalRestroom, setRentalRestroom] = useState(0);
  const [rentalArea, setRentalArea] = useState('');
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [haveTenant, setHaveTenant] = useState(false);
  const [nameTenant, setNameTenant] = useState('');
  const [numberTenant, setNumberTenant] = useState('');
  const [tempoDate, setTempoDate] = useState('');
  const [sentDelete, setSentDelete] = useState('');
  const [checkDate, setCheckDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showTagBox, setShowTagBox] = useState(false);
  const [showFrequencyBox, setShowFrequencyBox] = useState(false);
  const [showDetailsBox, setShowDetailsBox] = useState(false);
  const filterTagBoxRef = useRef(null);
  const filterFrequencyBoxRef = useRef(null);
  const filterDetailsBoxRef = useRef(null);
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('');
  const [selectedDetails, setSelectedDetails] = useState('');
  const tagOptions = ['ไม่ได้ระบุแท็ก', 'บ้านเช่า', 'โกดัง', 'ตึกเเถว', 'ที่ดิน', 'คอนโด'];
  const frequencyOptions = ['วัน', 'อาทิตย์', 'เดือน', 'ปี'];
  const detailsOptions = {
    'วันประกาศ': false,
    'ตกแต่งครบ': false,
    'เครื่องปรับอากาศ': false,
    'เครื่องทำน้ำอุ่น': false,
    'เครื่องซักผ้า': false,
    'อ่างอาบน้ำ': false,
    'กล้องวงจรปิด': false,
    'ลิฟต์': false,
    'ระเบียง': false,
    'สวน': false,
    'ลานจอดรถ': false,
    'สระว่ายน้ำ': false
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterTagBoxRef.current && !filterTagBoxRef.current.contains(event.target)) {
        setShowTagBox(false);
      }
      if (filterFrequencyBoxRef.current && !filterFrequencyBoxRef.current.contains(event.target)) {
        setShowFrequencyBox(false);
      }
      if (filterDetailsBoxRef.current && !filterDetailsBoxRef.current.contains(event.target)) {
        setShowDetailsBox(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChangeInput = (e, fieldType) => {
    const input = e.target.value.replace(/,/g, '');
    if (/^\d*$/.test(input)) {
      const formatted = input ? Number(input).toLocaleString('en-US') : '';
      if (fieldType === 'area') {
        setRentalArea(formatted);
      } else if (fieldType === 'fee') {
        setRentalFee(formatted);
      }
    }
  };

  const handleBackClick = () => {
    if (isEditing){
    setShowAlertBackEdit(true)
    }else{
    navigate(`/`);
    }
  };
  
  const handleDeleteTenant = async () => {
    setShowAlertDeleteTenant(false);
    
    try {
      setHaveTenant(false);
      setNameTenant("");
      setNumberTenant("");
      setDueDate("");
      setSentDelete("all");
      await updateRentalField({ 
        tenant: false, 
        status: "available", 
        dueDate: "", 
        tenantName: "", 
        tenantNumber: "" 
      });
      console.log("Tenant removed successfully");

      await fetchRentalDetail();
    } catch (error) {
      console.error("Error removing tenant:", error);
      setHaveTenant(true);
    }
  };

  const handleDelete = async () => {
    setShowAlertDelete(false);
    if (!rental || !user) {
      return;
    }
  
    try {
      const userDocRef = doc(db, "users", user);
      const docSnap = await getDoc(userDocRef);
  
      if (docSnap.exists() && docSnap.data().rental) {
        const updatedRentals = docSnap.data().rental.filter(r => r.id !== rentalId);
        
        await updateDoc(userDocRef, { rental: updatedRentals });
        
        console.log("Rental deleted successfully");
        navigate('/');
      }
    } catch (error) {
      console.error("Error deleting rental:", error);
    }
  
  };

  // Tag & Frequency
  const handleTagSelect = async (value, type) => {
    if (type === 'tag') {
      setSelectedTag(value);
      setShowTagBox(false);
    } else if (type === 'frequency') {
      setSelectedFrequency(value);
      setShowFrequencyBox(false);
    } else if (type === 'details') {
      const updatedDetails = { ...selectedDetails };
      updatedDetails[value] = !updatedDetails[value];
      setSelectedDetails(updatedDetails);
    }

    if (!rental || !user) {
      return;
    }

    try {
      const userDocRef = doc(db, "users", user);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists() && docSnap.data().rental) {
        const updatedRentals = docSnap.data().rental.map(r => {
          if (r.id === rentalId) {
            if (type === 'tag') {
              return { ...r, tag: value };
            } else if (type === 'frequency') {
              return { ...r, propertyDetails: value };
            } else if (type === 'details') {
              const updatedPropertyDetails = { ...r.propertyDetails };
              updatedPropertyDetails[value] = !updatedPropertyDetails[value];
              return { ...r, propertyDetails: updatedPropertyDetails };
            }
            return r;
          }
          return r;
        });

        await updateDoc(userDocRef, { rental: updatedRentals });

        setRental(prev => {
          if (type === 'tag') {
            return { ...prev, tag: value };
          } else if (type === 'frequency') {
            return { ...prev, rentFrequency: value };
          } else if (type === 'details') {
            const updatedPropertyDetails = { ...prev.propertyDetails };
            updatedPropertyDetails[value] = !updatedPropertyDetails[value];
            return { ...prev, propertyDetails: updatedPropertyDetails };
          }
          return prev;
        });
      }
    } catch (error) {
      console.error("Error updating tag:", error);
    }

    setShowTagBox(false);
  };

  const handleCheck = async () => {
    if (rental && user) {
      try {
        const userDocRef = doc(db, "users", user);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setCheckDate(Date.now())
          if (userData.rental) {
            const updatedRentals = userData.rental.map(r =>
              r.id === rentalId ? { ...r, checkDate: checkDate } : r
            );
            await updateDoc(userDocRef, {
              rental: updatedRentals
            });

            setRental(prevRental => ({
              ...prevRental,
              checkDate: checkDate
            }));

            console.log("Check rental successfully");
          }
        }
      } catch (error) {
        console.error("Error updating rental:", error);
      }
    }
  }

  // Manual Save
  const handleSave = async () => {
    if (isEditing && rental && user) {
      try {
        const userDocRef = doc(db, "users", user);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();

          if (userData.rental) {
            const updatedRentals = userData.rental.map(r =>
              r.id === rentalId ? { ...r, name: rentalName, location: rentalLocate, rentFee: rentalFee, bedroom: rentalBedroom, restroom: rentalRestroom, squareMetre: rentalArea, tenantName: nameTenant, tenantNumber: numberTenant, dueDate: dueDate } : r
            );
            await updateDoc(userDocRef, {
              rental: updatedRentals
            });

            setRental(prevRental => ({
              ...prevRental,
              name: rentalName,
              location: rentalLocate,
              rentFee: rentalFee,
              bedroom: rentalBedroom,
              restroom: rentalRestroom,
              squareMetre: rentalArea,
              tenantName: nameTenant,
              tenantNumber: numberTenant,
              dueDate: dueDate
            }));

            console.log("Other rental details updated successfully");
          }
        }
      } catch (error) {
        console.error("Error updating rental:", error);
      }
    }

    setIsEditing(false);
  }

  // Get from firebase User DB
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

  // Get from firebase Rental DB
  const fetchRentalDetail = async () => {
    try {
      const userEmail = localStorage.getItem("email");
      if (!userEmail) {
        console.log("User Not logged in");
        return;
      }
      const userDocRef = doc(db, "users", userEmail);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.rental) {
          const currentRental = userData.rental.find(r => r.id === rentalId);
          if (currentRental) {
            setRental(currentRental);
            setRentalName(currentRental.name);
            setRentalLocate(currentRental.location);
            setRentalFee(currentRental.rentFee);
            setRentalBedroom(currentRental.bedroom);
            setRentalRestroom(currentRental.restroom);
            setRentalArea(currentRental.squareMetre);
            setSelectedTag(currentRental.tag);
            setSelectedFrequency(currentRental.rentFrequency);
            setSelectedDetails(currentRental.propertyDetails);
            setHaveTenant(currentRental.tenant);
            setNameTenant(currentRental.tenantName);
            setNumberTenant(currentRental.tenantNumber);
            setDueDate(currentRental.dueDate);
            setCheckDate(currentRental.checkDate)
          }
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching rental details:", error);
      setLoading(false);
    }
  };
  
  // Run once on mount or rentalId change
  useEffect(() => {
    fetchRentalDetail();
  }, [rentalId]);

  // Auto Save
  const updateRentalField = async (fieldsToUpdate) => {
    if (rental && user) {
      try {
        const userDocRef = doc(db, "users", user);
        const docSnap = await getDoc(userDocRef);
  
        if (docSnap.exists()) {
          const userData = docSnap.data();
  
          if (Array.isArray(userData.rental)) {
            const updatedRentals = userData.rental.map(r =>
              r.id === rentalId ? { ...r, ...fieldsToUpdate } : r
            );
  
            await updateDoc(userDocRef, { rental: updatedRentals });
            setRental(prev => ({ ...prev, ...fieldsToUpdate }));
  
            console.log("Rental updated successfully");
          }
        }
      } catch (error) {
        console.error("Error updating rental:", error);
      }
    }
    fetchRentalDetail();
  };
  
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


  if (!rental || !rental.propertyDetails) return null;

  const propertyMapping = {
    วันประกาศ: { id: 1, name: `วันประกาศ ${rental.createdAt}`, icon: iconMegaphone },
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

  const handleDateChange = (e) => {
    const isoDate = e.target.value;
    setTempoDate(isoDate);
    
    if (isoDate) {
      const [year, month, day] = isoDate.split('-');
      setDueDate(`${day}/${month}/${year}`);
    } else {
      setDueDate("");
    }
  };

  const rentalDetail = Object.entries(rental.propertyDetails)
    .filter(([key, value]) => value === true)
    .map(([key]) => ({
      id: propertyMapping[key].id,
      name: propertyMapping[key].name,
      icon: propertyMapping[key].icon,
    }))
    .sort((a, b) => a.id - b.id);

  if (loading) {
    return <div className='bg-ellWhite h-screen w-screen text-ellPrimary text-lg font-prompt font-semibold'>Loading...</div>;
  }

  if (!rental) {
    return <div className='bg-ellWhite h-screen w-screen flex flex-col items-center justify-center text-ellPrimary text-lg font-prompt font-semibold'>
      <img src={iconError} width="55" height="40" alt="error" />
      Rental not found
      <button onClick={handleBackClick} className="bg-[#D6D6D6] text-[#333333] hover:scale-101 active:scale-98 font-medium py-2 px-4 rounded-md cursor-pointer">กลับไปยังหน้าแรก</button>
    </div>;
  }

  return (
    <>
      {showAlertDelete && (
        <Alert
          onConfirm={handleDelete}
          onCancel={() => setShowAlertDelete(false)}
          Header="You're about to delete this rental"
          Description="The data has already been imported to the Finance page, but your financial data in this rental will be deleted."          
        />
      )}
      {showAlertDeleteTenant && (
        <Alert
          onConfirm={handleDeleteTenant}
          onCancel={() => setShowAlertDeleteTenant(false)}
          Header="You're about to remove tenant"
          Description="The data has already been imported to the Finance page, but your financial data and tenant data in this rental will be deleted."          
        />
      )}
      {showAlertBackEdit && (
        <Alert
          onConfirm={() => navigate(`/`)}
          onCancel={() => setShowAlertBackEdit(false)}
          Header="You're about to leave this page without saving"
          Description="The data that has already been edited will not be saved if you leave this page without saving."          
        />
      )}
      <div className="bg-ellWhite md:bg-transparent h-20 md:h-0 flex justify-between md:block items-center md:border-0 border-b border-b-ellDarkGray z-40 hiddenLandscapePhone">
        <img src={iconBack} width="55" height="40" alt="back"
          className='xl:top-2 md:top-0 xl:left-2 md:left-0 left-2 md:absolute relative m-0 xl:m-3 md:m-1 cursor-pointer border-1 border-transparent active:border-ellPrimary hover:border-ellPrimary p-2 rounded-full hiddenLandscapePhone z-20'
          onClick={handleBackClick} />
        <div className='absolute md:hidden flex justify-center w-full z-10'>
          <span className='text-ellPrimary text-lg font-prompt font-semibold'>ดูรายละเอียด</span>
        </div>
        <img src={iconTrash} width="55" height="40" alt="trash"
          className='xl:top-2 md:top-0 xl:right-2 md:right-0 right-2 md:absolute relative m-0 xl:m-3 md:m-1 cursor-pointer border-1 border-transparent active:border-ellPrimary hover:border-ellPrimary p-2 rounded-full hiddenLandscapePhone z-20'
          onClick={() => setShowAlertDelete(true)} />
      </div>
        <div className="TooltipMain fixed bottom-24 right-4 flex flex-col items-center justify-center z-50">
          <div className="flex text-center justify-center bg-ellBlack p-1 mb-2 rounded-lg font-prompt text-ellSecondary text-sm z-20 Tooltip">ตรวจเช็ค</div>
          <div className="absolute mb-14 w-4 h-4 bg-ellBlack rotate-45 z-10 Tooltip"></div>
          <button className="relative rounded-full bg-ellBlack flex items-center justify-center cursor-pointer active:scale-98 hover:scale-105 p-3 z-20"
            onClick={handleCheck}>
            <img src={iconCheck} width="40" height="40" alt="edit" />
          </button>
        </div>
      {isEditing ? (
        <div className="TooltipMain fixed bottom-4 right-4 flex flex-col items-center justify-center z-50">
          <div className="flex text-center justify-center bg-ellGreen p-1 mb-2 rounded-lg font-prompt text-[#F7F7F7] text-sm z-20 Tooltip">บันทึก</div>
          <div className="absolute mb-14 w-4 h-4 bg-ellGreen rotate-45 z-10 Tooltip"></div>
          <button className="relative rounded-full bg-ellGreen flex items-center justify-center cursor-pointer active:scale-98 hover:scale-105 p-3 z-20"
            onClick={handleSave}>
            <img src={iconSave} width="40" height="40" alt="save" />
          </button>
        </div>
      ) : (
        <div className="TooltipMain fixed bottom-4 right-4 flex flex-col items-center justify-center z-50">
          <div className="flex text-center justify-center bg-ellBlack p-1 mb-2 rounded-lg font-prompt text-ellSecondary text-sm z-20 Tooltip border-t-2 border-x-2 border-ellWhite">แก้ไข</div>
          <div className="absolute mb-14 w-4 h-4 bg-ellBlack rotate-45 z-10 Tooltip"></div>
          <button className="relative rounded-full bg-ellBlack flex items-center justify-center cursor-pointer active:scale-98 hover:scale-105 p-3 z-20"
            onClick={() => setIsEditing(true)}>
            <img src={iconEdit} width="40" height="40" alt="edit" />
          </button>
        </div>
      )}
      <div className="overflow-y-auto overflow-x-hidden flex flex-col items-center w-full min-h-screen bg-ellWhite">
        <div className="flex flex-row justify-between xl:w-4xl md:w-2xl w-full my-4 md:mx-0 px-2">
          <div className="flex flex-row items-center font-prompt text-ellPrimary text-lg">
            <div className={`rounded-full border-2 border-ellGray h-5 w-5 mr-2 ${rental.status === "available" ? "bg-ellGreen" : "bg-ellRed"}`}></div>
            {rental.status === "available" ? "ว่าง" : "ไม่ว่าง"}
          </div>
          <div className="relative inline-block">
            <button className="flex justify-center rounded-sm px-1 font-prompt text-ellSecondary text-md md:text-lg bg-ellBlack h-8 cursor-pointer"
              onClick={() => setShowTagBox(prev => !prev)}>
              {rental.tag}
            </button>
            {/* TagBox */}
            {showTagBox &&
              <div className="absolute top-full mt-2 left-2 md:left-1/2 -translate-x-1/2 w-25 md:w-30 bg-ellBlack p-2 flex flex-col gap-1 rounded-xl border-2 border-ellPrimary z-50"
                ref={filterTagBoxRef}>
                <div className="absolute -top-2.5 left-15 md:left-11.75 w-4 h-4 bg-ellBlack rotate-45 border-s-2 border-t-2 border-s-ellPrimary border-t-ellPrimary"></div>
                {tagOptions.map((tag, index) => (
                  <label key={index} className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      checked={selectedTag === tag}
                      onChange={() => handleTagSelect(tag, 'tag')}
                      className="appearance-none w-3 h-3 rounded-full border-2 border-ellSecondary checked:bg-ellSecondary checked:border-transparent cursor-pointer"
                    />
                    <span className="font-prompt text-ellSecondary text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleTagSelect(tag, 'tag');
                      }}>
                      {tag}
                    </span>
                  </label>
                ))}
              </div>
            }
          </div>
        </div>
        <div className='flex flex-row xl:pl-2 md:pl-4 pl-2 xl:pr-2 md:pr-4 pr-2'>
          <img src="/img/sampleImage.jpg" alt="image" className="md:w-152 w-72 md:h-70 h-50 border-1 border-ellTertiary rounded-l-2xl" />
          <div className='flex flex-col'>
            <img src="/img/sampleImage.jpg" alt="image" className="w-72 md:h-35 h-25 border-1 border-ellTertiary rounded-tr-2xl" />
            <img src="/img/sampleImage.jpg" alt="image" className="w-72 md:h-35 h-25 border-1 border-ellTertiary rounded-br-2xl" />
          </div>
        </div>
        <div className={`flex flex-col xl:flex-row xl:w-fit md:w-full w-full pt-4 xl:px-0 px-4 ${isEditing ? "pb-1" : "pb-0"}`}>
          <div className="flex flex-col justify-between xl:w-md md:w-full w-full">
            {isEditing ? (
              <>
                <input
                  type="text"
                  placeholder="กรุณากรอกชื่ออสังหาริมทรัพย์"
                  maxLength={40}
                  value={rentalName}
                  onChange={(e) => setRentalName(e.target.value)}
                  className="border-2 border-ellGray rounded-md px-2 py-0.5 xl:w-110 md:w-full w-full font-prompt font-semibold text-ellPrimary text-md md:text-xl"
                  required
                />
                <textarea
                  placeholder="กรุณากรอกที่อยู่ตาม Google Maps"
                  maxLength={144}
                  value={rentalLocate}
                  onChange={(e) => setRentalLocate(e.target.value)}
                  className="border-2 border-ellGray rounded-md px-2 py-0.5 mt-2 min-h-16 xl:w-110 md:w-full w-full font-prompt text-ellPrimary text-sm md:text-lg resize-none"
                  required
                />
              </>
            ) : (
              <>
                <div className="flex items-center font-prompt font-semibold text-ellPrimary text-md md:text-xl xl:w-184 md:w-4xl w-56">
                  {rental.name}
                </div>
                <div className="font-prompt text-ellPrimary text-sm md:text-lg min-h-16 w-100 md:w-4xl xl:w-110">
                  {rental.location}
                </div>
              </>
            )}
          </div>
          <div className='flex xl:flex-col flex-col-reverse gap-2 xl:w-md w-full'>
            <div className="flex flex-row gap-2">
              {isEditing ? (
                <>
                  {/* Bedroom */}
                  <div className="xl:w-36 md:w-full w-full flex flex-row items-center justify-center font-prompt text-[#333333] bg-ConstantGray rounded-md xl:text-md text-sm font-semibold">
                    <img src="/img/plus-dark.svg" width="30" height="20" alt="add"
                      className='border-2 border-[#333333] ml-0.5 rounded-sm cursor-pointer hover:scale-105 active:scale-98'
                      onClick={() => setRentalBedroom(prev => Math.min(Math.max(prev + 1, 0), 50))} />
                    <div className='w-full flex items-center justify-center'>
                      <img src="/img/bed.svg" width="35" height="40" alt="bed" className='xl:mr-2 md:mr-2 mr-0' />
                      {rentalBedroom}
                    </div>
                    <img src="/img/minus-dark.svg" width="30" height="20" alt="remove"
                      className='border-2 border-[#333333] mr-0.75 rounded-sm cursor-pointer hover:scale-105 active:scale-98'
                      onClick={() => setRentalBedroom(prev => Math.min(Math.max(prev - 1, 0), 50))} />
                  </div>
                  {/* Restroom */}
                  <div className="xl:w-36 md:w-full w-full flex flex-row items-center justify-center font-prompt text-[#333333] bg-ConstantGray rounded-md xl:text-md text-sm font-semibold">
                    <img src="/img/plus-dark.svg" width="30" height="20" alt="add"
                      className='border-2 border-[#333333] ml-0.5 rounded-sm cursor-pointer hover:scale-105 active:scale-98'
                      onClick={() => setRentalRestroom(prev => Math.min(Math.max(prev + 1, 0), 50))} />
                    <div className='w-full flex items-center justify-center'>
                      <img src="/img/bath.svg" width="30" height="40" alt="bath" className='xl:mr-2 md:mr-2 mr-0' />
                      {rentalRestroom}
                    </div>
                    <img src="/img/minus-dark.svg" width="30" height="20" alt="remove"
                      className='border-2 border-[#333333] mr-0.75 rounded-sm cursor-pointer hover:scale-105 active:scale-98'
                      onClick={() => setRentalRestroom(prev => Math.min(Math.max(prev - 1, 0), 50))} />
                  </div>
                  {/* Square Metre */}
                    <div className="xl:w-36 md:w-full w-full flex flex-row items-center justify-center font-prompt text-[#333333] bg-ConstantGray rounded-md xl:text-md text-sm font-semibold">
                      <img src="/img/ruler.svg" width="33" height="40" alt="ruler" className='mx-2' />
                      <input
                        type="text"
                        placeholder="กรอกพื้นที่"
                        maxLength={6}
                        value={rentalArea}
                        onChange={(e) => handleChangeInput(e, 'area')}
                        className="text-center border-2 border-[#333333]  rounded-md mr-2 px-2 py-0.5 w-full font-prompt font-semibold text-[#333333] xl:text-md text-sm"
                        required
                      />
                    </div>
                </>
              ) : (
                <>
                  <div className="xl:w-36 md:w-full w-full flex flex-row items-center justify-center font-prompt text-[#333333] bg-ConstantGray rounded-md xl:text-md text-sm font-semibold">
                    <img src="/img/bed.svg" width="35" height="40" alt="bed" className='mr-2' />
                    {rental.bedroom} ห้องนอน
                  </div>
                  <div className="xl:w-36 md:w-full w-full flex flex-row items-center justify-center font-prompt text-[#333333] bg-ConstantGray rounded-md xl:text-md text-sm font-semibold">
                    <img src="/img/bath.svg" width="30" height="40" alt="bath" className='mr-2' />
                    {rental.restroom} ห้องน้ำ
                  </div>
                  <div className="xl:w-36 md:w-full w-full flex flex-row items-center justify-center font-prompt text-[#333333] bg-ConstantGray rounded-md xl:text-md text-sm font-semibold">
                    <img src="/img/ruler.svg" width="33" height="40" alt="ruler" className='mr-2' />
                    {rental.squareMetre} ตร.ม
                  </div>
                </>
              )}
            </div>
            <div className="flex font-prompt font-semibold text-ellPrimary text-md md:text-xl items-center xl:justify-end justify-start">
              {isEditing ? (
                <>
                  <input
                    type="text"
                    placeholder="กรอกค่าเช่า"
                    maxLength={10}
                    value={rentalFee}
                    onChange={(e) => handleChangeInput(e, 'fee')}
                    className="border-2 border-ellGray rounded-md px-2 py-0.5 w-32 font-prompt font-semibold text-ellPrimary text-md md:text-xl mr-2 xl:text-end text-start"
                    required
                  />
                  /
                  <div className="relative inline-block">
                    <button className={`border-2 rounded-md px-2 py-0.5 ml-2 cursor-pointer ${showFrequencyBox ? "border-ellPrimary" : "border-ellGray"}`}
                      onClick={() => setShowFrequencyBox(prev => !prev)}>
                      {rental.rentFrequency}
                    </button>
                    {showFrequencyBox &&
                      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-25 md:w-30 bg-ellBlack p-2 flex flex-col gap-1 rounded-xl border-2 border-ellPrimary z-50"
                        ref={filterFrequencyBoxRef}>
                        <div className="absolute -top-2.5 left-11.75 w-4 h-4 bg-ellBlack rotate-45 border-s-2 border-t-2 border-s-ellPrimary border-t-ellPrimary"></div>
                        {frequencyOptions.map((frequency, index) => (
                          <label key={index} className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="radio"
                              checked={selectedFrequency === frequency}
                              onChange={() => handleTagSelect(frequency, 'frequency')}
                              className="appearance-none w-3 h-3 rounded-full border-2 border-ellSecondary checked:bg-ellSecondary checked:border-transparent cursor-pointer"
                            />
                            <span className="font-prompt font-medium text-ellSecondary text-xs"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleTagSelect(frequency, 'frequency');
                              }}>
                              {frequency}
                            </span>
                          </label>
                        ))}
                      </div>
                    }
                  </div>
                </>
              ) : (
                <>
                  {rental.rentFee}/{rental.rentFrequency}
                </>
              )}
            </div>
          </div>
        </div>
        {haveTenant ? (
          <div className='flex flex-col xl:w-fit md:w-ful w-full'>
            <div className="flex flex-col xl:flex-row xl:w-fit md:w-full w-full pt-4 xl:px-0 px-4">
              <div className="flex flex-col justify-between xl:w-md md:w-full w-full xl:pr-2 md:pr-0">
                <div className="flex items-center font-prompt font-semibold text-ellPrimary text-md md:text-xl xl:w-full md:w-full w-56">
                  รายละเอียดผู้เช่า
                </div>
                <div className="bg-ellWhite xl:h-20 h-22 w-full md:w-full xl:w-full flex flex-row items-center justify-between rounded-xl border-2 border-ConstantGray p-2">
                  <div className="flex flex-row items-center">
                    <img src="/img/iconSubstitute.png" width="60" height="60" alt="icon" className="border-2 border-ellPrimary rounded-full ml-3" />
                    <div className='flex flex-col ml-3'>
                    {isEditing ? (
                      <>
                      <input
                        type="text"
                        placeholder="กรอกชื่อผู้เช่า"
                        maxLength={20}
                        value={nameTenant}
                        onChange={(e) => setNameTenant(e.target.value)}
                        className="text-center border-2 border-ellGray  rounded-md mr-2 px-2 py-0.5 w-full font-prompt font-semibold text-ellPrimary xl:text-md text-sm mb-1"
                      />
                      <input
                        type="text"
                        placeholder="กรอกเบอร์โทรศัพท์ผู้เช่า"
                        maxLength={20}
                        value={numberTenant}
                        onChange={(e) => setNumberTenant(e.target.value)}
                        className="text-center border-2 border-ellGray  rounded-md mr-2 px-2 py-0.5 w-full font-prompt font-semibold text-ellPrimary xl:text-md text-sm mt-1"
                      />
                      </>
                    ):(
                      <>
                      <span className="flex justify-center font-prompt text-ellLime bg-ellGreen rounded-2xl px-4 py-0.75 text-xs">จ่ายค่าเช่าแล้ว</span>
                      <span className='text-ellPrimary font-prompt text-md font-semibold'>{nameTenant.trim() === "" ? "ชื่อผู้เช่า" : nameTenant}</span>
                      <span className='text-ellPrimary font-prompt opacity-80 text-sm'>{numberTenant.trim() === "" ? "เบอร์โทรศัพท์" : numberTenant}</span>
                      </>
                    )}
                    </div>
                  </div>
                  
                  <div className="flex flex-row items-center gap-3 mr-3">
                    {isEditing &&
                      <img src={iconRemove} width="40" height="60" alt="icon" className="p-1 cursor-pointer hover:scale-105 active:scale-98" onClick={() => setShowAlertDeleteTenant(true)}/>
                    }
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between xl:w-md md:w-full w-full xl:pl-2 md:pl-0">
                <div className="flex items-center xl:justify-end justify-start font-prompt font-semibold text-ellPrimary text-md md:text-xl xl:w-full md:w-4xl w-56 mb-2">
                  สัญญาเช่า
                </div>
                <div className='flex flex-row'>
                  <div className="bg-ellWhite xl:h-20 h-22 w-full md:w-4xl xl:w-80 flex flex-row items-center justify-between rounded-l-xl border-2 border-r-0 border-ConstantGray p-2">
                    <div className="flex flex-row items-center">
                      <img src="/img/pdf-icon.png" width="45" height="60" alt="icon" className="ml-3" />
                      <div className='flex flex-col ml-3 w-full'>
                        <span className='text-ellPrimary font-prompt text-md font-semibold'>file.pdf</span>
                        <span className='text-ellPrimary font-prompt opacity-80 text-sm'>filesize</span>
                      </div>
                    </div>
                    {isEditing &&
                    <img src="/img/upload-dark.svg" width="40" height="60" alt="icon" className="p-1 bg-ConstantGray rounded-full mr-3 cursor-pointer hover:scale-105 active:scale-98" />
                    }
                  </div>
                  <div className="bg-ellWhite xl:h-20 h-22 w-40 md:w-sm xl:w-32 flex flex-col items-center justify-center rounded-r-xl border-2 border-ConstantGray py-2">
                      <span className='text-ellPrimary font-prompt text-md font-semibold items-center py-2'>วันครบกำหนด</span>
                      {isEditing ? (
                      <>
                      <input
                        type="date"
                        name="dueDate"
                        maxLength={12}
                        value={tempoDate != "" ? tempoDate : tempoDate || dueDate != "" ? dueDate : dueDate}
                        onChange={handleDateChange}
                        className="xl:block md:flex flex justify-center focus:outline-none text-center rounded-br-lg px-2 py-2 w-full border-t-2 border-t-ConstantGray font-prompt font-medium text-ellPrimary text-sm"
                      />
                      </>
                    ):(
                      <span className='text-ellPrimary font-prompt text-sm font-semibold border-t-2 border-t-ConstantGray w-full text-center py-2'>{dueDate.trim() === "" ? "-" : dueDate}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <FinancialHistory
              isEditing={isEditing} 
              setIsEditing={setIsEditing}
              setDeleteAll={sentDelete}
             />
          </div>
        ):(
        <div className='flex flex-col items-start justify-start xl:w-4xl w-full xl:px-0 px-4 flex-grow'>
          <div className='flex flex-row items-center w-full mb-2'>
            <div className="flex font-prompt font-semibold text-ellPrimary text-md md:text-xl md:justify-end justify-start">รายละเอียดของอสังหาฯ</div>
            {isEditing &&
              <>
                <div className="relative inline-block">
                  <button className="ml-3 py-1 px-3 flex flex-row items-center justify-center font-prompt text-[#333333] bg-ConstantGray hover:bg-ellDarkGray rounded-full xl:text-md text-sm font-semibold cursor-pointer"
                    onClick={() => setShowDetailsBox(prev => !prev)}>
                    <img src="/img/plus-dark.svg" width="20" height="40" alt="add" className='mr-1' />
                    เพิ่ม
                  </button>
                  {showDetailsBox &&
                    <div className="absolute top-1/2 mt-2 left-25 -translate-y-1/2 w-35 md:w-40 bg-ellBlack p-2 flex flex-col gap-1 rounded-xl border-2 border-ellPrimary z-50"
                      ref={filterDetailsBoxRef}>
                      <div className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-4 h-4 bg-ellBlack rotate-45 border-s-2 border-b-2 border-s-ellPrimary border-b-ellPrimary"></div>
                      {Object.keys(detailsOptions).map((detail) => (
                        <label key={detail} className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedDetails?.[detail] || false}
                            onChange={() => handleTagSelect(detail, 'details')}
                            className="appearance-none h-3 w-3 rounded border-ellSecondary text-ellSecondary border-2 checked:bg-ellSecondary cursor-pointer"
                          />
                          <span
                            className="font-prompt font-medium text-ellSecondary text-xs"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleTagSelect(detail, 'details');
                            }}
                          >
                            {detail}
                          </span>
                        </label>
                      ))}
                    </div>
                  }
                </div>
              </>
            }
          </div>
          <div className="grid xl:grid-cols-3 md:grid-cols-4 grid-cols-6 w-full min-h-27 [writing-mode:vertical-lr]">
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
          <div className='flex xl:flex-row flex-col-reverse w-full xl:w-4xl mb-2 mt-4 md:mt-auto xl:mt-auto self-center'>
            {!isEditing &&
              <div className="bg-ellWhite xl:h-20 h-22 w-full md:w-full xl:w-xl flex flex-row items-center justify-start rounded-xl border-2 border-ConstantGray p-2">
                <img src="/img/iconSubstitute.png" width="60" height="60" alt="icon" className="border-2 border-ellPrimary rounded-full ml-3" />
                <div className='flex flex-col ml-3'>
                  <div className="flex justify-center font-prompt text-ellLime bg-ellGreen rounded-2xl px-4 py-0.75 text-xs">เจ้าของ{rental.tag}</div>
                  <span className='text-ellPrimary font-prompt text-md font-semibold'>{name}</span>
                  <span className='text-ellPrimary font-prompt opacity-80 text-sm'>{number}</span>
                </div>
              </div>
            }
            <div className={`w-full md:w-full flex flex-row justify-between gap-2 xl:pl-2 pl-0 xl:pb-0 pb-2 ${isEditing ? "xl:flex-row xl:w-full" : "xl:flex-col xl:w-xl"}`}>
              <button className="w-full xl:h-8.5 h-8 flex items-center justify-between font-prompt text-[#333333] bg-ConstantGray hover:bg-ellDarkGray active:bg-ellDarkGray rounded-md text-md font-semibold cursor-pointer px-2"
                    onClick={() => updateRentalField({ tenant: true, status: "unavailable" })}>
                <div className="flex items-center w-full">
                  <img src="/img/plus-dark.svg" width="30" height="20" alt="add" />
                  <span className="flex-1 text-center">เพิ่มผู้เช่า</span>
                </div>
              </button>
              <div className="w-full xl:h-8.5 h-8 flex items-center justify-between font-prompt text-[#333333] bg-ConstantGray hover:bg-ellDarkGray active:bg-ellDarkGray rounded-md text-md font-semibold cursor-pointer px-2">
                <img src="/img/share.svg" width="35" height="40" alt="share" />
                <span className='flex-1 text-center'>แชร์หน้านี้</span>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </>
  )
}

export default RentalDetail