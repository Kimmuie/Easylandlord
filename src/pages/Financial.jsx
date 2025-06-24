import React, { useState, useEffect, useContext, useRef } from 'react';
import ThemeContext from '../contexts/ThemeContext';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../components/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext'; 
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { Thai } from "flatpickr/dist/l10n/th.js";
import {formatToThaiBuddhist, formatForStorage, formatIsoToThaiBuddhist, flatpickrThaiBuddhistFormatter} from "../components/dateUtils"
import Adbanner from '../components/Adbanner';

  const Finance = () => {
  const { theme, icons } = useContext(ThemeContext);
  const { currentUser } = useAuth();
  const { recordId } = useParams();
  const [showAlertDeleteHistory, setShowAlertDeleteHistory] = useState(false);
  const [rental, setRental] = useState(null);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [allIncome, setAllIncome] = useState(0);
  const [allOutcome, setAllOutcome] = useState(0);
  const [allTotal, setAllTotal] = useState(0);
  const [profitRate, setProfitRate] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [dateSort, setDateSort] = useState(true);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [showFilterTag, setShowFilterTag] = useState(false);
  const [showFilterTagBox, setShowFilterTagBox] = useState(false);
  const filterTagBoxRef = useRef(null);
  const [tagFilters, setTagFilters] = useState({});
  const [selectedTags, setSelectedTags] = useState([]);
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({
    firstDate: '',
    lastDate: ''
  });
  const [formData, setFormData] = useState({
    income: '',
    outcome: '',
    list: '',
    paymentDate: '',
    rental: '',
    note: '',
  });

  const formatDateForInput = (displayDate) => {
    if (!displayDate) return '';
    const [day, month, year] = displayDate.split('/');
    return `${year}-${month}-${day}`;
  };

useEffect(() => {
  if (Array.isArray(allRecords)) {
    const rentalNames = [...new Set(allRecords.map(rec => rec.rental).filter(Boolean))];
    const newTagFilters = rentalNames.reduce((acc, name) => {
      // Preserve existing selections when updating available tags
      acc[name] = tagFilters[name] || false;
      return acc;
    }, {});
    setTagFilters(newTagFilters);
  }
}, [allRecords]);


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
    [tag]: !tagFilters[tag],
  };
  setTagFilters(updatedFilters);
  const activeTags = Object.keys(updatedFilters).filter(key => updatedFilters[key]);
  setSelectedTags(activeTags);
};

const handleSortDate = (valueOrEvent, field) => {
  let newValue;

  if (valueOrEvent?.target?.value !== undefined) {
    newValue = valueOrEvent.target.value;
  } else {
    newValue = valueOrEvent instanceof Date ? valueOrEvent.toISOString() : null;
  }

  setDateRange(prev => ({
    ...prev,
    [field]: newValue
  }));

  if (field === 'lastDate' || (field === 'firstDate' && dateRange.lastDate)) {
    setCurrentFilter('custom');
  }
};


const handleFilterFinance = (filter) => {
  setCurrentFilter(filter);
  if (filter === 'all' || filter === 'thisMonth' || filter === 'thisYear') {
    setOpenCalendar(false);
    setDateRange({
      firstDate: '',
      lastDate: ''
    });
  }
};

useEffect(() => {
  const filtered = getFilteredRecords();
  setFilteredRecords(filtered);
}, [allRecords, tagFilters, currentFilter, dateRange]);

// Updated getFilteredRecords function
const getFilteredRecords = () => {
  if (!Array.isArray(allRecords) || allRecords.length === 0) {
    return [];
  }
  
  const activeTags = Object.keys(tagFilters).filter(tag => tagFilters[tag]);
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  return allRecords.filter(record => {
    // First check rental filter
    const matchRental = activeTags.length === 0 || activeTags.includes(record.rental);
    
    // If rental doesn't match, exclude this record
    if (!matchRental) {
      return false;
    }
    
    // Then check date filter
    if (!record.paymentDate || record.paymentDate.trim() === '') {
      return currentFilter === 'all';
    }

    // Updated parsing for YYYY-MM-DD format
    const recordDate = new Date(record.paymentDate);
    
    // Validate the date
    if (isNaN(recordDate.getTime())) {
      return currentFilter === 'all';
    }
    
    switch (currentFilter) {
      case 'thisMonth':
        return recordDate.getMonth() === currentMonth && 
               recordDate.getFullYear() === currentYear;
      case 'thisYear':
        return recordDate.getFullYear() === currentYear;
      case 'custom': {
        if (!dateRange.firstDate && !dateRange.lastDate) {
          return true;
        }
        if (dateRange.firstDate) {
          let startDate = new Date(dateRange.firstDate);
          startDate.setHours(0, 0, 0, 0);
          if (dateRange.lastDate) {
            let endDate = new Date(dateRange.lastDate);
            endDate.setHours(23, 59, 59, 999);
            return recordDate >= startDate && recordDate <= endDate;
          }
          return recordDate >= startDate;
        }
        if (dateRange.lastDate) {
          let endDate = new Date(dateRange.lastDate);
          endDate.setHours(23, 59, 59, 999);
          return recordDate <= endDate;
        }
        return true;
      }
      case 'all':
      default:
        return true;
    }
  });
};

useEffect(() => {
  if (Array.isArray(allRecords)) {
    const filtered = getFilteredRecords();

    const sortedFiltered = [...filtered].sort((a, b) => {
      const isEmptyA = !a.paymentDate || a.paymentDate.trim() === '';
      const isEmptyB = !b.paymentDate || b.paymentDate.trim() === '';
      
      if (isEmptyA && !isEmptyB) return -1;
      if (!isEmptyA && isEmptyB) return 1;
      if (isEmptyA && isEmptyB) return 0;
      const dateA = new Date(a.paymentDate);
      const dateB = new Date(b.paymentDate);
      
      // Handle invalid dates
      const validDateA = isNaN(dateA.getTime()) ? new Date(0) : dateA;
      const validDateB = isNaN(dateB.getTime()) ? new Date(0) : dateB;
      
      return dateSort ? validDateB - validDateA : validDateA - validDateB;
    });

    setFilteredRecords(sortedFiltered);

    const totalIncome = sortedFiltered.reduce((sum1, record) => {
      const incomeValue = parseInt(String(record.income).replace(/,/g, ""), 10);
      return sum1 + (isNaN(incomeValue) ? 0 : incomeValue);
    }, 0);
    
    const totalOutcome = sortedFiltered.reduce((sum2, record) => {
      const outcomeValue = parseInt(String(record.outcome).replace(/,/g, ""), 10);
      return sum2 + (isNaN(outcomeValue) ? 0 : outcomeValue);
    }, 0);
    
    const total = sortedFiltered.reduce((sum3, record) => {
      const income = parseInt(String(record.income).replace(/,/g, ""), 10) || 0;
      const outcome = parseInt(String(record.outcome).replace(/,/g, ""), 10) || 0;
      const totalValue = income - outcome;
      return sum3 + totalValue;
    }, 0);
    
    const profitRate = totalOutcome === 0 ? 0
      : Number((((totalIncome - totalOutcome) / totalOutcome) * 100).toFixed(2));        
    
    setAllIncome(totalIncome);
    setAllOutcome(totalOutcome);
    setAllTotal(total);
    setProfitRate(profitRate);
  }
}, [allRecords, currentFilter, dateRange, dateSort, tagFilters]); // Added tagFilters here!
  
  const handleAddComma = (number) => {
    return number ? number.toLocaleString('en-US') : '';
  };

  const fetchRecords = async () => {
    try {
      const userDocRef = doc(db, "users", currentUser.email);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.finance && userData.finance.allRecords) {
          setAllRecords(userData.finance.allRecords);
        } else {
          setAllRecords([]);
        }
      } else {
        setAllRecords([]);
      }
    } catch (error) {
      console.error("Error fetching records:", error);
      setAllRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchRecords();
    }
  }, [currentUser]);
  
  const addRecord = async (e) => {
      e.preventDefault();
      try {
      const newRecord = {
          id: Date.now().toString(), 
          ...formData,
          };
      if (!currentUser) {
        console.error("User not logged in");
        navigate(`/account`)
        return;
      }
      const userDocRef = doc(db, "users", currentUser.email);
      const userDoc = await getDoc(userDocRef);
  
      if (userDoc.exists()) {
          const userData = userDoc.data();
          
          if (userData.finance) {
            if (!Array.isArray(userData.finance.allRecords)) {
              userData.finance.allRecords = [];
            }
            userData.finance.allRecords.push(newRecord);
            await updateDoc(userDocRef, {
              finance: userData.finance
            });
            setFormData({
              income: '',
              outcome: '',
              list: '',
              paymentDate: '',
              rental: '',
              note: '',
              edited: false,
            });
            fetchRecords();
          } else {
            console.error("No finance found for this user");
          }
        } else {
          console.error("User document not found");
        }
      } catch (error) {
        console.error("Error adding record:", error);
      }
    };

  const deleteRecord = async (id) => {
    try {
      const userDocRef = doc(db, "users", currentUser.email);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
      if (userData.finance) {
            userData.finance.allRecords = 
            userData.finance.allRecords.filter(record => record.id !== id);
          await updateDoc(userDocRef, {
            finance: userData.finance
          });
          fetchRecords();
        }
      }
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  const handleChangeRecord = async (e, field, recordId) => {
    let newValue;
    if (field === 'paymentDate') {
      if (e instanceof Date) {
        newValue = formatForStorage(e);
      } else if (typeof e === 'string') {
        newValue = e;
      }
    } else {
      newValue = e.target.innerText;
      if (field === 'income' || field === 'outcome') {
        const cleanValue = newValue.replace(/,/g, '');
        newValue = cleanValue;
      }
    }
  
    try {
      const userDocRef = doc(db, "users", currentUser.email);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        if (userData.finance && Array.isArray(userData.finance.allRecords)) {
          const recordIndex = userData.finance.allRecords.findIndex(record => record.id === recordId);
          
          if (recordIndex !== -1) {
            userData.finance.allRecords[recordIndex][field] = newValue;
            userData.finance.allRecords[recordIndex].edited = true;
            
            await updateDoc(userDocRef, {
              finance: userData.finance
            });
            fetchRecords();
          }
        }
      }
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    }
  };
  function parseDate(dateStr) {
      if (!dateStr) return 0;
      
      const [day, month, year] = dateStr.split('/').map(num => parseInt(num, 10));
      return new Date(year, month - 1, day).getTime();
  }

  return (
    <>
    <div className="TooltipMain fixed bottom-24 right-4 flex flex-col items-center justify-center z-50">
      <div className="flex text-center justify-center bg-blue-500 p-1 mb-2 rounded-lg font-prompt text-ellSecondary text-sm z-20 Tooltip">เพิ่ม</div>
      <div className="absolute mb-14 w-4 h-4 bg-blue-500 rotate-45 z-10 Tooltip"></div>
      <button className="relative rounded-full bg-blue-500 flex items-center justify-center cursor-pointer active:scale-98 hover:scale-105 p-3 z-20"
        onClick={addRecord}>
        <img src={icons.plus} width="40" height="40" alt="edit" />
      </button>
    </div>
    {isEditing ? (
        <div className="TooltipMain fixed bottom-4 right-4 flex flex-col items-center justify-center z-50">
          <div className="flex text-center justify-center bg-ellGreen p-1 mb-2 rounded-lg font-prompt text-[#F7F7F7] text-sm z-20 Tooltip">บันทึก</div>
          <div className="absolute mb-14 w-4 h-4 bg-ellGreen rotate-45 z-10 Tooltip"></div>
          <button className="relative rounded-full bg-ellGreen flex items-center justify-center cursor-pointer active:scale-98 hover:scale-105 p-3 z-20"
            onClick={() => setIsEditing(false)}>
            <img src={icons.save} width="40" height="40" alt="save" />
          </button>
        </div>
      ) : (
    <div className="TooltipMain fixed bottom-4 right-4 flex flex-col items-center justify-center z-50">
      <div className="flex text-center justify-center bg-ellBlack p-1 mb-2 rounded-lg font-prompt text-ellSecondary text-sm z-20 Tooltip">แก้ไข</div>
      <div className="absolute mb-14 w-4 h-4 bg-ellBlack rotate-45 z-10 Tooltip"></div>
      <button className="relative rounded-full bg-ellBlack flex items-center justify-center cursor-pointer active:scale-98 hover:scale-105 p-3 z-20"
        onClick={() => setIsEditing(true)}>
        <img src={icons.edit} width="40" height="40" alt="edit" />
      </button>
    </div>
      )}    
<div className='flex flex-row justify-between w-full'>
  <div className='xl:fixed relative w-50 h-full justify-center hidden xl:flex'>
    <Adbanner 
      dataAdSlot="2654056216"
      dataAdFormat="auto"
    />
  </div>
    <div className='flex justify-center w-full h-full'>
        <div className="flex flex-col w-4xl h-full xl:pb-5 pb-22">
          {/* Table */}
          <div className='flex md:flex-col flex-col items-center justify-center w-full my-4'>
            <div className='flex md:flex-row flex-col w-full mb-4'>
              <div className="flex flex-row md:justify-start justify-center">
              <button className={`border-2 border-ellGray hover:border-ellPrimary rounded-2xl py-2 mr-2 w-25 md:w-22 font-prompt text-ellPrimary ${currentFilter === 'all' ? 'bg-ellPrimary text-ellTertiary border-transparent cursor-default' : "cursor-pointer"}`}
                onClick={() => handleFilterFinance("all")}>
                ทั้งหมด
              </button>
              <button className={`border-2 border-ellGray hover:border-ellPrimary rounded-2xl py-2 mr-2 w-25 md:w-22 font-prompt text-ellPrimary ${currentFilter === 'thisMonth' ? 'bg-ellPrimary text-ellTertiary border-transparent cursor-default' : "cursor-pointer"}`}
                onClick={() => handleFilterFinance("thisMonth")}>
                เดือนนี้
              </button>
              <button className={`border-2 border-ellGray hover:border-ellPrimary rounded-2xl py-2 mr-2 w-25 md:w-22 font-prompt text-ellPrimary ${currentFilter === 'thisYear' ? 'bg-ellPrimary text-ellTertiary border-transparent cursor-default' : "cursor-pointer"}`} 
                onClick={() => handleFilterFinance("thisYear")}>
                ปีนี้
              </button>
              </div>
              <div className="flex md:justify-start justify-center md:mt-0 mt-3">
              {!openCalendar ? (
              <button className={`border-2 border-ellGray hover:border-ellPrimary rounded-2xl py-2 px-4 mr-2 font-prompt text-ellPrimary flex justify-center cursor-pointer`}
                onClick={() => setOpenCalendar(true)}>
                <img src={icons.calendar} width="25" height="40" alt="calendar" />
              </button>
              ):(
              <div className={`w-xs flex flex-row justify-between border-2 border-ellGray rounded-2xl font-semibold text-lg items-center ${currentFilter === 'custom' ? 'bg-ellPrimary border-transparent text-ellTertiary' : "text-ellPrimary"}`} >
                <Flatpickr
                  options={{
                    locale: Thai,
                    dateFormat: "d/m/Y",
                    altInput: true,
                    altFormat: "j M Y",
                    formatDate: flatpickrThaiBuddhistFormatter
                  }}
                  placeholder="วัน/เดือน/ปี"
                  value={dateRange.firstDate ? new Date(dateRange.firstDate) : null}
                  onChange={([date]) => {handleSortDate(date, 'firstDate')}}
                  className={`w-full h-full focus:outline-none cursor-text text-sm text-center ${currentFilter === 'custom' ? 'text-ellTertiary' : "text-ellPrimary"}*`}
                />
                →
                <Flatpickr
                  options={{
                    locale: Thai,
                    dateFormat: "d/m/Y",
                    altInput: true,
                    altFormat: "j M Y",
                    formatDate: flatpickrThaiBuddhistFormatter
                  }}
                  placeholder="วัน/เดือน/ปี"
                  value={dateRange.lastDate ? new Date(dateRange.lastDate) : null}
                  onChange={([date]) => {handleSortDate(date, 'lastDate')}}
                  className={`w-full h-full focus:outline-none cursor-text text-sm text-center ${currentFilter === 'custom' ? 'text-ellTertiary' : "text-ellPrimary"}*`}
                />
              </div>
              )}
              </div>
              <div className="relative inline-block" ref={filterTagBoxRef}>
                <button className={`border-2 border-ellGray hover:border-ellPrimary rounded-2xl py-2 w-15 md:w-13 flex flex-row justify-center items-center cursor-pointer ${showFilterTagBox ? 'border-ellPrimary' : "border-ellGray"} ${showFilterTag ? "bg-ellPrimary border-transparent" : "bg-transparent"}`}
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
            </div>
            {/* Controls */}
              <table className="w-full">
              <thead>
                <tr>
                  <th className="w-20 py-2 font-prompt text-sm md:text-base text-center bg-ellWhite border-2 border-ellGray  text-ellPrimary tracking-wider">รายรับ</th>
                  <th className="w-20 py-2 font-prompt text-sm md:text-base text-center bg-ellWhite border-2 border-ellGray  text-ellPrimary tracking-wider">รายจ่าย</th>
                  <th className="w-20 py-2 font-prompt text-sm md:text-base text-center bg-ellWhite border-2 border-ellGray  text-ellPrimary tracking-wider">รายได้รวม</th>
                  <th className="w-20 py-2 font-prompt text-sm md:text-base text-center bg-ellWhite border-2 border-ellGray  text-ellPrimary tracking-wider">อัตรากำไร</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className={`w-20 py-2 whitespace-nowrap font-prompt text-center bg-ellWhite border-2 border-ellGray md:text-md text-sm ${allIncome === 0 ? 'text-ellPrimary' : "text-ellGreen"}`}>{allIncome === 0 ? "0" : handleAddComma(allIncome)}</td>
                  <td className={`w-20 py-2 whitespace-nowrap font-prompt text-center bg-ellWhite border-2 border-ellGray md:text-md text-sm ${allOutcome === 0 ? 'text-ellPrimary' : "text-ellRed"}`}>{allOutcome === 0 ? "0" : handleAddComma(allOutcome)}</td>
                  <td className={`w-20 py-2 whitespace-nowrap font-prompt text-center bg-ellWhite border-2 border-ellGray md:text-md text-sm ${allTotal === 0 ? 'text-ellPrimary' : allTotal > 0 ? 'text-ellGreen' : 'text-ellRed'}`}>{allTotal === 0 ? "-" : handleAddComma(allTotal)}</td>
                  <td className={`w-20 py-2 whitespace-nowrap font-prompt text-center bg-ellWhite border-2 border-ellGray md:text-md text-sm ${profitRate === 0 ? 'text-ellPrimary' : profitRate > 0 ? 'text-ellGreen' : "text-ellRed"}`}>{profitRate === 0 ? "-" : handleAddComma(profitRate) + "%"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        {/* Desktop/Tablet View (Headers on Top) - Hidden on Mobile */}
          <table className="w-full">
            <thead className="bg-ellPrimary">
              <tr>
                <th className="w-fit py-3 font-prompt text-center bg-ellWhite border-2 border-ellGray md:text-base text-sm text-ellPrimary uppercase tracking-wider cursor-default">รายรับ</th>
                <th className="w-fit py-3 font-prompt text-center bg-ellWhite border-2 border-ellGray md:text-base text-sm text-ellPrimary uppercase tracking-wider cursor-default">รายจ่าย</th>
                <th className="w-fit py-3 font-prompt text-center bg-ellWhite border-2 border-ellGray md:text-base text-sm text-ellPrimary uppercase tracking-wider cursor-default">รายการ</th>
                <th className="w-fit py-3 font-prompt text-center hover:bg-ellGray bg-ellWhite border-2 border-ellGray md:text-base text-sm text-ellPrimary uppercase tracking-wider cursor-pointer" onClick={() => setDateSort(prev => !prev)}>
                  <div className="flex flex-row justify-center" >
                  <img src={icons.sign} width="18" height="40" alt="sign" className={`${!dateSort ? "rotate-0" : "rotate-180 mr-2"} md:block hidden`}/>วันชำระ
                  </div>
                </th>
                <th className="w-fit py-3 font-prompt text-center bg-ellWhite border-2 border-ellGray md:text-base text-sm text-ellPrimary uppercase tracking-wider cursor-default">ชื่ออสังหาฯ</th>
                <th className="w-fit py-3 font-prompt text-center bg-ellWhite border-2 border-ellGray md:text-base text-sm text-ellPrimary uppercase tracking-wider cursor-default">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-ellPrimary border-2 border-ellGray">Loading...</td>
                </tr>
              ) : allRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-ellPrimary border-2 border-ellGray">No records found</td>
                </tr>
              ) : (
                <>
                {filteredRecords.length === 0 ? (
                  <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-ellPrimary border-2 border-ellGray">No records found</td>
                </tr>
                ):(
                  <>
                  {filteredRecords.map(allrecords => (
                   isEditing ? (
                    <>
                    <tr key={allrecords.id} className="relative">
                      <td 
                        className="py-4 w-20 md:text-base text-sm font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary"
                        contentEditable="true"
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleChangeRecord(e, 'income', allrecords.id)}
                      >
                        {allrecords.income}
                      </td>
                      <td 
                        className="py-4 w-20 md:text-base text-sm font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary"
                        contentEditable="true"
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleChangeRecord(e, 'outcome', allrecords.id)}
                      >
                        {allrecords.outcome}
                      </td>
                      <td 
                        className="py-4 w-20 md:text-base text-sm font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary break-all"
                        contentEditable="true"
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleChangeRecord(e, 'list', allrecords.id)}
                      >
                        {allrecords.list}
                      </td>
                      <td className="py-4 w-20 md:text-base text-sm font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary relative">
                        <Flatpickr
                          options={{
                            locale: Thai,
                            dateFormat: "d/m/Y",
                            altInput: true,
                            altFormat: "j M Y",
                            formatDate: flatpickrThaiBuddhistFormatter
                          }}
                          placeholder="วัน/เดือน/ปี"
                          value={allrecords.paymentDate ? new Date(allrecords.paymentDate) : null}
                          onChange={([date]) => {handleChangeRecord(date, 'paymentDate', allrecords.id)}}
                          className="w-full h-full text-center px-4 text-ellPrimary focus:outline-none cursor-text xl:text-md text-sm absolute inset-0"
                        />
                      </td>
                      <td 
                        className="py-4 w-20 md:text-base text-sm font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary"
                        contentEditable="true"
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleChangeRecord(e, 'rental', allrecords.id)}
                      >
                        {allrecords.rental}
                      </td>
                      
                      <td 
                        className="py-4 w-20 md:text-base text-sm font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary"
                        contentEditable="true"
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleChangeRecord(e, 'note', allrecords.id)}
                      >
                        {allrecords.note}
                      </td>
                      <td className="w-0 p-0 m-0 relative">
                        <button className="absolute xl:right-[-80px] md:right-[-70px] top-1/2 -translate-y-1/2 bg-ellWhite text-ellRed px-3 py-1 rounded-full cursor-pointer hover:bg-ellBlack"
                            onClick={() => deleteRecord(allrecords.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                      <tr>
                      <td colSpan={6} className="bg-ellWhite text-center md:hidden ">
                        <button
                          className="w-full bg-ellRed text-[#F7F7F7] active:bg-red-800 cursor-pointer font-prompt"
                          onClick={() => deleteRecord(allrecords.id)}
                        >
                          ↑ Delete ↑
                        </button>
                      </td>
                    </tr>
                    </>
                  ) : (
                    <>
                    <tr key={allrecords.id}>
                      <td className="py-4 w-20 md:text-base text-sm font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellGreen overflow-hidden whitespace-nowrap text-ellipsis">
                        {allrecords.income.trim() === "" ? "-" : allrecords.income}
                      </td>
                      <td className="py-4 w-20 md:text-base text-sm font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellRed overflow-hidden whitespace-nowrap text-ellipsis">
                        {allrecords.outcome.trim() === "" ? "-" : allrecords.outcome}
                      </td>
                      <td className="py-4 md:w-20 w-20 md:text-base text-sm font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary text-ellipsis break-all px-1">
                        {allrecords.list?.trim() === "" ? "-" : allrecords.list}
                      </td>
                      <td className="py-4 w-20 md:text-base text-xs font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary text-ellipsis">
                        {formatIsoToThaiBuddhist(allrecords.paymentDate) || "-"}
                      </td>
                      <td className="py-4 w-20 md:text-base text-sm font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary text-ellipsis break-all px-1">
                        {allrecords.rental?.trim() === "" ? "-" : allrecords.rental}
                      </td>
                      <td className="py-4 w-20 md:text-base text-xs font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary text-ellipsis">
                        {allrecords.note.trim() === "" ? "-" : allrecords.note}
                      </td>
                    </tr>
                    </>
                  )
                ))}
                </>
              )}
                </>
              )}
            </tbody>
          </table>
           <div className="w-full flex justify-center xl:hidden mt-6">
            <Adbanner
              dataAdSlot="2654056216"
              dataAdFormat="horizontal"
            />
          </div>
        </div>
      </div>
  </div>
    </>
  );
};

export default Finance