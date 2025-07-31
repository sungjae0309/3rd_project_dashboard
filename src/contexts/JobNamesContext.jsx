import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const JobNamesContext = createContext();

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://192.168.101.7:8000';

export const useJobNames = () => {
  const context = useContext(JobNamesContext);
  if (!context) {
    throw new Error('useJobNames must be used within a JobNamesProvider');
  }
  return context;
};

export const JobNamesProvider = ({ children }) => {
  const [jobNames, setJobNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  
  // 30분 캐싱 (백엔드와 동일)
  const CACHE_DURATION = 30 * 60 * 1000; // 30분

  const fetchJobNames = async (forceRefresh = false) => {
    // 캐시가 유효하고 강제 새로고침이 아닌 경우 캐시된 데이터 사용
    if (!forceRefresh && jobNames.length > 0 && lastFetchTime) {
      const now = Date.now();
      if (now - lastFetchTime < CACHE_DURATION) {
        return jobNames;
      }
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${BASE_URL}/job-role/job-names`, {
        params: { force_refresh: forceRefresh }
      });
      
      const data = response.data;
      setJobNames(data);
      setLastFetchTime(Date.now());
      return data;
    } catch (err) {
      console.error('직무명 조회 실패:', err);
      setError(err.message || '직무명을 불러오는데 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 자동으로 데이터 로드
  useEffect(() => {
    fetchJobNames();
  }, []);

  const value = {
    jobNames,
    loading,
    error,
    fetchJobNames,
    lastFetchTime
  };

  return (
    <JobNamesContext.Provider value={value}>
      {children}
    </JobNamesContext.Provider>
  );
}; 