import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://192.168.101.7:8000';

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
  const [loading, setLoading] = useState(false); // 로딩 상태는 하나로 관리
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState({ user: 0, desiredJob: 0 });

  const CACHE_DURATION = 5 * 60 * 1000; // 5분

  const isCacheValid = (type) => {
    return (Date.now() - lastFetchTime[type]) < CACHE_DURATION;
  };

  const fetchUserData = useCallback(async (force = false) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.log('⚠️ [UserDataContext] 토큰 없음, 사용자 데이터를 null로 설정');
      setUserData(null);
      setLoading(false);
      return;
    }

    if (!force && userData && isCacheValid('user')) {
      console.log('📋 [UserDataContext] 캐시된 사용자 데이터 사용');
      return;
    }

    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      console.log('🔍 [UserDataContext] 사용자 데이터 조회 시작:', `${BASE_URL}/users/me`);
      const response = await axios.get(`${BASE_URL}/users/me`, { headers });
      
      console.log('✅ [UserDataContext] 사용자 데이터 조회 성공:', response.data);
      setUserData(response.data);
      setLastFetchTime(prev => ({ ...prev, user: Date.now() }));
      setError(null);
    } catch (err) {
      console.error("❌ [UserDataContext] 사용자 데이터 조회 실패:", err);
      console.error("❌ [UserDataContext] 에러 상세:", err.response?.status, err.response?.data);
      setError(err.message);
      // 401 (Unauthorized) 오류 발생 시 토큰 제거 및 사용자 데이터 초기화
      if (err.response && err.response.status === 401) {
        console.log('🚫 [UserDataContext] 인증 실패, 토큰 제거');
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userId");
        setUserData(null);
      }
    } finally {
      console.log('🔄 [UserDataContext] 로딩 상태 해제');
      setLoading(false);
    }
  }, []); // useCallback 의존성 배열에서 userData 제거하여 무한 루프 방지

  const fetchDesiredJob = useCallback(async (force = false) => {
    if (!force && desiredJob && isCacheValid('desiredJob')) {
      return;
    }

    try {
      const { data } = await axios.get(`${BASE_URL}/users/desired-job`);
      setDesiredJob(data);
      setLastFetchTime(prev => ({ ...prev, desiredJob: Date.now() }));
    } catch (err) {
      console.error("희망 직무 조회 실패:", err);
      setError(err.message);
    }
  }, []); // useCallback 의존성 배열에서 desiredJob 제거하여 무한 루프 방지

  // 3. 초기 데이터 로드를 간결하게 수정
  useEffect(() => {
    console.log('🔄 [UserDataContext] 초기 데이터 로드 시작');
    // desiredJob은 토큰 유무와 상관없이 항상 조회
    fetchDesiredJob();
    // userData는 토큰이 있을 때만 조회
    const token = localStorage.getItem("accessToken");
    if (token) {
      console.log('🔍 [UserDataContext] 토큰 발견, 사용자 데이터 조회 시작');
      fetchUserData(true); // 강제 새로고침
    } else {
      console.log('⚠️ [UserDataContext] 토큰 없음, 사용자 데이터 조회 건너뜀');
    }
  }, []); // 이 useEffect는 마운트 시 한 번만 실행됩니다.

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