import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.101.51:8000';

const RoadmapContext = createContext();

export const useRoadmap = () => {
  const context = useContext(RoadmapContext);
  if (!context) {
    throw new Error('useRoadmap must be used within a RoadmapProvider');
  }
  return context;
};

export const RoadmapProvider = ({ children }) => {
  const [roadmapData, setRoadmapData] = useState({
    bootcamps: [],
    courses: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [currentJob, setCurrentJob] = useState(null);

  // 캐시 유효 시간 (5분)
  const CACHE_DURATION = 5 * 60 * 1000;

  const isCacheValid = () => {
    const now = Date.now();
    return (now - lastFetchTime) < CACHE_DURATION;
  };

  const fetchRoadmapData = useCallback(async (jobCategory, force = false) => {
    if (!jobCategory) {
      console.log('직무 카테고리가 없어서 로드맵 데이터를 가져오지 않습니다.');
      return;
    }

    // 캐시가 유효하고 강제 새로고침이 아닌 경우 기존 데이터 사용
    if (!force && isCacheValid() && currentJob === jobCategory) {
      console.log('캐시된 로드맵 데이터 사용');
      return roadmapData;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('로드맵 데이터 새로 가져오기 - 직무:', jobCategory);
      
      // 인증 토큰 추가
      const token = localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // API 문서에 따른 파라미터 설정
      const params = {
        category: jobCategory,
        limit: 10, // 기본값
        force_refresh: force // 캐시 무시 여부
      };
      
      const response = await axios.get(`${BASE_URL}/visualization/roadmap_recommendations`, {
        params,
        headers
      });
      
      console.log('로드맵 데이터 API 응답:', response.data);
      
      // API 응답 구조에 맞게 데이터 처리 - 랜덤으로 하나씩만 선택
      const allBootcamps = response.data.filter(item => item.type === '부트캠프');
      const allCourses = response.data.filter(item => item.type === '강의');
      
      // 랜덤으로 하나씩 선택
      const randomBootcamp = allBootcamps.length > 0 ? 
        [allBootcamps[Math.floor(Math.random() * allBootcamps.length)]] : [];
      const randomCourse = allCourses.length > 0 ? 
        [allCourses[Math.floor(Math.random() * allCourses.length)]] : [];
      
      const newRoadmapData = {
        bootcamps: randomBootcamp.length > 0 ? randomBootcamp : getDummyBootcamps(jobCategory),
        courses: randomCourse.length > 0 ? randomCourse : getDummyCourses(jobCategory)
      };
      
      console.log('로드맵 데이터 설정:', newRoadmapData);
      setRoadmapData(newRoadmapData);
      setCurrentJob(jobCategory);
      setLastFetchTime(Date.now());
      setError(null);
      
      return newRoadmapData;
    } catch (err) {
      console.error('로드맵 데이터 조회 실패:', err);
      setError(err.message);
      
      // 에러 시 직무별 더미 데이터 사용
      const dummyData = {
        bootcamps: getDummyBootcamps(jobCategory),
        courses: getDummyCourses(jobCategory)
      };
      setRoadmapData(dummyData);
      setCurrentJob(jobCategory);
      setLastFetchTime(Date.now());
      
      return dummyData;
    } finally {
      setLoading(false);
    }
  }, []); // 의존성 배열을 빈 배열로 설정하여 무한 루프 방지

  const refreshRoadmapData = useCallback((jobCategory) => {
    return fetchRoadmapData(jobCategory, true);
  }, [fetchRoadmapData]);

  const value = {
    roadmapData,
    loading,
    error,
    currentJob,
    fetchRoadmapData,
    refreshRoadmapData
  };

  return (
    <RoadmapContext.Provider value={value}>
      {children}
    </RoadmapContext.Provider>
  );
};

// 더미 데이터 함수들
const getDummyBootcamps = (job) => {
  const bootcamps = {
    "프론트엔드 개발자": [
      { name: "React 부트캠프", description: "React 기반 웹 개발", type: "부트캠프" },
      { name: "Vue.js 부트캠프", description: "Vue.js 기반 웹 개발", type: "부트캠프" }
    ],
    "백엔드 개발자": [
      { name: "Node.js 부트캠프", description: "Node.js 기반 서버 개발", type: "부트캠프" },
      { name: "Spring 부트캠프", description: "Spring 기반 서버 개발", type: "부트캠프" }
    ],
    "풀스택 개발자": [
      { name: "MERN 스택 부트캠프", description: "MongoDB, Express, React, Node.js", type: "부트캠프" },
      { name: "MEAN 스택 부트캠프", description: "MongoDB, Express, Angular, Node.js", type: "부트캠프" }
    ]
  };
  return bootcamps[job] || bootcamps["프론트엔드 개발자"];
};

const getDummyCourses = (job) => {
  const courses = {
    "프론트엔드 개발자": [
      { name: "JavaScript 기초", description: "JavaScript 기본 문법", type: "강의" },
      { name: "CSS 마스터", description: "CSS 스타일링", type: "강의" }
    ],
    "백엔드 개발자": [
      { name: "Python 기초", description: "Python 기본 문법", type: "강의" },
      { name: "데이터베이스 설계", description: "DB 설계 원리", type: "강의" }
    ],
    "풀스택 개발자": [
      { name: "웹 개발 기초", description: "웹 개발 전체 과정", type: "강의" },
      { name: "API 설계", description: "RESTful API 설계", type: "강의" }
    ]
  };
  return courses[job] || courses["프론트엔드 개발자"];
}; 