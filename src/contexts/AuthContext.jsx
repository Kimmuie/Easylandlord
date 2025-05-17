import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../components/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          docId: user.email
        });
        localStorage.setItem("email", user.email);
        localStorage.setItem("userId", user.uid);
      } else {
        setCurrentUser(null);
        localStorage.removeItem("email");
        localStorage.removeItem("userId");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Context value
  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;