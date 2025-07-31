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

  const login = async (token, userId) => {
    localStorage.setItem("accessToken", token);
    
    // userId가 없으면 API에서 사용자 정보를 가져옴
    if (!userId) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://192.168.101.7:8000'}/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          userId = userData.id;
          localStorage.setItem("userId", userId);
          setUser({ id: userId, token, ...userData });
        } else {
          // API 호출 실패 시 기본값 사용
          localStorage.setItem("userId", "unknown");
          setUser({ id: "unknown", token });
        }
      } catch (error) {
        console.error("사용자 정보 가져오기 실패:", error);
        localStorage.setItem("userId", "unknown");
        setUser({ id: "unknown", token });
      }
    } else {
      localStorage.setItem("userId", userId);
      setUser({ id: userId, token });
    }
    
    setIsLoggedIn(true);
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