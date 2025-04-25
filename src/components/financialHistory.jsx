import React, { useState, useEffect, useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';
import { useParams, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import { db } from '../components/firebase';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';

  const FinancialHistory = ({ isEditing, setIsEditing }) => {
  const { theme, icons } = useContext(ThemeContext);
  const [user, setUser] = useState(localStorage.getItem("email") || null);
  const { rentalId } = useParams();
  const [showAlertDeleteHistory, setShowAlertDeleteHistory] = useState(false);
  const [rental, setRental] = useState(null);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSort, setIsSort] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [depositBill, setDepositBill] = useState('');
  const [electricityBill, setElectricityBill] = useState('');
  const [waterBill, setWaterBill] = useState('');
  const [tempoDate, setTempoDate] = useState('');
  const [formData, setFormData] = useState({
    moveInDate: '',
    dueInDate: '',
    rentalRate: '',
    paymentDate: '',
    transactionCode: ''
  });

const formatDateForDisplay = (isoDate) => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

const formatDateForInput = (displayDate) => {
  if (!displayDate) return '';
  const [day, month, year] = displayDate.split('/');
  return `${year}-${month}-${day}`;
};

const handleRecordFieldChange = (e, field, recordId) => {
  let value;
  
  if (e.target.type === 'date') {
    value = formatDateForDisplay(e.target.value);
  } else {
    value = e.target.innerText || e.target.value;
  }
  
  setRecords(prevRecords => {
    return prevRecords.map(record => {
      if (record.id === recordId) {
        return { ...record, [field]: value };
      }
      return record;
    });
  });
};

  const handleFinancialSave = async () => {
    if (rental && user) {
      try {
        const userDocRef = doc(db, "users", user);
        const docSnap = await getDoc(userDocRef);
  
        if (docSnap.exists()) {
          const userData = docSnap.data();
  
          if (userData.rental) {
            const rentalIndex = userData.rental.findIndex(r => r.id === rentalId);
            
            if (rentalIndex !== -1) {
              userData.rental[rentalIndex] = {
                ...userData.rental[rentalIndex],
                billDeposit: depositBill,
                billElectricity: electricityBill,
                billWater: waterBill,
              };
              await updateDoc(userDocRef, { rental: userData.rental });
              
              setRental(prevRental => ({
                ...prevRental,
                billDeposit: depositBill,
                billElectricity: electricityBill,
                billWater: waterBill,
              }));
              
              console.log("All rental details updated successfully");
            }
          }
        }
      } catch (error) {
        console.error("Error updating rental:", error);
      }
    }
  }
  
  useEffect(() => {
    if (isEditing === false) {
      handleFinancialSave();
    }
  }, [isEditing]);

  useEffect(() => {
    if (user) {
      fetchRental();
    }
  }, [user, rentalId]);
  
  const fetchRental = async () => {
    try {
      const userDocRef = doc(db, "users", user);
      const docSnap = await getDoc(userDocRef);
  
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const rentalData = userData.rental?.find(r => r.id === rentalId);
        
        if (rentalData) {
          setRental(rentalData);
          setWaterBill(rentalData.billWater);
          setElectricityBill(rentalData.billElectricity);
          setDepositBill(rentalData.billDeposit);
        }
      }
    } catch (error) {
      console.error("Error fetching rental:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch records on component mount
  useEffect(() => {
    fetchRecords();
  }, []);

  // Fetch all records from Firestore
  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const userDocRef = doc(db, "users", user);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.rental) {
          const rental = userData.rental.find(r => r.id === rentalId);
          
          if (rental && rental.financialHistory) {
            setRecords(rental.financialHistory);
          } else {
            setRecords([]);
          }
        } else {
          setRecords([]);
        }
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error("Error fetching records:", error);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add new record
  const addRecord = async (e) => {
    e.preventDefault();
    try {
    const newRecord = {
        id: Date.now().toString(), 
        ...formData,
        };
    
    const userDocRef = doc(db, "users", user);
    const userDoc = await getDoc(userDocRef);


    if (userDoc.exists()) {
        const userData = userDoc.data();
        
        if (userData.rental) {
          const rentalIndex = userData.rental.findIndex(r => r.id === rentalId);
          
          if (rentalIndex !== -1) {
            if (!Array.isArray(userData.rental[rentalIndex].financialHistory)) {
              userData.rental[rentalIndex].financialHistory = [];
            }
            userData.rental[rentalIndex].financialHistory.push(newRecord);
            await updateDoc(userDocRef, {
              rental: userData.rental
            });
            setFormData({
              moveInDate: '',
              dueInDate: '',
              rentalRate: '',
              paymentDate: '',
              transactionCode: ''
            });
            setShowAddForm(false);
            fetchRecords();
          } else {
            console.error("Rental not found");
          }
        } else {
          console.error("No rentals found for this user");
        }
      } else {
        console.error("User document not found");
      }
    } catch (error) {
      console.error("Error adding record:", error);
    }
  };
  
  // Delete record
  const deleteRecord = async (id) => {
      try {
        const userDocRef = doc(db, "users", user);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          if (userData.rental) {
            const rentalIndex = userData.rental.findIndex(r => r.id === rentalId);
            if (rentalIndex !== -1 && userData.rental[rentalIndex].financialHistory) {
              if (id === "all") {
                userData.rental[rentalIndex].financialHistory = [];
              } else if (rentalIndex !== -1 && userData.rental[rentalIndex].financialHistory) {
                userData.rental[rentalIndex].financialHistory = 
                  userData.rental[rentalIndex].financialHistory.filter(record => record.id !== id);
              }
              await updateDoc(userDocRef, {
                rental: userData.rental
              });
              
              fetchRecords();
            }
          }
        }
      } catch (error) {
        console.error("Error deleting record:", error);
      }
  };

  const handleChangeInput = (e, fieldType) => {
    const input = e.target.value.replace(/,/g, '');
    const formatted = input ? Number(input).toLocaleString('en-US') : '';
    if (fieldType === 'waterBill') {
      setWaterBill(formatted);
    } else if (fieldType === 'electricityBill') {
      setElectricityBill(formatted);
    } else if (fieldType === 'depositBill') {
      setDepositBill(formatted);
    }
  };

  const handleChangeRecord = (e, fieldType, recordId) => {
    const raw = e.target.innerText.replace(/,/g, '');
    const formatted = raw ? Number(raw).toLocaleString('en-US') : '';
  
    setRecords(prevRecords => {
      return prevRecords.map(record => {
        if (record.id === recordId) {
          return { ...record, [fieldType]: formatted };
        }
        return record;
      });
    });
  };


  const sortedRecords = [...(Array.isArray(records) ? records : [])].sort((a, b) => {
    const idA = parseInt(a.id, 10);
    const idB = parseInt(b.id, 10);
    return isSort ? idB - idA : idA - idB;
    
  });

  const getFixedIconPath = (iconPath) => {
    return iconPath ? iconPath.replace(/^\./, '') : '';
  };

  const iconSign = getFixedIconPath(icons.sign);

  return (
    <>
    {showAlertDeleteHistory && (
      <Alert
        onConfirm={() => deleteRecord("all")}
        onCancel={() => setShowAlertDeleteHistory(false)}
        Header="You're about to clear history"
        Description="The data has already been imported to the Finance page, but your financial data in this rental will be deleted."          
      />
    )}
        <div className="flex flex-col w-full h-full xl:pb-5 pb-22">
          {/* Table */}
          <div className='flex md:flex-row flex-col items-center w-full my-4'>
              <div className="flex flex-col font-prompt font-semibold text-ellPrimary text-md md:text-xl justify-start w-full md:w-110 mr-auto">
                <span className='w-120 xl:ml-0 ml-4 xl:px-0 py-1 xl:text-start text-start'>ประวัติการเงิน</span>
                <div className='flex flex-row w-full'>
                  <button className="w-full bg-blue-500 px-4 py-2 rounded hover:bg-blue-600  font-prompt font-medium text-[#F7F7F7] text-sm mt-4 cursor-pointer xl:ml-0 ml-4 xl:mr-0 mr-2" onClick={addRecord}>
                    Add Record
                  </button>
                  <button className="xl:mr-0 md:mr-4 mr-4 w-full bg-ellRed px-4 py-2 rounded hover:bg-red-700 font-prompt font-medium text-[#F7F7F7] text-sm mt-4 cursor-pointer xl:ml-4 md:ml-2 ml-2"
                   onClick={() => setShowAlertDeleteHistory(true)}>
                    Clear History
                  </button>
                </div>
              </div>          
            {/* Controls */}
              <table className="w-110 md:mt-0 mt-4">
              <thead>
                <tr>
                  <th className="w-md py-2 font-prompt text-center bg-ellWhite border-2 border-ellGray text-md text-ellPrimary tracking-wider">ค่าน้ำ</th>
                  <th className="w-md py-2 font-prompt text-center bg-ellWhite border-2 border-ellGray text-md text-ellPrimary tracking-wider">ค่าไฟ</th>
                  <th className="w-md py-2 font-prompt text-center bg-ellWhite border-2 border-ellGray text-md text-ellPrimary tracking-wider">ค่ามัดจำ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {isEditing ? (
                <tr>
                  <td className="w-md py-2 whitespace-nowrap bg-ellWhite border-2 border-ellGray text-ellPrimary">
                  <input
                    type="text"
                    placeholder="0"
                    maxLength={6}
                    value={waterBill}
                    onChange={(e) => handleChangeInput(e, 'waterBill')}
                    className="focus:outline-none whitespace-nowrap font-prompt text-center w-full"
                  />
                  </td>
                  <td className="w-md py-2 whitespace-nowrap bg-ellWhite border-2 border-ellGray text-ellPrimary">
                  <input
                    type="text"
                    placeholder="0"
                    maxLength={6}
                    value={electricityBill}
                    onChange={(e) => handleChangeInput(e, 'electricityBill')}
                    className="focus:outline-none whitespace-nowrap font-prompt text-center w-full"
                  />
                  </td>
                  <td className="w-md py-2 whitespace-nowrap bg-ellWhite border-2 border-ellGray text-ellPrimary">
                  <input
                    type="text"
                    placeholder="0"
                    maxLength={6}
                    value={depositBill}
                    onChange={(e) => handleChangeInput(e, 'depositBill')}
                    className="focus:outline-none whitespace-nowrap font-prompt text-center w-full"
                  />
                  </td>
                </tr>
              ):(

                <tr>
                  <td className="w-md py-2 whitespace-nowrap font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary">{waterBill.trim() === "" ? "-" : waterBill}</td>
                  <td className="w-md py-2 whitespace-nowrap font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary">{electricityBill.trim() === "" ? "-" : electricityBill}</td>
                  <td className="w-md py-2 whitespace-nowrap font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary">{depositBill.trim() === "" ? "-" : depositBill}</td>
                </tr>
              )}
              </tbody>
            </table>
            </div>
        {/* Desktop/Tablet View (Headers on Top) - Hidden on Mobile */}
        <div className="hidden sm:block">
          <table className="w-full">
            <thead className="bg-ellPrimary">
              <tr>
                <th className="w-9 py-3 font-prompt hover:bg-ellBlack text-center bg-ellWhite border-2 border-ellGray md:text-sm text-xs text-ellPrimary uppercase tracking-wider cursor-pointer"
                    onClick={() => setIsSort(prev => !prev)}>
                  <div className="flex flex-row justify-center" >
                    <img src={iconSign} width="18" height="40" alt="sign" className={`${isSort ? "rotate-0" : "rotate-180 mr-2"} md:block hidden`}/>
                    No.
                  </div>
                </th>
                <th className="w-20 py-3 font-prompt text-center bg-ellWhite border-2 border-ellGray text-md text-ellPrimary uppercase tracking-wider cursor-default">วันที่เริ่มอยู่</th>
                <th className="w-20 py-3 font-prompt text-center bg-ellWhite border-2 border-ellGray text-md text-ellPrimary uppercase tracking-wider cursor-default">วันครบกำหนด</th>
                <th className="w-20 py-3 font-prompt text-center bg-ellWhite border-2 border-ellGray text-md text-ellPrimary uppercase tracking-wider cursor-default">อัตราค่าเช่า</th>
                <th className="w-20 py-3 font-prompt text-center bg-ellWhite border-2 border-ellGray text-md text-ellPrimary uppercase tracking-wider cursor-default">วันชำระ</th>
                <th className="w-20 py-3 font-prompt text-center bg-ellWhite border-2 border-ellGray text-md text-ellPrimary uppercase tracking-wider cursor-default">รหัสรายการ</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-ellPrimary border-2 border-ellGray">Loading...</td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-ellPrimary border-2 border-ellGray">No records found</td>
                </tr>
              ) : (
                sortedRecords.map((record, index) => {
                  const displayIndex = isSort ? sortedRecords.length - index : index + 1;
                  
                  return isEditing ? (
                    <tr key={record.id} className="relative">
                      <td className="w-fit py-4 font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary">
                        {displayIndex}
                      </td>
                      <td className="font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary relative">
                        <input
                          type="date"
                          name="moveInDate"
                          value={record.moveInDate ? formatDateForInput(record.moveInDate) : ''}
                          onChange={(e) => handleRecordFieldChange(e, 'moveInDate', record.id)}
                          className="w-full h-full px-4 text-ellPrimary focus:outline-none cursor-text"
                        />
                      </td>
                      <td className="font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary relative">
                        <input
                          type="date"
                          name="dueInDate"
                          value={record.dueInDate ? formatDateForInput(record.dueInDate) : ''}
                          onChange={(e) => handleRecordFieldChange(e, 'dueInDate', record.id)}
                          className="w-full h-full px-4 text-ellPrimary focus:outline-none cursor-text"
                        />
                      </td>
                      <td 
                        className="py-4 w-fit font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary"
                        contentEditable="true"
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleChangeRecord(e, 'rentalRate', record.id)}
                      >
                        {record.rentalRate}
                      </td>
                      <td className="font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary relative">
                        <input
                          type="date"
                          name="paymentDate"
                          value={record.paymentDate}
                          onChange={(e) => handleRecordFieldChange(e, 'paymentDate', record.id)}
                          className="w-full h-full px-4 text-ellPrimary focus:outline-none cursor-text"
                        />
                      </td>
                      <td 
                        className="py-4 w-fit font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary"
                        contentEditable="true"
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleRecordFieldChange(e, 'transactionCode', record.id)}
                      >
                        {record.transactionCode}
                      </td>
                      <td className="w-0 p-0 m-0 relative">
                        <div className="absolute right-[-80px] top-1/2 -translate-y-1/2 bg-ellWhite text-ellRed px-3 py-1 rounded-full cursor-pointer hover:bg-ellBlack"
                            onClick={() => deleteRecord(record.id)}>
                          Delete
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={record.id}>
                      <td className="py-4 w-fit font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary overflow-hidden whitespace-nowrap text-ellipsis">
                        {displayIndex}
                      </td>
                      <td className="py-4 w-fit font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary overflow-hidden whitespace-nowrap text-ellipsis">
                        {record.moveInDate.trim() === "" ? "-" : record.moveInDate}
                      </td>
                      <td className="py-4 w-fit font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary overflow-hidden whitespace-nowrap text-ellipsis">
                        {record.dueInDate.trim() === "" ? "-" : record.dueInDate}
                      </td>
                      <td className="py-4 w-fit font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary overflow-hidden whitespace-nowrap text-ellipsis">
                        {record.rentalRate.trim() === "" ? "-" : record.rentalRate}
                      </td>
                      <td className="py-4 w-fit font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary overflow-hidden whitespace-nowrap text-ellipsis">
                        {record.paymentDate.trim() === "" ? "-" : record.paymentDate}
                      </td>
                      <td className="py-4 w-fit font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary overflow-hidden whitespace-nowrap text-ellipsis">
                        {record.transactionCode.trim() === "" ? "-" : record.transactionCode}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View (Headers on Left) - Shown Only on Mobile */}
        <div className="sm:hidden">
          {isLoading ? (
            <div className="px-6 py-4 text-center text-ellPrimary border-2 border-ellGray">Loading...</div>
          ) : records.length === 0 ? (
            <div className="px-6 py-4 text-center text-ellPrimary border-2 border-ellGray">No records found</div>
          ) : (
            sortedRecords.map((record, index) => {
              const displayIndex = isSort ? sortedRecords.length - index : index + 1;
              
              return (
                <div key={record.id} className="mb-6 border-2 border-ellGray rounded">
                  <div className="bg-ellWhite border-b-2 border-ellGray p-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="font-prompt text-ellPrimary uppercase mr-2 font-bold">No. {displayIndex}</span>
                    </div>
                    {isEditing && (
                      <div 
                        className="bg-ellWhite text-ellRed px-3 py-1 rounded-full cursor-pointer hover:bg-ellBlack"
                        onClick={() => deleteRecord(record.id)}
                      >
                        Delete
                      </div>
                    )}
                  </div>
                  
                  <table className="w-full">
                    <tbody>
                      {/* Move-in Date */}
                      <tr>
                        <th className="w-40 py-3 font-prompt text-left px-4 bg-ellWhite border-b-2 border-ellGray md:text-md text-xs text-ellPrimary uppercase tracking-wider">
                          วันที่เริ่มอยู่
                        </th>
                        {isEditing ? (
                          <td className="font-prompt bg-ellWhite border-b-2 border-ellGray text-ellPrimary relative p-2">
                            <input
                              type="date"
                              name="moveInDate"
                              value={record.moveInDate}
                              onChange={(e) => handleRecordFieldChange(e, 'moveInDate', record.id)}
                              className="w-full px-2 text-ellPrimary focus:outline-none cursor-text"
                            />
                          </td>
                        ) : (
                          <td className="py-3 px-4 font-prompt bg-ellWhite border-b-2 border-ellGray text-ellPrimary overflow-hidden whitespace-nowrap text-ellipsis">
                            {record.moveInDate.trim() === "" ? "-" : record.moveInDate}
                          </td>
                        )}
                      </tr>
                      
                      {/* Due Date */}
                      <tr>
                        <th className="w-40 py-3 font-prompt text-left px-4 bg-ellWhite border-b-2 border-ellGray md:text-md text-xs text-ellPrimary uppercase tracking-wider">
                          วันครบกำหนด
                        </th>
                        {isEditing ? (
                          <td className="font-prompt bg-ellWhite border-b-2 border-ellGray text-ellPrimary relative p-2">
                            <input
                              type="date"
                              name="dueInDate"
                              value={record.dueInDate}
                              onChange={(e) => handleRecordFieldChange(e, 'dueInDate', record.id)}
                              className="w-full px-2 text-ellPrimary focus:outline-none cursor-text"
                            />
                          </td>
                        ) : (
                          <td className="py-3 px-4 font-prompt bg-ellWhite border-b-2 border-ellGray text-ellPrimary overflow-hidden whitespace-nowrap text-ellipsis">
                            {record.dueInDate.trim() === "" ? "-" : record.dueInDate}
                          </td>
                        )}
                      </tr>
                      
                      {/* Rental Rate */}
                      <tr>
                        <th className="w-40 py-3 font-prompt text-left px-4 bg-ellWhite border-b-2 border-ellGray md:text-md text-xs text-ellPrimary uppercase tracking-wider">
                          อัตราค่าเช่า
                        </th>
                        {isEditing ? (
                          <td 
                            className="py-3 px-4 font-prompt bg-ellWhite border-b-2 border-ellGray text-ellPrimary"
                            contentEditable="true"
                            suppressContentEditableWarning={true}
                            onBlur={(e) => handleChangeRecord(e, 'rentalRate', record.id)}
                          >
                            {record.rentalRate}
                          </td>
                        ) : (
                          <td className="py-3 px-4 font-prompt bg-ellWhite border-b-2 border-ellGray text-ellPrimary overflow-hidden whitespace-nowrap text-ellipsis">
                            {record.rentalRate.trim() === "" ? "-" : record.rentalRate}
                          </td>
                        )}
                      </tr>
                      
                      {/* Payment Date */}
                      <tr>
                        <th className="w-40 py-3 font-prompt text-left px-4 bg-ellWhite border-b-2 border-ellGray md:text-md text-xs text-ellPrimary uppercase tracking-wider">
                          วันชำระ
                        </th>
                        {isEditing ? (
                          <td className="font-prompt bg-ellWhite border-b-2 border-ellGray text-ellPrimary relative p-2">
                            <input
                              type="date"
                              name="paymentDate"
                              value={record.paymentDate}
                              onChange={(e) => handleRecordFieldChange(e, 'paymentDate', record.id)}
                              className="w-full px-2 text-ellPrimary focus:outline-none cursor-text"
                            />
                          </td>
                        ) : (
                          <td className="py-3 px-4 font-prompt bg-ellWhite border-b-2 border-ellGray text-ellPrimary overflow-hidden whitespace-nowrap text-ellipsis">
                            {record.paymentDate.trim() === "" ? "-" : record.paymentDate}
                          </td>
                        )}
                      </tr>
                      
                      {/* Transaction Code */}
                      <tr>
                        <th className="w-40 py-3 font-prompt text-left px-4 bg-ellWhite border-ellGray md:text-md text-xs text-ellPrimary uppercase tracking-wider">
                          รหัสรายการ
                        </th>
                        {isEditing ? (
                          <td 
                            className="py-3 px-4 font-prompt bg-ellWhite border-ellGray text-ellPrimary"
                            contentEditable="true"
                            suppressContentEditableWarning={true}
                            onBlur={(e) => handleRecordFieldChange(e, 'transactionCode', record.id)}
                          >
                            {record.transactionCode}
                          </td>
                        ) : (
                          <td className="py-3 px-4 font-prompt bg-ellWhite border-ellGray text-ellPrimary overflow-hidden whitespace-nowrap text-ellipsis">
                            {record.transactionCode.trim() === "" ? "-" : record.transactionCode}
                          </td>
                        )}
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })
          )}
        </div>
        </div>
    </>
  );
};

export default FinancialHistory;