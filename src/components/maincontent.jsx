// components/MainContent.jsx  (← 파일명/컴포넌트명 둘 다 대문자로 시작!)
import React, { useState, useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { FaUserCircle, FaArrowLeft } from "react-icons/fa";

/* 초기 랜딩 탭 (원래 'dashboard'였던 것) */
const LANDING_PAGE = "home";

export default function MainContent({ selectedPage, setSelectedPage }) {
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  /* ▸ 프로필 메뉴 외부 클릭 시 닫기 */
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
    <Main>
      {/* ── 헤더 ── */}
      <HeaderWrapper>
        <Header>성재 님, 만나서 반갑습니다</Header>

        <ProfileMenu ref={profileRef}>
          <ProfileIcon onClick={() => setShowProfile((p) => !p)}>
            <FaUserCircle />
          </ProfileIcon>
          {showProfile && (
            <Dropdown>
              <DropdownItem>프로필 수정</DropdownItem>
              <DropdownItem>로그아웃</DropdownItem>
            </Dropdown>
          )}
        </ProfileMenu>
      </HeaderWrapper>

      {/* ── 본문 ── */}
      <ContentArea>
        <Scrollable>
          {selectedPage === LANDING_PAGE && (
            <LandingCards setSelectedPage={setSelectedPage} />
          )}

          {selectedPage !== LANDING_PAGE && (
            <BackButton onClick={() => setSelectedPage(LANDING_PAGE)}>
              <FaArrowLeft /> 뒤로가기
            </BackButton>
          )}

          {/* 개별 탭(임시 카드) */}
          {pages.includes(selectedPage) && (
            <Card>
              <h2>{pageTitle[selectedPage]}</h2>
              <p>{pageDesc[selectedPage]}</p>
            </Card>
          )}
        </Scrollable>
      </ContentArea>

      {/* ── 프롬프트 영역 ── */}
      <PromptWrapper>
        <Prompt>
          <PromptText>JOB자에게 메시지</PromptText>
          <PromptInput placeholder="무엇이든 물어보세요..." />
          <PromptButton>전송</PromptButton>
        </Prompt>
      </PromptWrapper>
    </Main>
  );
}

/* ---------- 데이터 ---------- */
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
  "ai-jobs": "AI 기반 추천 채용 공고를 보여줍니다.",
  "career-roadmap": "목표를 설정하고 커리어를 설계해보세요.",
  todo: "오늘 해야 할 일을 정리해보세요.",
  search: "모든 채용 공고를 키워드로 검색하세요.",
  saved: "찜한 공고를 모아볼 수 있습니다.",
  history: "이전 대화 내용을 확인하세요.",
};

/* ---------- 랜딩 카드 ---------- */
function LandingCards({ setSelectedPage }) {
  return (
    <>
      <MainCards>
        <HoverCard onClick={() => setSelectedPage("ai-jobs")}>
          AI 추천 공고
        </HoverCard>
        <HoverCard onClick={() => setSelectedPage("career-roadmap")}>
          커리어 로드맵
        </HoverCard>
      </MainCards>

      <SingleCard>
        <HoverCard onClick={() => setSelectedPage("todo")}>To-do List</HoverCard>
      </SingleCard>

      <SubCards>
        <HoverCard
          style={{ height: "200px" }}
          onClick={() => setSelectedPage("search")}
        >
          공고 검색
        </HoverCard>
        <HoverCard
          style={{ height: "200px" }}
          onClick={() => setSelectedPage("saved")}
        >
          찜한 공고
        </HoverCard>
      </SubCards>
    </>
  );
}

/* ---------- 스타일 ---------- */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0);   }
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  background: #000;          /* 배경 통일 */
  color: #fff;
`;

/* ─ 헤더 ─ */
const HeaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 4rem 0;
`;
const Header = styled.h1`
  font-size: 2rem;
  color: #ffc107;
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
  &:hover { color: #fff; }
`;
const Dropdown = styled.div`
  margin-top: 0.4rem;
  background: #444;
  border-radius: 0.4rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.4);
`;
const DropdownItem = styled.div`
  padding: 0.6rem 1rem;
  cursor: pointer;
  &:hover { background: #555; }
`;

/* ─ 본문 스크롤 영역 ─ */
const ContentArea = styled.div`
  flex: 1;
  padding: 0.2rem 8rem 6rem;
  overflow-y: auto;
`;
const Scrollable = styled.div` flex: 1; `;

/* ─ 카드 공통 ─ */
const BaseCard = styled.div`
  background: #333;
  color: #fff;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  text-align: center;
`;
const HoverCard = styled(BaseCard)`
  flex: 1;
  height: 480px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background 0.3s;
  animation: ${fadeIn} 0.5s ease;
  &:hover { background: #444; }
`;
const Card = styled(BaseCard)`
  height: 480px;
  cursor: default;
`;

/* ─ 카드 레이아웃 ─ */
const MainCards = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
`;
const SingleCard = styled.div` margin-bottom: 2rem; `;
const SubCards  = styled(MainCards)``;

/* ─ 뒤로가기 ─ */
const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  background: #555;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  &:hover { background: #666; }
`;

/* ─ 프롬프트 ─ */
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
  background: rgb(105,105,104);
  padding: 1rem;
  border-radius: 1rem;
  width: 100%;
  max-width: 800px;
`;
const PromptText  = styled.div` font-size: 1rem; color: #ffc107; `;
const PromptInput = styled.input`
  flex: 1;
  padding: 1.3rem 1rem;
  font-size: 1rem;
  border: none;
  border-radius: 0.5rem;
  background: rgb(232,231,226);
  color: #000;
  &::placeholder { color: rgb(106,106,105); }
`;
const PromptButton = styled.button`
  padding: 1.4rem 1.2rem;
  background: #ffc107;
  color: #222;
  font-weight: bold;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  &:hover { background: #ffb300; }
`;
