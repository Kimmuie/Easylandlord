import React, { useState, useEffect, useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../components/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext'; 

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
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({
    firstDate: '',
    lastDate: ''
  });
  const [formData, setFormData] = useState({
    income: '',
    outcome: '',
    paymentDate: '',
    note: '',
  });

  const formatDateForInput = (displayDate) => {
    if (!displayDate) return '';
    const [day, month, year] = displayDate.split('/');
    return `${year}-${month}-${day}`;
  };

  const handleSortDate = (e, field) => {
    const newValue = e.target.value;
    setDateRange(prev => ({
      ...prev,
      [field]: newValue
    }));
    if (field === 'lastDate' || 
        (field === 'firstDate' && dateRange.lastDate)) {
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

  const getFilteredRecords = () => {
    if (!Array.isArray(allRecords) || allRecords.length === 0) {
      return [];
    }
  
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
  
    return allRecords.filter(record => {
      if (!record.paymentDate || record.paymentDate.trim() === '') {
        return currentFilter === 'all';
      }
  
      const [day, month, year] = record.paymentDate.split('/').map(num => parseInt(num, 10));
      const recordDate = new Date(year, month - 1, day);
      
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
        const dateA = parseDate(a.paymentDate);
        const dateB = parseDate(b.paymentDate);
        return dateSort ? dateB - dateA : dateA - dateB;
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
  }, [allRecords, currentFilter, dateRange, dateSort]);
  
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
              paymentDate: '',
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
      newValue = e.target.value;
      const [day, month, year] = newValue.split('-');
      newValue = `${year}/${month}/${day}`;
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

  const sortedRecords = [...(Array.isArray(allRecords) ? allRecords : [])].sort((a, b) => {
    const dateA = parseDate(a.paymentDate);
    const dateB = parseDate(b.paymentDate);
    return dateSort ? dateB - dateA : dateA - dateB;
  });

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
    <div className='flex justify-center w-full h-full'>
        <div className="flex flex-col w-4xl h-full xl:pb-5 pb-22">
          {/* Table */}
          <div className='flex md:flex-col flex-col items-center justify-center w-full my-4'>
            <div className='flex flex-row w-full mb-4'>
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
              {!openCalendar ? (
              <button className={`border-2 border-ellGray hover:border-ellPrimary rounded-2xl py-2 px-4 mr-2 font-prompt text-ellPrimary flex justify-center cursor-pointer`}
                onClick={() => setOpenCalendar(true)}>
                <img src={icons.calendar} width="25" height="40" alt="calendar" />
              </button>
              ):(
              <div className={`w-xs flex flex-row border-2 border-ellGray rounded-2xl font-semibold text-lg items-center ${currentFilter === 'custom' ? 'bg-ellPrimary border-transparent text-ellTertiary' : "text-ellPrimary"}`} >
                <input
                type="date"
                name="firstDate"
                value={dateRange.firstDate}
                onChange={(e) => handleSortDate(e, 'firstDate')}
                className={`calendar w-full h-full pl-10 focus:outline-none cursor-text text-sm text-right ${currentFilter === 'custom' ? 'text-ellTertiary' : "text-ellPrimary"}*`}
                />
                →
                <input
                type="date"
                name="lastDate"
                value={dateRange.lastDate}
                onChange={(e) => handleSortDate(e, 'lastDate')}
                className={`w-xs h-full px-4 focus:outline-none cursor-text text-sm  ${currentFilter === 'custom' ? 'text-ellTertiary' : "text-ellPrimary"}`}
                />
              </div>
              )}
            </div>
            {/* Controls */}
              <table className="w-full md:mt-0 mt-4">
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
                <th className="w-20 py-3 font-prompt text-center bg-ellWhite border-2 border-ellGray md:text-base text-sm text-ellPrimary uppercase tracking-wider cursor-default">รายรับ</th>
                <th className="w-20 py-3 font-prompt text-center bg-ellWhite border-2 border-ellGray md:text-base text-sm text-ellPrimary uppercase tracking-wider cursor-default">รายจ่าย</th>
                <th className="w-20 py-3 font-prompt text-center hover:bg-ellGray bg-ellWhite border-2 border-ellGray md:text-base text-sm text-ellPrimary uppercase tracking-wider cursor-pointer" onClick={() => setDateSort(prev => !prev)}>
                  <div className="flex flex-row justify-center" >
                  <img src={icons.sign} width="18" height="40" alt="sign" className={`${!dateSort ? "rotate-0" : "rotate-180 mr-2"} md:block hidden`}/>วันที่
                  </div>
                </th>
                <th className="w-20 py-3 font-prompt text-center bg-ellWhite border-2 border-ellGray md:text-base text-sm text-ellPrimary uppercase tracking-wider cursor-default">หมายเหตุ</th>
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
                      <td className="py-4 w-20 md:text-base text-sm font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary relative">
                        <input
                          type="date"
                          name="paymentDate"
                          value={allrecords.paymentDate ? formatDateForInput(allrecords.paymentDate) : ''}
                          onChange={(e) => handleChangeRecord(e, 'paymentDate', allrecords.id)}
                          className="w-full h-full px-4 text-ellPrimary focus:outline-none cursor-text xl:text-md text-sm absolute inset-0"
                        />
                      </td>
                      <td 
                        className="py-4 w-20 md:text-base text-sm font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary break-all"
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
                      <td colSpan={5} className="bg-ellWhite text-center md:hidden ">
                        <button
                          className="w-full bg-ellRed text-[#F7F7F7] active:bg-red-800 cursor-pointer font-prompt"
                          onClick={() => deleteRecord(allrecords.id)}
                        >
                          ↑<br/>Delete
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
                      <td className="py-4 w-20 md:text-base text-xs font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary text-ellipsis">
                        {allrecords.paymentDate.trim() === "" ? "-" : allrecords.paymentDate}
                      </td>
                      <td className="py-4 md:w-63.5 w-20 md:text-base text-sm font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary text-ellipsis break-all px-1">
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
        </div>
      </div>
    </>
  );
};

export default Finance