import React, { createContext, useState, useEffect, useContext } from "react";

// Theme configurations
const themes = {
  light: { 
    ellPrimary: "#333333", 
    ellWhite: "#F7F7F7", 
    ellBlack: "#333333",
    ellGray: "#D6D6D6",
    ellDarkGray: "#8E8E8E",
    ellSecondary: "#F7F7F7",
    background: "#F7F7F7", 
    text: "#333333" 
  },
  dark: { 
    ellPrimary: "#F7F7F7", 
    ellWhite: "#333333", 
    ellBlack: "#F7F7F7",
    ellGray: "#F7F7F7",
    ellDarkGray: "#8E8E8E", 
    ellSecondary: "#333333",
    background: "#333333", 
    text: "#F7F7F7" 
  },
  blue: { 
    ellPrimary: "#F7F7F7", 
    ellWhite: "#202435", 
    ellBlack: "#2B334E",
    ellGray: "#2B334E",
    ellDarkGray: "#8E8E8E", 
    ellSecondary: "#F7F7F7",
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
    document.documentElement.style.setProperty("--color-ellWhite", theme.ellWhite);
    document.documentElement.style.setProperty("--color-ellBlack", theme.ellBlack);
    document.documentElement.style.setProperty("--color-ellGray", theme.ellGray);
    document.documentElement.style.setProperty("--color-ellDarkGray", theme.ellDarkGray);
    document.documentElement.style.setProperty("--color-ellSecondary", theme.ellSecondary);
    
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