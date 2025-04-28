import React, { useState, useEffect, useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';
import { useParams, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import { db } from '../components/firebase';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';

  const Finance = () => {
  const { theme, icons } = useContext(ThemeContext);
  const [user, setUser] = useState(localStorage.getItem("email") || null);
  const { recordId } = useParams();
  const [showAlertDeleteHistory, setShowAlertDeleteHistory] = useState(false);
  const [rental, setRental] = useState(null);
  const [allRecords, setAllRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSort, setIsSort] = useState(false);
  const [formData, setFormData] = useState({
    income: '',
    outcome: '',
    paymentDate: '',
    note: '',
  });

  const fetchRecords = async () => {
    try {
      const userDocRef = doc(db, "users", user);
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
    if (user) {
      fetchRecords();
    }
  }, [user]);
  
  const sortedRecords = [...(Array.isArray(allRecords) ? allRecords : [])].sort((a, b) => {
    const idA = parseInt(a.id, 10);
    const idB = parseInt(b.id, 10);
    return isSort ? idB - idA : idA - idB;
    
  });
  return (
    <>
    <div className="TooltipMain fixed bottom-24 right-4 flex flex-col items-center justify-center z-50">
      <div className="flex text-center justify-center bg-blue-500 p-1 mb-2 rounded-lg font-prompt text-ellSecondary text-sm z-20 Tooltip">เพิ่ม</div>
      <div className="absolute mb-14 w-4 h-4 bg-blue-500 rotate-45 z-10 Tooltip"></div>
      <button className="relative rounded-full bg-blue-500 flex items-center justify-center cursor-pointer active:scale-98 hover:scale-105 p-3 z-20"
        onClick={() => setIsEditing(true)}>
        <img src={icons.plus} width="40" height="40" alt="edit" />
      </button>
    </div>
    <div className="TooltipMain fixed bottom-4 right-4 flex flex-col items-center justify-center z-50">
      <div className="flex text-center justify-center bg-ellBlack p-1 mb-2 rounded-lg font-prompt text-ellSecondary text-sm z-20 Tooltip">แก้ไข</div>
      <div className="absolute mb-14 w-4 h-4 bg-ellBlack rotate-45 z-10 Tooltip"></div>
      <button className="relative rounded-full bg-ellBlack flex items-center justify-center cursor-pointer active:scale-98 hover:scale-105 p-3 z-20"
        onClick={() => setIsEditing(true)}>
        <img src={icons.edit} width="40" height="40" alt="edit" />
      </button>
    </div>
    <div className='flex justify-center w-full h-full'>
        <div className="flex flex-col w-4xl h-full xl:pb-5 pb-22">
          {/* Table */}
          <div className='flex md:flex-col flex-col items-center justify-center w-full my-4'>
            <div className='flex flex-row w-full mb-4'>
              <button className={`border-2 border-ellGray hover:border-ellPrimary rounded-2xl py-2 mr-2 w-25 md:w-22 font-prompt text-ellPrimary `}>
                ทั้งหมด
              </button>
              <button className={`border-2 border-ellGray hover:border-ellPrimary rounded-2xl py-2 mr-2 w-25 md:w-22 font-prompt text-ellPrimary `}>
                เดือนนี้
              </button>
              <button className={`border-2 border-ellGray hover:border-ellPrimary rounded-2xl py-2 mr-2 w-25 md:w-22 font-prompt text-ellPrimary `}>
                ปีนี้
              </button>
              <button className={`border-2 border-ellGray hover:border-ellPrimary rounded-2xl py-2 px-4 mr-2 font-prompt text-ellPrimary flex justify-center`}>
                <img src={icons.calendar} width="25" height="40" alt="calendar" />
              </button>
            </div>
            {/* Controls */}
              <table className="w-full md:mt-0 mt-4">
              <thead>
                <tr>
                  <th className="w-md py-2 font-prompt text-center bg-ellWhite border-2 border-ellGray text-md text-ellPrimary tracking-wider">รายรับ</th>
                  <th className="w-md py-2 font-prompt text-center bg-ellWhite border-2 border-ellGray text-md text-ellPrimary tracking-wider">รายจ่าย</th>
                  <th className="w-md py-2 font-prompt text-center bg-ellWhite border-2 border-ellGray text-md text-ellPrimary tracking-wider">รายได้รวม</th>
                  <th className="w-md py-2 font-prompt text-center bg-ellWhite border-2 border-ellGray text-md text-ellPrimary tracking-wider">อัตรากำไร</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="w-md py-2 whitespace-nowrap font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary"></td>
                  <td className="w-md py-2 whitespace-nowrap font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary">t</td>
                  <td className="w-md py-2 whitespace-nowrap font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary">ill</td>
                  <td className="w-md py-2 whitespace-nowrap font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary">ill</td>
                </tr>
              </tbody>
            </table>
          </div>
        {/* Desktop/Tablet View (Headers on Top) - Hidden on Mobile */}
        <div className="hidden sm:block">
          <table className="w-full">
            <thead className="bg-ellPrimary">
              <tr>
                <th className="w-20 py-3 font-prompt text-center bg-ellWhite border-2 border-ellGray text-md text-ellPrimary uppercase tracking-wider cursor-default">รายรับ</th>
                <th className="w-20 py-3 font-prompt text-center bg-ellWhite border-2 border-ellGray text-md text-ellPrimary uppercase tracking-wider cursor-default">รายจ่าย</th>
                <th className="w-20 py-3 font-prompt text-center bg-ellWhite border-2 border-ellGray text-md text-ellPrimary uppercase tracking-wider cursor-default">วันที่</th>
                <th className="w-20 py-3 font-prompt text-center bg-ellWhite border-2 border-ellGray text-md text-ellPrimary uppercase tracking-wider cursor-default">หมายเหตุ</th>
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
                sortedRecords.map((allrecords, index) => {
                  const displayIndex = isSort ? sortedRecords.length - index : index + 1;
                  
                  return isEditing ? (
                    <tr key={allrecords.id} className="relative">
                      <td className="font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary relative">
                        <input
                          type="date"
                          name="moveInDate"
                          value={allrecords.moveInDate ? formatDateForInput(allrecords.moveInDate) : ''}
                          onChange={(e) => handleRecordFieldChange(e, 'moveInDate', allrecords.id)}
                          className="w-full h-full px-4 text-ellPrimary focus:outline-none cursor-text xl:text-md text-sm absolute inset-0"
                        />
                      </td>
                      <td 
                        className="py-4 w-fit font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary"
                        contentEditable="true"
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleChangeRecord(e, 'rentalRate', allrecords.id)}
                      >
                        {allrecords.rentalRate}
                      </td>
                      <td className="font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary relative">
                        <input
                          type="date"
                          name="paymentDate"
                          value={allrecords.paymentDate}
                          onChange={(e) => handleRecordFieldChange(e, 'paymentDate', allrecords.id)}
                          className="w-full h-full px-4 text-ellPrimary focus:outline-none cursor-text xl:text-md text-sm absolute inset-0"
                        />
                      </td>
                      <td 
                        className="py-4 w-fit font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary"
                        contentEditable="true"
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleRecordFieldChange(e, 'transactionCode', allrecords.id)}
                      >
                        {allrecords.transactionCode}
                      </td>
                      <td className="w-0 p-0 m-0 relative">
                        <div className="absolute right-[-80px] top-1/2 -translate-y-1/2 bg-ellWhite text-ellRed px-3 py-1 rounded-full cursor-pointer hover:bg-ellBlack"
                            onClick={() => deleteRecord(allrecords.id)}>
                          Delete
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={allrecords.id}>
                      <td className="py-4 w-fit font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary overflow-hidden whitespace-nowrap text-ellipsis">
                        {allrecords.income?.trim() === "" ? "-" : allrecords.income}
                      </td>
                      <td className="py-4 w-fit font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary overflow-hidden whitespace-nowrap text-ellipsis">
                        {allrecords.expense?.trim() === "" ? "-" : allrecords.expense}
                      </td>
                      <td className="py-4 w-fit font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary overflow-hidden whitespace-nowrap text-ellipsis">
                        {allrecords.date?.trim() === "" ? "-" : allrecords.date}
                      </td>
                      <td className="py-4 w-59.5 font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary overflow-hidden whitespace-nowrap text-ellipsis">
                        {allrecords.note?.trim() === "" ? "-" : allrecords.note}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </>
  );
};

export default Finance