import { BrowserRouter as Router, Routes, Route, useLocation, useParams } from "react-router-dom";
import { useState, useEffect } from 'react';
import Navbar from "./components/Navbar";
import LoadingScreen from './components/LoadingScreen'
import Management from "./pages/Management";
import Financial from "./pages/Financial";
import GoogleMap from "./pages/Map";
import Account from "./pages/Account";
import RentalDetail from "./pages/RentalDetail";
import { ThemeProvider } from "./contexts/ThemeContext";
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../src/components/firebase';

const AppContent = () => {
  const location = useLocation();
  const isRentalDetailPage = /^\/management\/[^/]+$/.test(location.pathname);
  const [user, setUser] = useState(localStorage.getItem("email") || null);
  const { rentalId } = useParams();
    const [records, setRecords] = useState([]);

  useEffect(() => {
    // Check for user authentication
    if (!user) {
      console.log("No user found in localStorage");
      return;
    }
    
    const checkRentalDueDates = async () => {
      try {
        const userDocRef = doc(db, "users", user);
        const docSnap = await getDoc(userDocRef);
        
        if (!docSnap.exists()) {
          console.log("User document doesn't exist");
          return;
        }

        const userData = docSnap.data();
        if (userData.rental) {
          const rental = userData.rental.find(r => r.id === rentalId);
          
          if (rental && rental.financialHistory) {
            setRecords(rental.financialHistory);
          } else {
            setRecords([]);
          }
        }
        
        if (!userData.rental || !Array.isArray(userData.rental) || userData.rental.length === 0) {
          console.log("No rentals found for this user");
          return;
        }
        
        console.log(`Found ${userData.rental.length} rentals to check`);
        
        // Get existing notifications or initialize with empty array
        const existingNotifications = userData.notification || [];
        const newNotifications = [];
        const now = new Date();
        
        // Scan through all rentals to check their due dates
        for (const rental of userData.rental) {
          console.log(`-------------Checking rental: ${rental.name || rental.id}------------`);
          
          if (!rental.dueDate) {
            console.log(`Rental ${rental.name || rental.id} has no due date`);
            continue;
          }
          
          // Parse the dueDate - ensure correct date parsing
          let dueDate;
          
          // Try different date parsing approaches
          if (typeof rental.dueDate === 'string') {
            // Try to parse string format
            if (rental.dueDate.includes('/')) {
              // Handle DD/MM/YYYY format
              const [day, month, year] = rental.dueDate.split('/');
              dueDate = new Date(year, month - 1, day); // Month is 0-indexed in JS Date
            } else if (rental.dueDate.includes('-')) {
              // Handle YYYY-MM-DD format
              dueDate = new Date(rental.dueDate);
            } else {
              // Try parsing as timestamp
              dueDate = new Date(rental.dueDate);
            }
          } else if (rental.dueDate instanceof Date) {
            dueDate = rental.dueDate;
          } else if (typeof rental.dueDate === 'object' && rental.dueDate.seconds) {
            // Handle Firestore timestamp
            dueDate = new Date(rental.dueDate.seconds * 1000);
          } else {
            // Fallback
            dueDate = new Date(rental.dueDate);
          }
          
          // Check if dueDate is a valid date
          if (isNaN(dueDate.getTime())) {
            console.log(`Invalid due date format for rental ${rental.name || rental.id}`);
            continue;
          }
          
          // Calculate days left until due date
          const timeDiff = dueDate.getTime() - now.getTime();
          const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
          console.log(`Days left until due date: ${daysLeft}`);
          
          // Format the current date for display
          const year = now.getFullYear();
          const day = String(now.getDate()).padStart(2, '0');
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const hours = String(now.getHours()).padStart(2, '0');
          const minutes = String(now.getMinutes()).padStart(2, '0');
          const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;
          // ---------- CONTRACT DUE DATE NOTIFICATIONS ----------
          if (daysLeft <= 30 && daysLeft >= 0) {
            let description;
            if (daysLeft === 0) {
              description = `สัญญาเช่าจะหมดภายในวันนี้`;
            } else if (daysLeft === 1) {
              description = `สัญญาเช่าจะหมดภายในพรุ่งนี้`;
            } else {
              description = `สัญญาเช่าจะหมดภายใน ${daysLeft} วัน`;
            }
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const alreadySent = existingNotifications.some(notification => {
              const isForSameRental = notification.header === (rental.name || `Rental ${rental.id}`);
              const isDesNotification = notification.description.includes('สัญญาเช่าจะหมดภายใน');
              const notificationDate = notification.rawDate ? new Date(notification.rawDate) : null;
              if (!notificationDate) return false;
              
              notificationDate.setHours(0, 0, 0, 0);
              const isSentToday = notificationDate.getTime() === today.getTime();
              
              return isForSameRental && isDesNotification && isSentToday;
            });
            
            if (!alreadySent) {
              const notificationId = `noti_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
              newNotifications.push({
                id: notificationId,
                date: formattedDate,
                rawDate: now.toISOString(),
                image: rental.rentalImage1 || rental.rentalImage2 || rental.rentalImage3 || rental.rentalImage4 || "",
                header: rental.name || `Rental ${rental.id}`,
                description: description,
                readed: false,
              });
              console.log(`Creating ${daysLeft}-day notification for ${rental.name || rental.id}`);
            }
          }
          
          if (daysLeft < 0) {
            const description = `สัญญาเช่าเกินเวลากำหนดมา ${Math.abs(daysLeft)} วัน`;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const alreadySent = existingNotifications.some(notification => {
              const isForSameRental = notification.header === (rental.name || `Rental ${rental.id}`);
              const isDesNotification = notification.description.includes(`สัญญาเช่าเกินเวลากำหนดมา`);
              const notificationDate = notification.rawDate ? new Date(notification.rawDate) : null;
              if (!notificationDate) return false;
              
              notificationDate.setHours(0, 0, 0, 0);
              const isSentToday = notificationDate.getTime() === today.getTime();
              
              return isForSameRental && isDesNotification && isSentToday;
            });

            if (!alreadySent) {
              const notificationId = `noti_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
              newNotifications.push({
                id: notificationId,
                date: formattedDate,
                rawDate: now.toISOString(),
                image: rental.rentalImage1 || rental.rentalImage2 || rental.rentalImage3 || rental.rentalImage4 || "",
                header: rental.name || `Rental ${rental.id}`,
                description: description,
                readed: false,
              });
              console.log(`Creating overdue notification for ${rental.name || rental.id}`);
            }
          }
          // ---------- CHECK RENTALS NOTIFICATIONS ----------
          if (rental.checkDate) {
            const checkDateObj = typeof rental.checkDate === 'number' 
              ? new Date(rental.checkDate) 
              : new Date(rental.checkDate);
              
            if (!isNaN(checkDateObj.getTime())) {
              const daysSinceLastCheck = Math.floor((now.getTime() - checkDateObj.getTime()) / (1000 * 3600 * 24));
              console.log(`Days since last check: ${daysSinceLastCheck}`);
              
              if (daysSinceLastCheck >= 30) {
                const description = `คุณไม่ได้เข้าตรวจเช็คเป็นเวลา ${daysSinceLastCheck} วัน`;
                
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const alreadySent = existingNotifications.some(notification => {
                  const isForSameRental = notification.header === (rental.name || `Rental ${rental.id}`);
                  const isDesNotification = notification.description.includes(`คุณไม่ได้เข้าตรวจเช็คเป็นเวลา`);
                  const notificationDate = notification.rawDate ? new Date(notification.rawDate) : null;
                  if (!notificationDate) return false;
                  
                  notificationDate.setHours(0, 0, 0, 0);
                  const isSentToday = notificationDate.getTime() === today.getTime();
                  
                  return isForSameRental && isDesNotification && isSentToday;
                });
                
                if (!alreadySent) {
                  const notificationId = `noti_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
                  newNotifications.push({
                    id: notificationId,
                    date: formattedDate,
                    rawDate: now.toISOString(),
                    image: rental.rentalImage1 || rental.rentalImage2 || rental.rentalImage3 || rental.rentalImage4 || "",
                    header: rental.name || `Rental ${rental.id}`,
                    description: description,
                    readed: false,
                  });
                  console.log(`Creating check date notification for ${rental.name || rental.id} - ${daysSinceLastCheck} days since last check`);
                }
              }
            } else {
              console.log(`Invalid checkDate format for rental ${rental.name || rental.id}`);
            }
          }
        
        // ---------- PAYMENT DUE DATE NOTIFICATIONS ----------
        if (rental.financialHistory && Array.isArray(rental.financialHistory) && rental.financialHistory.length > 0) {
          const latestRecord = rental.financialHistory[rental.financialHistory.length - 1];
          
          // console.log(`Checking payment due for rental ${rental.name || rental.id} | Latest record:`, latestRecord);
          if (latestRecord.dueInDate && !latestRecord.paymentDate) {
            let paymentDueDate;
            
            if (typeof latestRecord.dueInDate === 'string') {
              if (latestRecord.dueInDate.includes('/')) {
                const [day, month, year] = latestRecord.dueInDate.split('/');
                paymentDueDate = new Date(year, month - 1, day);
              } else if (latestRecord.dueInDate.includes('-')) {
                paymentDueDate = new Date(latestRecord.dueInDate);
              } else {
                paymentDueDate = new Date(latestRecord.dueInDate);
              }
            } else if (latestRecord.dueInDate instanceof Date) {
              paymentDueDate = latestRecord.dueInDate;
            } else if (typeof latestRecord.dueInDate === 'object' && latestRecord.dueInDate.seconds) {
              paymentDueDate = new Date(latestRecord.dueInDate.seconds * 1000);
            } else {
              paymentDueDate = new Date(latestRecord.dueInDate);
            }
            let dateFrequency;
            const rentFrequency = rental.rentFrequency.trim();
            if (rentFrequency === "วัน") {
              dateFrequency = 1;
            } else {
              dateFrequency = 7;
            }
            

            if (!isNaN(paymentDueDate.getTime())) {
              const timeDiff = paymentDueDate.getTime() - now.getTime();
              const daysUntilDue = Math.ceil(timeDiff / (1000 * 3600 * 24));
              console.log(`Days until payment due: ${daysUntilDue}`);

              if (daysUntilDue <= dateFrequency && daysUntilDue >= 0) {
                let description;
                if (daysUntilDue === 0) {
                  description = `ถึงกำหนดชำระค่าเช่าแล้วในวันนี้`;
                } else if (daysUntilDue === 1) {
                  description = `ถึงกำหนดชำระค่าเช่าในวันพรุ่งนี้`;
                } else {
                  description = `อีก ${daysUntilDue} วัน จะถึงกำหนดชำระค่าเช่า`;
                }
                
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const alreadySent = existingNotifications.some(notification => {
                  const isForSameRental = notification.header === (rental.name || `Rental ${rental.id}`);
                  const isPaymentNotification = notification.description.includes(`กำหนดชำระค่าเช่า`);
                  const notificationDate = notification.rawDate ? new Date(notification.rawDate) : null;
                  if (!notificationDate) return false;
                  
                  notificationDate.setHours(0, 0, 0, 0);
                  const isSentToday = notificationDate.getTime() === today.getTime();
                  
                  return isForSameRental && isPaymentNotification && isSentToday;
                });
                
                if (!alreadySent) {
                  const notificationId = `noti_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
                  newNotifications.push({
                    id: notificationId,
                    date: formattedDate,
                    rawDate: now.toISOString(),
                    image: rental.rentalImage1 || rental.rentalImage2 || rental.rentalImage3 || rental.rentalImage4 || "",
                    header: rental.name || `Rental ${rental.id}`,
                    description: description,
                    readed: false,
                  });
                  console.log(`Creating payment due notification for ${rental.name || rental.id} - Due in ${daysUntilDue} days`);
                }
              }
              
              if (daysUntilDue < 0) {
                const daysOverdue = Math.abs(daysUntilDue);
                const description = `ค่าเช่าค้างชำระเป็นเวลา ${daysOverdue} วันแล้ว`;
                
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const alreadySent = existingNotifications.some(notification => {
                  const isForSameRental = notification.header === (rental.name || `Rental ${rental.id}`);
                  const isOverdueNotification = notification.description.includes(`ค่าเช่าค้างชำระ`);
                  const notificationDate = notification.rawDate ? new Date(notification.rawDate) : null;
                  if (!notificationDate) return false;
                  
                  notificationDate.setHours(0, 0, 0, 0);
                  const isSentToday = notificationDate.getTime() === today.getTime();
                  
                  return isForSameRental && isOverdueNotification && isSentToday;
                });
                
                if (!alreadySent) {
                  const notificationId = `noti_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
                  newNotifications.push({
                    id: notificationId,
                    date: formattedDate,
                    rawDate: now.toISOString(),
                    image: rental.rentalImage1 || rental.rentalImage2 || rental.rentalImage3 || rental.rentalImage4 || "",
                    header: rental.name || `Rental ${rental.id}`,
                    description: description,
                    readed: false,
                  });
                  console.log(`Creating payment overdue notification for ${rental.name || rental.id} - Overdue by ${daysOverdue} days`);
                }
              }
            } else {
              console.log(`Invalid payment due date format for rental ${rental.name || rental.id}`);
            }
          }
        }
        }
        
        // If we have new notifications, add them to the database
        if (newNotifications.length > 0) {
          const updatedNotifications = [...existingNotifications, ...newNotifications];
          
          await updateDoc(userDocRef, {
            notification: updatedNotifications
          });
          console.log(`${newNotifications.length} notification(s) sent successfully`);
        } else {
          console.log("No new notifications to send");
        }
        
      } catch (error) {
        console.error("Error checking rental due dates:", error);
      }
    };
    
    checkRentalDueDates();
  }, [user]);

  return (
    <>
      <LoadingScreen />
      {!isRentalDetailPage && <Navbar />}
      <div
        className="navbar-container"
        style={{ height: isRentalDetailPage ? "100%" : "calc(100% - 64px)" }}
      >
        <Routes>
          <Route path="/" element={<Management />} />
          <Route path="/management" element={<Management />} />
          <Route path="/management/:rentalId" element={<RentalDetail />} />
          <Route path="/financial" element={<Financial />} />
          <Route path="/map" element={<GoogleMap />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;