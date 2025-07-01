// components/MainContent.jsx
import React, { useState, useRef, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import { FaUserCircle, FaArrowLeft } from "react-icons/fa";

const LANDING_PAGE = "dashboard";

export default function MainContent({
  selectedPage,
  setSelectedPage,
  darkMode,
  toggleTheme,
}) {
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  /* ─ 페이지 정보 ─ */
  const pages = ["ai-jobs", "career-roadmap", "todo", "search", "saved", "history"];
  const pageTitle = {
    "ai-jobs": "AI 추천 공고",
    "career-roadmap": "커리어 로드맵",
    todo: "To-do List",
    search: "공고 검색",
    saved: "찜한 공고",
    history: "대화 이력",
  };
  const pageDesc = {
    "ai-jobs": "AI 기반 추천 채용 공고를 보여줍니다.",
    "career-roadmap": "목표를 설정하고 커리어를 설계해보세요.",
    todo: "오늘 해야 할 일을 정리해보세요.",
    search: "모든 채용 공고를 키워드로 검색하세요.",
    saved: "찜한 공고를 모아볼 수 있습니다.",
    history: "이전 대화 내용을 확인하세요.",
  };

  /* ─ 대시보드 첫 화면 카드 ─ */
  function LandingCards({ setSelectedPage }) {
    // 프론트 고정 데이터
    const preview = [
      { company: "네이버", match: 95, dday: 3 },
      { company: "카카오", match: 88, dday: 5 },
      { company: "삼성전자", match: 84, dday: 1 },
      { company: "LG CNS", match: 77, dday: 2 },
      { company: "쿠팡", match: 72, dday: 7 },
    ];
    

    return (
      <>
        <MainCards>
          {/* AI 추천 공고 미리보기 */}
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

            <DescText>데이터 분석가에게 맞는 기업을 추천했어요.</DescText>

            <ColumnHeader>
              <ColumnTitle style={{ flex: 1.2, textAlign: "left" }}>기업명</ColumnTitle>
              <ColumnTitle style={{ flex: 0.8, textAlign: "left", paddingLeft: "2.2rem" }}>
                마감기간
              </ColumnTitle>
              <ColumnTitle style={{ flex: 0.6, textAlign: "right" }}>적합도</ColumnTitle>
            </ColumnHeader>


            <PreviewList>
              {preview.map((p, idx) => (
                <PreviewItem key={p.company}>
                  <CompanyName><strong>{idx + 1}. {p.company}</strong></CompanyName>
                  <Deadline>D-{p.dday}</Deadline>
                  <MatchPercent $match={p.match}>{p.match}%</MatchPercent>
                </PreviewItem>
              ))}
            </PreviewList>



            <HintText>(클릭하면 상세 보기)</HintText>
          </HoverCard>





          {/* 커리어 로드맵 기본 카드 */}
          <HoverCard $darkMode={darkMode} onClick={() => setSelectedPage("career-roadmap")}>
            커리어 로드맵
          </HoverCard>
        </MainCards>

        <SingleCard>
          <HoverCard $darkMode={darkMode} onClick={() => setSelectedPage("todo")}>
            To-do List
          </HoverCard>
        </SingleCard>

        <SubCards>
          <HoverCard style={{ height: 200 }} $darkMode={darkMode} onClick={() => setSelectedPage("search")}>
            공고 검색
          </HoverCard>
          <HoverCard style={{ height: 200 }} $darkMode={darkMode} onClick={() => setSelectedPage("saved")}>
            찜한 공고
          </HoverCard>
        </SubCards>
      </>
    );
  }

  /* ─ AI 추천 공고 상세 (이전 버전 유지) ─ */
  function AiJobsCard({ $darkMode }) {
    const recommendations = [
      { company: "네이버", match: 95 },
      { company: "카카오", match: 92 },
      { company: "삼성전자", match: 89 },
      { company: "LG CNS", match: 86 },
      { company: "쿠팡", match: 83 },
    ];
    return (
      <Card $darkMode={$darkMode} style={{ alignItems: "flex-start", padding: "2.5rem" }}>
        <h2 style={{ marginBottom: "1.5rem" }}>데이터 분석가 Top 5 대기업 추천</h2>
        <JobList>
          {recommendations.map((job, idx) => (
            <JobItem key={job.company} $darkMode={$darkMode}>
              <JobHeader>
                <Rank>{idx + 1}</Rank>
                <Company>{job.company}</Company>
                <Match>{job.match}%</Match>
              </JobHeader>
              <ProgressTrack $darkMode={$darkMode}>
                <ProgressBar $match={job.match} />
              </ProgressTrack>
            </JobItem>
          ))}
        </JobList>
      </Card>
    );
  }

  /* ─ 프로필 외부 클릭 감지 ─ */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Main $darkMode={darkMode}>
      {/* 헤더 + 스위치 + 프로필 */}
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

      {/* 메인 내용 */}
      <ContentArea>
        <Scrollable>
          {selectedPage === LANDING_PAGE && <LandingCards setSelectedPage={setSelectedPage} />}

          {selectedPage !== LANDING_PAGE && (
            <BackButton $darkMode={darkMode} onClick={() => setSelectedPage(LANDING_PAGE)}>
              <FaArrowLeft /> 뒤로가기
            </BackButton>
          )}

          {selectedPage === "ai-jobs" && <AiJobsCard $darkMode={darkMode} />}

          {selectedPage !== "ai-jobs" && pages.includes(selectedPage) && (
            <Card $darkMode={darkMode}>
              <h2>{pageTitle[selectedPage]}</h2>
              <p>{pageDesc[selectedPage]}</p>
            </Card>
          )}
        </Scrollable>
      </ContentArea>

      {/* 하단 프롬프트 */}
      <PromptWrapper>
        <Prompt $darkMode={darkMode}>
          <PromptText>JOB자에게 메시지</PromptText>
          <PromptInput placeholder="무엇이든 물어보세요…" $darkMode={darkMode} />
          <PromptButton>전송</PromptButton>
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

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  ${({ $darkMode }) =>
    $darkMode
      ? css`background: #000; color: #fff;`
      : css`background: rgb(235, 233, 224); color: #614f25;`}
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
      ? css`color: #eee; &:hover { background: #555; }`
      : css`color: #333; &:hover { background: #d8d2c2; }`}
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
      ? css`background: #333; color: #fff;`
      : css`background: #f7f6f2; color: #614f25; box-shadow: 0 0 6px rgba(0, 0, 0, 0.05);`}
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
            background:rgb(249, 225, 147);
            border: 1.5px solid rgb(239, 219, 152);
            color: #3c2f12;
          `}
  }
`;
const Card = styled(BaseCard)`
  height: 480px;
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
      ? css`background: #555; color: #fff; &:hover { background: #666; }`
      : css`background: #e0d9c9; color: #614f25; &:hover { background: #d5cdbc; }`}
`;

/* 프롬프트 */
const PromptWrapper = styled.div`
  position: fixed;
  bottom: 2.5rem;
  left: 60%;
  transform: translateX(-50%);
  z-index: 20;
  width: 100%;
  display: flex;
  justify-content: center;
`;
const Prompt = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 800px;
  border-radius: 1rem;
  padding: 1rem;
  ${({ $darkMode }) => ($darkMode ? "background:#333;" : "background:#ebe7dc;")}
`;
const PromptText = styled.div`
  font-size: 1rem;
  color: #ffc107;
`;
const PromptInput = styled.input`
  flex: 1;
  font-size: 1rem;
  border: none;
  border-radius: 0.5rem;
  padding: 1.3rem 1rem;
  ${({ $darkMode }) =>
    $darkMode
      ? css`background: #333; color: #fff; &::placeholder { color: #999; }`
      : css`background: #fff; color: #000; &::placeholder { color: #aaa; }`}
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

/* ────── AI 추천 공고 전용 스타일 ────── */
const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.3rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
`;

const HighlightBar = styled.div`
  width: 6px;
  height: 1.3rem;
  background: #ffbb00;
  border-radius: 4px;
`;

const TitleText = styled.h3`
  font-size: 1.3rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
`;

const DescText = styled.p`
  font-size: 0.83rem;
  color: #6c5f3f;
  margin-bottom: 1.2rem;
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
    $match >= 90 ? "#00796B" :
    $match >= 80 ? "#F57C00" :
    "#D32F2F"};
`;

const HintText = styled.small`
  margin-top: auto;
  font-size: 0.8rem;
  opacity: 0.55;
  padding-top: 1.2rem;
`;

/* 레이아웃용 */
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


const JobList = styled.ul`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1.2rem;
`;

const JobItem = styled.li`
  list-style: none;
  padding: 1rem 1.4rem;
  border-radius: 0.8rem;
  ${({ $darkMode }) =>
    $darkMode
      ? css`background: #2a2a2a;`
      : css`background: #fff; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);`}
`;

const JobHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 700;
`;

const Rank = styled.span`
  width: 24px;
  text-align: center;
`;
const Company = styled.span`
  flex: 1;
  padding-left: 0.4rem;
`;
const Match = styled.span`
  min-width: 52px;
  text-align: right;
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.6rem;
  ${({ $darkMode }) =>
    $darkMode
      ? css`background: #444;`
      : css`background: #e0d9c9;`}
`;

const ProgressBar = styled.div`
  height: 100%;
  width: ${({ $match }) => $match}%;
  background: #ffc107;
`;
