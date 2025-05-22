import React, { useState, useEffect, useContext, useRef } from 'react';
import ThemeContext from "../contexts/ThemeContext";
import { useParams, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import FinancialHistory from '../components/financialHistory';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../components/firebase';
import UploadImage from '../components/uploadImage';
import PDFdownload from '../components/pdfDownload';
import html2canvas from "html2canvas";
import { useAuth } from '../contexts/AuthContext'; 
import ExtendImage from '../components/extendImage';

const RentalDetail = () => {
  const { currentUser } = useAuth();
  const { theme, icons } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { rentalId } = useParams();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAlertDelete, setShowAlertDelete] = useState(false);
  const [showAlertDeleteTenant, setShowAlertDeleteTenant] = useState(false);
  const [showAlertBackEdit, setShowAlertBackEdit] = useState(false);
  const [rentalName, setRentalName] = useState('');
  const [rentalLocate, setRentalLocate] = useState('');
  const [rentalFee, setRentalFee] = useState('');
  const [rentalBedroom, setRentalBedroom] = useState(0);
  const [rentalRestroom, setRentalRestroom] = useState(0);
  const [rentalArea, setRentalArea] = useState('');
  const [rentalAreaB, setRentalAreaB] = useState('');
  const [electricUser, setElectricUser] = useState('');
  const [waterUser, setWaterUser] = useState('');
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
  const [showAreaBox, setShowAreaBox] = useState(false);
  const [showAreaBoxB, setShowAreaBoxB] = useState(false);
  const [showDetailsBox, setShowDetailsBox] = useState(false);
  const filterTagBoxRef = useRef(null);
  const filterFrequencyBoxRef = useRef(null);
  const filterAreaBoxRef = useRef(null);
  const filterAreaBoxBRef = useRef(null);
  const filterDetailsBoxRef = useRef(null);
  const [userIconImage, setUserIconImage] = useState("");
  const [tenantIconImage, setTenantIconImage] = useState("");
  const [uploadedTenantImage, setUploadedTenantImage] = useState("");
  const [rentalImage1, setRentalImage1] = useState("");
  const [uploadedRentalImage1, setUploadedRentalImage1] = useState(null);
  const [rentalImage2, setRentalImage2] = useState("");
  const [uploadedRentalImage2, setUploadedRentalImage2] = useState(null);
  const [rentalImage3, setRentalImage3] = useState("");
  const [uploadedRentalImage3, setUploadedRentalImage3] = useState(null);
  const [rentalImage4, setRentalImage4] = useState("");
  const [uploadedRentalImage4, setUploadedRentalImage4] = useState(null);
  const [uploadedExtendImage, setUploadedExtendImage] = useState(null);
  const [haveExtendImage, setHaveExtendImage] = useState(false);
  const [extendImage, setExtendImage] = useState(false);
  const [rentalPDF, setRentalPDF] = useState("");
  const [uploadedPDF, setUploadedPDF] = useState(null);
  const [currentImageShow, setCurrentImageShow] = useState('2');
  const [currentImage, setCurrentImage] = useState(currentImageShow);
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedAreaB, setSelectedAreaB] = useState('');
  const [selectedDetails, setSelectedDetails] = useState('');
  const [daysSinceLastCheck, setDaysSinceLastCheck] = useState(0);
  const tagOptions = ['ไม่ได้ระบุแท็ก', 'บ้านเช่า', 'โกดัง', 'ตึกเเถว', 'ที่ดิน', 'คอนโด'];
  const frequencyOptions = ['วัน', 'อาทิตย์', 'เดือน', 'ปี'];
  const areaOptions = ['ตร.ม', 'ตร.วา', 'ไร่'];
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
      if (filterAreaBoxRef.current && !filterAreaBoxRef.current.contains(event.target)) {
        setShowAreaBox(false);
      }
      if (filterAreaBoxBRef.current && !filterAreaBoxBRef.current.contains(event.target)) {
        setShowAreaBoxB(false);
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
    let input = e.target.value.replace(/,/g, '');

    // Allow only digits and a single decimal point
    if (/^\d*\.?\d*$/.test(input)) {
      // Format number with commas, preserving decimal
      const parts = input.split('.');
      let formatted = Number(parts[0]).toLocaleString('en-US');
      if (parts.length === 2) {
        formatted += '.' + parts[1];
      }

      if (fieldType === 'area') {
        setRentalArea(formatted);
      } else if (fieldType === 'areaB') {
        setRentalAreaB(formatted);
      } else if (fieldType === 'fee') {
        setRentalFee(formatted);
      } else if (fieldType === 'electric') {
        setElectricUser(input);
      } else if (fieldType === 'water') {
        setWaterUser(input);
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
    if (!rental || !currentUser) {
      return;
    }
  
    try {
      const userDocRef = doc(db, "users", currentUser.email);
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
    } else if (type === 'area') {
      setSelectedArea(value);
      setShowAreaBox(false);
    } else if (type === 'areaB') {
      setSelectedAreaB(value);
      setShowAreaBoxB(false);
    } else if (type === 'details') {
      const updatedDetails = { ...selectedDetails };
      updatedDetails[value] = !updatedDetails[value];
      setSelectedDetails(updatedDetails);
    }

    if (!rental || !currentUser) {
      return;
    }

    try {
      const userDocRef = doc(db, "users", currentUser.email);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists() && docSnap.data().rental) {
        const updatedRentals = docSnap.data().rental.map(r => {
          if (r.id === rentalId) {
            if (type === 'tag') {
              return { ...r, tag: value };
            } else if (type === 'frequency') {
              return { ...r, rentFrequency: value };
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
    if (rental && currentUser) {
      try {
        const userDocRef = doc(db, "users", currentUser.email);
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

  //Set Image Count
  useEffect(() => {
    if (rentalImage4) {
      setCurrentImageShow("4")
      setCurrentImage("4")
    } else if (rentalImage3) {
      setCurrentImageShow("3")
      setCurrentImage("3")
    } else {
      setCurrentImageShow("2")
    }
  }, [rentalImage3, rentalImage4]);

  // Save image/pdf to Cloudinary
  const handleUpload = (url, field) => {
    if (field === 'tenant') {
      console.log('Uploaded Image URL:', url);
      setUploadedTenantImage(url)
    } else if (field === 'rental1') {
      console.log('Uploaded Image URL:', url);
      setUploadedRentalImage1(url)
    } else if (field === 'rental2') {
      console.log('Uploaded Image URL:', url);
      setUploadedRentalImage2(url)
    } else if (field === 'rental3') {
      console.log('Uploaded Image URL:', url);
      setUploadedRentalImage3(url)
    } else if (field === 'rental4') {
      console.log('Uploaded Image URL:', url);
      setUploadedRentalImage4(url)
    } else if (field === 'extend') {
      console.log('Uploaded Image (Extend) URL:', url);
      setUploadedExtendImage(url)
    } else if (field === 'pdf') {
      console.log('Uploaded PDF URL:', url);
      setUploadedPDF(url)
    }
  };

const handleShare = async () => {
  const element = document.getElementById('capture-area'); 
  await new Promise((resolve) => setTimeout(resolve, 300));

  const canvas = await html2canvas(element, {
    useCORS: true, 
    scale: 2,      
    backgroundColor: null
  });

  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

  const file = new File([blob], rental.name + ".png", { type: 'image/png' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      title: 'Shared from my website',
      text: 'Check this out!',
      files: [file]
    });
  } else {
    alert('Sharing not supported on this device');
  }
};

  // Manual Save
  const handleSave = async () => {
    if (isEditing && rental && currentUser) {
      try {
        const userDocRef = doc(db, "users", currentUser.email);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();

          if (userData.rental) {
            const updatedRentals = userData.rental.map(r =>
              r.id === rentalId ? { ...r, name: rentalName, location: rentalLocate, rentFee: rentalFee, bedroom: rentalBedroom, restroom: rentalRestroom, squareMetreB: rentalAreaB, squareMetre: rentalArea, electricNumber: electricUser, waterNumber: waterUser, tenantName: nameTenant, tenantNumber: numberTenant, dueDate: tempoDate, rentFrequency: selectedFrequency, areaUnitB: selectedAreaB, areaUnit: selectedArea,
              tenantImage: uploadedTenantImage ?? tenantIconImage,
              rentalImage1: uploadedRentalImage1 ?? rentalImage1,
              rentalImage2: uploadedRentalImage2 ?? rentalImage2,
              rentalImage3: uploadedRentalImage3 ?? rentalImage3,
              rentalImage4: uploadedRentalImage4 ?? rentalImage4,
              pdf: uploadedPDF ?? rentalPDF} : r
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
              squareMetreB: rentalAreaB,
              squareMetre: rentalArea,
              electricNumber: electricUser,
              waterNumber: waterUser,
              tenantName: nameTenant,
              tenantNumber: numberTenant,
              dueDate: tempoDate,
              rentFrequency: selectedFrequency,
              areaUnitB: selectedAreaB,
              areaUnit: selectedArea,
              tenantImage: uploadedTenantImage || tenantIconImage,
              rentalImage1: uploadedRentalImage1 || rentalImage1,
              rentalImage2: uploadedRentalImage2 || rentalImage2,
              rentalImage3: uploadedRentalImage3 || rentalImage3,
              rentalImage4: uploadedRentalImage4 || rentalImage4,
              pdf: uploadedPDF || rentalPDF
            }));

            console.log("Other rental details updated successfully");
          }
        }
      } catch (error) {
        console.error("Error updating rental:", error);
      }
    }
    fetchRentalDetail();
    setIsEditing(false);
    setExtendImage(false);
    fetchRentalDetail()
  }

  // Get from firebase User DB
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
            setUserIconImage(data.profileImage);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    loadUserData();
  }, [currentUser]);

  // Get from firebase Rental DB
  const fetchRentalDetail = async () => {
    try {
      if (!currentUser) {
        console.log("User Not logged in");
        return;
      }
      const userDocRef = doc(db, "users", currentUser.email);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.rental) {
          const currentRental = userData.rental.find(r => r.id === rentalId);
          if (currentRental.checkDate) {
            const now = new Date();
            const checkDateObj = typeof currentRental.checkDate === 'number' 
              ? new Date(currentRental.checkDate) 
              : new Date(currentRental.checkDate);
              
            if (!isNaN(checkDateObj.getTime())) {
              setDaysSinceLastCheck(Math.floor((now.getTime() - checkDateObj.getTime()) / (1000 * 3600 * 24)))
              }
            } else {
              console.log(`Invalid checkDate format for rental ${currentRental.name || currentRental.id}`);
          }
          if (currentRental) {
            setRental(currentRental);
            setRentalName(currentRental.name);
            setRentalLocate(currentRental.location);
            setRentalFee(currentRental.rentFee);
            setRentalBedroom(currentRental.bedroom);
            setRentalRestroom(currentRental.restroom);
            setRentalAreaB(currentRental.squareMetreB);
            setRentalArea(currentRental.squareMetre);
            setElectricUser(currentRental.electricNumber);
            setWaterUser(currentRental.waterNumber);
            setSelectedTag(currentRental.tag);
            setSelectedFrequency(currentRental.rentFrequency);
            setSelectedAreaB(currentRental.areaUnitB);
            setSelectedArea(currentRental.areaUnit);
            setSelectedDetails(currentRental.propertyDetails);
            setHaveTenant(currentRental.tenant);
            setNameTenant(currentRental.tenantName);
            setNumberTenant(currentRental.tenantNumber);
            setDueDate(currentRental.dueDate);
            setCheckDate(currentRental.checkDate);
            setTenantIconImage(currentRental.tenantImage);
            setRentalImage1(currentRental.rentalImage1);
            setRentalImage2(currentRental.rentalImage2);
            setRentalImage3(currentRental.rentalImage3);
            setRentalImage4(currentRental.rentalImage4);
            setRentalPDF(currentRental.pdf);
            for (let i = 5; i <= 20; i++) {
              const key = `rentalImage${i}`;
              if (currentRental[key]) {
                setHaveExtendImage(true);
                break; 
              }
            }
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
    if (rental && currentUser) {
      try {
        const userDocRef = doc(db, "users", currentUser.email);
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

  function toDisplayDate(isoStr) {
    if (!isoStr) return "";
    const [year, month, day] = isoStr.split('-');
    return `${day}/${month}/${year}`;
  }

  const handleDateChange = (e) => {
    const isoDate = e.target.value;
    setTempoDate(isoDate);
    
    if (isoDate) {
      setDueDate(toDisplayDate(isoDate));
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
      {isEditing && (
        <div className="TooltipMain fixed bottom-44 right-4 flex flex-col items-center justify-center z-50">
          <div className="flex text-center w-22 justify-center bg-ellRed p-1 mb-2 rounded-lg font-prompt text-ellSecondary text-sm z-20 Tooltip">ลบอสังหฯ</div>
          <div className="absolute mb-14 w-4 h-4 bg-ellRed rotate-45 z-10 Tooltip"></div>
          <button className="relative rounded-full bg-ellRed flex items-center justify-center cursor-pointer active:scale-98 hover:scale-105 p-3 z-20"
            onClick={() => setShowAlertDelete(true)}>
            <img src="/img/trash-light.svg" width="40" height="40" alt="edit" />
          </button>
        </div>
      )}
        <div className="TooltipMain fixed bottom-24 right-4 flex flex-col items-center justify-center z-50">
          <div className="flex text-center w-22 justify-center bg-ellBlack p-1 mb-2 rounded-lg font-prompt text-ellSecondary text-sm z-20 Tooltip">ไม่ตรวจเช็ค<br/>มาแล้ว  {daysSinceLastCheck} วัน</div>
          <div className="absolute mb-9 w-4 h-4 bg-ellBlack rotate-45 z-10 Tooltip"></div>
          <button className="relative rounded-full bg-ellBlack flex items-center justify-center cursor-pointer active:scale-98 hover:scale-105 p-3 z-20"
            onClick={handleCheck}>
            <img src={iconCheck} width="40" height="40" alt="edit" />
          </button>
        </div>
      {isEditing ? (
        <div className="TooltipMain fixed bottom-4 right-4 flex flex-col items-center justify-center z-50">
          <div className="flex text-center w-22 justify-center bg-ellGreen p-1 mb-2 rounded-lg font-prompt text-[#F7F7F7] text-sm z-20 Tooltip">บันทึก</div>
          <div className="absolute mb-14 w-4 h-4 bg-ellGreen rotate-45 z-10 Tooltip"></div>
          <button className="relative rounded-full bg-ellGreen flex items-center justify-center cursor-pointer active:scale-98 hover:scale-105 p-3 z-20"
            onClick={handleSave}>
            <img src={iconSave} width="40" height="40" alt="save" />
          </button>
        </div>
      ) : (
        <div className="TooltipMain fixed bottom-4 right-4 flex flex-col items-center justify-center z-50">
          <div className="flex text-center w-22 justify-center bg-ellBlack p-1 mb-2 rounded-lg font-prompt text-ellSecondary text-sm z-20 Tooltip border-t-2 border-x-2 border-ellWhite">แก้ไข</div>
          <div className="absolute mb-14 w-4 h-4 bg-ellBlack rotate-45 z-10 Tooltip"></div>
          <button className="relative rounded-full bg-ellBlack flex items-center justify-center cursor-pointer active:scale-98 hover:scale-105 p-3 z-20"
            onClick={() => {
              setIsEditing(true);
              setExtendImage(true);
            }}>
            <img src={iconEdit} width="40" height="40" alt="edit" />
          </button>
        </div>
      )}
      <div id="capture-area" className="overflow-y-auto overflow-x-hidden flex flex-col items-center w-full min-h-screen bg-ellWhite">
        <div className="flex flex-row justify-between xl:w-4xl md:w-2xl w-full my-4 md:mx-0 px-2">
          <div className="flex flex-row items-center font-prompt text-ellPrimary text-lg w-30">
            <div className={`rounded-full border-2 border-ellGray h-5 w-5 mr-2 ${rental.status === "available" ? "bg-ellGreen" : "bg-ellRed"}`}></div>
            {rental.status === "available" ? "ว่าง" : "ไม่ว่าง"}
          </div>
          {isEditing && (
          <div className='flex flex-row gap-1'>
            <button className={`font-prompt text-ellPrimary text-lg cursor-pointer rounded h-9 w-9 border-2 border-ellGray hover:border-ellPrimary flex items-center justify-center hover:scale-102 active:scale-97 ${currentImage === '2' ? 'bg-ellPrimary text-ellTertiary border-transparent cursor-default' : "cursor-pointer"}`}
              onClick={() => setCurrentImage("2")}>2</button>
            <button className={`font-prompt text-ellPrimary text-lg cursor-pointer rounded h-9 w-9 border-2 border-ellGray hover:border-ellPrimary flex items-center justify-center hover:scale-102 active:scale-97 ${currentImage === '3' ? 'bg-ellPrimary text-ellTertiary border-transparent cursor-default' : "cursor-pointer"}`}
              onClick={() => setCurrentImage("3")}>3</button>
            <button className={`font-prompt text-ellPrimary text-lg cursor-pointer rounded h-9 w-9 border-2 border-ellGray hover:border-ellPrimary flex items-center justify-center hover:scale-102 active:scale-97 ${currentImage === '4' ? 'bg-ellPrimary text-ellTertiary border-transparent cursor-default' : "cursor-pointer"}`}
              onClick={() => setCurrentImage("4")}>4</button>
          </div>
          )}
          <div className="relative flex justify-end w-30">
            <button className={`flex justify-center rounded-sm px-1 font-prompt text-ellSecondary text-md md:text-lg bg-ellBlack h-8 cursor-pointer ${showTagBox && "pointer-events-none"}`}
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
          <div className='flex flex-col'>
            {/* 1 */}            
            <div className="relative inline-block">
              <img src={uploadedRentalImage1 || rentalImage1 || "/img/sampleImage.jpg"} alt="image" className={`object-cover border-1 border-ellTertiary ${isEditing ? (currentImage === '2' ? 'w-112 md:h-70 h-35 rounded-l-lg' : currentImage === '3' ? "md:w-152 w-72 md:h-70 h-50 rounded-l-lg"  : "md:w-112 w-full md:h-60 h-30 rounded-tl-lg"):(currentImageShow === '2' ? 'w-112 md:h-70 h-35 rounded-l-lg' : currentImageShow === '3' ? "md:w-152 w-72 md:h-70 h-50 rounded-l-lg"  : "md:w-112 w-full md:h-60 h-30 rounded-tl-lg")}`}/>
              <div className={`absolute right-1 bottom-1 flex flex-row ${!isEditing && "hidden"}`}>
                <UploadImage onUploadSuccess={(url) => handleUpload(url, "rental1")}>
                <button className="cursor-pointer rounded h-9 w-9 bg-blue-500 mr-1 flex items-center justify-center hover:scale-102 active:scale-97">
                  <img src="/img/plus-light.svg" alt="edit" className="w-7" />
                </button>
                </UploadImage>
                <button className={`cursor-pointer rounded h-9 w-9 bg-ellRed flex items-center justify-center hover:scale-102 active:scale-97 ${!rentalImage1 && "hidden"}`}
                  onClick={() => {
                    setUploadedRentalImage1("");
                    setRentalImage1("/img/sampleImage.jpg");
                  }}>
                  <img src="/img/trash-light.svg" alt="edit" className="w-7" />
                </button>
              </div>
            </div>
            {/* 4 */}
            <div className={`relative ${isEditing ? (currentImage === '2' ? 'hidden' : currentImage === '3' ? "hidden"  : "inline-block"):(currentImageShow === '2' ? 'hidden' : currentImageShow === '3' ? "hidden"  : "inline-block")}`}>
              <img src={uploadedRentalImage4 || rentalImage4 || "/img/sampleImage.jpg"} alt="image" className={`object-cover border-1 border-ellTertiary ${isEditing ? (currentImage === '2' ? '' : currentImage === '3' ? ""  : "md:w-112 w-full md:h-60 h-30 rounded-bl-lg"):(currentImageShow === '2' ? '' : currentImageShow === '3' ? ""  : "md:w-112 w-full md:h-60 h-30 rounded-bl-lg")}`}/>
              <div className={`absolute right-1 bottom-1 flex flex-row ${!isEditing && "hidden"}`}>
                <UploadImage onUploadSuccess={(url) => handleUpload(url, "rental4")}>
                <button className="cursor-pointer rounded h-9 w-9 bg-blue-500 mr-1 flex items-center justify-center hover:scale-102 active:scale-97">
                  <img src="/img/plus-light.svg" alt="edit" className="w-7" />
                </button>
                </UploadImage>
                <button className={`cursor-pointer rounded h-9 w-9 bg-ellRed flex items-center justify-center hover:scale-102 active:scale-97 ${!rentalImage4 && "hidden"}`}
                  onClick={() => {
                    setUploadedRentalImage4("");
                    setRentalImage4("/img/sampleImage.jpg");
                  }}>
                  <img src="/img/trash-light.svg" alt="edit" className="w-7" />
                </button>
              </div>
            </div>
          </div>
          <div className='flex flex-col'>
            {/* 2 */}
            <div className="relative inline-block">
              <img src={uploadedRentalImage2 || rentalImage2 || "/img/sampleImage.jpg"} alt="image" className={`object-cover border-1 border-ellTertiary ${isEditing ? (currentImage === '2' ? 'w-112 md:h-70 h-35 rounded-r-lg' : currentImage === '3' ? "md:w-72 w-40 md:h-35 h-25 rounded-tr-lg"  : "md:w-112 w-full md:h-60 h-30 rounded-tr-lg"):(currentImageShow === '2' ? 'w-112 md:h-70 h-35 rounded-r-lg' : currentImageShow === '3' ? "md:w-72 w-40 md:h-35 h-25 rounded-tr-lg"  : "md:w-112 w-full md:h-60 h-30 rounded-tr-lg")}`}/>
              <div className={`absolute right-1 bottom-1 flex flex-row ${!isEditing && "hidden"}`}>
                <UploadImage onUploadSuccess={(url) => handleUpload(url, "rental2")}>
                <button className="cursor-pointer rounded h-9 w-9 bg-blue-500 mr-1 flex items-center justify-center hover:scale-102 active:scale-97">
                  <img src="/img/plus-light.svg" alt="edit" className="w-7" />
                </button>
                </UploadImage>
                <button className={`cursor-pointer rounded h-9 w-9 bg-ellRed flex items-center justify-center hover:scale-102 active:scale-97 ${!rentalImage2 && "hidden"}`}
                  onClick={() => {
                    setUploadedRentalImage2("");
                    setRentalImage2("/img/sampleImage.jpg")
                  }}>
                  <img src="/img/trash-light.svg" alt="edit" className="w-7" />
                </button>
              </div>
            </div>
            {/* 3 */}
            <div className={`relative ${isEditing ? (currentImage === '2' ? 'hidden' : currentImage === '3' ? "inline-block"  : "inline-block"):(currentImageShow === '2' ? 'hidden' : currentImageShow === '3' ? "inline-block"  : "inline-block")}`}>
              <img src={uploadedRentalImage3 || rentalImage3 || "/img/sampleImage.jpg"} alt="image" className={`object-cover border-1 border-ellTertiary ${isEditing ? (currentImage === '2' ? '' : currentImage === '3' ? "md:w-72 w-40 md:h-35 h-25 rounded-br-lg"  : "md:w-112 w-full md:h-60 h-30 rounded-br-lg"):(currentImageShow === '2' ? '' : currentImageShow === '3' ? "md:w-72 w-40 md:h-35 h-25 rounded-br-lg"  : "md:w-112 w-full md:h-60 h-30 rounded-br-lg")}`}/>
              <div className={`absolute right-1 bottom-1 flex flex-row ${!isEditing && "hidden"}`}>
                <UploadImage onUploadSuccess={(url) => handleUpload(url, "rental3")}>
                <button className="cursor-pointer rounded h-9 w-9 bg-blue-500 mr-1 flex items-center justify-center hover:scale-102 active:scale-97">
                  <img src="/img/plus-light.svg" alt="edit" className="w-7" />
                </button>
                </UploadImage>
                <button className={`cursor-pointer rounded h-9 w-9 bg-ellRed flex items-center justify-center hover:scale-102 active:scale-97 ${!rentalImage3 && "hidden"}`}
                  onClick={() => {
                    setUploadedRentalImage3("");
                    setRentalImage3("/img/sampleImage.jpg")
                  }}>
                  <img src="/img/trash-light.svg" alt="edit" className="w-7" />
                </button>
              </div>
              {haveExtendImage &&
              <button className={`absolute right-2 bottom-2 cursor-pointer rounded-2xl h-9 w-20 mr-1 items-center justify-center font-prompt text-[#333333] bg-ConstantGray hover:scale-102 active:scale-97 xl:text-md text-sm font-semibold ${isEditing || extendImage ? "hidden" : "flex"}`}
                onClick={() => setExtendImage(true)}>
                  ดูทั้งหมด
              </button>
              }
            </div>
          </div>
        </div>
        {extendImage &&
        <ExtendImage 
          currentUpload={uploadedExtendImage}   
          isEditing={isEditing}     
        />
        }
        {isEditing || extendImage &&
        <button className="cursor-pointer rounded h-9 w-112 mt-2 font-prompt text-[#333333] bg-ConstantGray mr-1 flex items-center justify-center hover:scale-102 active:scale-97 xl:text-md text-sm font-semibold"
            onClick={() => setExtendImage(false)}>
           ย่อรูปภาพ
        </button>
          }
        {isEditing && currentImage === "4" && <UploadImage onUploadSuccess={(url) => handleUpload(url, "extend")}>
          <button className="cursor-pointer rounded h-9 w-112 mt-2 bg-blue-500 mr-1 flex items-center justify-center hover:scale-102 active:scale-97">
            <img src="/img/plus-light.svg" alt="edit" className="w-7" />
          </button>
        </UploadImage>
        }
        <div className={`flex flex-col xl:flex-row xl:w-fit md:w-full w-full pt-4 xl:px-0 px-4 ${isEditing ? "pb-1" : "pb-0"}`}>
          <div className="flex flex-col xl:w-md md:w-full w-full">
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
                  className="mt-2 border-2 border-ellGray rounded-md px-2 py-0.5 h-full xl:w-110 md:w-full w-full font-prompt text-ellPrimary text-sm md:text-lg resize-none"
                  required
                />
              </>
            ) : (
              <>
                <div className="flex items-center font-prompt font-semibold text-ellPrimary text-md md:text-xl xl:w-184 md:w-4xl w-56">
                  {rental.name}
                </div>
                <div className="font-prompt text-ellPrimary text-sm md:text-lg mt h-full w-100 md:w-4xl xl:w-110 break-all">
                  {rental.location}
                </div>
              </>
            )}
          </div>
          <div className='flex xl:flex-col flex-col-reverse gap-2 xl:w-md w-full'>
            <div className="flex flex-row gap-2">
              {isEditing ? (
                <>
                <div className='flex flex-col w-full'>
                  <div className='flex flex-row gap-2 xl:w-md w-full'>
                    {/* Bedroom */}
                    <div className="xl:w-full md:w-full w-full flex flex-row items-center justify-center font-prompt text-[#333333] bg-ConstantGray rounded-md xl:text-md text-sm font-semibold">
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
                    <div className="xl:w-full md:w-full w-full flex flex-row items-center justify-center font-prompt text-[#333333] bg-ConstantGray rounded-md xl:text-md text-sm font-semibold">
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
                  </div>
                  <div className="flex flex-row gap-2 mt-2">
                  {/* Building Area*/}
                    <div className="xl:w-full md:w-full w-full h-8 flex flex-row items-center justify-center font-prompt text-[#333333] bg-ConstantGray rounded-md xl:text-md text-sm font-semibold">
                      <input
                        type="text"
                        placeholder="กรอกพื้นที่อาคาร"
                        maxLength={8}
                        value={rentalAreaB}
                        onChange={(e) => handleChangeInput(e, 'areaB')}
                        className="text-center border-2 border-[#333333] ml-1 rounded-md px-2 py-0.5 w-full font-prompt font-semibold text-[#333333] xl:text-md text-sm"
                        required
                      />
                      <div className="relative inline-block">
                      <button className={`border-2 rounded-md px-2 py-0.5 mx-1 cursor-pointer ${showAreaBoxB ? "border-ellPrimary pointer-events-none" : "border-[#333333]"}`}
                        onClick={() => setShowAreaBoxB(prev => !prev)}>
                        {selectedAreaB || "ตร.ม"}
                      </button>
                      {showAreaBoxB &&
                      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-25 md:w-30 bg-ellBlack p-2 flex flex-col gap-1 rounded-xl border-2 border-ellPrimary z-50"
                        ref={filterAreaBoxBRef}>
                        <div className="absolute -top-2.5 left-11.75 w-4 h-4 bg-ellBlack rotate-45 border-s-2 border-t-2 border-s-ellPrimary border-t-ellPrimary"></div>
                        {areaOptions.map((area, index) => (
                          <label key={index} className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="radio"
                              checked={selectedAreaB === area}
                              onChange={() => handleTagSelect(area, 'areaB')}
                              className="appearance-none w-3 h-3 rounded-full border-2 border-ellSecondary checked:bg-ellSecondary checked:border-transparent cursor-pointer"
                            />
                            <span className="font-prompt font-medium text-ellSecondary text-xs"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleTagSelect(area, 'areaB');
                              }}>
                              {area}
                            </span>
                          </label>
                        ))}
                      </div>
                      }
                      </div>
                    </div>
                    {/* Land Area */}
                    <div className="xl:w-full md:w-full w-full flex flex-row items-center justify-center font-prompt text-[#333333] bg-ConstantGray rounded-md xl:text-md text-sm font-semibold">
                      <input
                        type="text"
                        placeholder="กรอกพื้นที่ที่ดิน"
                        maxLength={8}
                        value={rentalArea}
                        onChange={(e) => handleChangeInput(e, 'area')}
                        className="text-center border-2 border-[#333333] ml-1 rounded-md px-2 py-0.5 w-full font-prompt font-semibold text-[#333333] xl:text-md text-sm"
                        required
                      />
                      <div className="relative inline-block">
                      <button className={`border-2 rounded-md px-2 py-0.5 mx-1 cursor-pointer ${showAreaBox ? "border-ellPrimary pointer-events-none" : "border-[#333333]"}`}
                        onClick={() => setShowAreaBox(prev => !prev)}>
                        {selectedArea || "ตร.ม"}
                      </button>
                      {showAreaBox &&
                      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-25 md:w-30 bg-ellBlack p-2 flex flex-col gap-1 rounded-xl border-2 border-ellPrimary z-50"
                        ref={filterAreaBoxRef}>
                        <div className="absolute -top-2.5 left-11.75 w-4 h-4 bg-ellBlack rotate-45 border-s-2 border-t-2 border-s-ellPrimary border-t-ellPrimary"></div>
                        {areaOptions.map((area, index) => (
                          <label key={index} className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="radio"
                              checked={selectedArea === area}
                              onChange={() => handleTagSelect(area, 'area')}
                              className="appearance-none w-3 h-3 rounded-full border-2 border-ellSecondary checked:bg-ellSecondary checked:border-transparent cursor-pointer"
                            />
                            <span className="font-prompt font-medium text-ellSecondary text-xs"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleTagSelect(area, 'area');
                              }}>
                              {area}
                            </span>
                          </label>
                        ))}
                      </div>
                      }
                      </div>
                    </div>
                    </div>
                    <div className="flex flex-row gap-2 mt-2">
                    {/* Electric User*/}
                      <div className="xl:w-full md:w-full w-full h-8 flex flex-row items-center justify-center font-prompt text-[#333333] bg-ConstantGray rounded-md xl:text-md text-sm font-semibold">
                        <img src="/img/electric-dark.svg" width="35" height="40" alt="bed" className='mx-2' />
                        <input
                          type="text"
                          placeholder="กรอกเลขที่ผู้ใช้ไฟฟ้า"
                          maxLength={12}
                          value={electricUser}
                          onChange={(e) => handleChangeInput(e, 'electric')}
                          className="text-center border-2 border-[#333333] mx-1 rounded-md px-2 py-0.5 w-full font-prompt font-semibold text-[#333333] xl:text-md text-sm"
                          required
                        />
                      </div>
                    {/* Water User*/}
                      <div className="xl:w-full md:w-full w-full h-8 flex flex-row items-center justify-center font-prompt text-[#333333] bg-ConstantGray rounded-md xl:text-md text-sm font-semibold">
                        <img src="/img/water-dark.svg" width="35" height="40" alt="bed" className='mx-2' />
                        <input
                          type="text"
                          placeholder="กรอกเลขที่ผู้ใช้น้ำ"
                          maxLength={12}
                          value={waterUser}
                          onChange={(e) => handleChangeInput(e, 'water')}
                          className="text-center border-2 border-[#333333] mx-1 rounded-md px-2 py-0.5 w-full font-prompt font-semibold text-[#333333] xl:text-md text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className='flex flex-col w-full'>
                    <div className='flex flex-row gap-2 xl:w-md w-full'>
                      <div className="xl:w-full md:w-full w-full flex flex-row items-center justify-center font-prompt text-[#333333] bg-ConstantGray rounded-md xl:text-md text-sm font-semibold">
                        <img src="/img/bed.svg" width="35" height="40" alt="bed" className='mr-2' />
                        {rental.bedroom} ห้องนอน
                      </div>
                      <div className="xl:w-full md:w-full w-full flex flex-row items-center justify-center font-prompt text-[#333333] bg-ConstantGray rounded-md xl:text-md text-sm font-semibold">
                        <img src="/img/bath.svg" width="30" height="40" alt="bath" className='mr-2' />
                        {rental.restroom} ห้องน้ำ
                      </div>
                    </div>
                    <div className='flex flex-row  gap-2 mt-2'>
                      <div className="xl:w-full md:w-full w-full flex flex-row items-center justify-center font-prompt text-[#333333] bg-ConstantGray rounded-md xl:text-md text-sm font-semibold">
                        <img src="/img/ruler.svg" width="33" height="40" alt="ruler" className='mr-2' />
                        ขนาดอาคาร {rental.squareMetreB || 0} {rental.areaUnitB || "ตร.ม"}
                      </div>
                      <div className="xl:w-full md:w-full w-full flex flex-row items-center justify-center font-prompt text-[#333333] bg-ConstantGray rounded-md xl:text-md text-sm font-semibold">
                        <img src="/img/ruler.svg" width="33" height="40" alt="ruler" className='mr-2' />
                        ขนาดที่ดิน {rental.squareMetre || 0} {rental.areaUnit || "ตร.ม"}
                      </div>
                    </div>
                    <div className='flex flex-row gap-2 xl:w-md w-full mt-2'>
                      <div className="xl:w-full md:w-full w-full flex flex-row items-center justify-center font-prompt text-[#333333] bg-ConstantGray rounded-md xl:text-md text-sm font-semibold">
                        <img src="/img/electric-dark.svg" width="35" height="40" alt="bed" className='mr-2' />
                        {rental.electricNumber || "เลขที่ผู้ใช้ไฟฟ้า"}
                      </div>
                      <div className="xl:w-full md:w-full w-full flex flex-row items-center justify-center font-prompt text-[#333333] bg-ConstantGray rounded-md xl:text-md text-sm font-semibold">
                        <img src="/img/water-dark.svg" width="30" height="40" alt="bath" className='mr-2' />
                        {rental.waterNumber || "เลขที่ผู้ใช้น้ำ"} 
                      </div>
                    </div>
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
                    <button className={`border-2 rounded-md px-2 py-0.5 ml-2 cursor-pointer ${showFrequencyBox ? "border-ellPrimary pointer-events-none" : "border-ellGray"}`}
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
                    {isEditing ? (
                    <UploadImage onUploadSuccess={(url) => handleUpload(url, "tenant")}>
                      <div className="absolute rounded-full border-4 border-ellWhite h-7 w-7 bg-ellRed bottom-0 right-0 z-10 flex justify-center items-center">
                        <img src="/img/camera-light.svg" alt="edit" className="w-4" />
                      </div>
                      <img src={uploadedTenantImage || tenantIconImage || "/img/iconSubstitute.png"} alt="icon" className="w-16 h-16 object-cover border-2 border-ellPrimary rounded-full ml-3 hover:opacity-70" />
                    </UploadImage>
                    ):(
                    <img src={tenantIconImage || "/img/iconSubstitute.png"} alt="icon" className="w-16 h-16 object-cover border-2 border-ellPrimary rounded-full ml-3" />
                    )}
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
                  <PDFdownload 
                    pdfData={uploadedPDF || rentalPDF} 
                    isEditing={isEditing} 
                    handleUpload={handleUpload} 
                  />
                  <div className="bg-ellWhite xl:h-20 h-22 w-40 md:w-sm xl:w-32 flex flex-col items-center justify-center rounded-r-xl border-2 border-ConstantGray py-2">
                      <span className='text-ellPrimary font-prompt text-md font-semibold items-center py-2'>วันครบกำหนด</span>
                      {isEditing ? (
                      <>
                      <input
                        type="date"
                        name="dueDate"
                        maxLength={12}
                        value={tempoDate || dueDate}
                        onChange={handleDateChange}
                        className="xl:block md:flex flex justify-center focus:outline-none text-center rounded-br-lg px-2 py-2 w-full border-t-2 border-t-ConstantGray font-prompt font-medium text-ellPrimary text-sm"
                      />
                      </>
                    ):(
                      <span className='text-ellPrimary font-prompt text-sm font-semibold border-t-2 border-t-ConstantGray w-full text-center py-2'>{toDisplayDate(dueDate).trim() === "" ? "-" : toDisplayDate(dueDate)}</span>
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
          <div className='flex xl:flex-row flex-col-reverse w-full xl:w-4xl mb-4 mt-4 md:mt-auto xl:mt-auto self-center '>
            {!isEditing &&
              <div className="bg-ellWhite xl:h-20 h-22 w-full md:w-full xl:w-xl flex flex-row items-center justify-start rounded-xl border-2 border-ConstantGray p-2">
                <img src={userIconImage || "/img/iconSubstitute.png"} alt="icon" className="w-16 h-16 object-cover border-2 border-ellPrimary rounded-full ml-3" />
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
              <div className="w-full xl:h-8.5 h-8 flex items-center justify-between font-prompt text-[#333333] bg-ConstantGray hover:bg-ellDarkGray active:bg-ellDarkGray rounded-md text-md font-semibold cursor-pointer px-2"
                    onClick={handleShare}>
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