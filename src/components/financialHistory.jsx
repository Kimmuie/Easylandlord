import React, { useState, useEffect, useContext, useRef } from 'react';
import ThemeContext from '../contexts/ThemeContext';
import { useParams, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import { db } from '../components/firebase';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext'; 
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { Thai } from "flatpickr/dist/l10n/th.js";
import {formatToThaiBuddhist, formatForStorage, formatIsoToThaiBuddhist, flatpickrThaiBuddhistFormatter} from "../components/dateUtils"

const FinancialHistory = ({ isEditing, setDeleteAll, savePrevious }) => {
  const [editingStates, setEditingStates] = useState({});
  const contentEditableRefs = useRef({});
  const [customOrder, setCustomOrder] = useState([]);
  const [manuallyReordered, setManuallyReordered] = useState(false);
  const [orderedRecords, setOrderedRecords] = useState([]);
  const { currentUser } = useAuth();
  const { theme, icons } = useContext(ThemeContext);
  const { rentalId } = useParams();
  const [showAlertDeleteHistory, setShowAlertDeleteHistory] = useState(false);
  const [showAlertDeleteHistorySpecificTenant, setShowAlertDeleteHistorySpecificTenant] = useState(false);
  const [rental, setRental] = useState(null);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSort, setIsSort] = useState(false);
  const [rentalName, setRentalName] = useState('');
  const [depositBill, setDepositBill] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  const [touchDraggingIndex, setTouchDraggingIndex] = useState(null);
  const [showTagBox, setShowTagBox] = useState(false);  
  const [tagOptions, setTagOptions] = useState(['ผู้เช่าปัจจุบัน']);
  const filterTagBoxRef = useRef(null);
  const [selectedTag, setSelectedTag] = useState('ผู้เช่าปัจจุบัน');
  const [formData, setFormData] = useState({
    moveInDate: '',
    dueInDate: '',
    rentalRate: '',
    paymentDate: '',
    transactionCode: '',
    rentalNote: ''
  });

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterTagBoxRef.current && !filterTagBoxRef.current.contains(event.target)) {
        setShowTagBox(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTagSelect = async (value, type) => {
    try {
      setIsLoading(true);
      const userDocRef = doc(db, "users", currentUser.email);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.rental) {
          const rental = userData.rental.find(r => r.id === rentalId);
          if (type === 'tag') {
            setSelectedTag(value);
            setShowTagBox(false);
            
            if (value === "ผู้เช่าปัจจุบัน") {
              setRecords(rental.financialHistory);
            } else {
              // Use bracket notation to access the property with the variable value
              setRecords(rental.previousFinance[value] || []);
            }
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
  }

  // Improved preserve editing state function
  const preserveEditingState = () => {
    const currentStates = {};
    Object.keys(contentEditableRefs.current).forEach(key => {
      const element = contentEditableRefs.current[key];
      if (element) {
        // Always preserve the current content, whether it's focused or not
        currentStates[key] = {
          content: element.innerText || element.textContent || '',
          isFocused: document.activeElement === element,
          selection: null
        };
        
        // If the element is focused, also preserve cursor position
        if (document.activeElement === element) {
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            currentStates[key].selection = {
              start: range.startOffset,
              end: range.endOffset
            };
          }
        }
      }
    });
    setEditingStates(currentStates);
    return currentStates;
  };

  // Improved restore editing state function
  const restoreEditingState = (states = null) => {
    const statesToRestore = states || editingStates;
    
    // Use multiple timeouts to ensure DOM is fully updated
    setTimeout(() => {
      Object.keys(statesToRestore).forEach(key => {
        const element = contentEditableRefs.current[key];
        const state = statesToRestore[key];
        
        if (element && state) {
          // Restore content
          element.innerText = state.content;
          
          // Restore focus and cursor position if it was focused
          if (state.isFocused) {
            element.focus();
            
            if (state.selection && element.firstChild) {
              try {
                const range = document.createRange();
                const selection = window.getSelection();
                const textNode = element.firstChild;
                const maxLength = textNode.textContent.length;
                
                range.setStart(textNode, Math.min(state.selection.start, maxLength));
                range.setEnd(textNode, Math.min(state.selection.end, maxLength));
                
                selection.removeAllRanges();
                selection.addRange(range);
              } catch (error) {
                console.warn('Could not restore cursor position:', error);
              }
            }
          }
        }
      });
      
      // Clear the editing states after restoration
      setEditingStates({});
    }, 50);
  };

  useEffect(() => {
    if (Array.isArray(records)) {
      let sortedRecs;
      
      if (customOrder.length > 0 && manuallyReordered) {
        sortedRecs = [...records].sort((a, b) => {
          const indexA = customOrder.indexOf(a.id);
          const indexB = customOrder.indexOf(b.id);
          
          if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
          }
          
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          
          const idA = parseInt(a.id, 10);
          const idB = parseInt(b.id, 10);
          return isSort ? idB - idA : idA - idB;
        });
      } else {
        sortedRecs = [...records].sort((a, b) => {
          const idA = parseInt(a.id, 10);
          const idB = parseInt(b.id, 10);
          return isSort ? idB - idA : idA - idB;
        });
      }
      
      setOrderedRecords(sortedRecs);
    }
  }, [records, isSort, manuallyReordered, customOrder]);

  const moveItemUp = (index) => {
    if (index === 0) return;
    
    const items = [...records];
    const temp = items[index];
    items[index] = items[index - 1];
    items[index - 1] = temp;
    
    setRecords(items);
  };

  // Move item down (for mobile/button interface)
  const moveItemDown = (index) => {
    if (index === records.length - 1) return;
    
    const items = [...records];
    const temp = items[index];
    items[index] = items[index + 1];
    items[index + 1] = temp;
    
    setRecords(items);
  };

  // Function to save custom order to Firebase
  const saveCustomOrderToFirebase = async (orderArray) => {
    if (!currentUser) return;
    
    try {
      const userDocRef = doc(db, "users", currentUser.email);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        
        // Save the custom order array
        // You might want to store this under a specific rental property
        await updateDoc(userDocRef, {
          [`customOrders.${rentalName}`]: orderArray
          // Or store it in whatever structure makes sense for your app
        });
        
        console.log("Custom order saved successfully");
      }
    } catch (error) {
      console.error("Error saving custom order:", error);
    }
  };

// Desktop drag handlers
const handleDragStart = (e, index) => {
  setDraggedIndex(index);
  e.dataTransfer.effectAllowed = 'move';
  e.currentTarget.style.opacity = '0.5';
};

const handleDragEnd = (e) => {
  e.currentTarget.style.opacity = '1';
  setDraggedIndex(null);
  setTouchStartY(null);
  setTouchDraggingIndex(null);
};

const handleDragOver = (e, index) => {
  // e.preventDefault();
  if (draggedIndex === null || draggedIndex === index) return;

  const items = [...records];
  const draggedItem = items[draggedIndex];
  items.splice(draggedIndex, 1);
  items.splice(index, 0, draggedItem);

  setRecords(items);
  setDraggedIndex(index);
};

const handleDragEnter = (e) => {
  e.preventDefault();
};

    // ✅ Touch equivalents (for iPad)
  const handleTouchStart = (e, index) => {
    setTouchStartY(e.touches[0].clientY);
    setTouchDraggingIndex(index);
    setDraggedIndex(index);
    e.currentTarget.style.opacity = '0.5';
  };

  const ROW_HEIGHT = 50;
  const DEAD_ZONE = 20; 

  const handleTouchMove = (e, originalIndex) => {
    if (touchStartY === null || touchDraggingIndex === null) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY; // Total distance moved from start

    if (Math.abs(deltaY) < DEAD_ZONE) {
        return;
    }
    const rowsMoved = Math.round(deltaY / ROW_HEIGHT); 
    let newTargetIndex = originalIndex + rowsMoved; 
    
    const clampedIndex = Math.max(0, Math.min(records.length - 1, newTargetIndex));

    if (clampedIndex !== touchDraggingIndex) {
      handleDragOver(e, clampedIndex);
      const newTouchY = touchStartY + (clampedIndex - originalIndex) * ROW_HEIGHT;
      setTouchStartY(newTouchY);
    }
  };

  const handleTouchEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    handleDragEnd(e);
  };


  // Function to load custom order when component mounts
  const loadCustomOrder = async () => {
    if (!currentUser) return;
    
    try {
      const userDocRef = doc(db, "users", currentUser.email);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const savedOrder = userData.customOrders?.[rentalName];
        
        if (savedOrder && Array.isArray(savedOrder)) {
          setCustomOrder(savedOrder);
          setManuallyReordered(true);
        }
      }
    } catch (error) {
      console.error("Error loading custom order:", error);
    }
  };

  // Call loadCustomOrder when component mounts
  useEffect(() => {
    loadCustomOrder();
  }, [currentUser, rentalName]);

  const handleRecordFieldChange = (date, field, recordId) => {
    let value = '';
    
    if (date instanceof Date) {
      value = formatForStorage(date);
    } else if (typeof date === 'string') {
      value = date;
    }

    setRecords(prevRecords =>
      prevRecords.map(record =>
        record.id === recordId ? { ...record, [field]: value } : record
      )
    );
  };

  const saveToPreviousFinance = async () => {
    console.log("asdasdsadsad");
  if (!currentUser || !rentalId) {
    console.log("Missing user or rental ID");
    return;
  }
  
  try {
    const userDocRef = doc(db, "users", currentUser.email);
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
      const userData = docSnap.data();
      
      if (userData.rental) {
        const rentalIndex = userData.rental.findIndex(r => r.id === rentalId);
        
        if (rentalIndex !== -1) {
          const currentRental = userData.rental[rentalIndex];
          const financialHistory = currentRental.financialHistory || [];
          
          if (financialHistory.length === 0) {
            console.log("No financial history to save");
            return { success: false };
          }

          // Get the tenant name from the current rental
          const tenantName = currentRental.tenantName || "Unknown Tenant";

          console.log("Current rental before update:", currentRental);

          // Get existing previousFinance for this rental (if any)
          const existingPreviousFinance = currentRental.previousFinance || {};
          
          // Get existing records for this tenant (if any)
          const existingTenantRecords = existingPreviousFinance[tenantName] || [];
          
          // Merge with existing records for this tenant
          const updatedTenantRecords = [...existingTenantRecords, ...financialHistory];
          
          // Update the previousFinance structure
          const updatedPreviousFinance = {
            ...existingPreviousFinance,
            [tenantName]: updatedTenantRecords
          };

          console.log("Updated previousFinance object:", updatedPreviousFinance);

          // Update the rental with previousFinance (same pattern as handleFinancialSave)
          userData.rental[rentalIndex] = {
            ...userData.rental[rentalIndex],
            previousFinance: updatedPreviousFinance
          };

          console.log("Rental after update:", userData.rental[rentalIndex]);
          console.log("Full rental array being sent:", userData.rental);

          // Save to Firestore
          await updateDoc(userDocRef, { rental: userData.rental });
          
          console.log("✓ UpdateDoc completed");

          // Verify immediately after
          const verifySnap = await getDoc(userDocRef);
          const verifyData = verifySnap.data();
          console.log("Verified rental from Firestore:", verifyData.rental[rentalIndex]);
          console.log("Verified previousFinance:", verifyData.rental[rentalIndex]?.previousFinance);
          
          console.log(`Saved ${financialHistory.length} records to previous finance for tenant: ${tenantName}`);
          
          return { success: true, recordsSaved: financialHistory.length };
        } else {
          console.log("Rental not found for ID:", rentalId);
          return { success: false };
        }
      } else {
        console.log("No rentals found");
        return { success: false };
      }
    } else {
      console.log("User document doesn't exist");
      return { success: false };
    }
  } catch (error) {
    console.error("Error saving to previous finance:", error);
    console.error("Full error:", error);
    return { success: false, error: error.message };
  }
};


  useEffect(() => {
    if (savePrevious === true) {
      console.log("Running saveToPreviousFinance"); // Debug log
      saveToPreviousFinance();
    }
  }, [savePrevious]);

  const handleFinancialSave = async () => {
    if (rental && currentUser) {
      try {
        const userDocRef = doc(db, "users", currentUser.email);
        const docSnap = await getDoc(userDocRef);
  
        if (docSnap.exists()) {
          const userData = docSnap.data();
  
          if (userData.rental) {
            const rentalIndex = userData.rental.findIndex(r => r.id === rentalId);
            
            if (rentalIndex !== -1) {
              userData.rental[rentalIndex] = {
                ...userData.rental[rentalIndex],
                billDeposit: depositBill,
                financialHistory: records
              };
              await updateDoc(userDocRef, { rental: userData.rental });
              
              setRental(prevRental => ({
                ...prevRental,
                billDeposit: depositBill,
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
              if (currentRental) {
                setRentalName(currentRental.name);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching rental details:", error);
        }
      };
  
      fetchRentalDetail();
    }, [rentalId]);

const handleFinance = async () => {
  if (!currentUser || records.length === 0) return;
  
  try {
    const userDocRef = doc(db, "users", currentUser.email);
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
      const userData = docSnap.data();
      const financeData = userData.finance || {};
      const existingRecords = financeData.allRecords || [];
      
      const validRecords = records.filter(record => {
        return record && (
          (record.rentalRate && record.rentalRate.toString().trim() !== "") ||
          (record.paymentDate && record.paymentDate.toString().trim() !== "") 
        );
      });

      console.log("Filtered valid records:", validRecords);

      if (validRecords.length === 0) {
        console.log("No valid records to add (all records are empty)");
        return;
      }

      // Map valid records to finance format
      const mappedRecords = validRecords.map(record => ({
        id: record.id,
        paymentDate: record.paymentDate || "",
        income: record.income || record.rentalRate || "",
        outcome: record.outcome || "",
        note: record.rentalNote || "",
        list: record.transactionCode || "",
        rental: record.rental || rentalName || "",
        edited: false,
      }));

      const updatedExistingRecords = existingRecords.map(existingRecord => {
        const matchingNewRecord = mappedRecords.find(newRecord => 
          newRecord.id === existingRecord.id
        );
        if (existingRecord.edited === true) {
            return existingRecord;
          }
        if (matchingNewRecord) {
          return {
            ...existingRecord,
            ...matchingNewRecord, 
            list: matchingNewRecord.list || existingRecord.list || "",
            edited: existingRecord.edited || matchingNewRecord.edited || false
          };
        }
        
        return existingRecord;
      });
      
      const newRecords = mappedRecords.filter(newRecord => 
        !existingRecords.some(existingRecord => existingRecord.id === newRecord.id)
      );

      const finalRecords = [...updatedExistingRecords, ...newRecords];
      await updateDoc(userDocRef, {
        finance: {
          ...financeData,
          allRecords: finalRecords,
        }
      });
      
      console.log(`Finance data updated successfully. Updated: ${mappedRecords.length - newRecords.length}, Added: ${newRecords.length}`);
      
    } else {
      console.log("User document doesn't exist");
    }
  } catch (error) {
    console.error("Error updating finance data:", error);
  }
};
  

  useEffect(() => {
    handleTagSelect("ผู้เช่าปัจจุบัน", 'tag')
    if (isEditing === false) {
      handleFinancialSave();
      handleFinance();
      setTimeout(() => fetchRecords(), 200);;
    }
  }, [isEditing]);

  useEffect(() => {
    if (currentUser) {
      fetchRental();
    }
  }, [currentUser, rentalId]);
  
  const fetchRental = async () => {
    try {
      const userDocRef = doc(db, "users", currentUser.email);
      const docSnap = await getDoc(userDocRef);
  
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const rentalData = userData.rental?.find(r => r.id === rentalId);
        
        if (rentalData) {
          setRental(rentalData);
          setDepositBill(rentalData.billDeposit);
          const dynamicTags = ['ผู้เช่าปัจจุบัน'];

          if (rentalData.previousFinance) {
            const tenantNames = Object.keys(rentalData.previousFinance);
            dynamicTags.push(...tenantNames);
          }

          setTagOptions(dynamicTags);

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
      const userDocRef = doc(db, "users", currentUser.email);
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

  // FIXED: Add new record with proper state preservation
  const addRecord = async (e) => {
    e.preventDefault();
    
    // Preserve editing states before making changes
    const currentStates = preserveEditingState();
    
    try {
      const newRecord = {
        id: Date.now().toString(), 
        ...formData,
      };
      
      const userDocRef = doc(db, "users", currentUser.email);
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
              transactionCode: '',
              rentalNote: ''
            });
            setShowAddForm(false);
            
            // Update local state immediately to avoid refetch
            setRecords(prevRecords => [...prevRecords, newRecord]);
            
            // Restore editing state after the update
            restoreEditingState(currentStates);
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
  
  useEffect(() => {
    deleteRecord(setDeleteAll);
  }, [setDeleteAll]);

  // Delete record
  const deleteRecord = async (id) => {
    // Preserve editing states before deletion
    const currentStates = preserveEditingState();
    
    try {
      const userDocRef = doc(db, "users", currentUser.email);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        if (userData.rental) {
          const rentalIndex = userData.rental.findIndex(r => r.id === rentalId);
          if (rentalIndex !== -1 && userData.rental[rentalIndex].financialHistory) {
            if (id === "all") {
              // Handle deleting all records
              userData.rental[rentalIndex].financialHistory = [];

              setDepositBill("");
              if (rentalIndex !== -1) {
                userData.rental[rentalIndex] = {
                  ...userData.rental[rentalIndex],
                  billDeposit: "",
                };
                
                // Delete all non-edited finance records for this rental
                const financeData = userData.finance || {};
                const existingRecords = financeData.allRecords || [];
                
                const updatedFinanceRecords = existingRecords.filter(financeRecord => {
                  // Keep the record if it's edited OR if it doesn't belong to this rental
                  return financeRecord.edited === true || financeRecord.rental !== rentalName;
                });
                
                await updateDoc(userDocRef, { 
                  rental: userData.rental,
                  finance: {
                    ...financeData,
                    allRecords: updatedFinanceRecords,
                  }
                });
                
                setRental(prevRental => ({
                  ...prevRental,
                  billDeposit: "",
                }));
                
                // Update local state immediately
                setRecords([]);
                
                console.log("All rental details deleted successfully, and non-edited finance records removed");
              }
            } else {
              // Handle deleting single record
              if (rentalIndex !== -1 && userData.rental[rentalIndex].financialHistory) {
                if (Array.isArray(userData.rental[rentalIndex].financialHistory)) {
                  userData.rental[rentalIndex].financialHistory = userData.rental[rentalIndex].financialHistory.filter(
                    record => record.id !== id
                  );
                } else {
                  console.warn("financialHistory is not an array:", userData.rental[rentalIndex].financialHistory);
                }
                
                // Also delete from finance if edited is false
                const financeData = userData.finance || {};
                const existingRecords = financeData.allRecords || [];
                
                const updatedFinanceRecords = existingRecords.filter(financeRecord => {
                  // Remove the record if it matches the ID AND is not edited
                  if (financeRecord.id === id && financeRecord.edited === false) {
                    return false; // Remove this record
                  }
                  return true; // Keep this record
                });
                
                await updateDoc(userDocRef, {
                  rental: userData.rental,
                  finance: {
                    ...financeData,
                    allRecords: updatedFinanceRecords,
                  }
                });
                
                // Update local state immediately
                setRecords(prevRecords => prevRecords.filter(record => record.id !== id));
                
                console.log(`Record ${id} deleted from rental and finance (if not edited)`);
              }
            }
            
            setShowAlertDeleteHistory(false);
            
            // Restore editing state after deletion (for remaining records)
            if (id !== "all") {
              restoreEditingState(currentStates);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  const deletePreviousFinanceRecord = async (transactionCode, recordId) => {
  try {
    const userDocRef = doc(db, "users", currentUser.email);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      if (userData.rental) {
        const rentalIndex = userData.rental.findIndex(r => r.id === rentalId);
        
        if (rentalIndex !== -1 && userData.rental[rentalIndex].previousFinance) {
          const previousFinance = userData.rental[rentalIndex].previousFinance;
          
          if (recordId === "all") {
            // Delete the entire tenant (transaction code) completely
            if (previousFinance[transactionCode]) {
              delete userData.rental[rentalIndex].previousFinance[transactionCode];
              
              await updateDoc(userDocRef, {
                rental: userData.rental
              });
              
              // Update local state
              setRecords([]);
              setSelectedTag("ผู้เช่าปัจจุบัน"); // Reset to current tenant
              
              console.log(`Tenant ${transactionCode} deleted completely from previousFinance`);
            }
          } else {
            // Delete single record from specific transaction code
            if (previousFinance[transactionCode] && Array.isArray(previousFinance[transactionCode])) {
              userData.rental[rentalIndex].previousFinance[transactionCode] = 
                previousFinance[transactionCode].filter(record => record.id !== recordId);
              
              // Remove the tenant key if array becomes empty after deletion
              if (userData.rental[rentalIndex].previousFinance[transactionCode].length === 0) {
                delete userData.rental[rentalIndex].previousFinance[transactionCode];
                // Reset to current tenant since this tenant no longer exists
                setSelectedTag("ผู้เช่าปัจจุบัน");
              }
              
              await updateDoc(userDocRef, {
                rental: userData.rental
              });
              
              // Update local state
              setRecords(prevRecords => prevRecords.filter(record => record.id !== recordId));
              
              console.log(`Record ${recordId} deleted from ${transactionCode}`);
            }
          }
          
        }
      }
    }
  } catch (error) {
    console.error("Error deleting previous finance record:", error);
  }
  setShowAlertDeleteHistorySpecificTenant(false);
  handleTagSelect("ผู้เช่าปัจจุบัน", 'tag')
  fetchRental();
};

  const handleChangeInput = (e, fieldType) => {
    const input = e.target.value.replace(/,/g, '');
    const formatted = input ? Number(input).toLocaleString('en-US') : '';
    if (fieldType === 'depositBill') {
      setDepositBill(formatted);
    }
  };

  const handleChangeRecord = (e, fieldType, recordId) => {
    let value;
    
    if (fieldType === "rentalRate") {
      const raw = e.target.innerText.replace(/,/g, '');
      value = raw ? Number(raw).toLocaleString('en-US') : '';
    } else {
      value = e.target.innerText.trim();
    }

    setRecords(prevRecords => {
      return prevRecords.map(record => {
        if (record.id === recordId) {
          return { ...record, [fieldType]: value };
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
    {showAlertDeleteHistorySpecificTenant && (
      <Alert
        onConfirm={() => deletePreviousFinanceRecord(selectedTag, "all")}
        onCancel={() => setShowAlertDeleteHistorySpecificTenant(false)}
        Header="You're about to remove this tenant's history"
        Description="The data will be permanently deleted and cannot be recovered, please confirm you wish to continue this action."          
      />
    )}
    <div className="flex flex-col w-full h-full xl:pb-5 pb-22">
      {/* Table */}
      <div className='flex md:flex-row flex-col items-center w-full my-4'>
        <div className={`flex font-prompt font-semibold text-ellPrimary text-md md:text-xl justify-start w-full md:w-110 mr-auto ${isEditing ? "flex-col" : "flex-row"}`}>
          <span className='xl:ml-0 ml-4 xl:px-0 py-1 xl:text-start text-start'>ประวัติการเงิน</span>

          {isEditing ? (
            <div className='flex flex-row w-full'>
              <button className="w-full bg-blue-500 px-4 py-2 rounded hover:bg-blue-600  font-prompt font-medium text-[#F7F7F7] text-sm mt-4 cursor-pointer xl:ml-0 ml-4 xl:mr-0 mr-2" onClick={addRecord}>
                Add Record
              </button>
              <button className="xl:mr-0 md:mr-4 mr-4 w-full bg-ellRed px-4 py-2 rounded hover:bg-red-700 font-prompt font-medium text-[#F7F7F7] text-sm mt-4 cursor-pointer xl:ml-4 md:ml-2 ml-2"
               onClick={() => setShowAlertDeleteHistory(true)}>
                Clear History
              </button>
            </div>
          ):(
            <>
          <div className="relative flex justify-center w-50">
            <button className={`flex justify-center rounded-sm px-1 font-prompt text-ellSecondary text-md md:text-lg bg-ellBlack h-8 cursor-pointer ${showTagBox && "pointer-events-none"}`}
              onClick={() => setShowTagBox(prev => !prev)}>
              {selectedTag}
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
          </>
          )}
          
        </div>    
          {selectedTag != "ผู้เช่าปัจจุบัน" &&          
            <button className="w-xs h-8 bg-ellRed rounded-sm  hover:bg-red-700 font-prompt font-medium text-[#F7F7F7] text-sm cursor-pointer mt-4 sm:mt-0 "
              onClick={() => setShowAlertDeleteHistorySpecificTenant(true)}>
              Clear History of this Tenant
            </button>
          }      
        {/* Controls */}
          {selectedTag == "ผู้เช่าปัจจุบัน" &&
        <table className="md:w-37.5 w-full md:mt-0 mt-4 ">
          <thead>
            <tr>
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
                    maxLength={7}
                    value={depositBill}
                    onChange={(e) => handleChangeInput(e, 'depositBill')}
                    className="focus:outline-none whitespace-nowrap font-prompt text-center w-full"
                  />
                </td>
              </tr>
            ) : (
              <tr>
                <td className="w-md py-2 whitespace-nowrap font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary">{depositBill.trim() === "" ? "-" : depositBill}</td>
              </tr>
            )}
          </tbody>
        </table>
          }
      </div>
      
      {/* Desktop/Tablet View (Headers on Top) - Hidden on Mobile */}
      <div className={`hidden sm:block ${isEditing ? "ml-10 xl:ml-0" : "ml-0"}`}>
        <table className="lg:w-4xl w-full table-fixed ">
          <thead className="bg-ellPrimary">
            <tr>
              {isEditing && <th className='w-0 '></th>}
              <th className="w-20 py-3 font-prompt text-center bg-ellWhite border-2 border-ellGray text-md text-ellPrimary uppercase tracking-wider cursor-default">รายการ</th>
              <th className="w-20 py-3 font-prompt text-center bg-ellWhite border-2 border-ellGray text-md text-ellPrimary uppercase tracking-wider cursor-default">ยอดชำระ</th>
              <th className="w-20 py-3 font-prompt text-center bg-ellWhite border-2 border-ellGray text-md text-ellPrimary uppercase tracking-wider cursor-default">วันชำระ</th>
              <th className="w-20 py-3 font-prompt text-center bg-ellWhite border-2 border-ellGray text-md text-ellPrimary uppercase tracking-wider cursor-default">หมายเหตุ</th>
              <th className="w-20 py-3 font-prompt text-center bg-ellWhite border-2 border-ellGray text-md text-ellPrimary uppercase tracking-wider cursor-default">วันที่เริ่มอยู่</th>
              <th className="w-20 py-3 font-prompt text-center bg-ellWhite border-2 border-ellGray text-md text-ellPrimary uppercase tracking-wider cursor-default">วันครบกำหนด</th>
              {isEditing && <th className='w-0 bg-ellWhite'></th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={isEditing ? "8" : "6"} className="px-6 py-4 text-center text-ellPrimary border-2 border-ellGray">Loading...</td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={isEditing ? "8" : "6"} className="px-6 py-4 text-center text-ellPrimary border-2 border-ellGray">No records found</td>
              </tr>
            ) : (
              records.map((record, index) => (
                <tr
                  key={record.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnter={handleDragEnter}
                  // iPad/touch support
                  onTouchStart={(e) => handleTouchStart(e, index)}
                  onTouchMove={(e) => handleTouchMove(e, index)}
                  onTouchEnd={(e) => handleTouchEnd(e)}
                  className={`transition-all touch-none ${draggedIndex === index ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}
                >
                  {isEditing && (
                    <td className="w-0 p-0 m-0 relative">
                      <div className="touch-none cursor-move text-gray-400 hover:text-gray-600 text-xl leading-none select-none space-y-1 absolute top-[15px] right-[10px]">
                        ⋮⋮
                      </div>
                    </td>
                  )}
                  
                  {isEditing ? (
                    <>
                      <td 
                        className="py-4 w-fit font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary"
                        contentEditable="true"
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleChangeRecord(e, 'transactionCode', record.id)}
                      >
                        {record.transactionCode}
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
                        <Flatpickr
                          options={{
                            locale: Thai,
                            dateFormat: "d/m/Y",
                            altInput: true,
                            altFormat: "j M Y",
                            formatDate: flatpickrThaiBuddhistFormatter
                          }}
                          placeholder="วัน/เดือน/ปี"
                          value={record.paymentDate ? new Date(record.paymentDate) : null}
                          onChange={([date]) => {handleRecordFieldChange(date, 'paymentDate', record.id);}}
                          className="w-full h-full px-4 text-ellPrimary focus:outline-none cursor-text text-center xl:text-md text-sm absolute inset-0"
                        />
                      </td>
                      <td 
                        className="py-4 w-fit font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary"
                        contentEditable="true"
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleChangeRecord(e, 'rentalNote', record.id)}
                      >
                        {record.rentalNote}
                      </td>
                      <td className="font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary relative">
                        <Flatpickr
                          options={{
                            locale: Thai,
                            dateFormat: "d/m/Y",
                            altInput: true,
                            altFormat: "j M Y",
                            formatDate: flatpickrThaiBuddhistFormatter
                          }}
                          placeholder="วัน/เดือน/ปี"
                          value={record.moveInDate ? new Date(record.moveInDate) : null || "วัน/เดือน/ปี"}
                          onChange={([date]) => {handleRecordFieldChange(date, 'moveInDate', record.id);}}
                          className="w-full h-full px-4 text-ellPrimary focus:outline-none cursor-text text-center xl:text-md text-sm absolute inset-0"
                        />
                      </td>
                      <td className="font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary relative">
                        <Flatpickr
                          options={{
                            locale: Thai,
                            dateFormat: "d/m/Y",
                            altInput: true,
                            altFormat: "j M Y",
                            formatDate: flatpickrThaiBuddhistFormatter
                          }}
                          placeholder="วัน/เดือน/ปี"
                          value={record.dueInDate ? new Date(record.dueInDate) : null}
                          onChange={([date]) => {handleRecordFieldChange(date, 'dueInDate', record.id);}}
                          className="w-full h-full px-4 text-ellPrimary focus:outline-none cursor-text text-center xl:text-md text-sm absolute inset-0"
                        />
                      </td>
                      <td className="w-0 p-0 m-0 relative">
                        <div className="flex justify-center items-center">
                          <button
                            className="absolute xl:right-[-80px] md:right-[-70px] bg-ellWhite text-ellRed px-3 py-1 rounded-full cursor-pointer hover:bg-ellBlack"
                            onClick={() => deleteRecord(record.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-4 w-20 font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary overflow-hidden whitespace-nowrap text-ellipsis break-all">
                        {record.transactionCode.trim() === "" ? "-" : record.transactionCode}
                      </td>
                      <td className="py-4 w-fit font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary overflow-hidden whitespace-nowrap text-ellipsis">
                        {record.rentalRate.trim() === "" ? "-" : record.rentalRate}
                      </td>
                      <td className="py-4 w-fit font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary overflow-hidden whitespace-nowrap text-ellipsis">
                        {formatIsoToThaiBuddhist(record.paymentDate) || "-"}
                      </td>
                      <td className="py-4 w-fit font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary overflow-hidden whitespace-nowrap text-ellipsis">
                        {record.rentalNote?.trim() === "" ? "-" : record.rentalNote}
                      </td>
                      <td className="py-4 w-fit font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary overflow-hidden whitespace-nowrap text-ellipsis">
                        {formatIsoToThaiBuddhist(record.moveInDate) || "-"}
                      </td>
                      <td className="py-4 w-fit font-prompt text-center bg-ellWhite border-2 border-ellGray text-ellPrimary overflow-hidden whitespace-nowrap text-ellipsis">
                        {formatIsoToThaiBuddhist(record.dueInDate) || "-"}
                      </td>
                    </>
                  )}
                </tr>
              ))
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
          records.map((record, index) => {
            const displayIndex = isSort ? sortedRecords.length - index : index + 1;
            
            return (
              <div key={record.id} className="mb-6 border-2 border-ellGray rounded">
                <div className="bg-ellWhite border-b-2 border-ellGray p-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="font-prompt text-ellPrimary uppercase mr-2 font-bold">No. {displayIndex}</span>
                    {isEditing && (
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => moveItemUp(index)}
                          disabled={index === 0}
                          className={`px-2 py-1 text-xs rounded ${
                            index === 0 
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                              : 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                          }`}
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveItemDown(index)}
                          disabled={index === orderedRecords.length - 1}
                          className={`px-2 py-1 text-xs rounded ${
                            index === orderedRecords.length - 1 
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                              : 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                          }`}
                        >
                          ▼
                        </button>
                      </div>
                    )}
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
                    {/* transactionCode */}
                    <tr>
                      <th className="w-40 py-3 font-prompt text-left px-4 bg-ellWhite border-b-2 border-ellGray md:text-md text-xs text-ellPrimary uppercase tracking-wider">
                        รายการ
                      </th>
                      {isEditing ? (
                        <td 
                          className="py-3 px-4 font-prompt bg-ellWhite border-b-2 border-ellGray text-ellPrimary"
                          contentEditable="true"
                          suppressContentEditableWarning={true}
                          onBlur={(e) => handleChangeRecord(e, 'transactionCode', record.id)}
                        >
                          {record.transactionCode}
                        </td>
                      ) : (
                        <td className="py-3 px-4 font-prompt bg-ellWhite border-b-2 border-ellGray text-ellPrimary overflow-hidden whitespace-nowrap text-ellipsis">
                          {record.transactionCode.trim() === "" ? "-" : record.transactionCode}
                        </td>
                      )}
                    </tr>
                    
                    {/* rentalRate */}
                    <tr>
                      <th className="w-40 py-3 font-prompt text-left px-4 bg-ellWhite border-b-2 border-ellGray md:text-md text-xs text-ellPrimary uppercase tracking-wider">
                        ยอดชำระ	
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
                          <Flatpickr
                            options={{
                              locale: Thai,
                              dateFormat: "d/m/Y",
                              altInput: true,
                              altFormat: "j M Y",
                              formatDate: flatpickrThaiBuddhistFormatter
                            }}
                            placeholder="วัน/เดือน/ปี"
                            value={record.paymentDate ? new Date(record.paymentDate) : null}
                            onChange={([date]) => {handleRecordFieldChange(date, 'paymentDate', record.id);}}
                            className="w-full h-full px-4 text-ellPrimary focus:outline-none cursor-text text-center xl:text-md text-sm absolute inset-0"
                          />
                        </td>
                      ) : (
                        <td className="py-3 px-4 font-prompt bg-ellWhite border-b-2 border-ellGray text-ellPrimary overflow-hidden whitespace-nowrap text-ellipsis">
                          {formatIsoToThaiBuddhist(record.paymentDate) || "-"}
                        </td>
                      )}
                    </tr>
                    
                    {/* rentalNote */}
                    <tr>
                      <th className="w-40 py-3 font-prompt text-left px-4 bg-ellWhite border-b-2 border-ellGray md:text-md text-xs text-ellPrimary uppercase tracking-wider">
                        หมายเหตุ
                      </th>
                      {isEditing ? (
                        <td 
                          className="py-3 px-4 font-prompt bg-ellWhite border-b-2 border-ellGray text-ellPrimary"
                          contentEditable="true"
                          suppressContentEditableWarning={true}
                          onBlur={(e) => handleChangeRecord(e, 'rentalNote', record.id)}
                        >
                          {record.rentalNote}
                        </td>
                      ) : (
                        <td className="py-3 px-4 font-prompt bg-ellWhite border-b-2 border-ellGray text-ellPrimary overflow-hidden whitespace-nowrap text-ellipsis">
                          {record.rentalNote.trim() === "" ? "-" : record.rentalNote}
                        </td>
                      )}
                    </tr>
                    
                    {/* moveInDate */}
                    <tr>
                      <th className="w-40 py-3 font-prompt text-left px-4 bg-ellWhite border-ellGray md:text-md text-xs text-ellPrimary uppercase tracking-wider">
                        วันที่เริ่มอยู่
                      </th>
                      {isEditing ? (
                        <td className="font-prompt bg-ellWhite border-b-2 border-ellGray text-ellPrimary relative p-2">
                          <Flatpickr
                            options={{
                              locale: Thai,
                              dateFormat: "d/m/Y",
                              altInput: true,
                              altFormat: "j M Y",
                              formatDate: flatpickrThaiBuddhistFormatter
                            }}
                            placeholder="วัน/เดือน/ปี"
                            value={record.moveInDate ? new Date(record.moveInDate) : null}
                            onChange={([date]) => {handleRecordFieldChange(date, 'moveInDate', record.id);}}
                            className="w-full h-full px-4 text-ellPrimary focus:outline-none cursor-text text-center xl:text-md text-sm absolute inset-0"
                          />
                        </td>
                      ) : (
                        <td className="py-3 px-4 font-prompt bg-ellWhite border-ellGray text-ellPrimary overflow-hidden whitespace-nowrap text-ellipsis">
                          {formatIsoToThaiBuddhist(record.moveInDate) || "-"}
                        </td>
                      )}
                    </tr>
                    
                    {/* dueInDate */}
                    <tr>
                      <th className="w-40 py-3 font-prompt text-left px-4 bg-ellWhite border-ellGray md:text-md text-xs text-ellPrimary uppercase tracking-wider">
                        วันครบกำหนด
                      </th>
                      {isEditing ? (
                        <td className="font-prompt bg-ellWhite border-b-2 border-ellGray text-ellPrimary relative p-2">
                          <Flatpickr
                            options={{
                              locale: Thai,
                              dateFormat: "d/m/Y",
                              altInput: true,
                              altFormat: "j M Y",
                              formatDate: flatpickrThaiBuddhistFormatter
                            }}
                            placeholder="วัน/เดือน/ปี"
                            value={record.dueInDate ? new Date(record.dueInDate) : null}
                            onChange={([date]) => {handleRecordFieldChange(date, 'dueInDate', record.id);}}
                            className="w-full h-full px-4 text-ellPrimary focus:outline-none cursor-text text-center xl:text-md text-sm absolute inset-0"
                          />
                        </td>
                      ) : (
                        <td className="py-3 px-4 font-prompt bg-ellWhite border-ellGray text-ellPrimary overflow-hidden whitespace-nowrap text-ellipsis">
                          {formatIsoToThaiBuddhist(record.dueInDate) || "-"}
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