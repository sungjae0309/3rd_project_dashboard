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

 // AuthContext.jsx

const logout = () => {
  // 👇 [수정] userId를 먼저 변수에 저장합니다.
  const userId = localStorage.getItem("userId");

  // 이제 안심하고 localStorage 아이템들을 삭제합니다.
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("chatSessionId");
  localStorage.removeItem("lastSelectedPage");
  
  // 위에서 미리 저장해둔 userId를 사용해 캐시를 삭제합니다.
  if (userId) {
    localStorage.removeItem(`cachedRecommendations_${userId}`);
  }
  
  // 앱의 상태를 업데이트하여 모든 컴포넌트에 로그아웃을 알립니다.
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