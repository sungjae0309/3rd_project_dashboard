import React, { useState, useRef, useEffect } from "react";
import ChatSessionsList from "./ChatSessionsList";
import styled, { keyframes, css } from "styled-components";
import {
  FaUserCircle,
  FaArrowLeft,
  FaCheckCircle,
  FaRegCircle,
  FaSearch,
  FaHeart,
  FaBullseye,
  FaClipboardCheck,
  FaChevronLeft,
  FaChevronRight,
  FaGraduationCap,
  FaBook,
  FaBriefcase,
  FaLaptopCode,
  FaChalkboardTeacher
} from "react-icons/fa";
import { FiSearch, FiBookmark } from "react-icons/fi";
import TodoList from "./TodoList";
import PromptBar from "./PromptBar";
import ProfileMenu from "./ProfileMenu";
import CareerRoadmapMain from "./CareerRoadmapMain";
import MyProfile from "./MyProfile";
import TrendDetail from "./TrendDetail";
import GapDetail from "./GapDetail";
import ChatPage from "./ChatPage";
import JobCardPreview from "./JobCardPreview";
import SavedJobs from "./SavedJobs";
import AiJobRecommendation from "./AiJobRecommendation";
import JobKeywordAnalysis from "./JobKeywordAnalysis";
import { useNavigate } from "react-router-dom";
import TodoPreview from "./TodoPreview"; 

import axios from "axios";
import { fetchMcpResponse, createChatSession, sendChatMessage } from "../api/mcp";
import { useLocation } from "react-router-dom";
import { useUserData } from "../contexts/UserDataContext";
import { useRoadmap } from "../contexts/RoadmapContext";
import SavedPage from './SavedPage';
import AiRecsPreviewCard from "./AiRecsPreviewCard"; 
import CareerRoadmapDetail from "./CareerRoadmapDetail";
import SavedJobDetail from "./SavedJobDetail";
import JobSelector from "./JobSelector";
import RecommendationReason from "./RecommendationReason";
import GapAnalysisSection from "./GapAnalysisSection";
import RoadmapListPage from "./RoadmapListPage";

const LANDING_PAGE = "dashboard";
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://192.168.101.51:8000';

export default function MainContent({
  selectedPage,
  setSelectedPage,
  darkMode,
  toggleTheme,
  sidebarCollapsed = false,
}) {
  const [selectedSession, setSelectedSession] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  // ✨ [추가] savedRoadmaps 상태를 MainContent에서 관리합니다.
  const [savedRoadmaps, setSavedRoadmaps] = useState([]);
  const [roadmapDetailId, setRoadmapDetailId] = useState(null);
  const [jobDetailId, setJobDetailId] = useState(null);
  const [selectedJob, setSelectedJob] = useState("프론트엔드 개발자"); // 기본값으로 설정
  const [selectedFieldType, setSelectedFieldType] = useState("tech_stack");
  const [selectedReasonJob, setSelectedReasonJob] = useState(null);

  // Context에서 데이터 가져오기
  const { userData, desiredJob, fetchDesiredJob, loading } = useUserData();
  const { roadmapData, fetchRoadmapData } = useRoadmap();

  // Gemini가 추가한 상태들
  const [initialRoadmapCategory, setInitialRoadmapCategory] = useState(null);

  // 데이터 캐싱을 위한 상태 추가 (Context로 이동했으므로 제거)
  // const [cachedData, setCachedData] = useState({
  //   roadmapData: null,
  //   lastFetchTime: null,
  //   userId: null,
  //   selectedJob: null
  // });

  // API 호출 상태를 추적하는 ref 추가
  const hasInitialized = useRef(false);

  const [chatInit, setChatInit] = useState({ question: "", answer: "" });
  const token = localStorage.getItem("accessToken");
  const location = useLocation();

  // useState의 초기값 함수를 사용하여 localStorage에서 userId를 가져옵니다.
  const [userId, setUserId] = useState(() => localStorage.getItem("userId"));

  // ✨ 2. [추가] 찜한 로드맵 목록을 불러오는 함수를 정의합니다.
  const fetchSavedRoadmaps = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${BASE_URL}/user_roadmaps/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(response.data)) {
        setSavedRoadmaps(response.data);
      } else {
        setSavedRoadmaps([]);
      }
    } catch (error) {
      console.error("찜한 로드맵 목록 로딩 실패:", error);
      setSavedRoadmaps([]);
    }
  };

  // ✨ 3. [추가] 컴포넌트가 처음 로드될 때, 그리고 찜 상태 변경 이벤트가 발생할 때마다 목록을 새로고침합니다.
  useEffect(() => {
    fetchSavedRoadmaps(); // 초기 로딩

    // 찜하기/찜취소 이벤트가 발생하면 목록을 다시 불러옴
    const handleRoadmapBookmarkChange = () => {
      console.log('🔄 MainContent에서 찜 상태 변경 이벤트 감지');
      setTimeout(() => {
        fetchSavedRoadmaps();
      }, 100); // 약간의 지연을 두어 서버 상태 업데이트 대기
    };

    window.addEventListener('roadmapBookmarkChanged', handleRoadmapBookmarkChange);

    // 컴포넌트가 사라질 때 이벤트 리스너를 정리합니다.
    return () => {
      window.removeEventListener('roadmapBookmarkChanged', handleRoadmapBookmarkChange);
    };
  }, [token]);

  // maincontent.jsx

// 컴포넌트 최상단 또는 다른 useEffect 근처에 추가

// [수정 1] 페이지 로드 시, localStorage에서 마지막 페이지 상태를 '복원'
useEffect(() => {
  // 'lastSelectedPage'라는 키로 저장된 값을 불러옵니다.
  const savedPage = localStorage.getItem('lastSelectedPage');
  
  // 저장된 페이지가 있으면 해당 페이지로 상태를 설정합니다.
  if (savedPage) {
    setSelectedPage(savedPage);
  } else {
    // 저장된 페이지가 없으면(첫 방문 등) 기본값인 'dashboard'로 설정합니다.
    setSelectedPage('dashboard');
  }
  // 이 로직은 처음 한 번만 실행되면 되므로 의존성 배열은 비워둡니다.
}, []); // [] 대신 [setSelectedPage]를 사용해도 무방합니다.

// maincontent.jsx

// 바로 이어서 추가

// [수정 2] 페이지가 변경될 때마다 해당 상태를 localStorage에 '저장'
useEffect(() => {
  // selectedPage 상태가 변경될 때마다 'lastSelectedPage' 키로 값을 저장합니다.
  // 사용자가 'search' 페이지에 있다가 새로고침하면, 1단계 로직이 이 값을 읽어 복원합니다.
  localStorage.setItem('lastSelectedPage', selectedPage);
}, [selectedPage]); // selectedPage가 바뀔 때마다 이 코드가 실행됩니다.



  // 페이지 변경 시 localStorage에 저장 - 홈화면이 아닐 때만 저장
  useEffect(() => {
    if (selectedPage && selectedPage !== "dashboard") {
      localStorage.setItem("currentPage", selectedPage);
    }
  }, [selectedPage]);

  // 페이지 이동 시 상태 초기화를 위한 useEffect 추가
  useEffect(() => {
    if (selectedPage !== "career-plan") {
      setInitialRoadmapCategory(null);
    }
  }, [selectedPage]);

  useEffect(() => {
    if (location.state?.goTo === "search") {
      setSelectedPage("search");
    } else if (location.state?.goTo === "saved") {
      setSelectedPage("saved");
    } else if (location.state?.goTo === "dashboard") {
      setSelectedPage("dashboard");
    }
  }, [location.state, setSelectedPage]);
  
  const [mcpAnswer, setMcpAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /* ▼ 게스트 20회 사용 제한 */
  const [guestUses, setGuestUses] = useState(
    Number(localStorage.getItem("guestUses") || 0)
  );

  /* ▼ 예시 질문 선택 상태 */
  const [selectedExample, setSelectedExample] = useState(null);

  /* (예시) 로그인 여부 */
  const isGuest = !localStorage.getItem("accessToken");

  // ➊ 상태 정의 -> 고정 프롬포트로 이동시키는 작업
  const [chatHistory, setChatHistory] = useState([]);
  const [sessionId] = useState(() => {
    const saved = localStorage.getItem("chatSessionId");
    const id = saved || crypto.randomUUID();
    localStorage.setItem("chatSessionId", id);
    return id;
  }); 

  /* ───────── 라벨/설명 ───────── */
  const pages = [
    "ai-jobs",
    "career-roadmap",
    "todo",
    "search",
    "saved",
    "history",
  ];
  const pageTitle = {
    "ai-jobs": "AI 추천 공고",
    "career-roadmap": "커리어 로드맵",
    todo: "To-do List",
    history: "대화 이력",
  };
  const pageDesc = {
    "ai-jobs": "AI 기반 추천 채용 공고를 보여줍니다",
    "career-roadmap": "목표를 설정하고 커리어를 설계해보세요.",
    todo: "오늘 해야 할 일을 정리해보세요.",
    history: "이전 대화 내용을 확인하세요.",
  };

  const navigate = useNavigate();

  // 상태들
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedTab, setSelectedTab] = useState("전체");

  /* ▼ 예시 질문 클릭 */
  const handleExampleClick = (prompt) => {
    setSelectedExample(prompt);
    handlePromptSubmit(prompt);
  };
  
  const handlePromptSubmit = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
  
    setChatHistory((prev) => [...prev, { sender: "user", text: trimmed }]);
  
    try {
      // 1. 새 채팅 세션 생성
      const sessionData = await createChatSession(token);
      const newSessionId = sessionData.id;
      
      // 2. 첫 메시지 전송
      const response = await sendChatMessage(newSessionId, trimmed, token);
      
      // 3. 채팅 페이지로 이동 (세션 ID와 함께)
      setSelectedSession(newSessionId);
      setSelectedPage("chat");
      
    } catch (err) {
      console.error("채팅 세션 생성 실패:", err);
      // 에러 처리 - 기존 방식으로 fallback
      setChatHistory((prev) => [...prev, { sender: "user", text: trimmed }]);
      try {
        const res = await fetchMcpResponse(trimmed, userId, token);
        const assistantMsg = res?.message || "⚠ 메시지 없음";
        setChatHistory((prev) => [...prev, { sender: "assistant", text: assistantMsg }]);
      } catch (fallbackErr) {
        console.error("fallback 응답 오류:", fallbackErr);
        setChatHistory((prev) => [...prev, { sender: "assistant", text: "⚠ 서버 오류" }]);
      }
    }
  };
  
  /* ───────── 랜딩 카드(홈) ───────── */
  function LandingCards({ setSelectedPage }) {
    const handleFieldTypeChange = (fieldType) => {
      setSelectedFieldType(fieldType);
    };

    // 직무 변경 시 극복 방안 데이터 새로 가져오기
    const handleJobChange = (newJob) => {
      setSelectedJob(newJob);
      
      // Context를 사용하여 로드맵 데이터 가져오기 (강제 새로고침)
      fetchRoadmapData(newJob, true);
    };

    // 로드맵 데이터 fetch - Context 사용 (무한 루프 방지)
    useEffect(() => {
      if (selectedJob && !hasInitialized.current) {
        fetchRoadmapData(selectedJob);
        hasInitialized.current = true;
      }
    }, [selectedJob]); // selectedJob만 의존성으로 설정

    // 사용자 관심직무 자동 설정을 위한 useEffect 수정 - 무한 루프 방지
    useEffect(() => {
      // 이미 초기화되었으면 다시 호출하지 않음
      if (hasInitialized.current) {
        return;
      }

      const token = localStorage.getItem("accessToken");
      
      const fetchUserDesiredJob = async () => {
        // API 문서에 따르면 인증이 필요하지 않으므로 모든 사용자가 사용 가능
        try {
          console.log(' [LandingCards] Context 사용');
          
          // Context에서 desired job 정보 사용
          const desiredJobData = desiredJob;
          
          console.log(' [LandingCards] 사용자 관심직무:', desiredJobData);
          
          if (desiredJobData) {
            setSelectedJob(desiredJobData);
            // Context에서 자동으로 로드맵 데이터를 가져옴
          }
        } catch (error) {
          console.error('사용자 관심직무 가져오기 실패:', error);
          // 에러 시에도 기본값 유지
        } finally {
          hasInitialized.current = true;
        }
      };

      fetchUserDesiredJob();
    }, [desiredJob]); // desiredJob이 변경될 때만 실행

    const handleViewAllClick = (type) => {
      setInitialRoadmapCategory(type);
      setSelectedPage('career-plan');
    };

    // 수정된 필드 타입 라벨
    const fieldTypes = [
      { id: "tech_stack", label: "기술 스택" },
      { id: "required_skills", label: "요구 스택" },
      { id: "preferred_skills", label: "우대 사항" },
      { id: "main_tasks_skills", label: "주요 업무" }
    ];

    return (
      <>
       <MainCards>
        <AiRecsPreviewCard
          darkMode={darkMode}
          onJobDetail={setJobDetailId}
          onShowReason={setSelectedReasonJob}
        />
       
        
{/* HoverCard 태그 자체를 TodoPreview 컴포넌트로 교체합니다. */}
<TodoPreview darkMode={darkMode} setSelectedPage={setSelectedPage} />

        </MainCards>
        <SingleCard>
        <HoverCard $darkMode={darkMode} style={{ flexDirection: "column", alignItems: "flex-start", padding: "1.8rem 1.5rem", minHeight: "480px", maxHeight: "480px", overflow: "hidden" }}>
            <HeaderRow>
              <div>
                <SectionTitle style={{ fontSize: "1.7rem", gap: '0.5rem', justifyContent: 'flex-start' }}>
                  <HighlightBar />
                  <span>커리어 로드맵</span>
                </SectionTitle>
              </div>
              {/* 모든 사용자에게 직무 선택 드롭다운 표시 */}
              <JobSelector
                selectedJob={selectedJob}
                onJobChange={handleJobChange}
                darkMode={darkMode}
              />
            </HeaderRow>
            <CardRow style={{ marginTop: '0.4rem', justifyContent: 'center', alignItems: 'center' }}>
            {[
                { id: "analysis", label: "트렌드 분석", desc: "", color: "rgb(250, 243, 221)", },
                { id: "gap", label: "갭 분석", desc: "내 이력서와 공고를 비교합니다.", color: "rgb(251, 233, 179)", },
                { id: "plan", label: "극복 방안", desc: "부족한 부분 학습 계획을 제안합니다.", color: "rgb(252, 224, 132)", },
            ].map((s) => (
                s.id !== "plan" ? (
                  <MiniCard 
                    key={s.id} 
                    $bg={s.color} 
                    $darkMode={darkMode} 
                    onClick={() => setSelectedPage("career-summary")}
                    style={{ minHeight: "370px", maxHeight: "370px", display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', padding: '1.3rem', overflow: 'hidden' }}
                  >
                    {s.id === "analysis" && (
                      <>
                        <h3 style={{ marginBottom: '0.8rem', textAlign: 'center', width: '100%' }}>{s.label}</h3>
                        <FieldTypeSelector>
                          {fieldTypes.map((fieldType) => (
                            <FieldTypeButton
                              key={fieldType.id}
                              $active={selectedFieldType === fieldType.id}
                              $darkMode={darkMode}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFieldTypeChange(fieldType.id);
                              }}
                            >
                              {fieldType.label}
                            </FieldTypeButton>
                          ))}
                        </FieldTypeSelector>
                        <MiniWordCloudPreview style={{ justifyContent: 'center', alignItems: 'center' }}>
                          <JobKeywordAnalysis 
                            selectedJob={selectedJob} 
                            darkMode={darkMode}
                            selectedFieldType={selectedFieldType}
                            isMainPage={true} // 메인페이지임을 표시
                            key={`${selectedJob}-${selectedFieldType}`}

                          />
                        </MiniWordCloudPreview>
                      </>
                    )}
                    {s.id === "gap" && (
                      <>
                        <GapCardHeader>
                          <GapCardTitle>{s.label}</GapCardTitle>
                          <GapCardSubtitle>내 이력서와 공고를 비교합니다</GapCardSubtitle>
                        </GapCardHeader>
                        <GapAnalysisSection 
                          selectedJob={selectedJob} 
                          darkMode={darkMode}
                        />
                      </>
                    )}
                  </MiniCard>
                ) : (
                  <MiniCard 
                    key={s.id} 
                    $bg={s.color} 
                    $darkMode={darkMode} 
                    onClick={() => handleViewAllClick("plan")}
                    style={{ minHeight: "370px", maxHeight: "370px", display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', padding: '1.3rem', overflow: 'hidden' }}
                  >
                    <PlanCardHeader>
                      <PlanCardTitle>{s.label}</PlanCardTitle>
                      <PlanCardSubtitle>{s.desc}</PlanCardSubtitle>
                    </PlanCardHeader>
                    <PlanContent>
                      {roadmapData.bootcamps.length > 0 && (
                        <PlanItem>
                          <PlanItemIcon>🎓</PlanItemIcon>
                          <PlanItemContent>
                            <PlanItemTitle>부트캠프</PlanItemTitle>
                            <PlanItemName>{roadmapData.bootcamps[0].name}</PlanItemName>
                            <PlanItemDuration>{roadmapData.bootcamps[0].duration}</PlanItemDuration>
                          </PlanItemContent>
                        </PlanItem>
                      )}
                      {roadmapData.bootcamps.length > 1 && (
                        <PlanItem>
                          <PlanItemIcon>🎓</PlanItemIcon>
                          <PlanItemContent>
                            <PlanItemTitle>부트캠프</PlanItemTitle>
                            <PlanItemName>{roadmapData.bootcamps[1].name}</PlanItemName>
                            <PlanItemDuration>{roadmapData.bootcamps[1].duration}</PlanItemDuration>
                          </PlanItemContent>
                        </PlanItem>
                      )}
                      {roadmapData.courses.length > 0 && (
                        <PlanItem>
                          <PlanItemIcon>📚</PlanItemIcon>
                          <PlanItemContent>
                            <PlanItemTitle>강의</PlanItemTitle>
                            <PlanItemName>{roadmapData.courses[0].name}</PlanItemName>
                            <PlanItemDuration>{roadmapData.courses[0].duration}</PlanItemDuration>
                          </PlanItemContent>
                        </PlanItem>
                      )}
                      {roadmapData.courses.length > 1 && (
                        <PlanItem>
                          <PlanItemIcon>📚</PlanItemIcon>
                          <PlanItemContent>
                            <PlanItemTitle>강의</PlanItemTitle>
                            <PlanItemName>{roadmapData.courses[1].name}</PlanItemName>
                            <PlanItemDuration>{roadmapData.courses[1].duration}</PlanItemDuration>
                          </PlanItemContent>
                        </PlanItem>
                      )}
                    </PlanContent>
                    <PlanViewAllButton onClick={(e) => {
                      e.stopPropagation();
                      handleViewAllClick("plan");
                    }}>
                      전체 보기 →
                    </PlanViewAllButton>
                  </MiniCard>
                )
            ))}
            </CardRow>
        </HoverCard>
        </SingleCard>

        {/* 기존 공고 검색과 찜한 공고 탭 수정 */}
        <SingleCard>
          <MiniMapGrid>
            <MiniMapItem $darkMode={darkMode}>
              <MiniMapTitle>
                <MiniMapHighlightBar />
                <span>검색</span>
              </MiniMapTitle>
              <SearchModules>
                <SearchModule onClick={() => setSelectedPage("search")}>
                  <SearchModuleIcon><FaBriefcase /></SearchModuleIcon>
                  <SearchModuleLabel>공고</SearchModuleLabel>
                </SearchModule>
                <SearchModule onClick={() => setSelectedPage("roadmap-bootcamps")}>
                  <SearchModuleIcon><FaLaptopCode /></SearchModuleIcon>
                  <SearchModuleLabel>부트캠프</SearchModuleLabel>
                </SearchModule>
                <SearchModule onClick={() => setSelectedPage("roadmap-courses")}>
                  <SearchModuleIcon><FaChalkboardTeacher /></SearchModuleIcon>
                  <SearchModuleLabel>강의</SearchModuleLabel>
                </SearchModule>
              </SearchModules>
            </MiniMapItem>
            <MiniMapItem onClick={() => setSelectedPage("saved")} $darkMode={darkMode}>
              <MiniMapTitle>
                <MiniMapHighlightBar />
                <span>찜한 페이지</span>
              </MiniMapTitle>
            </MiniMapItem>
          </MiniMapGrid>
        </SingleCard>
      </>
    );
  }

  function MiniCalendar() {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
    
    const listener = () => {
      const event = new CustomEvent('todoClick');
      window.dispatchEvent(event);
    };

    return (
      <CalendarWrapper>
        <CalendarHeader>
          {today.toLocaleDateString('ko-KR', { month: 'long', year: 'numeric' })}
        </CalendarHeader>
        <CalendarGrid>
          {['일', '월', '화', '수', '목', '금', '토'].map(day => (
            <DayHeader key={day}>{day}</DayHeader>
          ))}
          {Array.from({ length: firstDayOfMonth }, (_, i) => (
            <EmptyDay key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const isToday = day === today.getDate();
            return (
              <Day key={day} $isToday={isToday} onClick={listener}>
                {day}
              </Day>
            );
          })}
        </CalendarGrid>
      </CalendarWrapper>
    );
  }

  function TodoPreviewList() {
    const [scheduleData, setScheduleData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchSchedule = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const token = localStorage.getItem("accessToken");
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          
          // 사용자 희망 직무 정보 가져오기 (새로운 API 사용)
          let jobTitle;
          
          // 로그인 여부와 관계없이 API 호출 (API가 회원/비회원을 구분해서 처리)
          try {
            const { data: desiredJobData } = await axios.get(`${BASE_URL}/users/desired-job`, { headers });
            // 백엔드에서 직접 문자열로 보내주므로 data 자체가 직무명
            jobTitle = desiredJobData;
          } catch (err) {
            console.warn('희망 직무 API 호출 실패, 기본값 사용:', err);
            jobTitle = selectedJob || "프론트엔드 개발자";
          }
          
          if (!jobTitle) {
            setError('관심 직무가 등록되어 있지 않습니다.');
            return;
          }
          
          // 맞춤 일정 생성 API 호출
          const { data: scheduleResponse } = await axios.post(
            `${BASE_URL}/todo/generate`,
            {
              job_title: jobTitle,
              days: 15 // 15일 일정으로 고정
            },
            { headers }
          );
          
          setScheduleData(scheduleResponse.data);
          
        } catch (error) {
          console.error('일정 생성 실패:', error);
          setError('일정을 불러오는데 실패했습니다.');
        } finally {
          setLoading(false);
        }
      };

      fetchSchedule();
    }, [selectedJob]);

    if (loading) {
      return (
        <TodoPreviewWrapper>
          <TodoStats>일정 생성 중...</TodoStats>
          <ProgressBar $match={0} />
          <BackBtn onClick={() => setSelectedPage("todo")}>
            상세 보기 →
          </BackBtn>
        </TodoPreviewWrapper>
      );
    }

    if (error) {
      return (
        <TodoPreviewWrapper>
          <TodoStats>일정 없음</TodoStats>
          <ProgressBar $match={0} />
          <BackBtn onClick={() => setSelectedPage("todo")}>
            일정 생성하기 →
          </BackBtn>
        </TodoPreviewWrapper>
      );
    }

    if (!scheduleData) {
      return (
        <TodoPreviewWrapper>
          <TodoStats>일정 없음</TodoStats>
          <ProgressBar $match={0} />
          <BackBtn onClick={() => setSelectedPage("todo")}>
            일정 생성하기 →
          </BackBtn>
        </TodoPreviewWrapper>
      );
    }

    // 오늘 날짜의 일정만 표시
    const today = new Date().toISOString().split('T')[0];
    const todaySchedule = scheduleData.schedule.find(day => day.date === today);
    
    const todayTasks = todaySchedule?.tasks || [];
    const completedTasks = todayTasks.filter(task => task.completed).length;
    const totalTasks = todayTasks.length;

    return (
      <TodoPreviewWrapper>
        <TodoStats>
          {scheduleData.job_title} 학습 일정
        </TodoStats>
        <TodoProgress>
          <ProgressText>오늘: {completedTasks}/{totalTasks}</ProgressText>
          <ProgressBar $match={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0} />
        </TodoProgress>
        <TodoListBox>
          {todayTasks.slice(0, 3).map((task, index) => (
            <TodoItem key={index} $completed={task.completed}>
              <TodoTitle>{task.title}</TodoTitle>
              <TodoDuration>{task.duration}</TodoDuration>
            </TodoItem>
          ))}
          {todayTasks.length === 0 && (
            <TodoEmpty>오늘은 휴식일입니다</TodoEmpty>
          )}
        </TodoListBox>
        <BackBtn onClick={() => setSelectedPage("todo")}>
          전체 일정 보기 →
        </BackBtn>
      </TodoPreviewWrapper>
    );
  }

  // 추천 이유 모달 닫기
  const handleCloseReasonModal = () => setSelectedReasonJob(null);

  // 디버깅을 위한 로그 추가
  console.log('🔍 [MainContent] 사용자 데이터 상태:', { loading, userData, name: userData?.name });

  return (
    <Main $darkMode={darkMode} $sidebarCollapsed={sidebarCollapsed}>
      <HeaderWrapper>
        <Header $darkMode={darkMode}>
          {loading ? '사용자 정보 로딩 중...' : '만나서 반갑습니다'}
        </Header>
        <ProfileMenuWrapper>
            <ProfileMenu darkMode={darkMode} toggleTheme={toggleTheme} setSelectedPage={setSelectedPage} />
        </ProfileMenuWrapper>
      </HeaderWrapper>
      <ContentArea>
        <Scrollable>
          {/* 기존 페이지들 - 상세 페이지와 관계없이 항상 렌더링 */}
          {selectedPage === "saved" && (
            <SavedPage
              darkMode={darkMode}
              savedJobs={savedJobs}
              setSavedJobs={setSavedJobs}
              // ✨ 4. [수정] 중앙 관리 상태를 SavedPage로 내려줍니다.
              savedRoadmaps={savedRoadmaps}
              userId={userId}
              onJobDetail={setJobDetailId}
              onRoadmapDetail={setRoadmapDetailId}
            />
          )}
          {selectedPage === "history" && (
            <ChatSessionsList 
              token={token} 
              darkMode={darkMode} 
              onSelect={(id) => { 
                setSelectedSession(Number(id)); // 숫자로 확실히 변환
                setSelectedPage("chat"); 
              }} 
            />
          )}
          {selectedPage === "chat" && (
            <ChatPage sessionId={selectedSession} token={token} darkMode={darkMode} onNewSession={(newId) => { setSelectedSession(newId); }} />
          )}
          {["dashboard", "search"].includes(selectedPage) && (
            <>
              {selectedPage === "dashboard" && (<LandingCards setSelectedPage={setSelectedPage} />)}
              {selectedPage === "search" && (
                <JobCardPreview 
                  selectedPage={selectedPage} 
                  setSelectedPage={setSelectedPage} 
                  savedJobs={savedJobs} 
                  setSavedJobs={setSavedJobs} 
                  darkMode={darkMode}
                  onJobDetail={setJobDetailId} 
                />
              )}
            </>
          )}
          {selectedPage === "profile" && ( <MyProfile darkMode={darkMode} userId={userId} /> )}
          
          {/* AI 추천 탭 */}
          {selectedPage === "ai-jobs" && (
            <AiJobRecommendation darkMode={darkMode} />
          )}
          
          {/* ======================= 수정된 커리어 로드맵 로직 ======================= */}
          {selectedPage === "career-summary" && (
            <CareerRoadmapMain 
              darkMode={darkMode} 
              setSelectedPage={setSelectedPage}
              roadmapData={roadmapData}
            />
          )}
          {selectedPage === "career-trend" && (
            <CareerRoadmapMain darkMode={darkMode} setSelectedPage={setSelectedPage} />
          )}
          {selectedPage === "career-gap" && (
            <GapDetail darkMode={darkMode} />
          )}
          {selectedPage === "roadmap-bootcamps" && (
            <RoadmapListPage 
              darkMode={darkMode} 
              type="부트캠프"
              onRoadmapDetail={setRoadmapDetailId}
              setSelectedPage={setSelectedPage}
            />
          )}
          {selectedPage === "roadmap-courses" && (
            <RoadmapListPage 
              darkMode={darkMode} 
              type="강의"
              onRoadmapDetail={setRoadmapDetailId}
              setSelectedPage={setSelectedPage}
            />
          )}


          {/* ======================================================================= */}
          
          {selectedPage === "todo" ? (
            <TodoList darkMode={darkMode} onPage="todo" />
          ) : (
            selectedPage !== "ai-jobs" &&
            !selectedPage.startsWith("career-") && 
            pages.includes(selectedPage) &&
            selectedPage !== "dashboard" && 
            selectedPage !== "search" && 
            selectedPage !== "saved" && 
            selectedPage !== "profile" && 
            selectedPage !== "history" && 
            selectedPage !== "chat" && 
            (
              <Card $darkMode={darkMode}>
                <h2>{pageTitle[selectedPage]}</h2>
                <p>{pageDesc[selectedPage]}</p>
              </Card>
            )
          )}
        </Scrollable>
      </ContentArea>
      
      {/* 상세 페이지 오버레이 */}
      {jobDetailId && (
        <DetailOverlay>
          <SavedJobDetail
            jobId={jobDetailId}
            onBack={() => setJobDetailId(null)}
            darkMode={darkMode}
          />
        </DetailOverlay>
      )}
      
      {roadmapDetailId && (
        <DetailOverlay>
          <CareerRoadmapDetail
            roadmapId={roadmapDetailId}
            onBack={() => setRoadmapDetailId(null)}
            darkMode={darkMode}
          />
        </DetailOverlay>
      )}
      
      {/* 프롬프트 바 - 상세 페이지가 있을 때는 숨김 */}
      {selectedPage !== "chat" && !jobDetailId && !roadmapDetailId && (
        <PromptBar darkMode={darkMode} activePage={selectedPage} onSubmit={handlePromptSubmit} />
      )}
      {/* 추천 이유 모달 */}
      {selectedReasonJob && (
        <DetailOverlay>
          <RecommendationReason
            darkMode={darkMode}
            job={selectedReasonJob}
            onClose={handleCloseReasonModal}
          />
        </DetailOverlay>
      )}
    </Main>
  );
}

// 스타일 컴포넌트들
const fadeIn = keyframes`from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); }`;

const Main = styled.main`
    flex: 1; display: flex; flex-direction: column; position: relative;
    margin-left: ${({ $sidebarCollapsed }) => $sidebarCollapsed ? "90px" : "260px"};
    ${({ $darkMode }) => $darkMode ? css`background: #000; color: #fff;` : css`background: #fff; color: #614f25;`}
    min-height: 100vh; padding-bottom: 120px;
    transition: margin-left 0.25s ease;
`;

const HeaderWrapper = styled.div`
  position: relative;
  padding: 2rem 0;
  text-align: center;
`;

const HoverCard = styled.div`
  background: ${({ $darkMode }) => $darkMode ? '#2a2a2a' : '#f0f0f0'}; // 라이트모드 기본색을 호버색으로 변경
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid ${({ $darkMode }) => $darkMode ? '#404040' : '#e9ecef'};
  cursor: pointer;
  transition: background 0.2s ease;
  max-width: 100%;
  min-height: 520px;
  max-height: 520px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  box-sizing: border-box;
  
  /* 호버 시 배경색 수정 - 라이트모드에서 기본색으로 */
  &:hover {
    background: ${({ $darkMode }) => $darkMode ? '#3a3a3a' : '#f8f9fa'}; // 라이트모드 호버색을 기본색으로 변경
  }
`;

const CardIconBg = styled.div`
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  font-size: 6.5rem;
  color: rgb(214, 214, 213);
  opacity: 0.5;
  z-index: -1;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  ${({ $darkMode }) => $darkMode && css`color: #444;`}
  
  /* 호버 시 아이콘 애니메이션 제거 */
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.7rem;
  font-weight: 800;
  margin-bottom: 0rem;
  justify-content: space-between;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* 호버 시 제목 애니메이션 제거 */
`;

const IntroText = styled.p`
  font-size: 0.95rem;
  line-height: 1.6;
  color: #6c5f3f;
  margin-bottom: 1rem;
  margin-top: 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  ${({ $darkMode }) => $darkMode && css`color: #ccc;`}
  
  /* 호버 시 텍스트 애니메이션 제거 */
`;

const HighlightBar = styled.div`
  width: 8px;
  height: 1.6rem;
  background: #ffc400;
  border-radius: 4px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* 호버 시 하이라이트 바 애니메이션 제거 */
`;

const Header = styled.h1`
  font-size: 2rem;
  ${({ $darkMode }) => ($darkMode ? "color:#f4bf12;" : "color:#000;")}
  text-align: center;
  z-index: 1;
`;

const ProfileMenuWrapper = styled.div`
  position: absolute;
  top: 1.6rem;
  right: 2.2rem;
  z-index: 10;
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 0.2rem 8rem 6rem;
  overflow: visible;
`;

const Scrollable = styled.div`
  flex: 1;
`;

const MainCards = styled.div`
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  align-items: stretch;
`;

const SingleCard = styled.div`
  margin-bottom: 2rem;
`;

const CardRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.0rem;
  margin-top: 1.0rem;
`;

const MiniCard = styled.div`
  background: ${({ $bg }) => $bg};
  border-radius: 1rem;
  padding: 1.5rem;
  position: relative;
  cursor: pointer;
  transition: background 0.2s ease; // transform 대신 background만 변경
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  ${({ $darkMode }) => $darkMode && css`background: #333; color: #fff;`}
  
  &:hover {
    background: ${({ $bg, $darkMode }) => {
      if ($darkMode) return '#444'; // 다크모드일 때 더 밝은 회색
      // 라이트모드일 때는 기존 배경색보다 약간 더 밝게
      if ($bg === 'rgb(250, 243, 221)') return 'rgb(252, 248, 235)'; // 트렌드 분석
      if ($bg === 'rgb(251, 233, 179)') return 'rgb(253, 240, 195)'; // 갭 분석
      if ($bg === 'rgb(252, 224, 132)') return 'rgb(254, 232, 155)'; // 극복 방안
      return $bg; // 기본값
    }};
  }
  
  h3 {
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 0.6rem;
    color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
  }
  
  p {
    font-size: 0.9rem;
    color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#666'};
    line-height: 1.4;
    margin-bottom: 0.8rem;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 1rem;
`;

const DescText = styled.p`
  font-size: 1rem;
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
  ${({ $darkMode }) => $darkMode && css`color: #ccc;`}
`;

const RowWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  margin-top: 2rem;
  flex-wrap: wrap;
`;

const Card = styled.div`
  width: 100%;
  max-width: 1000px;
  border-radius: 1.5rem;
  padding: 3rem;
  background: ${({ $darkMode }) => ($darkMode ? "#333" : "#eeeae2")};
`;

const DetailOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  overflow-y: auto;
`;

// 필터 버튼 스타일
const FieldTypeSelector = styled.div`
  display: flex;
  gap: 0.1rem;
  flex-wrap: nowrap;
  margin-top: 0.2rem;
  margin-bottom: 0.6rem;
  justify-content: flex-start;
  width: 90%;
  padding-left: 0rem;
  margin-left: -0.9rem;
`;

const FieldTypeButton = styled.button`
  padding: 0.4rem 0.6rem;
  border: 1px solid ${({ $darkMode, $active }) => 
    $active 
      ? ($darkMode ? '#4CAF50' : '#2E7D32') 
      : ($darkMode ? '#555' : '#ddd')};
  border-radius: 0.3rem;
  background: ${({ $darkMode, $active }) => 
    $active 
      ? ($darkMode ? '#4CAF50' : '#E8F5E8') 
      : ($darkMode ? '#333' : '#fff')};
  color: ${({ $darkMode, $active }) => 
    $active 
      ? ($darkMode ? '#fff' : '#2E7D32') 
      : ($darkMode ? '#ccc' : '#666')};
  font-size: 0.6rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-weight: 500;
  flex: 1;
  min-width: 60px;
  overflow: visible;
  text-overflow: clip;

  &:hover {
    background: ${({ $darkMode, $active }) => 
      $active 
        ? ($darkMode ? '#45a049' : '#C8E6C9') 
        : ($darkMode ? '#444' : '#f5f5f5')};
  }
`;

const MiniWordCloudPreview = styled.div`
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: #666;
  flex: 1;
  margin-top: 0.1rem;
  width: 100%;
  overflow: hidden;
`;

// 미니맵 스타일 컴포넌트들
const MinimapSection = styled.div`
  margin-bottom: 1.2rem;
  width: 100%;
`;

const MinimapSectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
  font-weight: 600;
  color: #333;
  ${({ $darkMode }) => $darkMode && css`color: #fff;`}
`;

const MinimapIcon = styled.div`
  font-size: 1.1rem;
  color: #ffc107;
`;

const MinimapLabel = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
`;

const MinimapItemList = styled.div`
  margin-bottom: 0.6rem;
`;

const MinimapItem = styled.div`
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 0.4rem;
  margin-bottom: 0.4rem;
  border-left: 3px solid #ffc107;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const MinimapItemTitle = styled.div`
  font-size: 0.8rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 0.15rem;
  ${({ $darkMode }) => $darkMode && css`color: #fff;`}
`;

const MinimapItemCompany = styled.div`
  font-size: 0.7rem;
  color: #666;
  ${({ $darkMode }) => $darkMode && css`color: #ccc;`}
`;

const MinimapViewAllButton = styled.button`
  width: 100%;
  padding: 0.4rem;
  background: #ffc107;
  color: #333;
  border: none;
  border-radius: 0.3rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #ffb300;
  }
`;

// 캘린더 스타일
const CalendarWrapper = styled.div`
  background: #fff;
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  ${({ $darkMode }) => $darkMode && css`background: #333; color: #fff;`}
`;

const CalendarHeader = styled.div`
  text-align: center;
  font-weight: 600;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.2rem;
`;

const DayHeader = styled.div`
  text-align: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: #666;
  padding: 0.3rem;
  ${({ $darkMode }) => $darkMode && css`color: #ccc;`}
`;

const Day = styled.div`
  text-align: center;
  padding: 0.3rem;
  font-size: 0.8rem;
  cursor: pointer;
  border-radius: 0.3rem;
  background: ${({ $isToday }) => $isToday ? '#ffc107' : 'transparent'};
  color: ${({ $isToday }) => $isToday ? '#333' : 'inherit'};
  font-weight: ${({ $isToday }) => $isToday ? '600' : 'normal'};
  
  &:hover {
    background: ${({ $isToday }) => $isToday ? '#ffb300' : '#f0f0f0'};
  }
`;

const EmptyDay = styled.div`
  padding: 0.3rem;
`;

// Todo 미리보기 스타일
const TodoPreviewWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TodoStats = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  ${({ $darkMode }) => $darkMode && css`color: #fff;`}
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: #eee;
  border-radius: 3px;
  overflow: hidden;
  ${({ $darkMode }) => $darkMode && css`background: #444;`}
`;

const BackBtn = styled.button`
  margin-top: 0.3rem;
  font-size: 0.85rem;
  color: #666;
  background: none;
  border: none;
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: #000;
  }
`;

const TodoProgress = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-bottom: 0.8rem;
`;

const ProgressText = styled.div`
  font-size: 0.8rem;
  color: #666;
  font-weight: 600;
`;

const TodoListBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.8rem;
  max-height: 120px;
  overflow-y: auto;
`;

const TodoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0.6rem;
  background: ${({ $completed }) => $completed ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 193, 7, 0.1)'};
  border-radius: 0.4rem;
  border-left: 3px solid ${({ $completed }) => $completed ? '#4CAF50' : '#FFC107'};
`;

const TodoTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TodoDuration = styled.div`
  font-size: 0.65rem;
  color: #666;
  font-weight: 500;
  flex-shrink: 0;
`;

const TodoEmpty = styled.div`
  font-size: 0.75rem;
  color: #999;
  text-align: center;
  padding: 0.5rem;
  font-style: italic;
`;

// 스타일 수정: 회색 배경과 제목 추가
const MiniMapGrid = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2rem;
  justify-content: center;
  align-items: stretch;
  width: 100%;
`;

const MiniMapTitle = styled.div`
  position: absolute;
  top: 1.4rem;
  left: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.6rem;
  font-weight: 700;
  color: #333;
  z-index: 1;
  
  ${({ $darkMode }) => $darkMode && css`
    color: #fff;
  `}
`;

const MiniMapHighlightBar = styled.div`
  width: 8px;
  height: 1.6rem;
  background: #ffc400;
  border-radius: 4px;
`;

const SearchModules = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.6rem;
  margin-top: 3rem;
  width: 100%;
  justify-content: space-between;
`;

const SearchModule = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 0.8rem 0.5rem;
  background: ${({ $darkMode }) => $darkMode ? '#333' : '#fff'};
  border-radius: 0.8rem;
  cursor: pointer;
  transition: background 0.2s ease;
  border: 1px solid ${({ $darkMode }) => $darkMode ? '#444' : '#e0e0e0'};
  flex: 1;
  
  &:hover {
    background: ${({ $darkMode }) => $darkMode ? '#444' : '#f8f9fa'};
  }
`;

const SearchModuleIcon = styled.div`
  font-size: 1.2rem;
  flex-shrink: 0;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${({ $darkMode }) => $darkMode && css`
    color: #fff;
  `}
`;

const SearchModuleLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
`;

const MiniMapItem = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ $darkMode }) => $darkMode ? '#2a2a2a' : '#f0f0f0'};
  border-radius: 1.5rem;
  padding: 2rem 1.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: background 0.2s ease;
  border: 1px solid ${({ $darkMode }) => $darkMode ? '#404040' : '#e9ecef'};
  min-height: 180px;
  position: relative;
  
  /* 호버 시 배경색 수정 - 커리어 로드맵과 동일한 호버 배경색 */
  &:hover, &:focus {
    background: ${({ $darkMode }) => $darkMode ? '#3a3a3a' : '#f8f9fa'};
  }
  
  ${({ $darkMode }) => $darkMode && css`
    color: #fff;
  `}
`;

const MiniMapIcon = styled.div`
  font-size: 2.5rem;
  color: #ffc107;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  
  ${MiniMapItem}:hover & {
    transform: scale(1.1);
    color: #ff8c00;
  }
  
  ${({ $darkMode }) => $darkMode && css`
    color: #ffc107;
    
    ${MiniMapItem}:hover & {
      color: #ff8c00;
    }
  `}
`;

const MiniMapLabel = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  text-align: center;
  transition: all 0.3s ease;
  
  ${MiniMapItem}:hover & {
    color: #ff8c00;
  }
  
  ${({ $darkMode }) => $darkMode && css`
    color: #fff;
    
    ${MiniMapItem}:hover & {
      color: #ffc107;
    }
  `}
`;

// 호버 팝업 스타일 수정
const HoverPopup = styled.div.attrs(({ $top, $left }) => ({
  style: {
    top: `${$top}px`,
    left: `${$left}px`,
  },
}))`
  position: fixed;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  min-width: 250px;
  max-width: 350px;
  pointer-events: auto;
`;

const PopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
`;

const PopupTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #333;
`;

const PopupCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #333;
  }
`;

const PopupItem = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: #f8f9fa;
  }
`;

const PopupItemTitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
`;

const PopupItemCompany = styled.div`
  font-size: 11px;
  color: #666;
`;

const PopupViewAllButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: #ffc107;
  color: #333;
  border: none;
  border-radius: 0 0 8px 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #ffb300;
  }
`;

// 누락된 스타일드 컴포넌트들 추가
const RoadmapPreview = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  flex: 1;
`;

const RoadmapItem = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const RoadmapTitle = styled.div`
  font-size: 11px;
  color: #888;
  margin-bottom: 4px;
  font-weight: 500;
`;

const RoadmapName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.$darkMode ? '#fff' : '#333'};
  margin-bottom: 2px;
`;

const RoadmapDuration = styled.div`
  font-size: 11px;
  color: #666;
`;

const ViewAllButton = styled.button`
  width: 100%;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  color: ${props => props.$darkMode ? '#fff' : '#333'};
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

// 직무별 더미 부트캠프 데이터 생성 함수
const getDummyBootcamps = (job) => {
  const bootcampData = {
    '프론트엔드 개발자': [
      { title: '프론트엔드 개발자 부트캠프 A', company: '코딩부트캠프' },
      { title: 'React & Vue.js 마스터 과정', company: '프론트엔드 아카데미' }
    ],
    '백엔드 개발자': [
      { title: '백엔드 개발자 부트캠프 A', company: '백엔드 아카데미' },
      { title: 'Spring Boot & JPA 과정', company: '자바스쿨' }
    ],
    '자바 개발자': [
      { title: '자바 개발자 부트캠프 A', company: '자바아카데미' },
      { title: 'Java & Spring Framework 과정', company: '코딩스쿨' }
    ],
    '소프트웨어 엔지니어': [
      { title: '소프트웨어 엔지니어 부트캠프 A', company: '소프트웨어 아카데미' },
      { title: '풀스택 개발 과정', company: '개발자스쿨' }
    ],
    '안드로이드 개발자': [
      { title: '안드로이드 개발자 부트캠프 A', company: '모바일 아카데미' },
      { title: 'Kotlin & Android Studio 과정', company: '앱개발스쿨' }
    ],
    'iOS 개발자': [
      { title: 'iOS 개발자 부트캠프 A', company: '애플 개발 아카데미' },
      { title: 'Swift & Xcode 과정', company: 'iOS스쿨' }
    ],
    '데이터 분석가': [
      { title: '데이터 분석가 부트캠프 A', company: '데이터 아카데미' },
      { title: 'Python & Pandas 과정', company: '데이터스쿨' }
    ],
    'AI 엔지니어': [
      { title: 'AI 엔지니어 부트캠프 A', company: 'AI 아카데미' },
      { title: '머신러닝 & 딥러닝 과정', company: 'AI스쿨' }
    ]
  };
  
  return bootcampData[job] || [
    { title: `${job} 부트캠프 A`, company: '부트캠프 회사 A' },
    { title: `${job} 부트캠프 B`, company: '부트캠프 회사 B' }
  ];
};

// 직무별 더미 강의 데이터 생성 함수
const getDummyCourses = (job) => {
  const courseData = {
    '프론트엔드 개발자': [
      { title: 'HTML/CSS 기초부터 마스터까지', company: '프론트엔드 강의 플랫폼' },
      { title: 'JavaScript ES6+ 완벽 가이드', company: '코딩 강의 사이트' }
    ],
    '백엔드 개발자': [
      { title: 'Java 기초부터 고급까지', company: '백엔드 강의 플랫폼' },
      { title: 'Spring Framework 핵심 강의', company: '자바 강의 사이트' }
    ],
    '자바 개발자': [
      { title: 'Java 프로그래밍 기초', company: '자바 강의 플랫폼' },
      { title: 'Spring Boot 실전 프로젝트', company: '스프링 강의 사이트' }
    ],
    '소프트웨어 엔지니어': [
      { title: '소프트웨어 설계 원리', company: '소프트웨어 강의 플랫폼' },
      { title: '알고리즘과 자료구조', company: '알고리즘 강의 사이트' }
    ],
    '안드로이드 개발자': [
      { title: 'Android Studio 기초 강의', company: '안드로이드 강의 플랫폼' },
      { title: 'Kotlin 프로그래밍 완벽 가이드', company: '코틀린 강의 사이트' }
    ],
    'iOS 개발자': [
      { title: 'Xcode 기초부터 실전까지', company: 'iOS 강의 플랫폼' },
      { title: 'Swift 프로그래밍 마스터', company: '스위프트 강의 사이트' }
    ],
    '데이터 분석가': [
      { title: 'Python 데이터 분석 기초', company: '데이터 강의 플랫폼' },
      { title: 'Pandas & NumPy 완벽 가이드', company: '파이썬 강의 사이트' }
    ],
    'AI 엔지니어': [
      { title: '머신러닝 기초 강의', company: 'AI 강의 플랫폼' },
      { title: '딥러닝 TensorFlow 실전', company: '딥러닝 강의 사이트' }
    ]
  };
  
  return courseData[job] || [
    { title: `${job} 온라인 강의 A`, company: '강의 플랫폼 A' },
    { title: `${job} 온라인 강의 B`, company: '강의 플랫폼 B' }
  ];
};

// 새로운 스타일 컴포넌트들 추가 (파일 하단의 스타일 컴포넌트 섹션에 추가)
const GapCardHeader = styled.div`
  text-align: center;
  margin-bottom: 1rem;
  width: 100%;
`;

const GapCardTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
  margin: 0 0 0.3rem 0;
  text-align: center;
`;

const GapCardSubtitle = styled.p`
  font-size: 0.8rem;
  color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#666'};
  margin: 0;
  opacity: 0.8;
  text-align: center;
`;

const PlanCardHeader = styled.div`
  text-align: center;
  margin-bottom: 1.2rem;
`;

const PlanCardTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
  margin: 0 0 0.3rem 0;
`;

const PlanCardSubtitle = styled.p`
  font-size: 0.8rem;
  color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#666'};
  margin: 0;
  opacity: 0.8;
`;

const PlanContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 0.8rem;
  flex: 1;
  overflow: hidden; // 추가: 넘치는 내용 숨김
`;

const PlanItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem; // 간격 줄임
  padding: 0.6rem; // 패딩 줄임
  background: ${({ $darkMode }) => $darkMode 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(255, 255, 255, 0.85)'};
  border-radius: 0.5rem; // 반지름 줄임
  border: 1px solid ${({ $darkMode }) => $darkMode 
    ? 'rgba(255, 255, 255, 0.15)' 
    : 'rgba(0, 0, 0, 0.08)'};
  transition: all 0.2s ease;
  box-shadow: ${({ $darkMode }) => $darkMode 
    ? '0 1px 4px rgba(0, 0, 0, 0.2)' 
    : '0 1px 4px rgba(0, 0, 0, 0.05)'};
  min-height: 0; // 추가: 최소 높이 제거
  
  &:hover {
    background: ${({ $darkMode }) => $darkMode 
      ? 'rgba(255, 255, 255, 0.12)' 
      : 'rgba(255, 255, 255, 0.95)'};
    transform: translateY(-1px); // 이동 거리 줄임
    box-shadow: ${({ $darkMode }) => $darkMode 
      ? '0 2px 6px rgba(0, 0, 0, 0.3)' 
      : '0 2px 6px rgba(0, 0, 0, 0.1)'};
  }
`;

const PlanItemIcon = styled.div`
  font-size: 1rem; // 크기 줄임
  flex-shrink: 0;
  width: 1.6rem; // 크기 줄임
  height: 1.6rem; // 크기 줄임
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $darkMode }) => $darkMode 
    ? 'rgba(255, 193, 7, 0.2)' 
    : 'rgba(255, 193, 7, 0.15)'};
  border-radius: 0.3rem; // 반지름 줄임
  border: 1px solid ${({ $darkMode }) => $darkMode 
    ? 'rgba(255, 193, 7, 0.3)' 
    : 'rgba(255, 193, 7, 0.25)'};
`;

const PlanItemContent = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden; // 추가: 텍스트 넘침 방지
`;

const PlanItemTitle = styled.div`
  font-size: 0.65rem; // 크기 줄임
  color: ${({ $darkMode }) => $darkMode ? '#aaa' : '#666'};
  margin-bottom: 0.15rem; // 마진 줄임
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px; // 자간 줄임
`;

const PlanItemName = styled.div`
                        <PlanItem>
                          <PlanItemIcon>🎓</PlanItemIcon>
                          <PlanItemContent>
                            <PlanItemTitle>부트캠프</PlanItemTitle>
                            <PlanItemName>{roadmapData.bootcamps[1].name}</PlanItemName>
                            <PlanItemDuration>{roadmapData.bootcamps[1].duration}</PlanItemDuration>
  font-size: 0.75rem; // 크기 조정
  font-weight: 600;
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
  margin-bottom: 0.15rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal; // nowrap에서 normal로 변경
  line-height: 1.2;
  max-width: 100%;
  display: -webkit-box;
  -webkit-line-clamp: 2; // 최대 2줄
  -webkit-box-orient: vertical;
  word-break: break-word; // 긴 단어 줄바꿈
`;

const PlanItemDuration = styled.div`
  font-size: 0.65rem; // 크기 줄임
  color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#666'};
  font-weight: 500;
`;

const PlanViewAllButton = styled.button`
  width: 100%;
  padding: 0.5rem 0.8rem; // 패딩 줄임
  background: ${({ $darkMode }) => $darkMode 
    ? 'rgba(255, 193, 7, 0.2)' 
    : 'rgba(255, 193, 7, 0.15)'};
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
  border: 1px solid ${({ $darkMode }) => $darkMode 
    ? 'rgba(255, 193, 7, 0.3)' 
    : 'rgba(255, 193, 7, 0.25)'};
  border-radius: 0.4rem; // 반지름 줄임
  font-size: 0.75rem; // 크기 줄임
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $darkMode }) => $darkMode 
      ? 'rgba(255, 193, 7, 0.3)' 
      : 'rgba(255, 193, 7, 0.25)'};
    transform: translateY(-1px);
    box-shadow: ${({ $darkMode }) => $darkMode 
      ? '0 2px 6px rgba(255, 193, 7, 0.2)' 
      : '0 2px 6px rgba(255, 193, 7, 0.15)'};
  }
`;