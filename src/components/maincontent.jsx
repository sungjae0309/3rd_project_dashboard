/* ───────── src/components/MainContent.jsx ───────── */
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
  FaChevronRight
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
// OvercomeDetail 대신 CareerPlanFlow를 사용합니다.
import CareerPlanFlow from './CareerPlanFlow';
import axios from "axios";
import { fetchMcpResponse } from "../api/mcp";
import { useLocation } from "react-router-dom";
import SavedPage from './SavedPage';
import AiRecsPreviewCard from "./AiRecsPreviewCard"; 
import CareerRoadmapDetail from "./CareerRoadmapDetail";
import SavedJobDetail from "./SavedJobDetail";
import JobSelector from "./JobSelector";
import RecommendationReason from "./RecommendationReason";
import GapAnalysisSection from "./GapAnalysisSection";
// import FieldTypeSelector from "./FieldTypeSelector"; // 이 줄 제거
const LANDING_PAGE = "dashboard";
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://192.168.101.51:8000';

export default function MainContent({
  selectedPage,
  setSelectedPage,
  darkMode,
  toggleTheme,
}) {
  const [selectedSession, setSelectedSession] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [roadmapDetailId, setRoadmapDetailId] = useState(null);
  const [jobDetailId, setJobDetailId] = useState(null);
  const [selectedJob, setSelectedJob] = useState("프론트엔드 개발자");
  const [selectedFieldType, setSelectedFieldType] = useState("tech_stack"); // 추가
  const [selectedReasonJob, setSelectedReasonJob] = useState(null); // 추천 이유 모달용

  const [chatInit, setChatInit] = useState({ question: "", answer: "" });
  /* ───────── 상태 ───────── */
  const token = localStorage.getItem("accessToken");
  const location = useLocation();


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

  /* ▼ 커리어 로드맵 섹션 상태(null: 메인, "analysis" | "gap" | "plan") */
  // 이 상태는 이제 사용되지 않으므로 제거하거나 주석 처리합니다.
  // const [roadmapSection, setRoadmapSection] = useState(null);

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

  // useState의 초기값 함수를 사용하여 localStorage에서 userId를 가져옵니다.
const [userId, setUserId] = useState(() => localStorage.getItem("userId"));
  
  
  
  const handlePromptSubmit = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
  
    setChatHistory((prev) => [...prev, { sender: "user", text: trimmed }]);
  
    try {
      const res = await fetchMcpResponse(trimmed, userId, token);
      const assistantMsg = res?.message || "⚠ 메시지 없음";
      setChatHistory((prev) => [...prev, { sender: "assistant", text: assistantMsg }]);
    } catch (err) {
      console.error("응답 오류:", err);
      setChatHistory((prev) => [...prev, { sender: "assistant", text: "⚠ 서버 오류" }]);
    }
  };
  
    /* ───────── 랜딩 카드(홈) ───────── */
    function LandingCards({ setSelectedPage }) {
    const handleFieldTypeChange = (fieldType) => {
      setSelectedFieldType(fieldType);
    };

    const fieldTypes = [
      { id: "tech_stack", label: "기술 스택" },
      { id: "required_skills", label: "요구 스택" },
      { id: "preferred_skills", label: "우대 사항" },
      { id: "main_tasks_skills", label: "주요 업무" }
    ];

    return (
      <>
       <MainCards>
        {/* ▼▼▼ 여기에 빠져있던 AiRecsPreviewCard 컴포넌트를 추가합니다. ▼▼▼ */}
        <AiRecsPreviewCard
          darkMode={darkMode}
          onJobDetail={setJobDetailId}
          onShowReason={setSelectedReasonJob} // 추천 이유 모달 오픈 함수 전달
        />
        {/* ▲▲▲ 수정 완료 ▲▲▲ */}
       {/* ▼▼▼ AI 추천 공고 카드 레이아웃 수정 ▼▼▼ */}
       
        <HoverCard $darkMode={darkMode} style={{ flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-start", padding: "2.2rem 2rem 1.6rem", gap: "1.4rem", position: "relative", }}>
            <CardIconBg><FaClipboardCheck /></CardIconBg>
            <SectionTitle style={{ fontSize: "1.7rem" }}><HighlightBar /><span>To-do List</span></SectionTitle>
            <TodoList darkMode={darkMode} onPage="todo" />
        
        </HoverCard>
        </MainCards>
        <SingleCard>
        <HoverCard $darkMode={darkMode} style={{ flexDirection: "column", alignItems: "flex-start", padding: "2rem 1.5rem", minHeight: "600px" }}> {/* 높이 증가 */}
            <HeaderRow>
              <div>
                <SectionTitle style={{ fontSize: "1.7rem" }}><HighlightBar /><span>커리어 로드맵</span></SectionTitle>
                <DescText>당신의 커리어 성장을 돕는 로드맵을 설계해보세요.</DescText>
              </div>
              <JobSelector
                selectedJob={selectedJob}
                onJobChange={setSelectedJob}
                darkMode={darkMode}
              />
            </HeaderRow>
            <CardRow>
            {[
                { id: "analysis", label: "트렌드 분석", desc: "", color: "rgb(250, 243, 221)", },
                { id: "gap", label: "갭 분석", desc: "내 이력서와 공고를 비교합니다.", color: "rgb(251, 233, 179)", },
                { id: "plan", label: "극복 방안", desc: "부족한 부분 학습 계획을 제안합니다.", color: "rgb(255, 220, 117)", },
            ].map((s) => (
                s.id !== "plan" ? (
                  <MiniCard 
                    key={s.id} 
                    $bg={s.color} 
                    $darkMode={darkMode} 
                    onClick={() => setSelectedPage("career-summary")}
                    style={{ minHeight: "400px" }}
                  >
                    {s.id === "analysis" && (
                      <>
                        <h3>{s.label}</h3>
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
                        <MiniWordCloudPreview>
                          <JobKeywordAnalysis 
                            selectedJob={selectedJob} 
                            darkMode={darkMode}
                            selectedFieldType={selectedFieldType}
                          />
                        </MiniWordCloudPreview>
                      </>
                    )}
                    {s.id === "gap" && (
                      <>
                        <h3>{s.label}</h3>
                        <p>{s.desc}</p>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <GapAnalysisSection 
                            selectedJob={selectedJob} 
                            darkMode={darkMode}
                          />
                        </div>
                      </>
                    )}
                    <MiniHint style={{ marginTop: 'auto' }}>(클릭하면 상세 보기)</MiniHint>
                  </MiniCard>
                ) : (
                  // 극복 방안 미니맵 카드
                  <MiniCard
                    key={s.id}
                    $bg={s.color}
                    $darkMode={darkMode}
                    style={{ minHeight: "400px", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <h3 style={{ marginBottom: '1.2rem' }}>극복 방안 미니맵</h3>
                    <MiniMapGrid>
                      <MiniMapItem tabIndex={0}><MiniMapIcon>🎓</MiniMapIcon><MiniMapLabel>부트캠프</MiniMapLabel></MiniMapItem>
                      <MiniMapItem tabIndex={0}><MiniMapIcon>📜</MiniMapIcon><MiniMapLabel>자격증</MiniMapLabel></MiniMapItem>
                      <MiniMapItem tabIndex={0}><MiniMapIcon>💻</MiniMapIcon><MiniMapLabel>강의</MiniMapLabel></MiniMapItem>
                    </MiniMapGrid>
                    <MiniHint style={{ marginTop: 'auto' }}>(클릭하면 상세 보기)</MiniHint>
                  </MiniCard>
                )
            ))}
            </CardRow>
        </HoverCard>
        </SingleCard>
        <RowWrapper>
        <HoverCard $darkMode={darkMode} onClick={() => setSelectedPage("search")} style={{ width: "48%", height: "230px" }}>
            <CardIconBg><FiSearch /></CardIconBg><SectionTitle><HighlightBar /><span>공고 검색</span></SectionTitle>
            <IntroText>키워드·지역·연차 등으로 원하는 채용을 찾아보세요.</IntroText><HintText>(클릭하면 검색 페이지로 이동)</HintText>
        </HoverCard>
        <HoverCard $darkMode={darkMode} onClick={() => setSelectedPage("saved")} style={{ width: "48%" }}>
            <CardIconBg><FaHeart /></CardIconBg><SectionTitle><HighlightBar /><span>찜한 공고</span></SectionTitle>
            <IntroText>관심 있는 공고를 한곳에 모아 관리해보세요.</IntroText><HintText>(클릭하면 찜 목록으로 이동)</HintText>
        </HoverCard>
        </RowWrapper>
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
          
          // 사용자 이력서에서 desired_job 가져오기
          const { data: resume } = await axios.get(`${BASE_URL}/users/me/resume`, { headers });
          const desiredJobs = resume.desired_job || [];
          const jobTitle = desiredJobs[0] || selectedJob; // 이력서에 없으면 선택된 직무 사용
          
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

  return (
    <Main $darkMode={darkMode}>
      <HeaderWrapper>
        <Header $darkMode={darkMode}>김취준님, 만나서 반갑습니다</Header>
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
              userId={userId}
              onJobDetail={setJobDetailId}
              onRoadmapDetail={setRoadmapDetailId}
            />
          )}
          {selectedPage === "history" && (
            <ChatSessionsList token={token} darkMode={darkMode} onSelect={(id) => { setSelectedSession(id); setSelectedPage("chat"); }} />
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
          
          {/* ======================= 수정된 커리어 로드맵 로직 ======================= */}
          {selectedPage === "career-summary" && (
            <CareerRoadmapMain darkMode={darkMode} setSelectedPage={setSelectedPage} />
          )}
          {selectedPage === "career-trend" && (
            <TrendDetail darkMode={darkMode} setSelectedPage={setSelectedPage} />
          )}
          {selectedPage === "career-gap" && (
            <GapDetail darkMode={darkMode} />
          )}
          {selectedPage === "career-plan" && (
            <CareerPlanFlow darkMode={darkMode} userId={userId} />
          )}
          {/* ======================================================================= */}
          
          {selectedPage === "todo" ? (
            <Card $darkMode={darkMode} style={{ padding: "2.5rem" }}>
              <SectionTitle style={{ fontSize: "1.9rem", marginBottom: "1.4rem" }}><HighlightBar /><span></span></SectionTitle>
              <TodoList darkMode={darkMode} onPage="todo" />
            </Card>
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

/* ───────── 여기에 모든 기존 styled-components 코드를 그대로 붙여넣으세요 ───────── */
const fadeIn = keyframes`from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); }`;
const Main = styled.main`
    flex: 1; display: flex; flex-direction: column; position: relative;
    ${({ $darkMode }) => $darkMode ? css`background: #000; color: #fff;` : css`background: #fff; color: #614f25;`}
    min-height: 100vh; padding-bottom: 200px;
`;

/* 헤더 */
const HeaderWrapper = styled.div`
  position: relative;
  padding: 2rem 0;
  text-align: center;
`;

const HoverCard = styled.div`
  position: relative;
  background: #edece9;
  border-radius: 2rem;
  padding: 2rem;
  transition: transform 0.2s ease;
  ${({ $darkMode }) => $darkMode && css`background: #2b2b2b; color: #fff;`}
  min-width: 340px;
  max-width: 100%;
  min-height: 520px;
  max-height: 520px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  box-sizing: border-box;
`;

const CardIconBg = styled.div`
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  font-size: 6.5rem;
  color: rgb(214, 214, 213);
  opacity: 0.5;
  z-index: 0;
  pointer-events: none;
  ${({ $darkMode }) => $darkMode && css`color: #444;`}
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.7rem;
  font-weight: 800;
  margin-bottom: 0rem;
  justify-content: space-between; // 우측 정렬
`;

const IntroText = styled.p`
  font-size: 0.95rem;
  line-height: 1.6;
  color: #6c5f3f;
  margin-bottom: 1rem;
  margin-top: 0.5rem;
  ${({ $darkMode }) => $darkMode && css`color: #ccc;`}
`;

const HighlightBar = styled.div`
  width: 8px;
  height: 1.6rem;
  background: #ffc400;
  border-radius: 4px;
`;

const Header = styled.h1`
  font-size: 2rem;
  ${({ $darkMode }) => ($darkMode ? "color:#f4bf12;" : "color:#000;")}
  text-align: center;
  z-index: 1;
`;

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

const ProfileIcon = styled.div`
  font-size: 1.8rem;
  cursor: pointer;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#666")};

  &:hover {
    color: ${({ $darkMode }) => ($darkMode ? "#fff" : "#000")};
  }
`;

const ProfileMenuWrapper = styled.div`
  position: absolute;
  top: 1.6rem;
  right: 2.2rem;
  z-index: 10;
`;

const Dropdown = styled.div`
  position: absolute;
  top: 2.4rem;
  right: 0;
  display: flex;
  flex-direction: column;
  background: ${({ $darkMode }) => ($darkMode ? "#444" : "#e9e4d7")};
  border-radius: 0.6rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  z-index: 10;
  min-width: 200px;
`;

const DropdownItem = styled.div`
  padding: 0.9rem 1rem;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  white-space: nowrap;
  line-height: 1.4;

  ${({ $darkMode }) =>
    $darkMode
      ? css`
          color: #eee;
          &:hover {
            background: #555;
          }
        `
      : css`
          color: #333;
          &:hover {
            background: #d8d2c2;
          }
        `}
`;

/* 콘텐츠 영역 */
const ContentArea = styled.div`
  flex: 1;
  padding: 0.2rem 8rem 6rem;
  overflow: visible;
`;

const Scrollable = styled.div`
  flex: 1;
`;

/* 카드 공통 */
const BaseCard = styled.div`
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  text-align: center;
  transition: background 0.3s, border 0.3s, color 0.3s;
  border: 2px solid transparent;
  ${({ $darkMode }) =>
    $darkMode
      ? css`
          background: #333;
          color: #fff;
        `
      : css`
          background: rgb(231, 231, 229);
          color: #614f25;
          box-shadow: 0 0 6px rgba(0, 0, 0, 0.05);
        `}
`;

const RowWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  margin-top: 2rem;
  flex-wrap: wrap;
`;

const BackButton = styled.button`
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  display: flex;
  align-items: center;
  background: ${({ $darkMode }) => ($darkMode ? "#444" : "#eee")};
  color: ${({ $darkMode }) => ($darkMode ? "#fff" : "#333")};
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  z-index: 999;
  &:hover {
    background: ${({ $darkMode }) => ($darkMode ? "#555" : "#ddd")};
  }
`;

/* 프롬프트 */
const PromptWrapper = styled.div`
  position: fixed;
  bottom: 2.5rem;
  left: 60%;
  transform: translateX(-50%);
  z-index: 20;
  width: 100%;
  max-width: 800px;
  display: flex;
  justify-content: center;
  height: 80px;
`;

const Prompt = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: ${({ $darkMode }) => ($darkMode ? "#2a2a2a" : "#fff")};
  border: 2px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#eee")};
  border-radius: 2rem;
  padding: 1rem 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
`;

const PromptText = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#666")};
  white-space: nowrap;
`;

const PromptInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  background: transparent;
  color: ${({ $darkMode }) => ($darkMode ? "#fff" : "#333")};
  &::placeholder {
    color: ${({ $darkMode }) => ($darkMode ? "#888" : "#999")};
  }
`;

const PromptButton = styled.button`
  background: #ffc107;
  color: #333;
  border: none;
  border-radius: 1rem;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #ffb300;
  }
`;

/* 랜딩 카드 스타일 */
const MainCards = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr; // AI 추천 공고가 to-do list보다 훨씬 넓게
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
  transition: transform 0.2s;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  ${({ $darkMode }) => $darkMode && css`background: #333; color: #fff;`}
  
  &:hover {
    transform: translateY(-2px);
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

const MiniCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 0.5rem; // 간격 줄임
`;

// 누락된 스타일 컴포넌트들 추가
const FieldTypeSelector = styled.div`
  display: flex;
  gap: 0.3rem; /* 간격 줄임 */
  flex-wrap: nowrap; /* 줄바꿈 방지 */
  margin-top: 0.8rem;
  margin-bottom: 1rem;
  justify-content: space-between; /* 버튼들을 균등하게 분배 */
  width: 100%; /* 전체 너비 사용 */
`;

const FieldTypeButton = styled.button`
  padding: 0.3rem 0.6rem; /* 패딩 줄임 */
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
  font-size: 0.7rem; /* 폰트 크기 줄임 */
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-weight: 500;
  flex: 1; /* 균등하게 분배 */
  min-width: 0; /* 최소 너비 제한 해제 */

  &:hover {
    background: ${({ $darkMode, $active }) => 
      $active 
        ? ($darkMode ? '#45a049' : '#C8E6C9') 
        : ($darkMode ? '#444' : '#f5f5f5')};
  }
`;

const MiniWordCloudPreview = styled.div`
  height: 240px; /* 높이 조정 */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: #666;
  flex: 1;
  margin-top: 0.5rem;
`;

const BlurOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
`;

const BlurBox = styled.div`
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 1rem;
`;

const LockIcon = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  color: #999;
`;

const MiniHint = styled.div`
  font-size: 0.8rem;
  color: #888;
  margin-top: 0.5rem;
  text-align: center;
`;

const DescText = styled.p`
  font-size: 1rem;
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
  ${({ $darkMode }) => $darkMode && css`color: #ccc;`}
`;

const HintText = styled.div`
  font-size: 0.85rem;
  color: #888;
  margin-top: 0.5rem;
  ${({ $darkMode }) => $darkMode && css`color: #666;`}
`;

/* 미니 캘린더 스타일 */
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

/* Todo 미리보기 스타일 */
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

const ProgressFill = styled.div`
  width: ${({ $match }) => $match}%;
  height: 100%;
  background: #ffc107;
  border-radius: 3px;
  transition: width 0.4s ease;
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

/* 오른쪽 고정 안내 박스 */
const Callout = styled.div`
  position: sticky;
  top: 1.5rem;
  background: #fff8dc;
  border-radius: 14px;
  padding: 1.5rem 1.2rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  text-align: center;
  line-height: 1.5;
  font-size: 0.95rem;

  & > p {
    margin-bottom: 1rem;
  }
`;

/* CTA 버튼 */
const RoadmapBtn = styled.button`
  background: #ffc107;
  color: #000;
  font-weight: 700;
  font-size: 0.95rem;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.4rem;
  cursor: pointer;
  transition: background 0.25s;

  &:hover {
    background: #ffb300;
  }
`;

const BulletText = styled.p`
  font-size: 0.88rem;
  color: #4d3b18;
  margin: 0.1rem 0;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding-left: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
  font-size: 0.88rem;
  color: #4d3b18;
  margin-bottom: 0.2rem;
`;

/* ▼ 커리어 로드맵 전용 추가 스타일 ▼ */
const RoadmapGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  width: 850px;
  animation: ${fadeIn} 0.5s ease;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  width: 100%;
  max-width: 1000px;
  border-radius: 1.5rem;
  padding: 3rem;
  background: ${({ $darkMode }) => ($darkMode ? "#333" : "#eeeae2")};
`;

const DetailCard = styled(Card)`
  height: auto;
  width: 850px;
  align-items: flex-start;
  padding: 2.5rem;
`;

/* 상세 페이지 오버레이 스타일 추가 */
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

/* 새로운 스타일 추가 */
const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 1rem;
`;

const FieldTypeIndicator = styled.div`
  font-size: 0.7rem;
  color: ${({ $darkMode }) => $darkMode ? '#666' : '#888'};
  margin-top: 0.3rem;
  font-weight: 500;
`;

const PageNavWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-left: auto;
`;

const PageInfo = styled.span`
  font-size: 1.1rem;
  color: #bfa94a;
  font-weight: 700;
  min-width: 56px;
  text-align: center;
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

// 스타일 추가
const MiniMapGrid = styled.div`
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  align-items: center;
`;
const MiniMapItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fffdfa;
  border-radius: 1.1rem;
  padding: 1.2rem 2.2rem;
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.08);
  cursor: pointer;
  transition: box-shadow 0.18s, transform 0.18s, background 0.18s;
  border: 2px solid transparent;
  &:hover, &:focus {
    box-shadow: 0 4px 16px rgba(255, 193, 7, 0.13);
    background: #fffbe7;
    border: 2px solid #ffc107;
    transform: translateY(-2px) scale(1.04);
  }
`;
const MiniMapIcon = styled.div`
  font-size: 2.2rem;
  margin-bottom: 0.7rem;
`;
const MiniMapLabel = styled.div`
  font-size: 1.05rem;
  font-weight: 600;
  color: #333;
`;