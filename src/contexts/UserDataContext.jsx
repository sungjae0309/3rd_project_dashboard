import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.101.51:8000';

const UserDataContext = createContext();

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};

export const UserDataProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [desiredJob, setDesiredJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState({ user: 0, desiredJob: 0 });

  // 캐시 유효 시간 (5분)
  const CACHE_DURATION = 5 * 60 * 1000;

  const isCacheValid = (type) => {
    const now = Date.now();
    return (now - lastFetchTime[type]) < CACHE_DURATION;
  };

  const fetchUserData = useCallback(async (force = false) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setUserData(null);
      setLoading(false);
      return;
    }

    // 캐시가 유효하고 강제 새로고침이 아닌 경우 기존 데이터 사용
    if (!force && userData && isCacheValid('user')) {
      return userData;
    }

    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${BASE_URL}/todo/user`, { headers });
      
      if (response.data && response.data.data) {
        setUserData(response.data.data);
        setLastFetchTime(prev => ({ ...prev, user: Date.now() }));
        setError(null);
        return response.data.data;
      }
    } catch (err) {
      console.error("사용자 데이터 조회 실패:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []); // 의존성 배열을 빈 배열로 설정하여 무한 루프 방지

  const fetchDesiredJob = useCallback(async (force = false) => {
    // 캐시가 유효하고 강제 새로고침이 아닌 경우 기존 데이터 사용
    if (!force && desiredJob && isCacheValid('desiredJob')) {
      return desiredJob;
    }

    try {
      // API 문서에 따르면 인증이 필요하지 않음
      const { data } = await axios.get(`${BASE_URL}/users/desired-job`);
      
      setDesiredJob(data);
      setLastFetchTime(prev => ({ ...prev, desiredJob: Date.now() }));
      setError(null);
      return data;
    } catch (err) {
      console.error("희망 직무 조회 실패:", err);
      setError(err.message);
      return null;
    }
  }, []); // 의존성 배열을 빈 배열로 설정하여 무한 루프 방지

  // 초기 데이터 로드 - 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    const initializeData = async () => {
      const token = localStorage.getItem("accessToken");
      
      // userData는 토큰이 있을 때만 로드
      if (token) {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setUserData(null);
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          const headers = { Authorization: `Bearer ${token}` };
          const response = await axios.get(`${BASE_URL}/todo/user`, { headers });
          
          if (response.data && response.data.data) {
            setUserData(response.data.data);
            setLastFetchTime(prev => ({ ...prev, user: Date.now() }));
            setError(null);
          }
        } catch (err) {
          console.error("사용자 데이터 조회 실패:", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
      
      // desiredJob은 항상 로드 (인증 불필요)
      try {
        const { data } = await axios.get(`${BASE_URL}/users/desired-job`);
        
        setDesiredJob(data);
        setLastFetchTime(prev => ({ ...prev, desiredJob: Date.now() }));
        setError(null);
      } catch (err) {
        console.error("희망 직무 조회 실패:", err);
        setError(err.message);
      }
    };

    initializeData();
  }, []); // 빈 배열로 변경하여 한 번만 실행

  // 토큰 변경 감지 - userData만 토큰이 필요함
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setUserData(null);
      setLoading(false);
    }
  }, []);

  const refreshUserData = useCallback(() => {
    return fetchUserData(true);
  }, [fetchUserData]);

  const refreshDesiredJob = useCallback(() => {
    return fetchDesiredJob(true);
  }, [fetchDesiredJob]);

  const value = {
    userData,
    desiredJob,
    loading,
    error,
    fetchUserData,
    fetchDesiredJob,
    refreshUserData,
    refreshDesiredJob
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}; 