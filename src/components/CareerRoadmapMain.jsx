/* ───────── src/components/CareerRoadmapMain.jsx ───────── */
import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import { IoIosArrowUp } from "react-icons/io";
import { 
  FaChartLine, 
  FaCloud, 
  FaChartBar, 
  FaCalendarAlt, 
  FaFilter,
  FaInfoCircle,
  FaStar,
  FaLightbulb,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaTimes,
  FaExpand,
  FaUserTie,
  FaCog,
  FaBriefcase,
  FaHashtag,
  FaChartPie,
  FaDiversity,
  FaHistory,
  FaExternalLinkAlt
} from "react-icons/fa";
import WordCloud from "react-wordcloud";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";
import axios from "axios";

// 메인 화면과 동일한 API 주소 사용
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://192.168.101.51:8000';

export default function CareerRoadmapMain({ darkMode = false, setSelectedPage, roadmapData = { bootcamps: [], courses: [] } }) {
  // 추천 로드맵 상태 추가
  const [recommendedRoadmaps, setRecommendedRoadmaps] = useState({ bootcamps: [], courses: [] });
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  
  // 트렌드 분석 상태
  const [jobNames, setJobNames] = useState([]);
  const [selectedTrendJob, setSelectedTrendJob] = useState("");
  const [selectedField, setSelectedField] = useState("tech_stack");
  const [visualizationType, setVisualizationType] = useState("wordcloud");
  const [skillData, setSkillData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 주간 비교를 위한 상태 추가
  const [startWeek, setStartWeek] = useState("");
  const [endWeek, setEndWeek] = useState("");
  const [year, setYear] = useState("");
  
  // 주간 비교 팝업 상태
  const [showWeeklyComparisonPopup, setShowWeeklyComparisonPopup] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const [selectedComparisonType, setSelectedComparisonType] = useState("all_skills");

  const [showGapInsightsPopup, setShowGapInsightsPopup] = useState(false);
  
  // 로드맵 상세 팝업 상태
  const [showRoadmapDetail, setShowRoadmapDetail] = useState(false);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [showOvercomeDetail, setShowOvercomeDetail] = useState(false);
  const [selectedOvercomeItem, setSelectedOvercomeItem] = useState(null);

  const [detailLoading, setDetailLoading] = useState(false);

  // 갭 분석 상태
  const [gapResult, setGapResult] = useState("");
  const [topSkills, setTopSkills] = useState([]);
  const [gapLoading, setGapLoading] = useState(false);

  // 필드 타입 옵션 (수정된 아이콘)
  const fieldOptions = [
    { value: "tech_stack", label: "기술 스택", icon: <FaCog /> },
    { value: "required_skills", label: "요구 스택", icon: <FaUserTie /> },
    { value: "preferred_skills", label: "우대 사항", icon: <FaStar /> },
    { value: "main_tasks_skills", label: "주요 업무", icon: <FaBriefcase /> }
  ];

  // 1. 상태 분리
  const [trendJobNames, setTrendJobNames] = useState([]);
  const [gapJobNames, setGapJobNames] = useState([]);
  const [selectedGapJob, setSelectedGapJob] = useState("");
  
  // ✨ [추가] 찜한 로드맵 ID 목록을 저장할 상태
  const [savedRoadmapIds, setSavedRoadmapIds] = useState(new Set());

  // 초기화 완료 상태 추가
  const [isInitialized, setIsInitialized] = useState(false);

  // URL 파라미터를 통해 특정 섹션으로 스크롤하는 기능
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    
    if (section) {
      setTimeout(() => {
        const targetSection = document.getElementById(section);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, []);

  // 2. 직무명 리스트 fetch 및 사용자 관심직무 자동 적용 - 수정된 버전
  useEffect(() => {
    let isMounted = true;
    
    const fetchJobNamesAndSetUserJob = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/job-skills/job-names/with-posts`);
        if (isMounted) {
          const jobList = response.data.map(job => job.name);
          setJobNames(jobList);
          
          // 사용자 관심직무 가져오기
          const token = localStorage.getItem("accessToken");
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          
          try {
            const { data: userDesiredJob } = await axios.get(`${BASE_URL}/users/desired-job`, { headers });
            console.log('✅ [CareerRoadmapMain] 사용자 관심직무:', userDesiredJob);
            
            // 사용자 관심직무가 직무 목록에 있는지 확인
            if (userDesiredJob && jobList.includes(userDesiredJob)) {
              setSelectedTrendJob(userDesiredJob);
              setSelectedGapJob(userDesiredJob);
            } else if (jobList.length > 0) {
              setSelectedTrendJob(jobList[0]);
              setSelectedGapJob(jobList[0]);
            }
          } catch (err) {
            console.warn('사용자 관심직무 조회 실패, 기본값 사용:', err);
            if (jobList.length > 0) {
              setSelectedTrendJob(jobList[0]);
              setSelectedGapJob(jobList[0]);
            }
          }
          
          // 초기화 완료 표시
          setIsInitialized(true);
        }
      } catch (error) {
        if (isMounted) {
          setJobNames([]);
          setIsInitialized(true);
        }
      }
    };
    fetchJobNamesAndSetUserJob();

    return () => {
      isMounted = false;
    };
  }, []);

  // ✨ [추가] 찜한 로드맵 ID 목록 불러오기
  useEffect(() => {
    const fetchSavedRoadmapIds = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const response = await axios.get(`${BASE_URL}/user_roadmaps/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (Array.isArray(response.data)) {
          setSavedRoadmapIds(new Set(response.data.map(item => item.roadmaps_id)));
        }
      } catch (error) {
        console.warn("찜한 로드맵 목록 로드 실패:", error);
      }
    };

    fetchSavedRoadmapIds();
  }, []);

  // ✨ [추가] 전역 이벤트 리스너 추가 (다른 컴포넌트에서 찜하기/찜취소 시 새로고침)
  useEffect(() => {
    const handleRoadmapBookmarkChange = async () => {
      console.log('🔄 CareerRoadmapMain 찜 상태 변경 이벤트 발생');
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const response = await axios.get(`${BASE_URL}/user_roadmaps/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (Array.isArray(response.data)) {
          setSavedRoadmapIds(new Set(response.data.map(item => item.roadmaps_id)));
        }
      } catch (error) {
        console.warn("찜한 로드맵 목록 새로고침 실패:", error);
      }
    };

    window.addEventListener('roadmapBookmarkChanged', handleRoadmapBookmarkChange);

    return () => {
      window.removeEventListener('roadmapBookmarkChanged', handleRoadmapBookmarkChange);
    };
  }, []);

  // 추천 로드맵 fetch - 초기화 완료 후에만 실행
  useEffect(() => {
    if (isInitialized && selectedTrendJob) {
      fetchRecommendedRoadmaps();
    }
  }, [isInitialized, selectedTrendJob]);

  // 3. 스킬 데이터 fetch (selectedTrendJob, selectedField 기준) - 초기화 완료 후에만 실행
  useEffect(() => {
    if (!isInitialized || !selectedTrendJob) return;
    
    console.log("트렌드 데이터 요청 - 직무:", selectedTrendJob, "필드:", selectedField);

    let isMounted = true;
    
    const fetchSkillData = async () => {
      if (!selectedTrendJob) return;
      
      try {
        setLoading(true);
        setError(null);

        let apiResponse;
        let data;

        if (visualizationType === "wordcloud") {
          apiResponse = await axios.get(`${BASE_URL}/visualization/weekly_skill_frequency_current`, {
            params: {
              job_name: selectedTrendJob,
              field: selectedField
            }
          });
          data = apiResponse.data;
        } else if (visualizationType === "trend") {
          apiResponse = await axios.get(`${BASE_URL}/stats/trend/${selectedTrendJob}`, {
            params: {
              field_type: selectedField,
              week: 29
            }
          });
          data = apiResponse.data;
        } else if (visualizationType === "weekly_comparison") {
          if (!startWeek || !endWeek || !year) {
            setSkillData([]);
            setLoading(false);
            return;
          }
          
          console.log('주간 비교 API 호출:', {
            job_name: selectedTrendJob,
            field: selectedField,
            start_week: startWeek,
            end_week: endWeek,
            year: year
          });
          
          apiResponse = await axios.get(`${BASE_URL}/visualization/weekly_skill_frequency_comparison`, {
            params: {
              job_name: selectedTrendJob,
              field: selectedField,
              week1: parseInt(startWeek),
              week2: parseInt(endWeek),
              year: parseInt(year)
            }
          });
          data = apiResponse.data;
        } else {
          apiResponse = await axios.get(`${BASE_URL}/stats/weekly/${selectedTrendJob}`, {
            params: { week: 29 }
          });
          data = apiResponse.data;
        }

        console.log("✅ [fetchSkillData] API 응답:", data);
        console.log("✅ [fetchSkillData] 응답 타입:", typeof data);
        console.log("✅ [fetchSkillData] 배열 여부:", Array.isArray(data));
        console.log("✅ [fetchSkillData] 데이터 길이:", data?.length);

        if (!data || !Array.isArray(data) || data.length === 0) {
          console.log("❌ [fetchSkillData] 데이터가 없거나 유효하지 않음");
          setError("해당 직무의 데이터가 없습니다.");
          setSkillData([]);
          return;
        }

        if (isMounted) {
          const processedData = processApiResponse(data, visualizationType);
          console.log("✅ [fetchSkillData] 처리된 데이터:", processedData);
          setSkillData(processedData);
        }

      } catch (error) {
        console.error('❌ [fetchSkillData] 스킬 데이터 조회 실패:', error);
        console.error('❌ [fetchSkillData] 에러 응답:', error.response?.data);
        
        if (isMounted) {
          if (error.response?.status === 404) {
            setError("해당 직무의 데이터가 없습니다. 다른 직무를 선택해보세요.");
          } else if (error.response?.status === 500) {
            setError("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
          } else if (error.response?.status === 401) {
            setError("인증이 필요합니다.");
          } else if (error.response?.status === 400) {
            setError("잘못된 요청입니다. 파라미터를 확인해주세요.");
          } else {
            setError("데이터를 불러오는데 실패했습니다. 네트워크 연결을 확인해주세요.");
          }
          
          setSkillData([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSkillData();

    return () => {
      isMounted = false;
    };
  }, [isInitialized, selectedTrendJob, selectedField, visualizationType, startWeek, endWeek, year]);

  // 4. 갭 분석 데이터 fetch (selectedGapJob 기준) - 초기화 완료 후에만 실행
  const fetchGapAnalysis = async () => {
    if (!selectedGapJob) return;
    
    try {
      setGapLoading(true);
      
      const token = localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${BASE_URL}/visualization/gap-analysis`, {
        headers,
        params: {
          category: selectedGapJob,
          force_refresh: false
        }
      });
      
      const data = response.data;
      setGapResult(data.gap_result);
      setTopSkills(data.top_skills);
      
      console.log('✅ [CareerRoadmapMain] 갭 분석 완료 (캐시 활용):', data);
    } catch (err) {
      console.error('❌ [CareerRoadmapMain] 갭 분석 실패:', err);
      setGapResult("갭 분석을 불러오는데 실패했습니다.");
    } finally {
      setGapLoading(false);
    }
  };

  // useEffect에서 fetchGapAnalysis 호출 - 초기화 완료 후에만 실행
  useEffect(() => {
    if (isInitialized && selectedGapJob) {
      fetchGapAnalysis();
    }
  }, [isInitialized, selectedGapJob]);

  // 캐시 초기화 함수 추가
  const clearCache = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.delete(`${BASE_URL}/visualization/cache/clear`, { headers });
      console.log('✅ [CareerRoadmapMain] 캐시 초기화 완료');
      
      // 캐시 초기화 후 갭 분석 다시 호출
      fetchGapAnalysis();
    } catch (err) {
      console.error('❌ [CareerRoadmapMain] 캐시 초기화 실패:', err);
    }
  };

  // 캐시 상태 조회 함수 추가
  const getCacheStatus = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${BASE_URL}/visualization/cache/status`, { headers });
      console.log('✅ [CareerRoadmapMain] 캐시 상태:', response.data);
      return response.data;
    } catch (err) {
      console.error('❌ [CareerRoadmapMain] 캐시 상태 조회 실패:', err);
    }
  };

  // 추천 로드맵 가져오기 - 캐시 활용으로 수정
  const fetchRecommendedRoadmaps = async () => {
    setRecommendationLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // 캐시를 활용한 로드맵 추천 호출
      const response = await axios.get(`${BASE_URL}/visualization/roadmap_recommendations`, { 
        params: { 
          category: selectedTrendJob,  // 직무별로 필터링
          limit: 10,
          force_refresh: false  // 캐시 우선 사용
        },
        headers 
      });
      
      console.log('✅ [CareerRoadmapMain] 로드맵 추천 완료 (캐시 활용):', response.data);
      
      // 부트캠프와 강의로 분류
      const bootcamps = response.data.filter(item => item.type === '부트캠프').slice(0, 5);
      const courses = response.data.filter(item => item.type === '강의').slice(0, 5);
      
      setRecommendedRoadmaps({ bootcamps, courses });
    } catch (error) {
      console.error('❌ [CareerRoadmapMain] 로드맵 추천 실패:', error);
      setRecommendedRoadmaps({ bootcamps: [], courses: [] });
    } finally {
      setRecommendationLoading(false);
    }
  };

  // 특정 로드맵 상세 조회
  const fetchRoadmapDetail = async (roadmapId) => {
    setDetailLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${BASE_URL}/roadmaps/${roadmapId}`, { headers });
      setSelectedRoadmap(response.data);
      setShowRoadmapDetail(true);
    } catch (error) {
      console.error('로드맵 상세 조회 실패:', error);
      // 에러 시 기존 데이터로 팝업 표시
      setShowRoadmapDetail(true);
    } finally {
      setDetailLoading(false);
    }
  };

  // 극복 방안 아이템 클릭 핸들러
  const handleOvercomeItemClick = async (item) => {
    try {
      // 상세 정보를 다시 API로 조회하여 최신 데이터 가져오기
      const token = localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${BASE_URL}/roadmaps/${item.id}`, { headers });
      setSelectedOvercomeItem(response.data);
      setShowOvercomeDetail(true);
    } catch (error) {
      console.error('극복 방안 상세 조회 실패:', error);
      // API 호출 실패 시 기존 데이터 사용
      setSelectedOvercomeItem(item);
      setShowOvercomeDetail(true);
    }
  };

  // ✨ [삭제] 중복 선언 제거 - 이미 위쪽에서 선언됨
  // const [savedRoadmapIds, setSavedRoadmapIds] = useState(new Set());



  // 찜하기/찜취소 핸들러
  const handleToggleSave = async (roadmapId) => {
    // ✨ [추가] 디버깅을 위해 현재 토큰 값을 콘솔에 출력합니다.
    const token = localStorage.getItem("accessToken");
    console.log("찜하기 버튼 클릭 시 토큰:", token);
    
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    const isSaved = savedRoadmapIds.has(roadmapId);

    try {
      if (isSaved) {
        // 찜취소
        await axios.delete(`${BASE_URL}/user_roadmaps/${roadmapId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSavedRoadmapIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(roadmapId);
          return newSet;
        });
        alert("찜이 해제되었습니다.");
        // 전역 이벤트 발생
        window.dispatchEvent(new CustomEvent('roadmapBookmarkChanged'));
      } else {
        // 찜하기
        await axios.post(`${BASE_URL}/user_roadmaps/`, {
          roadmaps_id: roadmapId
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSavedRoadmapIds(prev => new Set(prev).add(roadmapId));
        alert("로드맵이 찜 되었습니다!");
        // 전역 이벤트 발생
        window.dispatchEvent(new CustomEvent('roadmapBookmarkChanged'));
      }
    } catch (error) {
      console.error("찜하기/찜취소 실패:", error);
      if (error.response?.status === 400) {
        alert("이미 찜한 로드맵입니다.");
      } else {
        alert("처리 중 오류가 발생했습니다.");
      }
    }
  };

  // 메인 화면과 동일한 데이터 처리 방식
  const processApiResponse = (data, type) => {
    console.log('🔍 [processApiResponse] 입력 데이터:', data);
    console.log('🔍 [processApiResponse] 타입:', type);
    
    if (!data || !Array.isArray(data)) {
      console.log('❌ [processApiResponse] 데이터가 없거나 배열이 아님');
      return [];
    }

    if (type === "wordcloud") {
      // 워드클라우드용 데이터 처리 - API 응답 구조에 맞게 수정
      const processedData = data.map(item => {
        // API 응답에서 skill과 count 필드 추출
        const skill = item.skill || item.skill_name || '';
        const count = item.count || item.frequency || 0;
        
        // 트렌드 계산 (이전 데이터가 없으면 stable로 설정)
        const trend = calculateTrend(count, item.previous_count || 0);
        
        return {
          skill: skill,
          count: count,
          year: item.year,
          week: item.week,
          week_day: item.week ? `${item.week}.${(item.year || new Date().getFullYear()) % 100}` : '',
          trend: trend
        };
      }).filter(item => item.skill && item.count > 0); // 빈 데이터 필터링
      
      console.log('✅ [processApiResponse] 워드클라우드 처리 결과:', processedData);
      return processedData;
      
    } else if (type === "trend") {
      const processedData = data.map(item => {
        const trend = calculateTrend(item.count, item.previous_count || 0);
        return {
          skill: item.skill || item.skill_name,
          count: item.count || item.frequency,
          week_day: item.week_day,
          date: item.date,
          trend: trend
        };
      });
      
      console.log('✅ [processApiResponse] 트렌드 처리 결과:', processedData);
      return processedData;
      
    } else if (type === "weekly_comparison") {
      // FastAPI docs 응답 구조: [{year, week, skill, count}]
      const weeklyData = {};
      
      data.forEach(item => {
        if (!weeklyData[item.week]) {
          weeklyData[item.week] = [];
        }
        weeklyData[item.week].push({
          skill: item.skill,
          count: item.count,
          week: item.week,
          year: item.year
        });
      });

      const skillComparison = {};
      Object.keys(weeklyData).forEach(week => {
        weeklyData[week].forEach(item => {
          if (!skillComparison[item.skill]) {
            skillComparison[item.skill] = {};
          }
          skillComparison[item.skill][week] = item.count;
        });
      });

      const processedData = Object.keys(skillComparison).map(skill => {
        const weeks = Object.keys(skillComparison[skill]).sort();
        const beforeCount = skillComparison[skill][weeks[0]] || 0;
        const afterCount = skillComparison[skill][weeks[weeks.length - 1]] || 0;
        
        return {
          skill: skill,
          beforeCount: beforeCount,
          afterCount: afterCount,
          change: afterCount - beforeCount,
          changePercent: beforeCount > 0 ? ((afterCount - beforeCount) / beforeCount * 100) : 0,
          trend: afterCount > beforeCount ? "up" : afterCount < beforeCount ? "down" : "stable"
        };
      }).sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
      
      console.log('✅ [processApiResponse] 주간 비교 처리 결과:', processedData);
      return processedData;
      
    } else {
      const processedData = data.map(item => {
        const trend = calculateTrend(item.count || item.frequency, item.previous_count || 0);
        return {
          skill: item.skill || item.skill_name,
          count: item.count || item.frequency,
          week_day: item.week_day,
          trend: trend
        };
      });
      
      console.log('✅ [processApiResponse] 기본 처리 결과:', processedData);
      return processedData;
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <FaArrowUp style={{ color: "#28a745" }} />;
      case "down":
        return <FaArrowDown style={{ color: "#dc3545" }} />;
      default:
        return <FaMinus style={{ color: "#6c757d" }} />;
    }
  };



  // 분석 기준에 따른 라벨 반환 함수 추가
  const getFieldLabel = (field) => {
    switch(field) {
      case "tech_stack":
        return "기술스택";
      case "required_skills":
        return "요구스택";
      case "preferred_skills":
        return "우대사항";
      case "main_tasks_skills":
        return "주요업무";
      default:
        return "기술";
    }
  };



  // calculateTrend 함수 추가
  const calculateTrend = (currentCount, previousCount) => {
    if (previousCount === 0) return "stable";
    
    const changeRatio = currentCount / previousCount;
    if (changeRatio > 1.1) return "up";
    if (changeRatio < 0.9) return "down";
    return "stable";
  };

  // 고유한 기술 개수 계산 함수
  const getUniqueSkillsCount = () => {
    console.log('🔍 [getUniqueSkillsCount] skillData:', skillData);
    
    const uniqueSkills = new Set();
    skillData.forEach(item => {
      if (item.skill && item.skill.trim()) {
        uniqueSkills.add(item.skill.trim());
      }
    });
    
    const count = uniqueSkills.size;
    console.log('✅ [getUniqueSkillsCount] 결과:', count);
    return count;
  };

  // 최고 인기 기술의 점유율 계산 함수
  const getTopSkillPercentage = () => {
    console.log('🔍 [getTopSkillPercentage] skillData:', skillData);
    
    if (skillData.length === 0) {
      console.log('❌ [getTopSkillPercentage] 데이터 없음');
      return 0;
    }
    
    const totalCount = skillData.reduce((sum, skill) => sum + (skill.count || 0), 0);
    const maxCount = Math.max(...skillData.map(item => item.count || 0));
    
    console.log('🔍 [getTopSkillPercentage] totalCount:', totalCount, 'maxCount:', maxCount);
    
    if (totalCount === 0) {
      console.log('❌ [getTopSkillPercentage] 총 카운트가 0');
      return 0;
    }
    
    const percentage = Math.round((maxCount / totalCount) * 100);
    console.log('✅ [getTopSkillPercentage] 결과:', percentage + '%');
    return percentage;
  };

  // 기술 다양성 지수 계산 (새로운 지표)
  const getSkillDiversityIndex = () => {
    console.log('🔍 [getSkillDiversityIndex] skillData:', skillData);
    
    if (skillData.length === 0) {
      console.log('❌ [getSkillDiversityIndex] 데이터 없음');
      return 0;
    }
    
    const totalCount = skillData.reduce((sum, skill) => sum + (skill.count || 0), 0);
    if (totalCount === 0) {
      console.log('❌ [getSkillDiversityIndex] 총 카운트가 0');
      return 0;
    }
    
    // 각 기술의 비율 계산
    const proportions = skillData.map(skill => (skill.count || 0) / totalCount);
    
    // Shannon 다양성 지수 계산 (H = -Σ(p * log(p)))
    const diversityIndex = -proportions.reduce((sum, p) => {
      if (p > 0) return sum + (p * Math.log(p));
      return sum;
    }, 0);
    
    // 0-100 스케일로 변환 (최대값은 log(기술개수))
    const maxDiversity = Math.log(skillData.length);
    const result = maxDiversity > 0 ? Math.round((diversityIndex / maxDiversity) * 100) : 0;
    
    console.log('✅ [getSkillDiversityIndex] 결과:', result);
    return result;
  };

  // 상승 중인 기술 개수 계산
  const getRisingSkillsCount = () => {
    return skillData.filter(skill => skill.trend === "up").length;
  };

  // 워드클라우드 데이터 가져오기 (첫 번째 버튼) - 올바른 엔드포인트로 수정
  const fetchWordCloudData = async () => {
    if (!selectedTrendJob) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // FastAPI 문서에 따른 올바른 엔드포인트 사용
      const response = await axios.get(`${BASE_URL}/visualization/weekly_skill_frequency_current`, {
        params: {
          job_name: selectedTrendJob,
          field: selectedField
        }
      });
      
      const data = response.data;
      console.log('✅ [CareerRoadmapMain] 워드클라우드 데이터:', data);
      
      // 워드클라우드 형식으로 변환
      const wordCloudData = data.map(item => ({
        text: item.skill,
        value: item.count
      }));
      
      setSkillData(wordCloudData);
    } catch (err) {
      console.error('❌ [CareerRoadmapMain] 워드클라우드 데이터 조회 실패:', err);
      setError('워드클라우드 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 주간 비교 데이터 가져오기 (두 번째 버튼) - 이미 올바른 엔드포인트 사용 중
  const fetchWeeklyComparison = async () => {
    if (!selectedTrendJob || !startWeek || !endWeek || !year) {
      setError('주차와 연도를 모두 입력해주세요.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${BASE_URL}/visualization/weekly_skill_frequency_comparison`, {
        params: {
          job_name: selectedTrendJob,
          field: selectedField,
          week1: parseInt(startWeek),
          week2: parseInt(endWeek),
          year: parseInt(year)
        }
      });
      
      setComparisonData(response.data);
      setShowWeeklyComparisonPopup(true);
      console.log('✅ [CareerRoadmapMain] 주간 비교 데이터:', response.data);
    } catch (err) {
      console.error('❌ [CareerRoadmapMain] 주간 비교 데이터 조회 실패:', err);
      setError('주간 비교 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 시각화 타입 변경 시 데이터 가져오기
  useEffect(() => {
    if (visualizationType === "wordcloud" && selectedTrendJob) {
      fetchWordCloudData();
    }
  }, [visualizationType, selectedTrendJob, selectedField]);

  // 캐시 설정
  const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4시간
  const SKILL_CACHE_KEY = 'skill_data_cache';
  const SKILL_CACHE_TIMESTAMP_KEY = 'skill_data_timestamp';

  // 캐시된 데이터 로드
  const loadCachedSkillData = (cacheKey) => {
    try {
      const cachedData = localStorage.getItem(`${SKILL_CACHE_KEY}_${cacheKey}`);
      const timestamp = localStorage.getItem(`${SKILL_CACHE_TIMESTAMP_KEY}_${cacheKey}`);
      
      if (cachedData && timestamp) {
        const now = Date.now();
        const cacheAge = now - parseInt(timestamp);
        
        if (cacheAge < CACHE_DURATION) {
          return JSON.parse(cachedData);
        }
      }
    } catch (error) {
      console.error('스킬 데이터 캐시 로드 실패:', error);
    }
    return null;
  };

  // 스킬 데이터 캐시 저장
  const saveCachedSkillData = (cacheKey, data) => {
    try {
      localStorage.setItem(`${SKILL_CACHE_KEY}_${cacheKey}`, JSON.stringify(data));
      localStorage.setItem(`${SKILL_CACHE_TIMESTAMP_KEY}_${cacheKey}`, Date.now().toString());
    } catch (error) {
      console.error('스킬 데이터 캐시 저장 실패:', error);
    }
  };

  return (
    <Container $darkMode={darkMode}>
      {/* ───────────── 트렌드 분석 ───────────── */}
      <SectionCard>
        <HeaderSection $darkMode={darkMode}>
          <HeaderLeft>
            <Title>트렌드 분석</Title>
            <Subtitle $darkMode={darkMode}>
              채용 시장의 기술 트렌드를 분석하여 인기 기술을 파악해보세요.
            </Subtitle>
          </HeaderLeft>
          <HeaderRight>
          </HeaderRight>
        </HeaderSection>

        <CompactControlPanel $darkMode={darkMode}>
          <ControlGroup>
            <ControlLabel $darkMode={darkMode}>
              <FaChartLine />
              직무 선택
            </ControlLabel>
            <Select 
              $darkMode={darkMode}
              value={selectedTrendJob}
              onChange={(e) => setSelectedTrendJob(e.target.value)}
            >
              {jobNames.map((job) => (
                <option key={job} value={job}>
                  {job}
                </option>
              ))}
            </Select>
          </ControlGroup>

          <ControlGroup>
            <ControlLabel $darkMode={darkMode}>
              <FaFilter />
              분석 기준
            </ControlLabel>
            <Select 
              $darkMode={darkMode}
              value={selectedField} 
              onChange={(e) => setSelectedField(e.target.value)}
            >
              {fieldOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </ControlGroup>

          <ControlGroup>
            <ControlLabel $darkMode={darkMode}>
              <FaChartBar />
              시각화
            </ControlLabel>
            <VisualizationToggle>
              <ToggleButton 
                $active={visualizationType === "wordcloud"}
                $darkMode={darkMode}
                onClick={() => setVisualizationType("wordcloud")}
              >
                <FaCloud />
              </ToggleButton>
              <ToggleButton 
                $active={visualizationType === "weekly_comparison"}
                $darkMode={darkMode}
                onClick={() => setVisualizationType("weekly_comparison")}
              >
                <FaCalendarAlt />
              </ToggleButton>
              <ToggleButton 
                $active={visualizationType === "trend"}
                $darkMode={darkMode}
                onClick={() => setVisualizationType("trend")}
              >
                <FaChartLine />
              </ToggleButton>
            </VisualizationToggle>
          </ControlGroup>
        </CompactControlPanel>

        <MainVisualizationArea $darkMode={darkMode} $visualizationType={visualizationType}>
          {loading ? (
            <LoadingContainer>
              <LoadingSpinner />
              <LoadingText>데이터를 불러오는 중...</LoadingText>
            </LoadingContainer>
          ) : error ? (
            <ErrorContainer>
              <ErrorIcon>
                <FaExclamationTriangle />
              </ErrorIcon>
              <ErrorMessage>{error}</ErrorMessage>
              <ErrorNote>샘플 데이터를 표시합니다.</ErrorNote>
            </ErrorContainer>
          ) : (visualizationType === "weekly_comparison" || skillData.length > 0) ? (
            <>
              {visualizationType === "wordcloud" && (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    transform: 'translateX(30px)' // 우측으로 30px 이동 (조정 가능)
                  }}>
                    <WordCloud
                      words={skillData} // 이미 올바른 형식이므로 매핑 제거
                      options={{
                        rotations: 0,
                        fontSizes: [18, 60],
                        fontFamily: "Pretendard, sans-serif",
                        enableTooltip: false,
                        deterministic: true,
                        removeDuplicateWords: false,
                        colors: ["#264653", "#2a9d8f", "#e76f51", "#f4a261", "#e9c46a"],
                        spiral: "archimedean",
                        layout: "wordcloud",
                      }}
                      size={[520, 260]}
                    />
                  </div>
                </div>
              )}

              {visualizationType === "trend" && (
                <TrendChartContainer>
                  <ChartTitle>기술 트렌드 분석</ChartTitle>
                  <CompactTrendGrid>
                    {skillData.slice(0, 12).map((item, index) => (
                      <TrendCard key={index} $darkMode={darkMode}>
                        <TrendCardHeader>
                          <TrendCardTitle>{item.skill}</TrendCardTitle>
                          <TrendCardRank>#{index + 1}</TrendCardRank>
                        </TrendCardHeader>
                        <TrendCardBody>
                          <TrendCardCount>{item.count}</TrendCardCount>
                          <TrendCardTrend $trend={item.trend}>
                            {getTrendIcon(item.trend)}
                          </TrendCardTrend>
                        </TrendCardBody>
                      </TrendCard>
                    ))}
                  </CompactTrendGrid>
                </TrendChartContainer>
              )}

              {visualizationType === "weekly_comparison" && (
                <WeeklyComparisonContainer>
                  {!startWeek || !endWeek || !year ? (
                    <WeeklyInputContainer $darkMode={darkMode}>
                      <WeeklyInputTitle $darkMode={darkMode}>
                        <FaHistory style={{ marginRight: '0.5rem' }} />
                        주간 스킬 빈도 조회 (주차 범위 지정)
                      </WeeklyInputTitle>
                      <WeeklyInputDescription $darkMode={darkMode}>
                        선택한 직무명과 분석 필드에 대해, 지정된 주차 범위의 채용공고에서 추출된 기술/키워드의 주별 등장 빈도를 집계하여 반환합니다.
                      </WeeklyInputDescription>
                      
                      <WeeklyInputGrid>
                        <FilterGroup>
                          <FilterLabel $darkMode={darkMode}>시작 주차 *</FilterLabel>
                          <FilterSelect 
                            value={startWeek} 
                            onChange={(e) => setStartWeek(e.target.value)}
                            $darkMode={darkMode}
                            required
                          >
                            <option value="">선택하세요</option>
                            {Array.from({length: 53}, (_, i) => i + 1).map(week => (
                              <option key={week} value={week}>{week}주차</option>
                            ))}
                          </FilterSelect>
                        </FilterGroup>

                        <FilterGroup>
                          <FilterLabel $darkMode={darkMode}>마감 주차 *</FilterLabel>
                          <FilterSelect 
                            value={endWeek} 
                            onChange={(e) => setEndWeek(e.target.value)}
                            $darkMode={darkMode}
                            required
                          >
                            <option value="">선택하세요</option>
                            {Array.from({length: 53}, (_, i) => i + 1).map(week => (
                              <option key={week} value={week}>{week}주차</option>
                            ))}
                          </FilterSelect>
                        </FilterGroup>

                        <FilterGroup>
                          <FilterLabel $darkMode={darkMode}>연도 *</FilterLabel>
                          <FilterSelect 
                            value={year} 
                            onChange={(e) => setYear(e.target.value)}
                            $darkMode={darkMode}
                            required
                          >
                            <option value="">선택하세요</option>
                            {[2024, 2025, 2026].map(year => (
                              <option key={year} value={year}>{year}년</option>
                            ))}
                          </FilterSelect>
                        </FilterGroup>
                      </WeeklyInputGrid>
                      
                      {startWeek && endWeek && parseInt(startWeek) >= parseInt(endWeek) && (
                        <InputError $darkMode={darkMode}>
                          마감 주차는 시작 주차보다 커야 합니다.
                        </InputError>
                      )}
                      
                      <InputInfo $darkMode={darkMode}>
                        <FaInfoCircle style={{ marginRight: '0.5rem' }} />
                        현재 29주차, 30주차에 데이터가 있습니다. 해당 범위로 설정해보세요.
                      </InputInfo>
                    </WeeklyInputContainer>
                  ) : (
                    <WeeklyComparisonResult>
                      <ComparisonHeader>
                        <ComparisonTitle>주간 스킬 변화 분석</ComparisonTitle>
                        <ComparisonSubtitle>
                          {startWeek}주차 → {endWeek}주차 ({year}년)
                        </ComparisonSubtitle>
                        <FullViewButton 
                          onClick={() => setShowWeeklyComparisonPopup(true)}
                          $darkMode={darkMode}
                        >
                          <FaExternalLinkAlt />
                          전체 보기
                        </FullViewButton>
                      </ComparisonHeader>
                      
                      <ComparisonGrid>
                        {skillData.slice(0, 10).map((item, index) => (
                          <ComparisonCard key={index} $darkMode={darkMode}>
                            <SkillName $darkMode={darkMode}>{item.skill}</SkillName>
                            
                            <ComparisonData>
                              <BeforeAfterSection>
                                <BeforeSection>
                                  <BeforeLabel>이전</BeforeLabel>
                                  <BeforeCount>{item.beforeCount || 0}</BeforeCount>
                                </BeforeSection>
                                
                                <ArrowSection>
                                  {getTrendIcon(item.trend || "stable")}
                                </ArrowSection>
                                
                                <AfterSection>
                                  <AfterLabel>이후</AfterLabel>
                                  <AfterCount $trend={item.trend || "stable"}>{item.afterCount || 0}</AfterCount>
                                </AfterSection>
                              </BeforeAfterSection>
                              
                              <ChangeInfo>
                                <ChangeAmount $trend={item.trend || "stable"}>
                                  {item.change > 0 ? '+' : ''}{item.change || 0}
                                </ChangeAmount>
                                <ChangePercent $trend={item.trend || "stable"}>
                                  ({item.changePercent > 0 ? '+' : ''}{(item.changePercent || 0).toFixed(1)}%)
                                </ChangePercent>
                              </ChangeInfo>
                            </ComparisonData>
                          </ComparisonCard>
                        ))}
                      </ComparisonGrid>
                    </WeeklyComparisonResult>
                  )}
                </WeeklyComparisonContainer>
              )}
            </>
          ) : (
            <NoDataText $darkMode={darkMode}>
              데이터가 없습니다.
            </NoDataText>
          )}
        </MainVisualizationArea>

        {/* 인사이트 보기 버튼 추가 */}
        {/* <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <InsightsButton onClick={() => setShowInsightsPopup(true)}>
            인사이트 보기
          </InsightsButton>
        </div> */}

        {/* 하단 통계 - 주간 비교가 아닐 때만 표시 */}
        {visualizationType !== "weekly_comparison" && (
          <QuickStats $darkMode={darkMode}>
            <StatItem 
              $darkMode={darkMode}
              title="채용공고에서 언급된 서로 다른 기술의 총 개수 (중복 제외)"
            >
              <StatIcon>
                <FaHashtag />
              </StatIcon>
              <StatValue>{getUniqueSkillsCount()}</StatValue>
              <StatLabel $darkMode={darkMode}>기술 개수</StatLabel>
            </StatItem>
            <StatItem 
              $darkMode={darkMode}
              title="채용공고에서 가장 많이 언급된 기술 키워드"
            >
              <StatIcon>
                <FaStar />
              </StatIcon>
              <StatValue>
                {skillData.length > 0 && skillData[0]?.skill ? skillData[0].skill : '데이터 없음'}
              </StatValue>
              <StatLabel $darkMode={darkMode}>최고 인기</StatLabel>
            </StatItem>
            <StatItem 
              $darkMode={darkMode}
              title="최고 인기 기술이 전체 기술 언급 중 차지하는 비율 (%)"
            >
              <StatIcon>
                <FaChartBar />
              </StatIcon>
              <StatValue>{getTopSkillPercentage()}%</StatValue>
              <StatLabel $darkMode={darkMode}>최고 점유율</StatLabel>
            </StatItem>
            <StatItem 
              $darkMode={darkMode}
              title="기술 분포의 다양성 지수 (0-100, 높을수록 다양함)"
            >
              <StatIcon>
                <FaChartPie />
              </StatIcon>
              <StatValue>{getSkillDiversityIndex()}</StatValue>
              <StatLabel $darkMode={darkMode}>기술 다양성</StatLabel>
            </StatItem>
          </QuickStats>
        )}
      </SectionCard>

      {/* 주간 비교 팝업 */}
      {showWeeklyComparisonPopup && comparisonData && (
        <WeeklyComparisonPopup onClick={() => setShowWeeklyComparisonPopup(false)}>
          <WeeklyComparisonPopupContent onClick={(e) => e.stopPropagation()}>
            <WeeklyComparisonPopupHeader>
              <WeeklyComparisonPopupTitle>
                주간 스킬 변화 분석 - 전체 보기
              </WeeklyComparisonPopupTitle>
              <PopupCloseButton 
                onClick={() => setShowWeeklyComparisonPopup(false)}
                $darkMode={darkMode}
              >
                <FaTimes />
              </PopupCloseButton>
            </WeeklyComparisonPopupHeader>
            
            <WeeklyComparisonPopupSubtitle>
              {startWeek}주차 → {endWeek}주차 ({year}년)
            </WeeklyComparisonPopupSubtitle>
            
            {/* 비교 타입 버튼들 추가 */}
            <WeeklyComparisonTypeButtons>
              <ComparisonTypeButton 
                onClick={() => setSelectedComparisonType("biggest_difference")}
                $active={selectedComparisonType === "biggest_difference"}
              >
                최대 차이
              </ComparisonTypeButton>
              <ComparisonTypeButton 
                onClick={() => setSelectedComparisonType("smallest_difference")}
                $active={selectedComparisonType === "smallest_difference"}
              >
                최소 차이
              </ComparisonTypeButton>
              <ComparisonTypeButton 
                onClick={() => setSelectedComparisonType("biggest_percentage")}
                $active={selectedComparisonType === "biggest_percentage"}
              >
                최대 비율
              </ComparisonTypeButton>
              <ComparisonTypeButton 
                onClick={() => setSelectedComparisonType("smallest_percentage")}
                $active={selectedComparisonType === "smallest_percentage"}
              >
                최소 비율
              </ComparisonTypeButton>
            </WeeklyComparisonTypeButtons>
            
            {/* 선택된 비교 타입에 따른 데이터 표시 */}
            {selectedComparisonType === "all_skills" ? (
              <WeeklyComparisonPopupGrid>
                {comparisonData.all_skills?.map((item, index) => (
                  <WeeklyComparisonPopupCard key={index} $darkMode={darkMode}>
                    <WeeklyComparisonPopupSkillName $darkMode={darkMode}>
                      {item.skill}
                    </WeeklyComparisonPopupSkillName>
                    
                    <WeeklyComparisonPopupData>
                      <WeeklyComparisonPopupBeforeAfter>
                        <WeeklyComparisonPopupBefore>
                          <WeeklyComparisonPopupLabel>Week 1</WeeklyComparisonPopupLabel>
                          <WeeklyComparisonPopupCount>{item.week1_count}</WeeklyComparisonPopupCount>
                        </WeeklyComparisonPopupBefore>
                        
                        <WeeklyComparisonPopupArrow>
                          {getTrendIcon(item.difference > 0 ? "up" : item.difference < 0 ? "down" : "stable")}
                        </WeeklyComparisonPopupArrow>
                        
                        <WeeklyComparisonPopupAfter>
                          <WeeklyComparisonPopupLabel>Week 2</WeeklyComparisonPopupLabel>
                          <WeeklyComparisonPopupCount $trend={item.difference > 0 ? "up" : item.difference < 0 ? "down" : "stable"}>
                            {item.week2_count}
                          </WeeklyComparisonPopupCount>
                        </WeeklyComparisonPopupAfter>
                      </WeeklyComparisonPopupBeforeAfter>
                      
                      <WeeklyComparisonPopupChange>
                        <WeeklyComparisonPopupChangeAmount $trend={item.difference > 0 ? "up" : item.difference < 0 ? "down" : "stable"}>
                          {item.difference > 0 ? '+' : ''}{item.difference}
                        </WeeklyComparisonPopupChangeAmount>
                        <WeeklyComparisonPopupChangePercent $trend={item.difference > 0 ? "up" : item.difference < 0 ? "down" : "stable"}>
                          ({item.percentage_change > 0 ? '+' : ''}{item.percentage_change.toFixed(1)}%)
                        </WeeklyComparisonPopupChangePercent>
                      </WeeklyComparisonPopupChange>
                    </WeeklyComparisonPopupData>
                  </WeeklyComparisonPopupCard>
                ))}
              </WeeklyComparisonPopupGrid>
            ) : (
              /* 특정 비교 타입 결과 표시 */
              comparisonData[selectedComparisonType] && (
                <WeeklyComparisonSpecificResult $darkMode={darkMode}>
                  <h4>{comparisonData[selectedComparisonType].skill}</h4>
                  <div>Week 1: {comparisonData[selectedComparisonType].week1_count}</div>
                  <div>Week 2: {comparisonData[selectedComparisonType].week2_count}</div>
                  <div>차이: {comparisonData[selectedComparisonType].difference}</div>
                  <div>비율 변화: {comparisonData[selectedComparisonType].percentage_change}%</div>
                </WeeklyComparisonSpecificResult>
              )
            )}
          </WeeklyComparisonPopupContent>
        </WeeklyComparisonPopup>
      )}

      {/* 트렌드 분석과 갭 분석 사이 화살표 */}
      <ScrollArrow>
        <IoIosArrowUp />
        <IoIosArrowUp />
        <IoIosArrowUp />
      </ScrollArrow>

      {/* ───────────── 갭 분석 ───────────── */}
      <SectionCard id="gap-analysis-section">
        <GapHeader>
          <div>
            <Title>갭 분석</Title>
            <ShortDesc>내 이력서와 공고를 비교합니다.</ShortDesc>
          </div>
          <InsightsButton onClick={() => setShowGapInsightsPopup(true)}>
            인사이트
          </InsightsButton>
        </GapHeader>

        <Divider />

        <GapControlRow>
          <ControlLabel $darkMode={darkMode}>
            <FaUserTie />
            분석 직무
          </ControlLabel>
          <Select
            $darkMode={darkMode}
            value={selectedGapJob}
            onChange={(e) => setSelectedGapJob(e.target.value)}
            style={{ width: "200px" }}
          >
            {jobNames.map((job) => (
              <option key={job} value={job}>
                {job}
              </option>
            ))}
          </Select>
        </GapControlRow>

        <GapResultArea>
          {gapLoading ? (
            <LoadingContainer>
              <LoadingSpinner />
              <LoadingText>갭 분석을 수행하는 중...</LoadingText>
            </LoadingContainer>
          ) : (
            <StyledGapResult>
              {gapResult}
              {topSkills.length > 0 && (
                <>
                  <GapHeadline>Top 부족 역량</GapHeadline>
                  <GapSkillList>
                    <ul>
                      {topSkills.map((skill, index) => (
                        <li key={index}>{skill}</li>
                      ))}
                    </ul>
                  </GapSkillList>
                </>
              )}
            </StyledGapResult>
          )}
        </GapResultArea>
      </SectionCard>

      <ScrollArrow>
        <IoIosArrowUp />
        <IoIosArrowUp />
        <IoIosArrowUp />
      </ScrollArrow>

      {/* ───────────── 극복 방안 ───────────── */}
      <SectionCard id="overcome-plan-section">
        <OvercomeHeader>
          <Title>극복 방안</Title>
          <Text>
            부족한 역량을 채우기 위한 맞춤형 부트캠프와 강의를 추천해드립니다.
          </Text>
        </OvercomeHeader>
        
        <OvercomeContent>
          {/* 직무 선택 섹션 */}
          <JobSelectionSection $darkMode={darkMode}>
            <JobSelectionHeader>
              <JobSelectionTitle>직무 선택</JobSelectionTitle>
              <JobSelectionSubtitle $darkMode={darkMode}>
                선택한 직무에 맞는 부트캠프와 강의를 추천해드립니다.
              </JobSelectionSubtitle>
            </JobSelectionHeader>
            <JobSelectionControls>
              <JobSelect 
                value={selectedTrendJob} 
                onChange={(e) => setSelectedTrendJob(e.target.value)}
                $darkMode={darkMode}
              >
                {jobNames.map((job) => (
                  <option key={job} value={job}>{job}</option>
                ))}
              </JobSelect>
              <RefreshButton onClick={fetchRecommendedRoadmaps} $darkMode={darkMode}>
                <FaFilter />
                추천 새로고침
              </RefreshButton>
            </JobSelectionControls>
          </JobSelectionSection>

          {/* 부트캠프와 강의 섹션을 나란히 배치 */}
          <OvercomeSectionsContainer>
            {/* 부트캠프 섹션 */}
            <OvercomeSection $darkMode={darkMode}>
              <OvercomeSectionHeader $darkMode={darkMode}>
                <OvercomeHeaderLeft>
                  <OvercomeIconWrapper $darkMode={darkMode}>
                    <OvercomeIcon>🎓</OvercomeIcon>
                  </OvercomeIconWrapper>
                  <OvercomeTitle $darkMode={darkMode}>부트캠프</OvercomeTitle>
                </OvercomeHeaderLeft>
                <OvercomeCount $darkMode={darkMode}>{recommendedRoadmaps.bootcamps.length}개 추천</OvercomeCount>
              </OvercomeSectionHeader>
              <OvercomeItemList>
                {recommendationLoading ? (
                  <LoadingText $darkMode={darkMode}>추천 로드맵 로딩 중...</LoadingText>
                ) : recommendedRoadmaps.bootcamps.length > 0 ? (
                  recommendedRoadmaps.bootcamps.map((item, index) => (
                    <OvercomeItem 
                      key={index} 
                      onClick={() => handleOvercomeItemClick(item)}
                    >
                      <OvercomeItemContent>
                        <OvercomeItemTitle>{item.name}</OvercomeItemTitle>
                        <OvercomeItemCompany>{item.company}</OvercomeItemCompany>
                      </OvercomeItemContent>
                      <OvercomeItemActions>
                        <OvercomeSaveButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSave(item.id);
                          }}
                          $isSaved={savedRoadmapIds.has(item.id)}
                        >
                          {savedRoadmapIds.has(item.id) ? '❤️' : '🤍'}
                        </OvercomeSaveButton>
                        <OvercomeItemArrow>→</OvercomeItemArrow>
                      </OvercomeItemActions>
                    </OvercomeItem>
                  ))
                ) : (
                  <NoDataText $darkMode={darkMode}>추천 부트캠프가 없습니다.</NoDataText>
                )}
              </OvercomeItemList>
              <OvercomeViewAllButton onClick={() => setSelectedPage("roadmap-bootcamps")}>
                <OvercomeButtonIcon>📋</OvercomeButtonIcon>
                전체 부트캠프 목록 보기
              </OvercomeViewAllButton>
            </OvercomeSection>

            {/* 강의 섹션 */}
            <OvercomeSection $darkMode={darkMode}>
              <OvercomeSectionHeader $darkMode={darkMode}>
                <OvercomeHeaderLeft>
                  <OvercomeIconWrapper $darkMode={darkMode}>
                    <OvercomeIcon>📚</OvercomeIcon>
                  </OvercomeIconWrapper>
                  <OvercomeTitle $darkMode={darkMode}>강의</OvercomeTitle>
                </OvercomeHeaderLeft>
                <OvercomeCount $darkMode={darkMode}>{recommendedRoadmaps.courses.length}개 추천</OvercomeCount>
              </OvercomeSectionHeader>
              <OvercomeItemList>
                {recommendationLoading ? (
                  <LoadingText $darkMode={darkMode}>추천 로드맵 로딩 중...</LoadingText>
                ) : recommendedRoadmaps.courses.length > 0 ? (
                  recommendedRoadmaps.courses.map((item, index) => (
                    <OvercomeItem 
                      key={index}
                      onClick={() => handleOvercomeItemClick(item)}
                    >
                      <OvercomeItemContent>
                        <OvercomeItemTitle>{item.name}</OvercomeItemTitle>
                        <OvercomeItemCompany>{item.company}</OvercomeItemCompany>
                      </OvercomeItemContent>
                      <OvercomeItemActions>
                        <OvercomeSaveButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSave(item.id);
                          }}
                          $isSaved={savedRoadmapIds.has(item.id)}
                        >
                          {savedRoadmapIds.has(item.id) ? '❤️' : '🤍'}
                        </OvercomeSaveButton>
                        <OvercomeItemArrow>→</OvercomeItemArrow>
                      </OvercomeItemActions>
                    </OvercomeItem>
                  ))
                ) : (
                  <NoDataText $darkMode={darkMode}>추천 강의가 없습니다.</NoDataText>
                )}
              </OvercomeItemList>
              <OvercomeViewAllButton onClick={() => setSelectedPage("roadmap-courses")}>
                <OvercomeButtonIcon>📋</OvercomeButtonIcon>
                전체 강의 목록 보기
              </OvercomeViewAllButton>
            </OvercomeSection>
          </OvercomeSectionsContainer>
        </OvercomeContent>
      </SectionCard>



      {/* 갭 분석 인사이트 팝업 */}
      {showGapInsightsPopup && (
        <InsightsPopup onClick={() => setShowGapInsightsPopup(false)}>
          <InsightsPopupContent $darkMode={darkMode} onClick={(e) => e.stopPropagation()}>
            <InsightsPopupHeader $darkMode={darkMode}>
              <InsightsPopupTitle>
                <FaLightbulb />
                갭 분석 인사이트
              </InsightsPopupTitle>
              <CloseButton $darkMode={darkMode} onClick={() => setShowGapInsightsPopup(false)}>
                <FaTimes />
              </CloseButton>
            </InsightsPopupHeader>
            
            <InsightsPopupBody>
              <StatsGrid>
                <StatCard $darkMode={darkMode}>
                  <StatValue>{topSkills.length}</StatValue>
                  <StatLabel $darkMode={darkMode}>부족한 역량</StatLabel>
                </StatCard>
                <StatCard $darkMode={darkMode}>
                  <StatValue>{topSkills.length > 0 ? topSkills[0] : '-'}</StatValue>
                  <StatLabel $darkMode={darkMode}>최빈 부족 역량</StatLabel>
                </StatCard>
              </StatsGrid>

              <AnalysisSection>
                <AnalysisTitle>주요 분석 결과</AnalysisTitle>
                <AnalysisList>
                  <AnalysisItem>
                    <AnalysisIcon>🎯</AnalysisIcon>
                    <AnalysisText $darkMode={darkMode}>
                      내 이력서와 공고를 비교했을 때, 최빈 부족 역량은 {topSkills.length > 0 ? topSkills[0] : '없습니다.'}입니다.
                    </AnalysisText>
                  </AnalysisItem>
                  <AnalysisItem>
                    <AnalysisIcon>📊</AnalysisIcon>
                    <AnalysisText $darkMode={darkMode}>
                      최근 채용 공고에서 요구되는 역량은 다양하게 분포되어 있으며, 특정 역량에 대한 우대는 점차 줄어들고 있습니다.
                    </AnalysisText>
                  </AnalysisItem>
                  <AnalysisItem>
                    <AnalysisIcon>💡</AnalysisIcon>
                    <AnalysisText $darkMode={darkMode}>
                      부족한 역량을 학습하여 채용 시장에서의 경쟁력을 높이는 것이 중요합니다.
                    </AnalysisText>
                  </AnalysisItem>
                </AnalysisList>
              </AnalysisSection>

              <RecommendationSection>
                <RecommendationTitle>극복 방안</RecommendationTitle>
                <RecommendationList>
                  <RecommendationItem>
                    <RecommendationIcon>🔍</RecommendationIcon>
                    <RecommendationText $darkMode={darkMode}>
                      채용 공고를 더 자세히 분석하여 요구되는 역량을 파악하세요.
                    </RecommendationText>
                  </RecommendationItem>
                  <RecommendationItem>
                    <RecommendationIcon>📚</RecommendationIcon>
                    <RecommendationText $darkMode={darkMode}>
                      부족한 역량에 대한 학습 자료를 찾아보세요.
                    </RecommendationText>
                  </RecommendationItem>
                  <RecommendationItem>
                    <RecommendationIcon>💪</RecommendationIcon>
                    <RecommendationText $darkMode={darkMode}>
                      실무 프로젝트를 통해 부족한 역량을 실제로 적용해보세요.
                    </RecommendationText>
                  </RecommendationItem>
                </RecommendationList>
              </RecommendationSection>
            </InsightsPopupBody>
          </InsightsPopupContent>
        </InsightsPopup>
      )}

      {/* 로드맵 상세 팝업 */}
      {showRoadmapDetail && selectedRoadmap && (
        <RoadmapDetailPopup onClick={() => setShowRoadmapDetail(false)}>
          <RoadmapDetailContent $darkMode={darkMode} onClick={(e) => e.stopPropagation()}>
            <RoadmapDetailHeader $darkMode={darkMode}>
              <RoadmapDetailTitle>
                {selectedRoadmap.type === '부트캠프' ? '🎓' : '📚'} {selectedRoadmap.name}
              </RoadmapDetailTitle>
              <CloseButton $darkMode={darkMode} onClick={() => setShowRoadmapDetail(false)}>
                <FaTimes />
              </CloseButton>
            </RoadmapDetailHeader>
            
            <RoadmapDetailBody>
              <RoadmapDetailInfo>
                <RoadmapDetailLabel>기관/강사</RoadmapDetailLabel>
                <RoadmapDetailValue>{selectedRoadmap.company}</RoadmapDetailValue>
              </RoadmapDetailInfo>
              
              {selectedRoadmap.status && (
                <RoadmapDetailInfo>
                  <RoadmapDetailLabel>상태</RoadmapDetailLabel>
                  <RoadmapDetailValue>{selectedRoadmap.status}</RoadmapDetailValue>
                </RoadmapDetailInfo>
              )}
              
              {selectedRoadmap.deadline && (
                <RoadmapDetailInfo>
                  <RoadmapDetailLabel>마감일</RoadmapDetailLabel>
                  <RoadmapDetailValue>{selectedRoadmap.deadline_display || selectedRoadmap.deadline}</RoadmapDetailValue>
                </RoadmapDetailInfo>
              )}
              
              {/* 부트캠프에만 있는 날짜 필드들 */}
              {selectedRoadmap.type === '부트캠프' && selectedRoadmap.start_date_display && (
                <RoadmapDetailInfo>
                  <RoadmapDetailLabel>시작일</RoadmapDetailLabel>
                  <RoadmapDetailValue>{selectedRoadmap.start_date_display}</RoadmapDetailValue>
                </RoadmapDetailInfo>
              )}
              
              {selectedRoadmap.type === '부트캠프' && selectedRoadmap.end_date_display && (
                <RoadmapDetailInfo>
                  <RoadmapDetailLabel>종료일</RoadmapDetailLabel>
                  <RoadmapDetailValue>{selectedRoadmap.end_date_display}</RoadmapDetailValue>
                </RoadmapDetailInfo>
              )}
              
              {selectedRoadmap.location && (
                <RoadmapDetailInfo>
                  <RoadmapDetailLabel>위치</RoadmapDetailLabel>
                  <RoadmapDetailValue>{selectedRoadmap.location}</RoadmapDetailValue>
                </RoadmapDetailInfo>
              )}
              
              {selectedRoadmap.onoff && (
                <RoadmapDetailInfo>
                  <RoadmapDetailLabel>진행 방식</RoadmapDetailLabel>
                  <RoadmapDetailValue>{selectedRoadmap.onoff}</RoadmapDetailValue>
                </RoadmapDetailInfo>
              )}
              
              {selectedRoadmap.participation_time && (
                <RoadmapDetailInfo>
                  <RoadmapDetailLabel>참여 시간</RoadmapDetailLabel>
                  <RoadmapDetailValue>{selectedRoadmap.participation_time}</RoadmapDetailValue>
                </RoadmapDetailInfo>
              )}
              
              {selectedRoadmap.program_course && (
                <RoadmapDetailInfo>
                  <RoadmapDetailLabel>프로그램 과정</RoadmapDetailLabel>
                  <RoadmapDetailValue>{selectedRoadmap.program_course}</RoadmapDetailValue>
                </RoadmapDetailInfo>
              )}
              
              {/* 강의에만 있는 필드들 */}
              {selectedRoadmap.type === '강의' && selectedRoadmap.price && (
                <RoadmapDetailInfo>
                  <RoadmapDetailLabel>가격</RoadmapDetailLabel>
                  <RoadmapDetailValue>{selectedRoadmap.price}</RoadmapDetailValue>
                </RoadmapDetailInfo>
              )}
              
              {selectedRoadmap.type === '강의' && selectedRoadmap.url && (
                <RoadmapDetailInfo>
                  <RoadmapDetailLabel>강의 링크</RoadmapDetailLabel>
                  <RoadmapDetailValue>
                    <a href={selectedRoadmap.url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'none' }}>
                      링크 열기
                    </a>
                  </RoadmapDetailValue>
                </RoadmapDetailInfo>
              )}
              
              {selectedRoadmap.skill_description && selectedRoadmap.skill_description.length > 0 && (
                <RoadmapDetailInfo>
                  <RoadmapDetailLabel>기술 스택</RoadmapDetailLabel>
                  <RoadmapDetailSkills>
                    {selectedRoadmap.skill_description.map((skill, index) => (
                      <RoadmapSkillTag key={index}>{skill}</RoadmapSkillTag>
                    ))}
                  </RoadmapDetailSkills>
                </RoadmapDetailInfo>
              )}
            </RoadmapDetailBody>
          </RoadmapDetailContent>
        </RoadmapDetailPopup>
      )}

      {/* 극복 방안 상세 팝업 */}
      {showOvercomeDetail && selectedOvercomeItem && (
        <OvercomeDetailPopup onClick={() => setShowOvercomeDetail(false)}>
          <OvercomeDetailContent $darkMode={darkMode} onClick={(e) => e.stopPropagation()}>
            <OvercomeDetailHeader $darkMode={darkMode}>
              <OvercomeDetailTitle>
                {selectedOvercomeItem.type === '부트캠프' ? '🎓' : '📚'} {selectedOvercomeItem.name}
              </OvercomeDetailTitle>
              <CloseButton $darkMode={darkMode} onClick={() => setShowOvercomeDetail(false)}>
                <FaTimes />
              </CloseButton>
            </OvercomeDetailHeader>
            
            <OvercomeDetailBody>
              <OvercomeDetailInfo>
                <OvercomeDetailLabel>기관/강사</OvercomeDetailLabel>
                <OvercomeDetailValue>{selectedOvercomeItem.company}</OvercomeDetailValue>
              </OvercomeDetailInfo>
              
              {selectedOvercomeItem.status && (
                <OvercomeDetailInfo>
                  <OvercomeDetailLabel>상태</OvercomeDetailLabel>
                  <OvercomeDetailValue>{selectedOvercomeItem.status}</OvercomeDetailValue>
                </OvercomeDetailInfo>
              )}
              
              {selectedOvercomeItem.deadline && (
                <OvercomeDetailInfo>
                  <OvercomeDetailLabel>마감일</OvercomeDetailLabel>
                  <OvercomeDetailValue>{selectedOvercomeItem.deadline_display || selectedOvercomeItem.deadline}</OvercomeDetailValue>
                </OvercomeDetailInfo>
              )}
              
              {/* 부트캠프에만 있는 날짜 필드들 */}
              {selectedOvercomeItem.type === '부트캠프' && selectedOvercomeItem.start_date_display && (
                <OvercomeDetailInfo>
                  <OvercomeDetailLabel>시작일</OvercomeDetailLabel>
                  <OvercomeDetailValue>{selectedOvercomeItem.start_date_display}</OvercomeDetailValue>
                </OvercomeDetailInfo>
              )}
              
              {selectedOvercomeItem.type === '부트캠프' && selectedOvercomeItem.end_date_display && (
                <OvercomeDetailInfo>
                  <OvercomeDetailLabel>종료일</OvercomeDetailLabel>
                  <OvercomeDetailValue>{selectedOvercomeItem.end_date_display}</OvercomeDetailValue>
                </OvercomeDetailInfo>
              )}
              
              {selectedOvercomeItem.location && (
                <OvercomeDetailInfo>
                  <OvercomeDetailLabel>위치</OvercomeDetailLabel>
                  <OvercomeDetailValue>{selectedOvercomeItem.location}</OvercomeDetailValue>
                </OvercomeDetailInfo>
              )}
              
              {selectedOvercomeItem.onoff && (
                <OvercomeDetailInfo>
                  <OvercomeDetailLabel>진행 방식</OvercomeDetailLabel>
                  <OvercomeDetailValue>{selectedOvercomeItem.onoff}</OvercomeDetailValue>
                </OvercomeDetailInfo>
              )}
              
              {selectedOvercomeItem.participation_time && (
                <OvercomeDetailInfo>
                  <OvercomeDetailLabel>참여 시간</OvercomeDetailLabel>
                  <OvercomeDetailValue>{selectedOvercomeItem.participation_time}</OvercomeDetailValue>
                </OvercomeDetailInfo>
              )}
              
              {selectedOvercomeItem.program_course && (
                <OvercomeDetailInfo>
                  <OvercomeDetailLabel>프로그램 과정</OvercomeDetailLabel>
                  <OvercomeDetailValue>{selectedOvercomeItem.program_course}</OvercomeDetailValue>
                </OvercomeDetailInfo>
              )}
              
              {/* 강의에만 있는 필드들 */}
              {selectedOvercomeItem.type === '강의' && selectedOvercomeItem.price && (
                <OvercomeDetailInfo>
                  <OvercomeDetailLabel>가격</OvercomeDetailLabel>
                  <OvercomeDetailValue>{selectedOvercomeItem.price}</OvercomeDetailValue>
                </OvercomeDetailInfo>
              )}
              
              {selectedOvercomeItem.type === '강의' && selectedOvercomeItem.url && (
                <OvercomeDetailInfo>
                  <OvercomeDetailLabel>강의 링크</OvercomeDetailLabel>
                  <OvercomeDetailValue>
                    <a href={selectedOvercomeItem.url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'none' }}>
                      링크 열기
                    </a>
                  </OvercomeDetailValue>
                </OvercomeDetailInfo>
              )}
              
              {selectedOvercomeItem.skill_description && selectedOvercomeItem.skill_description.length > 0 && (
                <OvercomeDetailInfo>
                  <OvercomeDetailLabel>기술 스택</OvercomeDetailLabel>
                  <OvercomeDetailSkills>
                    {selectedOvercomeItem.skill_description.map((skill, index) => (
                      <OvercomeSkillTag key={index}>{skill}</OvercomeSkillTag>
                    ))}
                  </OvercomeDetailSkills>
                </OvercomeDetailInfo>
              )}
            </OvercomeDetailBody>
          </OvercomeDetailContent>
        </OvercomeDetailPopup>
      )}


    </Container>
  );
}

/* ───────────── styled-components ───────────── */
const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 0 3rem;
  background: ${({ $darkMode }) => ($darkMode ? "#121212" : "#fff")};
  color: ${({ $darkMode }) => ($darkMode ? "#eee" : "#333")};
`;

const SectionCard = styled.div`
  display: flex;
  flex-direction: column;
  background: #f9f9f9;
  border-radius: 1rem;
  padding: 1.2rem 1.8rem;  /* 패딩 축소 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  min-height: 40vh;  /* 53vh에서 40vh로 축소 */
  transition: box-shadow 0.2s;
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const LeftSide = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const TopTextBlock = styled.div`
  margin-bottom: 1rem;
`;

const RightSide = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  min-width: 200px;
`;

const RightOnly = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
`;

const Title = styled.h3`
  font-size: 1.2rem;  /* 1.35rem에서 1.2rem으로 축소 */
  font-weight: 700;
  margin-bottom: 0.6rem;  /* 0.8rem에서 0.6rem으로 축소 */
  color: #ffa500;
`;

const Text = styled.p`
  font-size: 1.05rem;
  line-height: 1.6;
`;

// 극복 방안 스타일 컴포넌트들
const OvercomeHeader = styled.div`
  margin-bottom: 2rem;
`;

const OvercomeContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const OvercomeSectionsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 1rem;
`;

const OvercomeSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: ${({ $darkMode }) => ($darkMode ? "#2a2a2a" : "#fff")};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#e9ecef")};
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  max-height: 400px;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  }
`;

const OvercomeSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#e9ecef")};
`;

const OvercomeHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const OvercomeIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #ffa500, #ff8c00);
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(255, 165, 0, 0.3);
`;

const OvercomeIcon = styled.div`
  font-size: 1.2rem;
`;

const OvercomeTitle = styled.h4`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${({ $darkMode }) => ($darkMode ? "#fff" : "#333")};
  margin: 0;
`;

const OvercomeCount = styled.span`
  background: linear-gradient(135deg, #28a745, #20c997);
  color: #fff;
  padding: 0.3rem 0.8rem;
  border-radius: 0.8rem;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.2);
`;

const OvercomeItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  flex: 1;
  overflow-y: auto;
  max-height: 200px;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 165, 0, 0.3);
    border-radius: 2px;
  }
`;

const OvercomeItem = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? "#333" : "#f8f9fa")};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#e9ecef")};
  border-radius: 0.6rem;
  padding: 0.8rem;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: ${({ $darkMode }) => ($darkMode ? "#444" : "#e9ecef")};
    transform: translateX(4px);
  }
`;

const OvercomeItemContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const OvercomeItemTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ $darkMode }) => ($darkMode ? "#fff" : "#333")};
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const OvercomeItemCompany = styled.div`
  font-size: 0.8rem;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#666")};
`;

const OvercomeItemArrow = styled.div`
  font-size: 1rem;
  color: #ffa500;
  font-weight: bold;
  margin-left: 0.5rem;
`;

const OvercomeItemActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const OvercomeSaveButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 0.3rem;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
  
  ${({ $isSaved }) => $isSaved && css`
    animation: heartBeat 0.3s ease;
  `}
  
  @keyframes heartBeat {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
`;

const OvercomeViewAllButton = styled.button`
  background: linear-gradient(135deg, #ffa500, #ff8c00);
  color: #fff;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 0.6rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  box-shadow: 0 2px 8px rgba(255, 165, 0, 0.2);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 165, 0, 0.3);
  }
`;

const OvercomeButtonIcon = styled.span`
  font-size: 0.9rem;
`;

const RoadmapCardsContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2rem;
  min-width: 450px;
  padding: 1rem;
  min-height: 400px;
`;

const RoadmapSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  background: ${({ $darkMode }) => ($darkMode ? "#2a2a2a" : "#fff")};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#e9ecef")};
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  }
`;

const RoadmapSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#e9ecef")};
`;

const RoadmapHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const RoadmapIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #ffa500, #ff8c00);
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(255, 165, 0, 0.3);
`;

const RoadmapIcon = styled.div`
  font-size: 1.5rem;
`;

const RoadmapTitle = styled.h4`
  font-size: 1.4rem;
  font-weight: 700;
  color: ${({ $darkMode }) => ($darkMode ? "#fff" : "#333")};
  margin: 0;
`;

const RoadmapCount = styled.span`
  background: linear-gradient(135deg, #28a745, #20c997);
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.2);
`;

const RoadmapItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const RoadmapItem = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? "#333" : "#f8f9fa")};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#e9ecef")};
  border-radius: 0.8rem;
  padding: 1.2rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  &:hover {
    background: ${({ $darkMode }) => ($darkMode ? "#444" : "#fff")};
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    border-color: #ffc107;
  }
`;

const RoadmapItemContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const RoadmapItemTitle = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ $darkMode }) => ($darkMode ? "#fff" : "#333")};
  line-height: 1.4;
`;

const RoadmapItemCompany = styled.div`
  font-size: 0.85rem;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#666")};
`;

const RoadmapItemBadge = styled.span`
  background: linear-gradient(135deg, #ffc107, #ff9800);
  color: #333;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  align-self: flex-start;
  box-shadow: 0 2px 4px rgba(255, 193, 7, 0.2);
`;

const RoadmapItemArrow = styled.div`
  font-size: 1.2rem;
  color: #ffc107;
  font-weight: bold;
  margin-left: 1rem;
`;

const RoadmapViewAllButton = styled.button`
  background: linear-gradient(135deg, #ffc107, #ff9800);
  color: #333;
  border: none;
  padding: 0.8rem 1.2rem;
  border-radius: 0.8rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 193, 7, 0.4);
  }
`;

const RoadmapButtonIcon = styled.span`
  font-size: 1rem;
`;

// 로드맵 상세 팝업 스타일
const RoadmapDetailPopup = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const RoadmapDetailContent = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? "#1e1e1e" : "#fff")};
  border-radius: 1rem;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from { 
      opacity: 0; 
      transform: translateY(50px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
`;

const RoadmapDetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#e9ecef")};
`;

const RoadmapDetailTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  color: #ffa500;
  margin: 0;
`;

const RoadmapDetailBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const RoadmapDetailInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const RoadmapDetailLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#666")};
`;

const RoadmapDetailValue = styled.div`
  font-size: 1rem;
  color: ${({ $darkMode }) => ($darkMode ? "#fff" : "#333")};
  line-height: 1.4;
`;

// 극복 방안 상세 팝업 스타일
const OvercomeDetailPopup = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const OvercomeDetailContent = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? "#1e1e1e" : "#fff")};
  border-radius: 1rem;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from { 
      opacity: 0; 
      transform: translateY(50px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
`;

const OvercomeDetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#e9ecef")};
`;

const OvercomeDetailTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  color: #ffa500;
  margin: 0;
`;

const OvercomeDetailBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const OvercomeDetailInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const OvercomeDetailLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#666")};
`;

const OvercomeDetailValue = styled.div`
  font-size: 1rem;
  color: ${({ $darkMode }) => ($darkMode ? "#fff" : "#333")};
  line-height: 1.4;
`;

const OvercomeDetailSkills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const OvercomeSkillTag = styled.span`
  background: linear-gradient(135deg, #ffa500, #ff8c00);
  color: #fff;
  padding: 0.3rem 0.8rem;
  border-radius: 0.8rem;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(255, 165, 0, 0.2);
`;

const RoadmapDetailSkills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const RoadmapSkillTag = styled.span`
  background: linear-gradient(135deg, #ffc107, #ff9800);
  color: #333;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  box-shadow: 0 2px 4px rgba(255, 193, 7, 0.2);
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
`;

const RoadmapStatItem = styled.div`
  text-align: center;
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #ffc107, #ff9800);
  color: #333;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 0.8rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
  }
`;

// 새로운 스타일 컴포넌트들
const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;  /* 1.5rem에서 1rem으로 축소 */
  padding-bottom: 0.8rem;  /* 1rem에서 0.8rem으로 축소 */
  border-bottom: 2px solid ${({ $darkMode }) => ($darkMode ? "#333" : "#e9ecef")};
`;

const HeaderLeft = styled.div``;

const HeaderRight = styled.div`
  display: flex;
  gap: 0.8rem;
`;

const Subtitle = styled.p`
  font-size: 0.9rem;  /* 1rem에서 0.9rem으로 축소 */
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#666")};
  margin-top: 0.4rem;  /* 0.5rem에서 0.4rem으로 축소 */
`;



// 컴팩트한 컨트롤 패널
const CompactControlPanel = styled.div`
  display: flex;
  gap: 1rem;  /* 1.5rem에서 1rem으로 축소 */
  margin-bottom: 1rem;  /* 마진 추가 */
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 120px;
  flex: 1;
`;

const ControlLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#555")};
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#ddd")};
  border-radius: 0.4rem;
  background: ${({ $darkMode }) => ($darkMode ? "#1e1e1e" : "#fff")};
  color: ${({ $darkMode }) => ($darkMode ? "#eee" : "#333")};
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #ffa500;
    box-shadow: 0 0 0 2px rgba(255, 165, 0, 0.2);
  }
`;

const VisualizationToggle = styled.div`
  display: flex;
  gap: 0.3rem;
`;

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border: 1px solid ${({ $active, $darkMode }) => ($active ? "#ffa500" : ($darkMode ? "#444" : "#ddd"))};
  border-radius: 0.4rem;
  background: ${({ $active, $darkMode }) => ($active ? "#ffa500" : ($darkMode ? "#1e1e1e" : "#fff"))};
  color: ${({ $active, $darkMode }) => ($active ? "#fff" : ($darkMode ? "#eee" : "#333"))};
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;

  &:hover {
    background: ${({ $active }) => ($active ? "#ffa500" : "rgba(255, 165, 0, 0.1)")};
    transform: translateY(-1px);
  }
`;

// 메인 시각화 영역 (더 컴팩트)
const MainVisualizationArea = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? "#1e1e1e" : "#fff")};
  border-radius: 0.8rem;
  padding: 1.5rem;
  border: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#e9ecef")};
  height: 400px;
  display: flex;
  align-items: ${({ $visualizationType }) => $visualizationType === "weekly_comparison" ? "flex-start" : "center"};
  justify-content: center;
  margin-bottom: 0.8rem;
  overflow: ${({ $visualizationType }) => $visualizationType === "weekly_comparison" ? "auto" : "hidden"};
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ffa500;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;



const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 2rem;
`;

const ErrorMessage = styled.p`
  color: #dc3545;
  font-weight: 600;
`;

const ErrorNote = styled.p`
  color: #856404;
  font-size: 0.9rem;
`;

const WordCloudContainer = styled.div`
  width: 100%;
  max-width: 600px;
  height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: ${props => props.$darkMode ? '#2a2a2a' : '#ffffff'};
  border-radius: 12px;
  border: 1px solid ${props => props.$darkMode ? '#404040' : '#e0e0e0'};
  margin: 0 auto;
  overflow: hidden;
`;

const ChartTitle = styled.h4`
  font-size: 0.9rem;  /* 1rem에서 0.9rem으로 더 축소 */
  font-weight: 700;
  color: #ffa500;
  margin-bottom: 0.5rem;  /* 0.8rem에서 0.5rem으로 더 축소 */
  text-align: center;
`;

const WordCloudWrapper = styled.div`
  width: 100%;
  height: 150px;  /* 250px에서 150px로 더 축소 */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const BarChartContainer = styled.div`
  width: 100%;
`;

const CompactBarChart = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const BarItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const BarRank = styled.div`
  min-width: 25px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #ffa500;
`;

const BarLabel = styled.div`
  min-width: 80px;
  font-size: 0.85rem;
  font-weight: 600;
`;

const BarWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const Bar = styled.div`
  height: 20px;
  background: linear-gradient(90deg, #ffa500, #ff8c00);
  border-radius: 10px;
  width: ${({ $width }) => $width}%;
  transition: width 0.3s ease;
  box-shadow: 0 2px 4px rgba(255, 165, 0, 0.2);
`;

const BarValue = styled.div`
  min-width: 35px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #ffa500;
`;

const TrendIcon = styled.div`
  font-size: 0.75rem;
`;

const TrendChartContainer = styled.div`
  width: 100%;
`;

const CompactTrendGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.8rem;
`;

const TrendCard = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? "#2a2a2a" : "#f8f9fa")};
  border-radius: 0.4rem;
  padding: 0.8rem;
  border: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#e9ecef")};
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const TrendCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
`;

const TrendCardTitle = styled.div`
  font-weight: 600;
  font-size: 0.8rem;
`;

const TrendCardRank = styled.div`
  font-size: 0.7rem;
  color: #ffa500;
  font-weight: 700;
`;

const TrendCardBody = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TrendCardCount = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #ffa500;
`;

const TrendCardTrend = styled.div`
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.7rem;
  color: ${({ $trend }) => 
    $trend === "up" ? "#28a745" : 
    $trend === "down" ? "#dc3545" : "#6c757d"
  };
`;

// 빠른 통계 요약
const QuickStats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.6rem;  /* 0.8rem에서 0.6rem으로 축소 */
  margin-top: 0.6rem;  /* 0.8rem에서 0.6rem으로 축소 */
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;  /* 0.4rem에서 0.3rem으로 축소 */
  padding: 0.6rem;  /* 0.8rem에서 0.6rem으로 축소 */
  border-radius: 0.6rem;  /* 0.8rem에서 0.6rem으로 축소 */
  /* 배경과 테두리 제거 */
  position: relative;
  cursor: help;
  
  &:hover::after {
    content: attr(title);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: ${({ $darkMode }) => ($darkMode ? "#2a2a2a" : "#333")};
    color: ${({ $darkMode }) => ($darkMode ? "#fff" : "#fff")};
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    white-space: nowrap;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    max-width: 250px;
    white-space: normal;
    text-align: center;
    line-height: 1.3;
  }
`;

const StatIcon = styled.div`
  font-size: 1.2rem;
  margin-bottom: 0.3rem;
`;

const StatValue = styled.div`
  font-size: 1rem;  /* 1.2rem에서 1rem으로 축소 */
  font-weight: 700;
  color: #ffa500;
`;

const StatLabel = styled.div`
  font-size: 0.7rem;  /* 0.75rem에서 0.7rem으로 축소 */
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#666")};
  text-align: center;
`;

// 인사이트 팝업
const InsightsPopup = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const InsightsPopupContent = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? "#1e1e1e" : "#fff")};
  border-radius: 1rem;
  padding: 2rem;
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from { 
      opacity: 0; 
      transform: translateY(50px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
`;

const InsightsPopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#e9ecef")};
`;

const InsightsPopupTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffa500;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#666")};
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.5rem;
  border-radius: 0.3rem;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 165, 0, 0.1);
    color: #ffa500;
  }
`;

const InsightsPopupBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const StatCard = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? "#2a2a2a" : "#f8f9fa")};
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: center;
  border: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#e9ecef")};
`;

const AnalysisSection = styled.div``;

const AnalysisTitle = styled.h5`
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffa500;
  margin-bottom: 1rem;
`;

const AnalysisList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const AnalysisItem = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
`;

const AnalysisIcon = styled.div`
  font-size: 1rem;
  margin-top: 0.1rem;
`;

const AnalysisText = styled.div`
  font-size: 0.95rem;
  line-height: 1.4;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#666")};
`;

const RecommendationSection = styled.div``;

const RecommendationTitle = styled.h5`
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffa500;
  margin-bottom: 1rem;
`;

const RecommendationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const RecommendationItem = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
`;

const RecommendationIcon = styled.div`
  font-size: 1rem;
  margin-top: 0.1rem;
`;

const RecommendationText = styled.div`
  font-size: 0.95rem;
  line-height: 1.4;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#666")};
`;

const bounce = keyframes`
  0%,100% { transform: translateY(0);  opacity:.65; }
  50%     { transform: translateY(10px); opacity:1; }
`;

const ScrollArrow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -3.2rem;
  z-index: 5;

  svg {
    width: 54px;
    height: 54px;
    color: #ffa500;
    transform: rotate(180deg);
    filter: drop-shadow(0 1px 2px rgba(0,0,0,.18));
    margin-top: -28px;
  }
  animation: ${bounce} 1.6s infinite;
`;

const NoDataText = styled.div`
  color: ${({ $darkMode }) => $darkMode ? '#888' : '#999'};
  font-size: 0.9rem;
  text-align: center;
`;

// 갭 분석 카드 UI
const GapHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const ShortDesc = styled.div`
  font-size: 1rem;
  color: #888;
  margin-bottom: 0.5rem;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1.5px solid #eee;
  margin: 1rem 0 1.2rem 0;
`;

const GapControlRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.2rem;
`;

const GapResultArea = styled.div`
  min-height: 120px;
`;

const InsightsButton = styled.button`
  background: #fff7ed;
  color: #ffa500;
  border: 1px solid #ffa500;
  border-radius: 0.5rem;
  padding: 0.5rem 1.1rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s;
  &:hover {
    background: #ffa500;
    color: #fff;
  }
`;

const StyledGapResult = styled.div`
  background: #fffdfa;
  border-radius: 1rem;
  padding: 1.3rem 1.5rem;
  font-size: 1.08rem;
  color: #333;
  line-height: 1.8;
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.08);
  min-height: 120px;
  max-height: 320px;
  overflow-y: auto;
  margin-top: 0.5rem;
  word-break: keep-all;
`;

const GapHeadline = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffa500;
  margin-bottom: 0.8rem;
`;

const GapSkillList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const GapSkillItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.8rem;
  background: #fff7ed;
  border-radius: 0.5rem;
  border: 1px solid #ffe4b3;
`;

const GapSkillRank = styled.div`
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 50%;
  background: #ffa500;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
`;

const GapSkillName = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
`;

const GapSkillCount = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-left: auto;
`;

const GapLoadingText = styled.div`
  color: #888;
  font-size: 0.9rem;
  text-align: center;
  padding: 2rem;
`;

const GapErrorText = styled.div`
  color: #dc3545;
  font-size: 0.9rem;
  text-align: center;
  padding: 2rem;
`;

// 누락된 스타일 컴포넌트들 추가
const LoadingText = styled.div`
  color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#666'};
  font-size: 0.9rem;
  text-align: center;
  margin-top: 0.5rem;
`;

const JobSelectionSection = styled.div`
  margin-bottom: 2rem;
`;

const JobSelectionHeader = styled.div`
  margin-bottom: 1rem;
`;

const JobSelectionTitle = styled.h4`
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffa500;
  margin-bottom: 0.5rem;
`;

const JobSelectionSubtitle = styled.p`
  font-size: 0.9rem;
  color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#666'};
  line-height: 1.4;
`;

const JobSelectionControls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const JobSelect = styled.select`
  padding: 0.6rem 1rem;
  border: 1px solid ${({ $darkMode }) => $darkMode ? '#444' : '#ddd'};
  border-radius: 0.5rem;
  background: ${({ $darkMode }) => $darkMode ? '#333' : '#fff'};
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #ffa500;
  }
`;

// 누락된 스타일 컴포넌트들 추가
const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ $darkMode }) => ($darkMode ? '#ccc' : '#666')};
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#444' : '#ddd')};
  border-radius: 0.4rem;
  background: ${({ $darkMode }) => ($darkMode ? '#333' : '#fff')};
  color: ${({ $darkMode }) => ($darkMode ? '#fff' : '#333')};
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #ffa500;
  }
`;

const RefreshButton = styled.button`
  background: #ffa500;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #e69500;
    transform: translateY(-1px);
  }
`;

// 주간 비교 관련 스타일 컴포넌트들
const WeeklyComparisonContainer = styled.div`
  width: 100%;
  min-height: 400px;
`;

const WeeklyInputContainer = styled.div`
  background: ${({ $darkMode }) => $darkMode ? '#2a2a2a' : '#f8f9fa'};
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 1rem;
`;

const WeeklyInputTitle = styled.h3`
  display: flex;
  align-items: center;
  font-size: 1.3rem;
  font-weight: 700;
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
  margin-bottom: 0.5rem;
`;

const WeeklyInputDescription = styled.p`
  color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#666'};
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
`;

const WeeklyInputGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const InputError = styled.div`
  color: #dc3545;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #f8d7da;
  border-radius: 0.4rem;
  border: 1px solid #f5c6cb;
`;

const InputInfo = styled.div`
  display: flex;
  align-items: center;
  color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#666'};
  font-size: 0.9rem;
  padding: 0.5rem;
  background: ${({ $darkMode }) => $darkMode ? '#333' : '#e9ecef'};
  border-radius: 0.4rem;
`;

const WeeklyComparisonResult = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #fff;
  border-radius: 0.8rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 10px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 5px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 5px;
    border: 2px solid #f1f1f1;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
  
  /* 스크롤바가 나타날 때 패딩 조정 */
  &:hover {
    padding-right: 1rem;
  }
`;

const ComparisonHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
`;

const FullViewButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${({ $darkMode }) => $darkMode ? '#ffa500' : '#ffa500'};
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e69500;
    transform: translateY(-1px);
  }
`;

const ComparisonTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
  margin-bottom: 0.5rem;
`;

const ComparisonSubtitle = styled.p`
  color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#666'};
  font-size: 1rem;
`;

const ComparisonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
`;

const ComparisonCard = styled.div`
  background: ${({ $darkMode }) => $darkMode ? '#2a2a2a' : '#fff'};
  border: 1px solid ${({ $darkMode }) => $darkMode ? '#444' : '#ddd'};
  border-radius: 0.8rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SkillName = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
  margin-bottom: 1rem;
`;

const ComparisonData = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const BeforeAfterSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const BeforeSection = styled.div`
  text-align: center;
  flex: 1;
`;

const BeforeLabel = styled.div`
  font-size: 0.8rem;
  color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#666'};
  margin-bottom: 0.3rem;
`;

const BeforeCount = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#666'};
`;

const ArrowSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
`;

const AfterSection = styled.div`
  text-align: center;
  flex: 1;
`;

const AfterLabel = styled.div`
  font-size: 0.8rem;
  color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#666'};
  margin-bottom: 0.3rem;
`;

const AfterCount = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ $trend, $darkMode }) => {
    if ($trend === 'up') return '#28a745';
    if ($trend === 'down') return '#dc3545';
    return $darkMode ? '#ccc' : '#666';
  }};
`;

const ChangeInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: ${({ $darkMode }) => $darkMode ? '#333' : '#f8f9fa'};
  border-radius: 0.4rem;
`;

const ChangeAmount = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ $trend }) => {
    if ($trend === 'up') return '#28a745';
    if ($trend === 'down') return '#dc3545';
    return '#6c757d';
  }};
`;

const ChangePercent = styled.div`
  font-size: 0.9rem;
  color: ${({ $trend }) => {
    if ($trend === 'up') return '#28a745';
    if ($trend === 'down') return '#dc3545';
    return '#6c757d';
  }};
`;

// 팝업 관련 스타일 컴포넌트들
const WeeklyComparisonPopup = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const WeeklyComparisonPopupContent = styled.div`
  background: #fff;
  border-radius: 1rem;
  max-width: 90vw;
  max-height: 90vh;
  width: 100%;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const WeeklyComparisonPopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
  border-radius: 1rem 1rem 0 0;
`;

const WeeklyComparisonPopupTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin: 0;
`;

const WeeklyComparisonPopupSubtitle = styled.p`
  font-size: 1rem;
  color: #666;
  text-align: center;
  margin: 1rem 0;
  padding: 0 2rem;
`;

const WeeklyComparisonPopupGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  padding: 2rem;
  max-height: 70vh;
  overflow-y: auto;
`;

const WeeklyComparisonPopupCard = styled.div`
  background: ${({ $darkMode }) => $darkMode ? '#2a2a2a' : '#fff'};
  border: 1px solid ${({ $darkMode }) => $darkMode ? '#444' : '#ddd'};
  border-radius: 0.8rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const WeeklyComparisonPopupSkillName = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
  margin-bottom: 1rem;
`;

const WeeklyComparisonPopupData = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const WeeklyComparisonPopupBeforeAfter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const WeeklyComparisonPopupBefore = styled.div`
  text-align: center;
  flex: 1;
`;

const WeeklyComparisonPopupAfter = styled.div`
  text-align: center;
  flex: 1;
`;

const WeeklyComparisonPopupLabel = styled.div`
  font-size: 0.8rem;
  color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#666'};
  margin-bottom: 0.3rem;
`;

const WeeklyComparisonPopupCount = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ $trend, $darkMode }) => {
    if ($trend === 'up') return '#28a745';
    if ($trend === 'down') return '#dc3545';
    return $darkMode ? '#ccc' : '#666';
  }};
`;

const WeeklyComparisonPopupArrow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
`;

const WeeklyComparisonPopupChange = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: ${({ $darkMode }) => $darkMode ? '#333' : '#f8f9fa'};
  border-radius: 0.4rem;
`;

const WeeklyComparisonPopupChangeAmount = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ $trend }) => {
    if ($trend === 'up') return '#28a745';
    if ($trend === 'down') return '#dc3545';
    return '#6c757d';
  }};
`;

const WeeklyComparisonPopupChangePercent = styled.div`
  font-size: 0.9rem;
  color: ${({ $trend }) => {
    if ($trend === 'up') return '#28a745';
    if ($trend === 'down') return '#dc3545';
    return '#6c757d';
  }};
`;

const PopupCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#666'};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.3rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $darkMode }) => $darkMode ? '#444' : '#e9ecef'};
    color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
  }
`;

// 주간 비교 팝업 관련 스타일드 컴포넌트들 추가
const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const PopupContent = styled.div`
  background: ${props => props.$darkMode ? '#333' : '#fff'};
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const PopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h3 {
    margin: 0;
    color: ${props => props.$darkMode ? '#fff' : '#333'};
  }
`;

const ComparisonButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const ComparisonButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid ${props => props.$active ? '#007bff' : props.$darkMode ? '#555' : '#dee2e6'};
  border-radius: 6px;
  background: ${props => props.$active ? '#007bff' : props.$darkMode ? '#444' : '#fff'};
  color: ${props => props.$active ? '#fff' : props.$darkMode ? '#ccc' : '#333'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.$active ? '#0056b3' : props.$darkMode ? '#555' : '#f8f9fa'};
  }
`;

const ComparisonResult = styled.div`
  padding: 1rem;
  background: ${props => props.$darkMode ? '#444' : '#f8f9fa'};
  border-radius: 8px;
  
  h4 {
    margin: 0 0 1rem 0;
    color: ${props => props.$darkMode ? '#fff' : '#333'};
  }
`;

const ComparisonDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: ${props => props.$darkMode ? '#ccc' : '#666'};
`;

const WeeklyComparisonTypeButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  justify-content: center;
`;

const ComparisonTypeButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.$active ? '#007bff' : props.$darkMode ? '#555' : '#dee2e6'};
  border-radius: 4px;
  background: ${props => props.$active ? '#007bff' : props.$darkMode ? '#444' : '#fff'};
  color: ${props => props.$active ? '#fff' : props.$darkMode ? '#ccc' : '#333'};
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background: ${props => props.$active ? '#0056b3' : props.$darkMode ? '#555' : '#f8f9fa'};
  }
`;

const WeeklyComparisonSpecificResult = styled.div`
  padding: 1rem;
  background: ${props => props.$darkMode ? '#444' : '#f8f9fa'};
  border-radius: 8px;
  text-align: center;
  
  h4 {
    margin: 0 0 1rem 0;
    color: ${props => props.$darkMode ? '#fff' : '#333'};
  }
  
  div {
    margin: 0.25rem 0;
    color: ${props => props.$darkMode ? '#ccc' : '#666'};
  }
`;