import React, { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from '../contexts/AuthContext'; 
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../components/firebase';

const themes = {
  light: { 
    ellPrimary: "#333333", 
    ellSecondary: "#F7F7F7",
    ellTertiary: "#F7F7F7",
    ellWhite: "#F7F7F7", 
    ellBlack: "#333333",
    ellGray: "#D6D6D6",
    ellDarkGray: "#8E8E8E",
    ellScrollbar1: "#D6D6D6",
    ellScrollbar2: "#333333",
    background: "#F7F7F7", 
    text: "#333333" 
  },
  dark: { 
    ellPrimary: "#F7F7F7", 
    ellSecondary: "#333333",
    ellTertiary: "#333333",
    ellWhite: "#333333", 
    ellBlack: "#F7F7F7",
    ellGray: "#D6D6D6",
    ellDarkGray: "#8E8E8E", 
    ellScrollbar1: "#F7F7F7",
    ellScrollbar2: "#8E8E8E",
    background: "#333333", 
    text: "#F7F7F7" 
  },
  blue: { 
    ellPrimary: "#F7F7F7", 
    ellSecondary: "#F7F7F7",
    ellTertiary: "#333333",
    ellWhite: "#202435", 
    ellBlack: "#2B334E",
    ellGray: "#2B334E",
    ellDarkGray: "#8E8E8E", 
    ellScrollbar1: "#D6D6D6",
    ellScrollbar2: "#2B334E",
    background: "#2D336B", 
    text: "#F7F7F7" 
  },
};
  
const themeIcons = {
  light: {
    loading: "./img/Home-light.svg",
    logo: "./img/Home-dark.svg",
    notification: "./img/notification-dark.svg",
    menuClose: "./img/menuClose-dark.svg",
    menuOpen: "./img/menuOpen-dark.svg",
    theme: "./img/theme-dark.svg",
    help: "./img/help-dark.svg",
    plus: "./img/plus-light.svg",
    info: "./img/info-light.svg",
    dot: "./img/dot-dark.svg",
    filterOff: "./img/filter-off-dark.svg",
    filterOn: "./img/filter-on-light.svg",
    inbox: "./img/inbox-dark.svg",
    error: "./img/error-dark.svg",
    back: "./img/back-dark.svg",
    trash: "./img/trash-dark.svg",
    check: "./img/check-light.svg",
    share: "./img/share-light.svg",
    edit: "./img/edit-light.svg",
    save: "./img/save-light.svg",
    megaphone: "./img/property/megaphone-dark.svg",
    furniture: "./img/property/furniture-dark.svg",
    conditioner: "./img/property/conditioner-dark.svg",
    heater: "./img/property/heater-dark.svg",
    washing: "./img/property/washing-machine-dark.svg",
    bath: "./img/property/bath-dark.svg",
    cctv: "./img/property/cctv-dark.svg",
    elevator: "./img/property/elevator-dark.svg",
    balcony: "./img/property/balcony-dark.svg",
    garden: "./img/property/plant-dark.svg",
    parking: "./img/property/parking-dark.svg",
    pool: "./img/property/pool-dark.svg",
    remove: "./img/remove-dark.svg",
    sign: "./img/sign-dark.svg",
    mapId: "abcd1234mymapid",
    target: "./img/target-dark.svg",
    calendar: "./img/calendar-dark.svg",
  },
  dark: {
    loading: "./img/Home-dark.svg",
    logo: "./img/Home-light.svg",
    notification: "./img/notification-light.svg",
    menuClose: "./img/menuClose-light.svg",
    menuOpen: "./img/menuOpen-light.svg",
    theme: "./img/theme-light.svg",
    help: "./img/help-light.svg",
    plus: "./img/plus-dark.svg",
    info: "./img/info-dark.svg",
    dot: "./img/dot-light.svg",
    filterOff: "./img/filter-off-light.svg",
    filterOn: "./img/filter-on-dark.svg",
    inbox: "./img/inbox-light.svg",
    error: "./img/error-light.svg",
    back: "./img/back-light.svg",
    trash: "./img/trash-light.svg",
    check: "./img/check-dark.svg",
    share: "./img/share-dark.svg",
    edit: "./img/edit-dark.svg",
    save: "./img/save-light.svg",
    megaphone: "./img/property/megaphone-light.svg",
    furniture: "./img/property/furniture-light.svg",
    conditioner: "./img/property/conditioner-light.svg",
    heater: "./img/property/heater-light.svg",
    washing: "./img/property/washing-machine-light.svg",
    bath: "./img/property/bath-light.svg",
    cctv: "./img/property/cctv-light.svg",
    elevator: "./img/property/elevator-light.svg",
    balcony: "./img/property/balcony-light.svg",
    garden: "./img/property/plant-light.svg",
    parking: "./img/property/parking-light.svg",
    pool: "./img/property/pool-light.svg",
    remove: "./img/remove-light.svg",
    sign: "./img/sign-light.svg",
    mapId: import.meta.env.VITE_Dark_MapId,
    target: "./img/target-light.svg",
    calendar: "./img/calendar-light.svg",
  },
  blue: {
    loading: "./img/Home-light.svg",
    logo: "./img/Home-light.svg",
    notification: "./img/notification-light.svg",
    menuClose: "./img/menuClose-light.svg",
    menuOpen: "./img/menuOpen-light.svg",
    theme: "./img/theme-light.svg",
    help: "./img/help-light.svg",
    plus: "./img/plus-light.svg",
    info: "./img/info-light.svg",
    dot: "./img/dot-light.svg",
    filterOff: "./img/filter-off-light.svg",
    filterOn: "./img/filter-on-dark.svg",
    inbox: "./img/inbox-light.svg",
    error: "./img/error-light.svg",
    back: "./img/back-light.svg",
    trash: "./img/trash-light.svg",
    check: "./img/check-light.svg",
    share: "./img/share-light.svg",
    edit: "./img/edit-light.svg",
    save: "./img/save-light.svg",
    megaphone: "./img/property/megaphone-light.svg",
    furniture: "./img/property/furniture-light.svg",
    conditioner: "./img/property/conditioner-light.svg",
    heater: "./img/property/heater-light.svg",
    washing: "./img/property/washing-machine-light.svg",
    bath: "./img/property/bath-light.svg",
    cctv: "./img/property/cctv-light.svg",
    elevator: "./img/property/elevator-light.svg",
    balcony: "./img/property/balcony-light.svg",
    garden: "./img/property/plant-light.svg",
    parking: "./img/property/parking-light.svg",
    pool: "./img/property/pool-light.svg",
    remove: "./img/remove-light.svg",
    sign: "./img/sign-light.svg",
    mapId: import.meta.env.VITE_Blue_MapId,
    target: "./img/target-light.svg",
    calendar: "./img/calendar-light.svg",
  },
};

// Create context
const ThemeContext = createContext();

// Custom hook for using the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [theme, setTheme] = useState("light");
  const [icons, setIcons] = useState(themeIcons.light);

    useEffect(() => {
    const loadUserData = async () => {
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.email);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setTheme(data.theme || '');
            applyTheme(theme);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    loadUserData();
  }, [currentUser]);

  const applyTheme = (themeName) => {
    const theme = themes[themeName] || themes.light;
    Object.entries(theme).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--color-${key}`, value);
    });
    
  };

  // Function to change theme that can be called from anywhere in the app
  const changeTheme = (newTheme) => {
    if (themes[newTheme]) {
      setTheme(newTheme);
      setIcons(themeIcons[newTheme] || themeIcons.light);
      applyTheme(newTheme);
    }
  };

  // Apply theme on initial load and when theme changes
  useEffect(() => {
    applyTheme(theme);
    setIcons(themeIcons[theme]);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      icons, 
      changeTheme,
      themes,
      themeIcons
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;