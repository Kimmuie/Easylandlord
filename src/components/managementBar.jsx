import React, { useContext, useState, useEffect, useRef } from "react";
import ThemeContext from "../contexts/ThemeContext";
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import { db } from "../components/firebase";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 

const ManagementBar = ({ currentFilter, handleFilterChange, selectedTags, onTagFilterChange, handleSearch }) => {
    const { theme, icons } = useContext(ThemeContext);
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [showFilterTag, setShowFilterTag] = useState(false);
    const [showFilterTagBox, setShowFilterTagBox] = useState(false);
    const filterTagBoxRef = useRef(null);
    const [tagFilters, setTagFilters] = useState({
        'บ้านเช่า': false,
        'โกดัง': false,
        'ตึกเเถว': false,
        'ที่ดิน': false,
        'คอนโด': false
    });

    useEffect(() => {
        function handleClickOutside(event) {
            if (filterTagBoxRef.current && !filterTagBoxRef.current.contains(event.target)) {
                setShowFilterTagBox(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (selectedTags) {
            const newTagFilters = { ...tagFilters };
            Object.keys(newTagFilters).forEach(key => {
                newTagFilters[key] = false;
            });
            selectedTags.forEach(tag => {
                if (tag in newTagFilters) {
                    newTagFilters[tag] = true;
                }
            });
            setTagFilters(newTagFilters);
        }
    }, [selectedTags]);

    useEffect(() => {
        const hasActiveTags = Object.values(tagFilters).some(value => value);
        setShowFilterTag(hasActiveTags);
    }, [tagFilters]);
    const handleTagFilterChange = (tag) => {
        const updatedFilters = {
            ...tagFilters,
            [tag]: !tagFilters[tag]
        };
        setTagFilters(updatedFilters);
        const activeTags = Object.keys(updatedFilters).filter(key => updatedFilters[key]);
        if (onTagFilterChange) {
            onTagFilterChange(activeTags);
        }
    };


    const handleCreateRental = async () => {
        try {
            if (!currentUser) {
                console.error("User not logged in");
                navigate(`/account`)
                return;
            }
            const userDocRef = doc(db, "users", currentUser.email);
            const docSnap = await getDoc(userDocRef);
            
            const userData = docSnap.data()
            const rentalCount = userData.rental.length > 0 ? userData.rental.length : 0;
            const maxIndex = Math.max(0, ...userData.rental?.map(r => r.zindex || 0) || []);
            const timestamp = Timestamp.now();
            const date = timestamp.toDate();
            const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
            const newRental = {
                zindex: maxIndex + 1,
                id: Date.now().toString(),
                checkDate: Date.now(),
                name: "Untitle " + (rentalCount + 1),
                status: "available",
                tag: "ไม่ได้ระบุแท็ก",
                location: "",
                rentFee: 0,
                rentFrequency: "เดือน",
                coverRental: "",
                message: "",
                bedroom: 0,
                restroom: 0,
                squareMetreB: 0,
                squareMetre: 0,
                electricNumber: "",
                waterNumber: "",
                propertyDetails: {'วันประกาศ':false, 'ตกแต่งครบ': false, 'เครื่องปรับอากาศ': false, 'เครื่องทำน้ำอุ่น':false, 'เครื่องซักผ้า':false, 'อ่างอาบน้ำ':false, 'กล้องวงจรปิด':false, 'ลิฟต์':false, 'ระเบียง':false, 'สวน':false, 'ลานจอดรถ':false, 'สระว่ายน้ำ':false},
                tenant: false,
                tenantName: "",
                tenantNumber: "",
                dueDate: "",
                fileName: "",
                fileLink: "",
                billDeposit: "",
                areaUnitB: "ตร.ม",
                areaUnit: "ตร.ม",
                createdAt: formattedDate,
                tenantImage: "",
                rentalImage1: "",
                rentalImage2: "",
                rentalImage3: "",
                rentalImage4: "",
                pdf: "",
                financialHistory: []
            };
            
            await updateDoc(userDocRef, {
                rental: arrayUnion(newRental)
            });
            
            console.log("New rental added to user document:", newRental);
        } catch (error) {
            console.error("Error creating rental:", error);
        }
    };
    
    return (
        <div className="flex w-xl xl:w-4xl md:w-3xl mb-4.5 justify-center">
            <div className="relative flex-col md:flex-row md:flex">
                <div className="flex mt-4.5">
                    <input 
                        type="text" 
                        placeholder="ค้นหาบ้านเช่าของคุณ"   
                        maxLength={32}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="border-2 border-ellGray rounded-2xl px-4 py-2 w-96 xl:min-w-116 md:w-83 font-prompt text-ellPrimary text-lg mr-2"
                    />
                </div>
                <div className="flex justify-center">
                    <button className={`mt-4.5 border-2 border-ellGray hover:border-ellPrimary rounded-2xl py-2 mr-2 w-25 md:w-22 font-prompt text-ellPrimary ${currentFilter === 'all' ? 'bg-ellPrimary text-ellTertiary border-transparent cursor-default' : "cursor-pointer"}`}
                            onClick={() => handleFilterChange("all")}>ทั้งหมด</button>
                    <button className={`mt-4.5 border-2 border-ellGray hover:border-ellPrimary rounded-2xl py-2 mr-2 w-25 md:w-22 font-prompt text-ellPrimary flex flex-row justify-center items-center ${currentFilter === 'unavailable' ? 'bg-ellPrimary text-ellTertiary border-transparent cursor-default' : "cursor-pointer"}`}
                            onClick={() => handleFilterChange("unavailable")}>
                        <div className="rounded-full border-2 border-ellGray h-5 w-5 bg-ellRed mr-2"></div>
                        ไม่ว่าง
                    </button>
                    <button className={`mt-4.5 border-2 border-ellGray hover:border-ellPrimary rounded-2xl py-2 mr-2 w-25 md:w-22 font-prompt text-ellPrimary flex flex-row justify-center items-center ${currentFilter === 'available' ? 'bg-ellPrimary text-ellTertiary border-transparent cursor-default' : "cursor-pointer"}`}
                            onClick={() => handleFilterChange("available")}>
                        <div className="rounded-full border-2 border-ellGray h-5 w-5 bg-ellGreen mr-2"></div>
                        ว่าง
                    </button>
                    <div className="relative inline-block" ref={filterTagBoxRef}>
                        <button className={`mt-4.5 border-2 border-ellGray hover:border-ellPrimary rounded-2xl py-2 mr-2 w-15 md:w-13 flex flex-row justify-center items-center cursor-pointer ${showFilterTagBox ? 'border-ellPrimary' : "border-ellGray"} ${showFilterTag ? "bg-ellPrimary border-transparent" : "bg-transparent"}`}
                                onClick={() => setShowFilterTagBox(prev => !prev)}>
                            <img src={showFilterTag ? icons.filterOn : icons.filterOff} width="30" height="40" alt="filter"/>
                        </button>
                        {/* Filter TagBox */}
                        {showFilterTagBox && 
                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-20 md:w-30 bg-ellBlack p-2 flex flex-col gap-1 rounded-xl border-2 border-ellPrimary z-50">
                            <div className="absolute -top-2.5 left-7 md:left-11.75 w-4 h-4 bg-ellBlack rotate-45 border-s-2 border-t-2 border-s-ellPrimary border-t-ellPrimary"></div>
                        {Object.keys(tagFilters).map((tag, index) => (
                        <label key={index} className="flex items-center gap-1 cursor-pointer">
                            <input
                            type="checkbox"
                            checked={tagFilters[tag]}
                            onChange={(e) => {
                                e.stopPropagation();
                                handleTagFilterChange(tag)
                            }}
                            className="appearance-none w-3 h-3 rounded-full border-2 border-ellSecondary checked:bg-ellSecondary checked:border-transparent cursor-pointer"
                            />
                            <span className="font-prompt text-ellSecondary text-xs"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleTagFilterChange(tag);
                                }}>
                                {tag}
                            </span>
                        </label>
                        ))}
                        </div>
                        }
                    </div>
                    <button className="md:flex hidden mt-0 bg-ellBlack rounded-b-full w-20  flex-row justify-center items-center cursor-pointer "
                            onClick={handleCreateRental}>
                        <img src={icons.plus} width="40" height="40" alt="add"/>
                    </button>
                    {/* Phone Rental Add */}
                    <div className="fixed bottom-4 right-4 z-100">
                        <button className="md:hidden flex mt-4.5 bg-ellBlack rounded-full p-4 flex-row justify-center items-center cursor-pointer hover:scale-105 active:scale-98"
                                onClick={handleCreateRental}>
                            <img src={icons.plus} width="40" height="40" alt="add"/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagementBar;