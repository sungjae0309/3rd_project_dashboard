/* ───────── src/components/MainContent.jsx ───────── */
import React, { useState, useRef, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import {
  FaUserCircle,
  FaArrowLeft,
  FaCheckCircle,
  FaRegCircle,
  FaSearch,
  FaHeart,
  FaBullseye,
  FaClipboardCheck
} from "react-icons/fa";
import { FiSearch, FiBookmark } from "react-icons/fi";
import TodoList from "./TodoList";
import PromptBar from "./PromptBar";
import ProfileMenu from "./ProfileMenu";
import CareerRoadmapMain from "./CareerRoadmapMain";
import CareerRoadmapDetail from "./CareerRoadmapDetail";
import MyProfile from "./MyProfile";
import TrendDetail from "./TrendDetail";
import GapDetail from "./GapDetail";
import OvercomeDetail from "./OvercomeDetail";
import JobCardPreview from "./JobCardPreview";
import SavedJobs from "./SavedJobs";



import JobKeywordAnalysis from "./JobKeywordAnalysis";





const LANDING_PAGE = "dashboard";

export default function MainContent({
  selectedPage,
  setSelectedPage,
  darkMode,
  toggleTheme,
}) {
  /* ───────── 상태 ───────── */
  
  /* ▼ AI 추천 공고용 상태 */
  const [aiMessage, setAiMessage] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  /* ▼ 게스트 20회 사용 제한 */
  const [guestUses, setGuestUses] = useState(
    Number(localStorage.getItem("guestUses") || 0)
  );

  /* ▼ 예시 질문 선택 상태 */
  const [selectedExample, setSelectedExample] = useState(null);

  /* ▼ 커리어 로드맵 섹션 상태(null: 메인, "analysis" | "gap" | "plan") */
  const [roadmapSection, setRoadmapSection] = useState(null);

  /* (예시) 로그인 여부 */
  const isGuest = !localStorage.getItem("userToken");

  /* ───────── 라벨/설명 ───────── */
  const pages = [
    "ai-jobs",
    "career-roadmap",
    "todo",
  
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

  /* ───────── 예시 질문 ───────── */
  const examplePrompts = [
    "데이터 분석가가 지원할 수 있는 공고를 추천해줘",
    "신입 백엔드 개발자에게 적합한 회사를 알려줘",
    "포트폴리오 없는 AI 직무 지원 가능한 곳 추천해줘",
    "비전공자를 위한 프론트엔드 공고 알려줘",
    "주니어 데이터 엔지니어 채용 중인 스타트업 추천해줘",
    "서울에서 하이브리드 근무 가능한 기획 직무 있어?",
    "재택 근무 가능한 풀스택 포지션 리스트 보여줘",
    "연봉 5천 이상 제공하는 신입 QA 공고 소개해줘",
  ];

  /* ───────── 더미 API ───────── */
  async function fetchAiJobRecommendation(query) {
    await new Promise((r) => setTimeout(r, 1000));
    return {
      explanation: `"${query}"에 대한 추천 결과입니다.`,
      jobs: [
        { company: "네이버", match: 94 },
        { company: "카카오", match: 90 },
        { company: "삼성전자", match: 87 },
        { company: "LG CNS", match: 85 },
        { company: "쿠팡", match: 82 },
      ],
    };
  }

  /* ───────── 추천 호출 ───────── */
  const handlePromptSubmit = async (query) => {
    if (selectedPage !== "ai-jobs") return;
  
    if (!query.trim()) return; // 빈 문자열 방지
  
    if (isGuest && guestUses >= 50) {
      alert(
        "게스트는 AI 추천 공고 기능을 50회까지 이용할 수 있습니다.\n회원가입 후 계속 이용해 주세요!"
      );
      return;
    }
  
    setIsLoading(true);
    try {
      const res = await fetchAiJobRecommendation(query); // ← 쿼리 직접 사용
      setAiMessage(res.explanation);
      setRecommendations(res.jobs);
  
      if (isGuest) {
        const newCnt = guestUses + 1;
        setGuestUses(newCnt);
        localStorage.setItem("guestUses", newCnt);
      }
    } catch (e) {
      alert("추천을 가져오는 데 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };
  

  // 상태들
const [searchKeyword, setSearchKeyword] = useState("");
const [selectedTab, setSelectedTab] = useState("전체");

// 더미 데이터
const jobData = [
  { id: 1, company: "카카오", position: "백엔드 개발자", location: "판교", category: "최신 공고" },
  { id: 2, company: "네이버", position: "AI 엔지니어", location: "분당", category: "유행 공고" },
  { id: 3, company: "라인", position: "데이터 분석가", location: "서울", category: "마감 임박" },
];

const [savedJobs, setSavedJobs] = useState([]);


// 필터 로직
const filteredJobs = jobData.filter((job) => {
  const keywordMatch =
    searchKeyword === "" ||
    job.company.includes(searchKeyword) ||
    job.position.includes(searchKeyword);

  const tabMatch =
    selectedTab === "전체" || job.category === selectedTab;

  return keywordMatch && tabMatch;
});

// 검색 핸들러
const handleSearch = () => {
  // 여기선 실시간 필터이므로 따로 로직 필요 없음
};


  /* ▼ 예시 질문 클릭 */
  const handleExampleClick = (prompt) => {
    setSelectedExample(prompt);
    handlePromptSubmit(prompt);
  };

  /* ───────── selectedPage 변경 시 로드맵 섹션 초기화 ───────── */
  useEffect(() => {
    if (selectedPage !== "career-roadmap") setRoadmapSection(null);
  }, [selectedPage]);

  /* ───────── 랜딩 카드(홈) ───────── */
  function LandingCards({ setSelectedPage }) {
    const preview = [
      { company: "네이버", match: 95, size: "대기업" },
      { company: "카카오", match: 88, size: "대기업" },
      { company: "삼성전자", match: 84, size: "대기업" },
      { company: "LG CNS", match: 77, size: "중견기업" },
      { company: "쿠팡", match: 72, size: "대기업" },
    ];
  
    return (
      <>
        {/* 상단 카드 2개 */}
       {/* 상단 카드 2개 */}
       <MainCards>
  {/* AI 추천 공고 카드 */}
  <HoverCard
    $darkMode={darkMode}
    onClick={() => setSelectedPage("ai-jobs")}
    style={{
      flexDirection: "column",
      alignItems: "flex-start",
      padding: "2.2rem 2rem 6.6rem",
      justifyContent: "flex-start",
      position: "relative",
    }}
  >
    <CardIconBg><FaBullseye /></CardIconBg> {/* ✅ 아이콘 위치 고정 */}

    <SectionTitle>
      <HighlightBar />
      <span>AI 추천 공고</span>
    </SectionTitle>

    <IntroText
      style={{
        fontSize: "0.92rem",
        marginTop: "0.7rem",
        marginBottom: "2rem",
        textAlign: "left",
        lineHeight: "1.5",
      }}
    >
      김취준님의 이력과 관심사를 바탕으로<br />
      데이터 분석 직무에 맞는 기업을 골라봤어요
    </IntroText>

    <ColumnHeader>
      <ColumnTitle style={{ flex: 1.2, textAlign: "left" }}>기업명</ColumnTitle>
      <ColumnTitle style={{ flex: 0.8, textAlign: "left", paddingLeft: "2.2rem" }}>기업 규모</ColumnTitle>
      <ColumnTitle style={{ flex: 0.6, textAlign: "right" }}>적합도</ColumnTitle>
    </ColumnHeader>

    <PreviewList>
      {preview.map((p, idx) => (
        <PreviewItem key={p.company}>
          <CompanyName><strong>{idx + 1}. {p.company}</strong></CompanyName>
          <Deadline>{p.size}</Deadline>
          <MatchPercent $match={p.match}>{p.match}%</MatchPercent>
        </PreviewItem>
      ))}
    </PreviewList>

    <HintText>(클릭하면 상세 보기)</HintText>
  </HoverCard>

  {/* To-do 카드 */}
  <HoverCard
    $darkMode={darkMode}
    onClick={() => setSelectedPage("todo")}
    style={{
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      padding: "2.2rem 2rem 1.6rem",
      gap: "1.4rem",
      position: "relative",
    }}
  >
    <CardIconBg><FaClipboardCheck /></CardIconBg> {/* ✅ 고정 */}

    <SectionTitle style={{ fontSize: "1.7rem" }}>
      <HighlightBar />
      <span>To-do List</span>
    </SectionTitle>

    <MiniCalendar />
    <TodoPreviewList />
    <HintText>(클릭하면 오늘의 할 일로 이동)</HintText>
  </HoverCard>
</MainCards>


       {/* 커리어 로드맵 카드 */}
<SingleCard>
  <HoverCard
    $darkMode={darkMode}
    onClick={() => setSelectedPage("career-roadmap")}
    style={{
      flexDirection: "column",
      alignItems: "flex-start",
      padding: "2rem 1.5rem",
    }}
  >
    <SectionTitle style={{ fontSize: "1.7rem" }}>
      <HighlightBar />
      <span>커리어 로드맵</span>
    </SectionTitle>

    <DescText>당신의 커리어 성장을 돕는 로드맵을 설계해보세요.</DescText>

    <CardRow>
  {[
    {
      id: "analysis",
      label: "트렌드 분석",
      desc: "",
      color: "rgb(250, 243, 221)",
    },
    {
      id: "gap",
      label: "갭 분석",
      desc: "내 이력서와 공고를 비교합니다.",
      color: "rgb(251, 233, 179)",
    },
    {
      id: "plan",
      label: "극복 방안",
      desc: "부족한 부분 학습 계획을 제안합니다.",
      color: "rgb(255, 220, 117)",
    },
  ].map((s) => (
    <MiniCard
  key={s.id}
  $bg={s.color}
  $darkMode={darkMode}
>
  <h3>{s.label}</h3>
  <p>{s.desc}</p>

  {/* 트렌드 분석 카드만 워드클라우드 표시 */}
  {s.id === "analysis" && (
    <MiniWordCloudPreview>
      <JobKeywordAnalysis />
    </MiniWordCloudPreview>
  )}

  {/* 갭 분석 또는 극복 방안 카드면 빈 영역에 Blur 표시 */}
  {(s.id === "gap" || s.id === "plan") && (
  <BlurOverlay>
    <BlurBox />
    <LockIcon>🔒</LockIcon>
  </BlurOverlay>
)}


  <MiniHint>(클릭하면 상세 보기)</MiniHint>
</MiniCard>

  ))}
</CardRow>

  </HoverCard>
</SingleCard>


      
      </>
    );
  }

  function MiniCalendar() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
  
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= lastDate; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
  
    return (
      <CalendarGrid>
        {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
          <CalHeader key={d}>{d}</CalHeader>
        ))}
        {cells.map((d, i) => (
          <CalCell key={i} $today={d === today.getDate()}>
            {d || ""}
          </CalCell>
        ))}
      </CalendarGrid>
    );
  }

  // MainContent.jsx 내부에서 사용


  function JobCardsPreview() {
    return (
      <JobCardRow>
        {/* ── 공고 검색 ── */}
        <PrettyCard onClick={() => setSelectedPage("search")} $darkMode={darkMode}>
          <IconBg>
            <FiSearch />
          </IconBg>
  
          <CardHead>
            <HighlightBar />
            <h3>공고 검색</h3>
          </CardHead>
  
          <CardBody>
            원하는 키워드로<br />
            채용 공고를 찾아보세요.
          </CardBody>
  
          <CardFoot>예: 백엔드 · 데이터 분석 · AI</CardFoot>
        </PrettyCard>
  
        {/* ── 찜한 공고 ── */}
        <PrettyCard onClick={() => setSelectedPage("saved")} $darkMode={darkMode}>
          <IconBg>
            <FiBookmark />
          </IconBg>
  
          <CardHead>
            <HighlightBar />
            <h3>찜한 공고</h3>
          </CardHead>
  
          <CardBody>
            저장한 공고를<br />
            한곳에서 모아보세요.
          </CardBody>
  
          <CardFoot>최대 20개까지 자동 저장</CardFoot>
        </PrettyCard>
      </JobCardRow>
    );
  }


  
  function TodoPreviewList() {
    const [todayTasks, setTodayTasks] = React.useState([]);
  
    useEffect(() => {
      const todayKey = new Date().toISOString().slice(0, 10);      // YYYY-MM-DD
      const saved = JSON.parse(localStorage.getItem("tasks") || "{}");
  
      // ▶︎ 최대 4개만 미리보기
      setTodayTasks((saved[todayKey] || []).slice(0, 4));
  
      // storage 변화(다른 탭·컴포넌트) 감지
      const listener = () => {
        const updated = JSON.parse(localStorage.getItem("tasks") || "{}");
        setTodayTasks((updated[todayKey] || []).slice(0, 4));
      };
      window.addEventListener("storage", listener);
      return () => window.removeEventListener("storage", listener);
    }, []);
  
    return (
      <PreviewTasks>
        {todayTasks.length === 0 ? (
          <NoTask>오늘 할 일이 없습니다</NoTask>
        ) : (
          todayTasks.map((t, i) => (
            <TaskItem key={i}>
              <input type="checkbox" checked={t.done} readOnly />
              <span>{t.text}</span>
            </TaskItem>
          ))
        )}
      </PreviewTasks>
    );
  }
  
  

  /* ───────── AI 추천 공고 페이지 ───────── */
  function AiJobsPage({ $darkMode }) {
    return (
      <Card
        $darkMode={$darkMode}
        style={{ alignItems: "flex-start", padding: "2.5rem", position: "relative" }}
      >
        {/* 예시 질문 */}
        {!aiMessage && !isLoading && (
          <ExampleBox>
            <p style={{ fontWeight: 600, marginBottom: "0.9rem" }}>이런 질문이 가능해요:</p>
            <ul>
              {examplePrompts.map((ex) => (
                <ExampleItem
                  key={ex}
                  $darkMode={$darkMode}
                  onClick={() => handleExampleClick(ex)}
                >
                  <CheckIcon>
                    {selectedExample === ex ? <FaCheckCircle /> : <FaRegCircle />}
                  </CheckIcon>
                  {ex}
                </ExampleItem>
              ))}
            </ul>
          </ExampleBox>
        )}

        {isLoading && <p>🔄 추천을 생성하는 중...</p>}

        {aiMessage && !isLoading && (
          <ResultSection>
            {/* ───────── Left : 메시지 + 추천 리스트 ───────── */}
            <LeftPane>
              <Message>{aiMessage}</Message>

              <JobList>
                {recommendations.map((job, idx) => (
                  <JobItem key={job.company}>
                    <JobHeader>
                      <Rank>{idx + 1}</Rank>
                      <Company>{job.company}</Company>
                      <Match>{job.match}%</Match>
                    </JobHeader>
                    <ProgressTrack>
                      <ProgressBar $match={job.match} />
                    </ProgressTrack>
                  </JobItem>
                ))}
              </JobList>

              <BackBtn
                onClick={() => {
                  setAiMessage("");
                  setRecommendations([]);
                
                  setSelectedExample(null);
                }}
              >
                ⬅ 예시 질문 보기로 돌아가기
              </BackBtn>
            </LeftPane>

            {/* ───────── Right : 로드맵 안내 ───────── */}
            <Callout>
              <p>
                👉 추천 결과 기반 <strong>커리어 로드맵</strong>을 설계해보고 싶다면,
                아래 버튼을 눌러보세요.
              </p>
              <RoadmapBtn onClick={() => setSelectedPage("career-roadmap")}>
                커리어 로드맵 바로 가기
              </RoadmapBtn>
            </Callout>
          </ResultSection>
        )}
      </Card>
    );
  }




  /* ───────── 렌더 ───────── */
  return (
    <Main $darkMode={darkMode}>
      {/* ─── 헤더 ─── */}
      <HeaderWrapper>
  <Header $darkMode={darkMode}>김취준님, 만나서 반갑습니다</Header>

  <ProfileMenuWrapper>
    <ProfileMenu
      darkMode={darkMode}
      toggleTheme={toggleTheme}
      setSelectedPage={setSelectedPage}
    />
  </ProfileMenuWrapper>
</HeaderWrapper>




      {/* ─── 본문 ─── */}
      {/* ─── 본문 ─── */}
<ContentArea>
  <Scrollable>
    {selectedPage === LANDING_PAGE && (
      <>
        <LandingCards setSelectedPage={setSelectedPage} />
        <JobCardPreview
          setSelectedPage={setSelectedPage}
          darkMode={darkMode}
        />
      </>
    )}

    {selectedPage === "saved" && (
      <SavedJobs savedJobs={savedJobs} darkMode={darkMode} />
    )}




{selectedPage === "profile" && (
  <MyProfile darkMode={darkMode} />
)}

{selectedPage === "search" && (
  <JobSearchSection>
    <SectionTitle>
      <HighlightBar />
      <span>공고 검색</span>
    </SectionTitle>

    <SearchBarWrapper>
      <SearchInput
        type="text"
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        placeholder="키워드를 입력하세요..."
      />
      <SearchButton onClick={handleSearch}>검색</SearchButton>
    </SearchBarWrapper>

    <TabMenu>
      {["전체", "최신 공고", "유행 공고", "마감 임박"].map((tab) => (
        <Tab
          key={tab}
          selected={selectedTab === tab}
          onClick={() => setSelectedTab(tab)}
        >
          {tab}
        </Tab>
      ))}
    </TabMenu>

    <JobCardList>
      {filteredJobs.map((job) => (
        /* MainContent.jsx 내부 검색 결과 렌더링 부분 */
<JobCard key={job.id}>
  <strong>{job.company}</strong>
  <div>{job.position}</div>
  <span>{job.location}</span>

  {/* ▼ 찜 버튼 */}
  <SaveBtn
    onClick={() => {
      // 이미 있으면 추가 안 함
      setSavedJobs((prev) =>
        prev.find((j) => j.id === job.id) ? prev : [...prev, job]
      );
    }}
  >
    <FaHeart />
  </SaveBtn>
</JobCard>

      ))}
    </JobCardList>
  </JobSearchSection>
)}



          {/* 홈이 아닐 때 상단 뒤로가기(홈으로) */}
          {selectedPage !== LANDING_PAGE && (
            <BackButton
              $darkMode={darkMode}
              onClick={() => setSelectedPage(LANDING_PAGE)}
            >
              <FaArrowLeft /> 뒤로가기
            </BackButton>
          )}

         

          {/* AI 추천 공고 페이지 */}
          {selectedPage === "ai-jobs" && <AiJobsPage $darkMode={darkMode} />}

          {selectedPage === "career-summary" && (
            <CareerRoadmapMain darkMode={darkMode} />
          )}

          {selectedPage === "career-requirements" && (
            <TrendDetail darkMode={darkMode} />
          )}

          {selectedPage === "career-gap" && (
            <GapDetail darkMode={darkMode} />
          )}

          {selectedPage === "career-plan" && (
            <OvercomeDetail darkMode={darkMode} />
          )}

          {selectedPage === "career-roadmap" &&
  (roadmapSection ? (
    <CareerRoadmapDetail
      section={roadmapSection}
      darkMode={darkMode}
      onBack={() => setRoadmapSection(null)} // ← 뒤로가기 클릭 시 null로 초기화
    />
  ) : (
    <CareerRoadmapMain
      darkMode={darkMode}
      onSelect={(id) => setRoadmapSection(id)} // ← 카드 클릭 시 section ID 설정
    />
  ))}


          {/* 기타 페이지 공통 카드 */}
          {selectedPage === "todo" ? (
  <Card $darkMode={darkMode} style={{ padding: "2.5rem" }}>
    {/* To-do List 타이틀 */}
    <SectionTitle style={{ fontSize: "1.9rem", marginBottom: "1.4rem" }}>
      <HighlightBar />
      <span></span>
    </SectionTitle>

    {/* 할 일 캘린더 + 체크리스트 */}
    <TodoList darkMode={darkMode} />
  </Card>
) : (
  selectedPage !== "ai-jobs" &&
  selectedPage !== "career-roadmap" &&
  pages.includes(selectedPage) && (
    <Card $darkMode={darkMode}>
      <h2>{pageTitle[selectedPage]}</h2>
      <p>{pageDesc[selectedPage]}</p>
    </Card>
  )
)}


        </Scrollable>
      </ContentArea>

      {/* ─── 공통 프롬프트 ─── */}
              
        <PromptBar
          darkMode={darkMode}
          activePage={selectedPage}
          onSubmit={handlePromptSubmit}
        />
    </Main>
  );
}

/* ───────── 스타일 ───────── */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* 메인 컨테이너 */
const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  ${({ $darkMode }) =>
    $darkMode
      ? css`
          background: #000;
          color: #fff;
        `
      : css`
          background: #fff;
          color: #614f25;
        `}
  min-height: 100vh;
  padding-bottom: 200px;
`;

/* 헤더 */
const HeaderWrapper = styled.div`
  position: relative;
  padding: 2rem 0;
  text-align: center;
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
  display: flex;               // ✅ 핵심
  flex-direction: column;      // ✅ 아래로 쌓기
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


 const HoverCard = styled.div`
  position: relative;
  background: #edece9;
  border-radius: 2rem;
  padding: 2rem;
  transition: transform 0.2s ease;
  cursor: pointer;
  &:hover {
    transform: translateY(-4px);
  }
`;





const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  ${({ $darkMode }) =>
    $darkMode
      ? css`
          background: #555;
          color: #fff;
          &:hover {
            background: #666;
          }
        `
      : css`
          background: #e0d9c9;
          color: #614f25;
          &:hover {
            background: #d5cdbc;
          }
        `}
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
  width: 100%;
  max-width: 800px;
  border-radius: 1rem;
  padding: 1rem;
  ${({ $darkMode }) =>
    $darkMode ? "background:#333;" : "background:rgb(188, 185, 179);"}
`;
const PromptText = styled.div`
  font-size: 1rem;
  color: rgb(25, 19, 1);
`;
const PromptInput = styled.input.attrs({ inputMode: "text" })`
  flex: 1;
  font-size: 1rem;
  border: none;
  border-radius: 0.5rem;
  padding: 1.3rem 1rem;
  ${({ $darkMode }) =>
    $darkMode
      ? css`
          background: #333;
          color: #fff;
          &::placeholder {
            color: #999;
          }
        `
      : css`
          background: #fff;
          color: #000;
          &::placeholder {
            color: #aaa;
          }
        `}
  &:focus {
    scroll-margin: 0 !important;
    outline: none;
  }
`;
const PromptButton = styled.button`
  padding: 1.4rem 1.2rem;
  background: #ffc107;
  color: #222;
  font-weight: bold;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  &:hover {
    background: #ffb300;
  }
`;

/* 예시 질문 전용 */
const ExampleBox = styled.div`
  margin-bottom: 2rem;
  ul {
    list-style: disc;
    padding-left: 1.4rem;
    line-height: 1.55;
  }
`;
const ExampleItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0;
  cursor: pointer;
  font-size: 1rem;
  ${({ $darkMode }) => ($darkMode ? css`color:#eee;` : css`color:#3c2f12;`)}
  &:hover { opacity: .78; }
`;
const CheckIcon = styled.span`
  font-size: 1.1rem;
  color: #ffc107;
  display: flex;
  align-items: center;
`;

/* 홈 카드 레이아웃 */
const MainCards = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
`;
const SingleCard = styled.div`
  margin-bottom: 2rem;
`;
const SubCards = styled(MainCards)``;

/* 공통 타이포 등 */
const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.7rem;
  font-weight: 800;
  margin-bottom: 0rem;
`;


const DescText = styled.p`
  font-size: 0.9rem;
  color: #6c5f3f;
  margin: 0.3rem 0 1rem;
`;

const ColumnTitle = styled.span`
  font-size: 1.05rem;
  font-weight: 600;
  color: #7e6a39;
`;
const ColumnHeader = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 1.05rem;
  font-weight: 600;
  padding: 0 0.2rem;
  color: #7e6a39;
  margin-bottom: 0.6rem;
`;
const PreviewList = styled.ul`
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  list-style: none;
  padding: 0;
  margin: 0;
`;
const PreviewItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  width: 100%;
`;
const CompanyName = styled.span`
  font-size: 1.2rem;
  font-weight: 600;
  flex: 1.2;
  text-align: left;
`;
const Deadline = styled.span`
  font-size: 0.95rem;
  font-weight: 500;
  color: #555;
  flex: 0.8;
  text-align: left;
  padding-left: 2.2rem;
`;
const MatchPercent = styled.span`
  font-size: 1.2rem;
  font-weight: 700;
  flex: 0.6;
  text-align: right;
  color: ${({ $match }) =>
    $match >= 90 ? "#00796B" : $match >= 80 ? "#F57C00" : "#D32F2F"};
`;
const HintText = styled.small`
  margin-top: auto;
  font-size: 0.8rem;
  opacity: 0.55;
  padding-top: 1.2rem;
`;

/* 로드맵 미리보기 */
const RoadmapPreview = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: stretch;
  gap: 0;
  margin-top: 1rem;
  width: 100%;
`;
const RoadmapItem = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  text-align: center;
  padding: 0 1rem;
`;
const Divider = styled.div`
  width: 2px;
  height: 200%;
  background: ${({ $darkMode }) => ($darkMode ? "#666" : "#c4b38a")};
  opacity: 0.5;
  align-self: center;
`;
const Title = styled.div`
  font-size: 1.4rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: #3c2f12;
`;
const BulletList = styled.ul`
  list-style-type: disc;
  padding-left: 1.2rem;
  font-size: 0.95rem;
  color: #6c5f3f;
  line-height: 1.6;
`;

/* 전체 2-컬럼 그리드 */
const ResultSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 2rem;
  align-items: flex-start;
  width: 100%;

  /* 모바일 : 1-컬럼 */
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

/* 왼쪽 영역 */
const LeftPane = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

/* 질문 메시지 */
const Message = styled.p`
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.6;
  white-space: pre-wrap;
  color: #333;
`;

/* 리스트 */
const JobList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

/* 각 카드 */
const JobItem = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  padding: 1rem 1.2rem;
`;

/* 카드 헤더 */
const JobHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6rem;
  font-weight: 600;
  font-size: 0.98rem;
`;
const Rank = styled.span`
  color: #555;
`;
const Company = styled.span`
  flex: 1;
  text-align: center;
  font-weight: 700;
`;
const Match = styled.span`
  color: #ff9800;
  font-weight: 700;
`;

/* 진행 바 */
const ProgressTrack = styled.div`
  width: 100%;
  height: 8px;
  background: #eee;
  border-radius: 4px;
`;
const ProgressBar = styled.div`
  width: ${({ $match }) => $match}%;
  height: 100%;
  background: #ffc107;
  border-radius: 4px;
  transition: width 0.4s ease;
`;

/* 예시 질문 돌아가기 */
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

const IntroText = styled.p`
  font-size: 0.95rem;
  line-height: 1.6;
  color: #6c5f3f;
  margin-bottom: 0.6rem;
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

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.8rem;
  h2 {
    font-size: 1.6rem;
  }
`;

const LocalBack = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border: none;
  background: none;
  font-size: 0.9rem;
  cursor: pointer;
  ${({ $darkMode }) =>
    $darkMode
      ? css`
          color: #ffc107;
          &:hover {
            opacity: 0.8;
          }
        `
      : css`
          color: #614f25;
          &:hover {
            opacity: 0.8;
          }
        `}
`;

const DetailList = styled.ul`
  list-style: disc;
  padding-left: 1.4rem;
  line-height: 1.8;
  font-size: 0.97rem;
`;


const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.2rem;
  width: 100%;
`;
const CalHeader = styled.div`
  font-size: 0.7rem;
  font-weight: 700;
  text-align: center;
  opacity: 0.8;
`;
const CalCell = styled.div`
  height: 22px;
  font-size: 0.7rem;
  text-align: center;
  line-height: 22px;
  border-radius: 4px;
  ${({ $today }) =>
    $today && css`
      background: #ffc107;
      color: #000;
      font-weight: 700;
    `}
`;

const PreviewTasks = styled.ul`
  list-style: none;
  padding-left: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;
const TaskItem = styled.li`
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  input {
    pointer-events: none;
  }
`;
const NoTask = styled.li`
  font-size: 0.8rem;
  color: #777;
`;


const CardRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 0.8rem;
  flex-wrap: nowrap;
  width: 100%;
  margin-top: 1rem;
`;

const MiniCard = styled.div`
  width: 270px;
  min-height: 400px;
  background-color: ${({ $bg }) => $bg || " #f5f5f5"};
  padding: 1.2rem 1rem;
  border-radius: 1rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  text-align: center;
  font-weight: 500;
  filter: ${({ $blurred }) => ($blurred ? "blur(2px)" : "none")};
  pointer-events: ${({ $blurred }) => ($blurred ? "none" : "auto")};

  h3 {
    font-size: 1.2rem;
    font-weight: bold;
  }

  p {
    font-size: 0.95rem;
    line-height: 1.4;
  }

  &:hover {
    transform: scale(1.04);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  }
`;

const MiniHint = styled.small`
  font-size: 0.8rem;
  opacity: 0.55;
  margin-top: auto;
`;

const MiniWordCloudPreview = styled.div`
  width: 100%;
  height: 180px;
  margin-top: 1rem;

  .react-wordcloud {
    width: 100%;
    height: 100%;
  }

  svg {
    width: 100% !important;
    height: 100% !important;
  }
`;




const FlowRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 2rem;
  flex-wrap: nowrap;
`;

const RoadmapCard = styled.div`
  width: 400px;
  height: auto;
  min-height: 450px;
  background-color: ${({ $bg }) => $bg || "#f5f5f5"};
  text-align: center;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 0.8rem;
  cursor: pointer;
  border-radius: 1rem;
  font-weight: 500;
  transition: transform 0.2s ease;

  h3 {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 0.4rem;
  }

  p {
    font-size: 1.05rem;
    line-height: 1.6;
    min-height: 50px;
  }

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  }
`;

const WordPreview = styled.div`
  margin-top: 1rem;
  width: 100%;
  height: 180px;
`;

const SmallHint = styled.small`
  font-size: 0.9rem;
  opacity: 0.55;
  margin-top: auto;
`;

const ArrowBox = styled.div`
  font-size: 2rem;
  color: #aaa;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MiniRadarPreview = styled.div`
  width: 100%;
  height: 180px;
  margin-top: 1rem;
`;



const BlurOverlay = styled.div`
  position: relative;
  width: 100%;
  height: 220px;
  margin-top: 1rem;
`;

const BlurBox = styled.div`
  width: 100%;
  height: 100%;
  background: #f0e6cc;
  filter: blur(4px);
  border-radius: 0.6rem;
`;

const LockIcon = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  color: #333;
  z-index: 2;
  pointer-events: none;
`;




const ThemeToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 1.2rem;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: 2px solid ${({ $darkMode }) => ($darkMode ? "#fff" : "#000")};
  background: ${({ $darkMode }) => ($darkMode ? "#000" : "#fff")};
  color: ${({ $darkMode }) => ($darkMode ? "#fff" : "#000")};
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
`;

const ToggleIcon = styled.div`
  background: #fff;
  color: #000;
  border-radius: 50%;
  padding: 0.3rem;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;



const JobCardRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-top: 1rem;
`; 

const StyledCard = styled.div`
  padding: 2rem;
  border-radius: 1.5rem;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  cursor: pointer;
  transition: all 0.25s ease;

  ${({ $darkMode }) =>
    $darkMode
      ? css`
          background: #2d2d2d;
          color: #fff;
          &:hover {
            background: #3a3a3a;
          }
        `
      : css`
          background: #eae9e5;
          color: #4b3e1e;
          &:hover {
            background: #dad7cf;
          }
        `}
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 1rem;

  h3 {
    margin: 0;
    font-weight: 800;
  }
`;


const SubText = styled.p`
  font-size: 0.95rem;
  line-height: 1.6;
  opacity: 0.9;
  margin: 0;
`;


const JobPreviewCard = styled.div`
  height: 300px;
  border-radius: 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.3rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;

  ${({ $darkMode }) =>
    $darkMode
      ? css`
          background: #333;
          color: #ffc107;
          &:hover {
            background: #444;
            box-shadow: 0 4px 10px rgba(255, 193, 7, 0.2);
          }
        `
      : css`
          background: #eae9e5;
          color: #5a4a20;
          &:hover {
            background: #dcd8cb;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          }
        `}
`;

const IconWrapper = styled.div`
  font-size: 2.4rem;
  margin-bottom: 1rem;
`;

const Label = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
`;



const KeywordList = styled.ul`
  list-style: disc;
  padding-left: 1.2rem;
  font-size: 0.9rem;
  line-height: 1.6;
`;

const HintList = styled.ul`
  list-style: disc;
  padding-left: 1.2rem;
  font-size: 0.9rem;
  line-height: 1.6;
`;

const TipText = styled.div`
  font-size: 0.88rem;
  color: #777;
  margin-top: auto;
`;


const KeywordRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Tag = styled.span`
  background: #fff3cd;
  color: #6b4e00;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
`;

const TipList = styled.ul`
  list-style: none;
  padding-left: 0;
  font-size: 0.88rem;
  line-height: 1.6;
  color: #555;

  li::before {
    content: "• ";
    color: #aaa;
  }
`;

const Tip = styled.div`
  font-size: 0.85rem;
  color: #888;
  margin-top: 1rem;
`;

const Spacer = styled.div`
  flex-grow: 1;
`;

const MinimalHint = styled.div`
  font-size: 0.85rem;
  color: #999;
  margin-top: 1.5rem;
`;



/* 메인 카드 */
const PrettyCard = styled.div`
  position: relative;
  padding: 2.8rem 2.4rem 2.2rem;
  border-radius: 2rem;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.35s ease, box-shadow 0.35s ease;

  /* 글래스 느낌 + 라이트 & 다크 모두 어울리게 */
  /* 기존 카드들과 같은 배경 색상 적용 */
  background:rgb(239, 238, 237);
  color: #3d3215;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 18px 30px rgba(0, 0, 0, 0.12);
  }
`;

/* 좌측 컬러 막대 + 제목 */
const CardHead = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.2rem;

  h3 {
    font-size: 2rem;
    font-weight: 800;
    margin: 0;
  }
`;

const HighlightBar = styled.div`
  width: 8px;
  height: 1.6rem;
  background: #ffc400;
  border-radius: 4px;
`;

/* 본문 & 푸터 */
const CardBody = styled.p`
  font-size: 1.1rem;
  line-height: 1.56;
  margin: 0 0 4.5rem;
`;

const CardFoot = styled.div`
  font-size: 0.9rem;
  color: #8b8b8b;
`;

const CardIconBg = styled.div`
  position: absolute;
  top: -10%;
  right: -8%;
  font-size: 9rem;
  opacity: 0.07;
  pointer-events: none;
  z-index: 0;
`;


const IconBg = styled.div`
  position: absolute;
  right: -14%;
  top: -14%;
  font-size: 11rem;
  opacity: 0.06;
  pointer-events: none;
`;



const JobSearchSection = styled.section`
  padding: 2rem;
`;


const ExampleText = styled.div`
  font-size: 0.9rem;
  color: gray;
  margin-top: 0.2rem;
`;

const SearchBarWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.4rem;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.6rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #ccc;
`;

const SearchButton = styled.button`
  background: #ffc107;
  border: none;
  border-radius: 0.5rem;
  padding: 0 1.2rem;
  cursor: pointer;
`;

const TabMenu = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.4rem;
`;

const Tab = styled.div`
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  cursor: pointer;
  background: ${({ selected }) => (selected ? "#ffc107" : "#eee")};
  font-weight: ${({ selected }) => (selected ? "bold" : "normal")};
`;

const JobCardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const JobCard = styled.div`
  padding: 1rem;
  border-radius: 1rem;
  background: #f7f7f7;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
`;



/* 스타일 */
const SaveBtn = styled.button`
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: #d32f2f;
  font-size: 1.2rem;

  &:hover {
    transform: scale(1.1);
  }
`;

const CardDecorationIcon = styled.div`
  position: absolute;
  top: -18%;
  right: -10%;
  width: 150px;
  height: 150px;
  background: url(${(props) => props.icon}) no-repeat center/contain;
  opacity: 0.06;
  z-index: 0;
  pointer-events: none;
  animation: float 6s ease-in-out infinite;

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-8px);
    }
  }
`;






