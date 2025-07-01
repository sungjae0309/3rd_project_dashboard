// ✅ GuestDashboard.jsx — AI 추천 + 로드맵 + 부트캠프 + 이력서 분석 + 프롬프트 완전본
import React, { useState, useEffect, useRef } from "react";
import styled, { css } from "styled-components";
import Sidebar from "../components/Sidebar";
import { FaHeart, FaUpload } from "react-icons/fa";

/* ─ 선택지 목록 ─ */
const jobOptions = ["프론트엔드", "백엔드", "풀스택", "데이터 엔지니어", "AI 엔지니어"];
const companyOptions = ["네이버", "카카오", "토스", "배달의민족", "쿠팡"];
const skillOptions = ["React", "Vue", "Angular", "Node.js", "Spring", "Django", "AWS", "Docker"];

export default function GuestDashboard() {
  /* ─ 다크모드 ─ */
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("guest_dark") === "true");
  useEffect(() => localStorage.setItem("guest_dark", darkMode), [darkMode]);

  /* ─ 사이드바/페이지 ─ */
  const [collapsed, setCollapsed] = useState(false);
  const [selectedPage, setSelectedPage] = useState("guest-landing");

  /* ─ 파일 업로드 ─ */
  const [resumeFile, setResumeFile] = useState(null);

  /* ─ AI 추천 상태 ─ */
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiJob, setAiJob] = useState("");
  const [aiCompany, setAiCompany] = useState("");
  const [aiSkills, setAiSkills] = useState([]);
  const [aiResults, setAiResults] = useState([]);
  const [likedIds, setLikedIds] = useState([]);
  const [aiError, setAiError] = useState("");

  /* ─ 로드맵 ─ */
  const [roadmapModalOpen, setRoadmapOpen] = useState(false);
  const roadmapSteps = [
    { step: 1, title: "HTML/CSS", desc: "웹 페이지 구조와 시각적 표현 방식 학습", resources: ["MDN Docs", "생활코딩"] },
    { step: 2, title: "JavaScript", desc: "기초 문법부터 DOM 제어, 이벤트 핸들링까지", resources: ["JavaScript.info"] },
    { step: 3, title: "React", desc: "컴포넌트 기반 개발, 상태 관리, 라우팅 학습", resources: ["React 공식문서"] },
    { step: 4, title: "API 연동", desc: "fetch와 axios로 외부 데이터 가져오기 실습", resources: ["Postman 연습"] },
    { step: 5, title: "포트폴리오 제작", desc: "단일 페이지 프로젝트 완성", resources: ["Github Pages 배포"] },
  ];

  /* ─ 부트캠프 추천 ─ */
  const [bootcampOpen, setBootcampOpen] = useState(false);
  const bootcampSamples = [
    {
      id: 1,
      name: "코드스테이츠",
      org: "CodeStates",
      period: "6개월",
      stack: ["JavaScript", "React", "Node.js"],
      desc: "풀스택 집중 교육, 프로젝트 기반 학습",
    },
    {
      id: 2,
      name: "항해99",
      org: "스파르타코딩클럽",
      period: "12주",
      stack: ["Spring", "React"],
      desc: "팀 프로젝트 중심, 실무형 부트캠프",
    },
    {
      id: 3,
      name: "멋쟁이사자처럼",
      org: "LikeLion",
      period: "10주",
      stack: ["HTML", "CSS", "JavaScript"],
      desc: "초보자 대상 웹 풀스택 기초 부트캠프",
    },
  ];

  /* ─ 프롬프트 입력 ─ */
  const [promptText, setPromptText] = useState("");
  const promptInputRef = useRef(null);

  /* ─ 핸들러 ─ */
  const toggleTheme = () => setDarkMode((p) => !p);

  const handleAiSubmit = (e) => {
    e.preventDefault();
    if (!aiJob) {
      setAiError("관심 직무를 선택해주세요.");
      return;
    }
    setAiError("");
    // mock 결과
    const mock = [
      {
        id: 1,
        title: aiJob,
        company: aiCompany || "샘플회사",
        location: "서울",
        stack: aiSkills.length ? aiSkills : ["React", "Node.js"],
        salary: "3,800만원",
        type: "정규직",
        summary: "주요 서비스 프론트 개발 + 유지보수",
      },
      {
        id: 2,
        title: aiJob,
        company: aiCompany || "테스트컴퍼니",
        location: "판교",
        stack: aiSkills.length ? aiSkills : ["Vue", "Spring"],
        salary: "4,200만원",
        type: "계약직",
        summary: "웹 플랫폼 유지보수 및 기능 개선 참여",
      },
    ];
    setAiResults(mock);
  };

  const toggleLike = (id) =>
    setLikedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const sendPrompt = () => {
    if (!promptText.trim()) return;
    console.log("JOB자 메시지:", promptText);
    setPromptText("");
    promptInputRef.current?.focus();
  };

  return (
    <Wrapper>
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
        darkMode={darkMode}
        isGuest
      />

      <Main $darkMode={darkMode}>
        {/* 헤더 */}
        <Header>
          <Title>환영합니다! 로그인 없이 둘러보세요</Title>
          <ThemeSwitch onClick={toggleTheme} $darkMode={darkMode}>
            <SwitchKnob $darkMode={darkMode} />
          </ThemeSwitch>
        </Header>

        {/* 메인 영역 */}
        <Scrollable>
          <LandingGrid>
            <TrialCard $darkMode={darkMode} onClick={() => setAiModalOpen(true)}>
              AI 추천 체험
              <SubText>관심 키워드 + 기술스택 → 샘플 공고 보기</SubText>
            </TrialCard>

            <TrialCard $darkMode={darkMode} onClick={() => setRoadmapOpen(true)}>
              로드맵 미리보기
              <SubText>단계별 학습 목표 + 추천 자료</SubText>
            </TrialCard>

            <TrialCard $darkMode={darkMode} onClick={() => setBootcampOpen(true)}>
              부트캠프 추천
              <SubText>AI가 추천하는 인기 부트캠프 보기</SubText>
            </TrialCard>

            <TrialCardLarge $darkMode={darkMode}>
              <ResumeUploadBox>
                <FaUpload size={32} style={{ marginBottom: "1rem" }} />
                <div><strong>이력서 분석</strong></div>
                <SubText>당신의 이력서를 업로드해보세요</SubText>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  style={{ marginTop: "0.8rem" }}
                />
                {resumeFile && <SubText style={{ marginTop: "0.5rem" }}>✅ {resumeFile.name}</SubText>}
              </ResumeUploadBox>
            </TrialCardLarge>
          </LandingGrid>
        </Scrollable>

        {/* ───────── 모달들 ───────── */}

        {/* AI 추천 */}
        {aiModalOpen && (
          <ModalOverlay onClick={() => setAiModalOpen(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()} $darkMode={darkMode}>
              <h3>AI 추천 체험</h3>
              <form onSubmit={handleAiSubmit} style={{ marginBottom: "1rem" }}>
                {/* 직무 */}
                <label>관심 직무*</label>
                <select value={aiJob} onChange={(e) => setAiJob(e.target.value)}
                  style={{ width: "100%", padding: "0.6rem", marginBottom: "0.5rem" }}>
                  <option value="">선택하세요</option>
                  {jobOptions.map((job) => <option key={job}>{job}</option>)}
                </select>

                {/* 회사 */}
                <label>관심 회사</label>
                <select value={aiCompany} onChange={(e) => setAiCompany(e.target.value)}
                  style={{ width: "100%", padding: "0.6rem", marginBottom: "0.5rem" }}>
                  <option value="">(선택)</option>
                  {companyOptions.map((co) => <option key={co}>{co}</option>)}
                </select>

                {/* 기술 */}
                <label>사용 기술 (다중 선택)</label>
                <select multiple value={aiSkills}
                  onChange={(e) => setAiSkills(Array.from(e.target.selectedOptions, o => o.value))}
                  style={{ width: "100%", padding: "0.6rem", height: "100px", marginBottom: "0.5rem" }}>
                  {skillOptions.map((sk) => <option key={sk}>{sk}</option>)}
                </select>

                {aiError && <ErrorMsg>{aiError}</ErrorMsg>}
                <SubmitButton type="submit">추천 보기</SubmitButton>
              </form>

              {/* 결과 */}
              <ul style={{ listStyle: "none", padding: 0 }}>
                {aiResults.map((r) => (
                  <li key={r.id} style={{ padding: "0.7rem 0", borderBottom: "1px solid #ccc" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <strong>{r.title}</strong> @ {r.company} – {r.location}<br />
                        <small style={{ opacity: 0.8 }}>{r.stack.join(", ")}</small><br />
                        <small>💼 {r.type} | 💰 {r.salary}</small><br />
                        <small>📌 {r.summary}</small>
                      </div>
                      <FaHeart
                        color={likedIds.includes(r.id) ? "#ff5252" : "#bbb"}
                        style={{ cursor: "pointer", marginLeft: "1rem", marginTop: "0.3rem" }}
                        onClick={() => toggleLike(r.id)}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </ModalContent>
          </ModalOverlay>
        )}

        {/* 로드맵 */}
        {roadmapModalOpen && (
          <ModalOverlay onClick={() => setRoadmapOpen(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()} $darkMode={darkMode}>
              <h3>프론트엔드 로드맵</h3>
              <ol style={{ paddingLeft: "1rem" }}>
                {roadmapSteps.map(step => (
                  <li key={step.step} style={{ marginBottom: "1rem" }}>
                    <strong>{step.step}. {step.title}</strong><br />
                    <div style={{ marginTop: "0.2rem" }}>{step.desc}</div>
                    <div style={{ marginTop: "0.4rem", fontSize: "0.9rem", opacity: 0.8 }}>
                      추천 자료: {step.resources.join(" / ")}
                    </div>
                  </li>
                ))}
              </ol>

              <p style={{ marginTop: "1rem" }}>
                <strong>회원가입 시 로드맵 저장 및 진행률 추적이 가능합니다.</strong>
              </p>

              {/* 시각화 + 잠금 */}
              <div style={{ marginTop: "2rem" }}>
                <h4 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>📌 전체 로드맵 이미지 시각화</h4>
                <p style={{ fontSize: "0.95rem", opacity: 0.85 }}>
                  전체 로드맵을 한눈에 보고 싶다면 회원가입을 해보세요!
                  <br />기술 스택 흐름, 학습 우선순위, 추천 툴 등을 시각적으로 확인할 수 있어요.
                </p>

                <LockedImageContainer>
                  <LockedOverlay>
                    <LockIcon>🔒</LockIcon>
                    <LockText>회원가입 후 전체 시각화 로드맵 열람 가능</LockText>
                  </LockedOverlay>
                  <img
                    src="/images/frontend-roadmap.png"
                    alt="프론트엔드 로드맵 시각화"
                    style={{ width: "100%", borderRadius: "0.8rem", filter: "blur(2px)" }}
                  />
                </LockedImageContainer>
              </div>
            </ModalContent>
          </ModalOverlay>
        )}

        {/* 부트캠프 추천 */}
        {bootcampOpen && (
          <ModalOverlay onClick={() => setBootcampOpen(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()} $darkMode={darkMode}>
              <h3>🔥 부트캠프 추천 맛보기</h3>
              <p style={{ fontSize: "0.95rem", opacity: 0.85, marginBottom: "1rem" }}>
                아래는 AI가 추천하는 인기 부트캠프 예시입니다.<br />
                원하는 기술스택 기반으로 다양한 커리큘럼을 탐색해보세요!
              </p>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {bootcampSamples.map(bc => (
                  <li key={bc.id} style={{ marginBottom: "1rem", borderBottom: "1px solid #ccc", paddingBottom: "1rem" }}>
                    <div><strong>{bc.name}</strong> ({bc.org})</div>
                    <div style={{ fontSize: "0.9rem", margin: "0.4rem 0" }}>
                      기간: {bc.period}<br />
                      기술스택: {bc.stack.join(", ")}<br />
                      📌 {bc.desc}
                    </div>
                  </li>
                ))}
              </ul>
            </ModalContent>
          </ModalOverlay>
        )}

        {/* 프롬프트 */}
        <PromptWrapper>
          <Prompt $darkMode={darkMode}>
            <PromptText>JOB자에게 메시지</PromptText>
            <PromptInput
              ref={promptInputRef}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendPrompt()}
              placeholder="무엇이든 물어보세요…"
              $darkMode={darkMode}
            />
            <PromptButton onClick={sendPrompt}>전송</PromptButton>
          </Prompt>
        </PromptWrapper>
      </Main>
    </Wrapper>
  );
}

/* ───────── styled-components ───────── */
const Wrapper = styled.div`display: flex; min-height: 100vh;`;
const Main = styled.main`
  flex: 1; display: flex; flex-direction: column; overflow-y: auto;
  min-height: 100vh; padding-bottom: 200px;
  ${({ $darkMode }) => $darkMode ? css`background: #000; color: #fff;` : css`background: #faf8f3; color: #40351a;`};
`;
const Header = styled.div`display: flex; justify-content: space-between; align-items: center; padding: 2rem 3rem 1rem;`;
const Title = styled.h2`font-size: 1.6rem; font-weight: 700;`;
const ThemeSwitch = styled.div`
  width: 48px; height: 28px; border-radius: 14px; position: relative; cursor: pointer;
  background: ${({ $darkMode }) => ($darkMode ? "#555" : "#ccc")}; transition: background 0.3s;
`;
const SwitchKnob = styled.div`
  width: 20px; height: 20px; border-radius: 50%; position: absolute; top: 4px;
  left: ${({ $darkMode }) => ($darkMode ? "24px" : "4px")};
  background: ${({ $darkMode }) => ($darkMode ? "#0f0" : "#fff")}; transition: left 0.3s;
`;
const Scrollable = styled.div`flex: 1;`;
const LandingGrid = styled.div`
  display: grid; gap: 2rem; padding: 1rem 3rem 6rem;
  grid-template-columns: repeat(2, 1fr);
`;
const TrialCard = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? "#222" : "#fff")};
  color: ${({ $darkMode }) => ($darkMode ? "#fff" : "#5a4c28")};
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.05); border-radius: 1rem;
  padding: 2rem; cursor: pointer; text-align: center; transition: 0.25s;
  &:hover {
    background: ${({ $darkMode }) => ($darkMode ? "#333" : "#fdf6e3")};
    border: 2px solid ${({ $darkMode }) => ($darkMode ? "#ffd54f" : "#d8b24a")};
  }
`;
const TrialCardLarge = styled(TrialCard)`grid-column: 1 / 3;`;
const ResumeUploadBox = styled.div`display: flex; flex-direction: column; align-items: center;`;
const SubText = styled.div`font-size: 0.85rem; margin-top: 0.4rem; opacity: 0.7;`;
const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center; z-index: 50;
`;
const ModalContent = styled.div`
  width: 90%; max-width: 520px; max-height: 80vh; overflow-y: auto;
  background: ${({ $darkMode }) => ($darkMode ? "#111" : "#fff")};
  color: ${({ $darkMode }) => ($darkMode ? "#fff" : "#333")};
  padding: 2rem; border-radius: 1rem;
`;
const SubmitButton = styled.button`
  width: 100%; padding: 0.85rem 0; font-size: 1rem; font-weight: 600;
  background: #ffd54f; border: none; border-radius: 0.6rem; cursor: pointer; transition: background 0.25s;
  &:hover { background: #ffca28; }
`;
const ErrorMsg = styled.div`color: #ff5252; margin-bottom: 0.5rem;`;
const PromptWrapper = styled.div`
  position: fixed; bottom: 2.5rem; left: 60%; transform: translateX(-50%);
  z-index: 100; width: 100%; display: flex; justify-content: center;
`;
const Prompt = styled.div`
  display: flex; align-items: center; gap: 1rem; width: 100%; max-width: 800px;
  border-radius: 1rem; padding: 1rem;
  ${({ $darkMode }) => ($darkMode ? "background:#333;" : "background:#ebe7dc;")}
`;
const PromptText = styled.div`font-size: 1rem; color: #ffc107;`;
const PromptInput = styled.input`
  flex: 1; font-size: 1rem; border: none; border-radius: 0.5rem; padding: 1.3rem 1rem;
  ${({ $darkMode }) => $darkMode ? css`
    background: #333; color: #fff; &::placeholder { color: #999; }
  ` : css`
    background: #fff; color: #000; &::placeholder { color: #aaa; }
  `}
`;
const PromptButton = styled.button`
  padding: 1.4rem 1.2rem; background: #ffc107; color: #222; font-weight: bold;
  border: none; border-radius: 0.5rem; cursor: pointer;
  &:hover { background: #ffb300; }
`;
const LockedImageContainer = styled.div`
  position: relative; margin-top: 1rem; border-radius: 0.8rem; overflow: hidden;
`;
const LockedOverlay = styled.div`
  position: absolute; inset: 0; background: rgba(0,0,0,0.55); color: white;
  display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 2;
`;
const LockIcon = styled.div`font-size: 2.2rem; margin-bottom: 0.5rem;`;
const LockText = styled.div`font-size: 0.95rem; font-weight: 500; text-align: center;`;
