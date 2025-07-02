/* ───────── src/components/MainContent.jsx ───────── */
import React, { useState, useRef, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import {
  FaUserCircle,
  FaArrowLeft,
  FaCheckCircle,
  FaRegCircle,
} from "react-icons/fa";

const LANDING_PAGE = "dashboard";

export default function MainContent({
  selectedPage,
  setSelectedPage,
  darkMode,
  toggleTheme,
}) {
  /* ───────── 상태 ───────── */
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  /* ▼ AI 추천 공고용 상태 */
  const [userQuery, setUserQuery] = useState("");
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
    "search",
    "saved",
    "history",
  ];
  const pageTitle = {
    "ai-jobs": "AI 추천 공고",
    "career-roadmap": "커리어 로드맵",
    todo: "To-do List",
    search: "공고 검색",
    saved: "찜한 공고",
    history: "대화 이력",
  };
  const pageDesc = {
    "ai-jobs": "AI 기반 추천 채용 공고를 보여줍니다",
    "career-roadmap": "목표를 설정하고 커리어를 설계해보세요.",
    todo: "오늘 해야 할 일을 정리해보세요.",
    search: "모든 채용 공고를 키워드로 검색하세요.",
    saved: "찜한 공고를 모아볼 수 있습니다.",
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
  const handlePromptSubmit = async (inputQuery) => {
    if (selectedPage !== "ai-jobs") return;

    const query = inputQuery !== undefined ? inputQuery : userQuery;
    if (!query.trim()) return;

    if (isGuest && guestUses >= 20) {
      alert(
        "게스트는 AI 추천 공고 기능을 20회까지 이용할 수 있습니다.\n회원가입 후 계속 이용해 주세요!"
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetchAiJobRecommendation(query);
      setAiMessage(res.explanation);
      setRecommendations(res.jobs);
      setUserQuery(query);
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
      { company: "네이버", match: 95, dday: 3 },
      { company: "카카오", match: 88, dday: 5 },
      { company: "삼성전자", match: 84, dday: 1 },
      { company: "LG CNS", match: 77, dday: 2 },
      { company: "쿠팡", match: 72, dday: 7 },
    ];

    return (
      <>
        {/* 상단 카드 2개 */}
        <MainCards>
          {/* AI 추천 공고 카드 */}
          <HoverCard
            $darkMode={darkMode}
            onClick={() => setSelectedPage("ai-jobs")}
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "2.2rem 2rem 1.6rem",
              justifyContent: "flex-start",
            }}
          >
            <SectionTitle>
              <HighlightBar />
              <span>AI 추천 공고</span>
            </SectionTitle>
            <DescText>데이터 분석가에게 맞는 기업을 추천했어요</DescText>
            <ColumnHeader>
              <ColumnTitle style={{ flex: 1.2, textAlign: "left" }}>기업명</ColumnTitle>
              <ColumnTitle
                style={{ flex: 0.8, textAlign: "left", paddingLeft: "2.2rem" }}
              >
                마감기간
              </ColumnTitle>
              <ColumnTitle style={{ flex: 0.6, textAlign: "right" }}>적합도</ColumnTitle>
            </ColumnHeader>
            <PreviewList>
              {preview.map((p, idx) => (
                <PreviewItem key={p.company}>
                  <CompanyName>
                    <strong>
                      {idx + 1}. {p.company}
                    </strong>
                  </CompanyName>
                  <Deadline>D-{p.dday}</Deadline>
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
              textAlign: "left",
              gap: "1.2rem",
            }}
          >
            <SectionTitle style={{ fontSize: "1.7rem" }}>
              <HighlightBar />
              <span>To-do List</span>
            </SectionTitle>

            <IntroText>
              매일 해야 할 일을 캘린더에 정리하고,
              <br />
              날짜별로 한눈에 확인하세요
            </IntroText>

            <FeatureList>
              <li>📅 달력 기반 날짜별 할 일 관리</li>
              <li>📝 하루 일정 직접 작성 및 수정</li>
              <li>✅ 완료 체크 및 자동 정렬</li>
              <li>📊 주간/월간 일정 요약 제공</li>
              <li>🤖 AI 기반 일정 추천 (준비 중)</li>
            </FeatureList>

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

            <RoadmapPreview>
              <RoadmapItem>
                <Title>공고 분석</Title>
                <BulletList>
                  <li>핵심 키워드 및 기술 요건 추출</li>
                  <li>우대 조건 및 직무 요약 제공</li>
                  <li>한눈에 공고 요약 파악</li>
                </BulletList>
              </RoadmapItem>

              <Divider $darkMode={darkMode} />

              <RoadmapItem>
                <Title>갭 분석</Title>
                <BulletList>
                  <li>내 이력서와 공고를 항목별 비교</li>
                  <li>부족 기술/경험 자동 분석</li>
                  <li>갭 점수 시각화 제공</li>
                </BulletList>
              </RoadmapItem>

              <Divider $darkMode={darkMode} />

              <RoadmapItem>
                <Title>극복 방안</Title>
                <BulletList>
                  <li>부족한 영역 학습 루트 제안</li>
                  <li>프로젝트/경험 추천</li>
                  <li>강의 및 부트캠프 연결</li>
                </BulletList>
              </RoadmapItem>
            </RoadmapPreview>

            <HintText>(클릭하면 상세 보기)</HintText>
          </HoverCard>
        </SingleCard>

        {/* 하단 2개 카드 */}
        <SubCards>
          <HoverCard
            style={{ height: 200 }}
            $darkMode={darkMode}
            onClick={() => setSelectedPage("search")}
          >
            공고 검색
          </HoverCard>
          <HoverCard
            style={{ height: 200 }}
            $darkMode={darkMode}
            onClick={() => setSelectedPage("saved")}
          >
            찜한 공고
          </HoverCard>
        </SubCards>
      </>
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
                  setUserQuery("");
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

  /* ───────── 커리어 로드맵 메인(섹션 카드 3개) ───────── */
  function RoadmapMain() {
    const sections = [
      {
        id: "analysis",
        label: "공고 분석",
        desc: "공고 핵심 키워드를 추출합니다.",
        color: "#fdf5dd",
      },
      {
        id: "gap",
        label: "갭 분석",
        desc: "내 이력서와 공고를 비교합니다.",
        color: "#f3f1eb",
      },
      {
        id: "plan",
        label: "극복 방안",
        desc: "부족한 부분 학습 계획을 제안합니다.",
        color: "#efeffa",
      },
    ];
  
    return (
      <Card $darkMode={darkMode} style={{ padding: "2.5rem", alignItems: "center" }}>
        <FlowRow>
          {sections.map((s, i) => (
            <React.Fragment key={s.id}>
              <RoadmapCard
                $darkMode={darkMode}
                $bg={s.color}
                onClick={() => setRoadmapSection(s.id)}
              >
                <h3>{s.label}</h3>
                <p>{s.desc}</p>
                <SmallHint>(클릭하면 상세 보기)</SmallHint>
              </RoadmapCard>
              {i < sections.length - 1 && <ArrowBox>→</ArrowBox>}
            </React.Fragment>
          ))}
        </FlowRow>
      </Card>
    );
  }
  
  
  

  /* ───────── 커리어 로드맵 상세 ───────── */
  function RoadmapDetail({ section }) {
    const titles = {
      analysis: "공고 분석",
      gap: "갭 분석",
      plan: "극복 방안",
    };
    const dummy = {
      analysis: [
        "• 요구 기술 키워드 12개 추출",
        "• 우대 조건 3건 요약",
        "• 직무 핵심 역량 그래프",
      ],
      gap: [
        "• 기술 스택 일치율 68%",
        "• 프로젝트 경험 부족 2건",
        "• 학위/자격증 요구 사항 없음",
      ],
      plan: [
        "• React 심화 강의(2주)",
        "• 사이드 프로젝트 1건 제안",
        "• 알고리즘 풀이 주 3회 추천",
      ],
    };

    return (
      <DetailCard $darkMode={darkMode}>
        <SectionHeader>
          <LocalBack onClick={() => setRoadmapSection(null)}>
            <FaArrowLeft /> 뒤로가기
          </LocalBack>
          <h2>{titles[section]}</h2>
        </SectionHeader>

        <DetailList>
          {dummy[section].map((line) => (
            <li key={line}>{line}</li>
          ))}
        </DetailList>
      </DetailCard>
    );
  }

  /* ───────── 바깥 클릭 시 프로필 닫기 ───────── */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ───────── 렌더 ───────── */
  return (
    <Main $darkMode={darkMode}>
      {/* ─── 헤더 ─── */}
      <HeaderWrapper>
        <Header $darkMode={darkMode}>성재 님, 만나서 반갑습니다</Header>
        <ProfileMenu ref={profileRef}>
          <ToggleWrapper>
            <SwitchWrapper onClick={toggleTheme} $darkMode={darkMode}>
              <SwitchKnob $darkMode={darkMode} />
            </SwitchWrapper>
            <ProfileIcon onClick={() => setShowProfile((p) => !p)}>
              <FaUserCircle />
            </ProfileIcon>
          </ToggleWrapper>
          {showProfile && (
            <Dropdown $darkMode={darkMode}>
              <DropdownItem $darkMode={darkMode}>프로필 수정</DropdownItem>
              <DropdownItem $darkMode={darkMode}>로그아웃</DropdownItem>
            </Dropdown>
          )}
        </ProfileMenu>
      </HeaderWrapper>

      {/* ─── 본문 ─── */}
      <ContentArea>
        <Scrollable>
          {selectedPage === LANDING_PAGE && (
            <LandingCards setSelectedPage={setSelectedPage} />
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

          {/* 커리어 로드맵 페이지 */}
          {selectedPage === "career-roadmap" &&
            (roadmapSection ? (
              <RoadmapDetail section={roadmapSection} />
            ) : (
              <RoadmapMain />
            ))}

          {/* 기타 페이지 공통 카드 */}
          {selectedPage !== "ai-jobs" &&
            selectedPage !== "career-roadmap" &&
            pages.includes(selectedPage) && (
              <Card $darkMode={darkMode}>
                <h2>{pageTitle[selectedPage]}</h2>
                <p>{pageDesc[selectedPage]}</p>
              </Card>
            )}
        </Scrollable>
      </ContentArea>

      {/* ─── 공통 프롬프트 ─── */}
      <PromptWrapper>
        <Prompt $darkMode={darkMode}>
          <PromptText>JOB자에게 메시지</PromptText>
          <PromptInput
            placeholder={
              selectedPage === "ai-jobs"
                ? "추천받고 싶은 조건을 입력하세요…"
                : "무엇이든 물어보세요…"
            }
            $darkMode={darkMode}
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
          />
          <PromptButton onClick={() => handlePromptSubmit()}>전송</PromptButton>
        </Prompt>
      </PromptWrapper>
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
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 4rem 0;
`;
const Header = styled.h1`
  font-size: 2rem;
  ${({ $darkMode }) => ($darkMode ? "color:#f4bf12;" : "color:#000;")}
`;
const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;
const SwitchWrapper = styled.div`
  width: 48px;
  height: 28px;
  border-radius: 14px;
  cursor: pointer;
  background: ${({ $darkMode }) => ($darkMode ? "#555" : "#ccc")};
  position: relative;
  transition: background 0.3s;
`;
const SwitchKnob = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${({ $darkMode }) => ($darkMode ? "#0f0" : "#fff")};
  position: absolute;
  top: 4px;
  left: ${({ $darkMode }) => ($darkMode ? "24px" : "4px")};
  transition: left 0.3s;
`;

const ProfileMenu = styled.div`
  position: absolute;
  top: 1.2rem;
  right: 2rem;
`;
const ProfileIcon = styled.div`
  font-size: 1.8rem;
  color: #ccc;
  cursor: pointer;
  &:hover {
    color: #fff;
  }
`;
const Dropdown = styled.div`
  margin-top: 0.4rem;
  border-radius: 0.4rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  ${({ $darkMode }) => ($darkMode ? "background:#444;" : "background:#e9e4d7;")}
`;
const DropdownItem = styled.div`
  padding: 0.6rem 1rem;
  cursor: pointer;
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

const HoverCard = styled(BaseCard)`
  flex: 1;
  height: 480px;
  font-size: 1.2rem;
  cursor: pointer;
  animation: ${fadeIn} 0.5s ease;
  border-radius: 12px;

  &:hover {
    ${({ $darkMode }) =>
      $darkMode
        ? css`
            background: #3c2f12;
            border: 1.5px solid #ffc400;
            color: #fffdd8;
          `
        : css`
            background: rgb(230, 226, 213);
            border: 1.5px solid rgb(238, 186, 15);
            color: #3c2f12;
          `}
  }
`;

const Card = styled(BaseCard)`
  height: 530px;
  width: 850px;
  cursor: default;
  animation: ${fadeIn} 0.5s ease;
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
const HighlightBar = styled.div`
  width: 6px;
  height: 1.3rem;
  background: #ffbb00;
  border-radius: 4px;
`;
const DescText = styled.p`
  font-size: 0.9rem;
  color: #6c5f3f;
  margin: 0.3rem 0 3.7rem;
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
  margin-top: 2rem;
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

const FlowRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.2rem;
  flex-wrap: nowrap;
`;

const RoadmapCard = styled(BaseCard)`
  width: 220px;
  height: 250px;
  background-color: ${({ $bg }) => $bg || "#f5f5f5"};
  text-align: center;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.6rem;
  cursor: pointer;
  transition: all 0.2s;

  h3 {
    font-size: 1.3rem;
    font-weight: bold;
    margin-bottom: 0.4rem;
  }

  p {
    font-size: 1rem;
    line-height: 1.5;
    font-weight: 500;
  }

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
  }
`;

const ArrowBox = styled.div`
  font-size: 2rem;
  color: #888;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SmallHint = styled.small`
  font-size: 0.85rem;
  opacity: 0.55;
  margin-top: auto;
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
