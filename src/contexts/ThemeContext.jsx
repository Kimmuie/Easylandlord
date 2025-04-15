import React, { createContext, useState, useEffect, useContext } from "react";

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
    edit: "./img/edit-light.svg",
    save: "./img/save-light.svg",
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
    edit: "./img/edit-dark.svg",
    save: "./img/save-light.svg",
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
    edit: "./img/edit-light.svg",
    save: "./img/save-light.svg",
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
  const [theme, setTheme] = useState(() => {
    // Initialize from localStorage
    return localStorage.getItem("theme") || "light";
  });
  
  const [icons, setIcons] = useState(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    return themeIcons[savedTheme] || themeIcons.light;
  });

  // Function to apply theme that is now internal to the context
  const applyTheme = (themeName) => {
    const theme = themes[themeName] || themes.light;
    
    // Apply all theme properties
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });
    
    // For backward compatibility with your current setup
    document.documentElement.style.setProperty("--color-ellPrimary", theme.ellPrimary);
    document.documentElement.style.setProperty("--color-ellSecondary", theme.ellSecondary);
    document.documentElement.style.setProperty("--color-ellTertiary", theme.ellTertiary);
    document.documentElement.style.setProperty("--color-ellWhite", theme.ellWhite);
    document.documentElement.style.setProperty("--color-ellBlack", theme.ellBlack);
    document.documentElement.style.setProperty("--color-ellGray", theme.ellGray);
    document.documentElement.style.setProperty("--color-ellDarkGray", theme.ellDarkGray);
    document.documentElement.style.setProperty("--color-ellScrollbar1", theme.ellScrollbar1);
    document.documentElement.style.setProperty("--color-ellScrollbar2", theme.ellScrollbar2);
    localStorage.setItem("theme", themeName);
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