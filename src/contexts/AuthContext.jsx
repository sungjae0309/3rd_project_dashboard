import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 초기 로그인 상태 확인
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");
      
      if (token && userId) {
        setIsLoggedIn(true);
        setUser({ id: userId, token });
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
      setIsInitialized(true);
    };

    checkLoginStatus();
  }, []);

  const login = (token, userId) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("userId", userId);
    setIsLoggedIn(true);
    setUser({ id: userId, token });
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("chatSessionId");
    localStorage.removeItem("lastSelectedPage");
    
    // 사용자별 캐시된 추천 공고도 삭제
    const userId = localStorage.getItem("userId");
    if (userId) {
      localStorage.removeItem(`cachedRecommendations_${userId}`);
    }
    
    setIsLoggedIn(false);
    setUser(null);
  };

  const value = {
    isLoggedIn,
    user,
    isInitialized,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 