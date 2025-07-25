// ────────────── src/components/AiJobRecommendation.jsx (최종본) ──────────────
import React, { useState } from "react";
import styled from "styled-components";
import { FaBullseye, FaRegCircle, FaHeart, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// 벡엔드 API 서버 주소 (환경 변수로 관리하는 것을 추천합니다)
const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://192.168.101.51:8000";
// API 요청을 위한 클라이언트 설정
const apiClient = axios.create({
  baseURL: BASE_URL,
});

// 모든 요청에 자동으로 인증 토큰(JWT)을 추가하는 설정
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * AI 추천 공고 및 추천 이유를 서버에서 받아오는 함수
 * 1페이지는 GET /recommend/jobs/ids API를 호출합니다.
 */
const fetchAiJobRecommendations = async () => {
  // 1페이지용 API 호출 (가장 적합한 공고)
  const { data } = await apiClient.get("/recommend/jobs/ids", {
    params: {
      force_refresh: false // 캐시 사용 (1시간 캐싱)
    }
  });
  return data;
};

export default function AiJobRecommendation({ darkMode }) {
  const navigate = useNavigate();
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

  // 'examples'(초기), 'loading'(로딩), 'results'(결과), 'error'(오류) 뷰 상태 관리
  const [view, setView] = useState("examples");
  // 이 컴포넌트가 직접 API 결과를 상태로 가집니다.
  const [recommendations, setRecommendations] = useState([]);
  const [aiMessage, setAiMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  /** 예시 질문 클릭 시 AI 추천을 받아오는 핸들러 */
  const handleGetRecommendation = async () => {
    setView("loading"); // 로딩 상태로 변경
    try {
      const data = await fetchAiJobRecommendations();

      // API 응답에서 jobs와 explanation을 추출 (서버 응답 구조에 따라 키 이름 변경 필요)
      setRecommendations(data.recommended_jobs?.slice(0, 5) || []);
      setAiMessage(
        data.explanation || "AI가 회원님의 프로필에 맞춰 가장 적합한 채용 공고를 추천했습니다!"
      );
      setView("results"); // 결과 뷰로 변경
    } catch (err) {
      console.error("AI 추천 공고 로딩 실패:", err);
      if (err.response?.status === 401) {
        setErrorMessage("추천을 받으려면 로그인이 필요합니다.");
      } else {
        setErrorMessage(
          "추천 공고를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        );
      }
      setView("error"); // 에러 뷰로 변경
    }
  };

  /** "뒤로가기" 버튼 핸들러: 모든 상태를 초기화하고 예시 화면으로 돌아갑니다. */
  const handleBackToExamples = () => {
    setView("examples");
    setAiMessage("");
    setRecommendations([]);
    setErrorMessage("");
  };

  /** 채용 공고 카드 클릭 핸들러 (상세 페이지로 이동) */
  const handleJobClick = (jobId) => {
    if (!jobId) return;
    // navigate(`/job-detail/${jobId}`); // TODO: 실제 상세 페이지 라우팅 경로로 수정
    alert(`상세 페이지로 이동합니다 (공고 ID: ${jobId})`);
  };

  /** 현재 view 상태에 따라 다른 컨텐츠를 렌더링하는 함수 */
  const renderContent = () => {
    switch (view) {
      case "loading":
        return <LoadingText $darkMode={darkMode}>⏳ AI가 가장 적합한 공고를 분석 중입니다...</LoadingText>;

      case "error":
        return (
          <>
            <ErrorMessage>⚠️ {errorMessage}</ErrorMessage>
            <BackBtn onClick={handleBackToExamples} $darkMode={darkMode}>⬅ 예시 질문으로 돌아가기</BackBtn>
          </>
        );

      case "results":
        return (
          <>
            <Reason $darkMode={darkMode}>{aiMessage}</Reason>
            <JobList>
              {recommendations.length > 0 ? (
                recommendations.map((job) => (
                  <JobCard
                    key={job.id}
                    $darkMode={darkMode}
                    onClick={() => handleJobClick(job.id)}
                  >
                    <JobTitle $darkMode={darkMode}>{job.title || "직무 정보 없음"}</JobTitle>
                    <Company $darkMode={darkMode}>{job.company || "회사 정보 없음"}</Company>
                    <MatchScore>적합도: {job.match_score || 0}%</MatchScore>
                    <LikeIcon>
                      <FaHeart />
                    </LikeIcon>
                  </JobCard>
                ))
              ) : (
                <p>추천할 만한 공고를 찾지 못했습니다.</p>
              )}
            </JobList>
            <BackBtn onClick={handleBackToExamples} $darkMode={darkMode}>⬅ 다른 추천 보기</BackBtn>
          </>
        );

      case "examples":
      default:
        return (
          <ExampleBox $darkMode={darkMode}>
            <p>아래 예시처럼 질문하고 가장 적합한 추천을 받아보세요!</p>
            <ul>
              {examplePrompts.map((ex) => (
                <ExampleItem
                  key={ex}
                  $darkMode={darkMode}
                  onClick={handleGetRecommendation} // 클릭 시 바로 API 호출
                >
                  <CheckIcon>
                    <FaRegCircle />
                  </CheckIcon>
                  {ex}
                </ExampleItem>
              ))}
            </ul>
          </ExampleBox>
        );
    }
  };

  return (
    <Wrapper>
      <RecommendationCard $darkMode={darkMode}>
        <SectionHeader $darkMode={darkMode}>
          <span>🎯 AI 추천 공고</span>
          <IconWrapper>
            <FaBullseye />
          </IconWrapper>
        </SectionHeader>
        {renderContent()}
      </RecommendationCard>
    </Wrapper>
  );
}

/* ───────────── 이 컴포넌트만을 위한 styled-components ───────────── */
const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  overflow: hidden; // 가로 스크롤 방지
`;
const RecommendationCard = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? "#2a2a2a" : "#fff")};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#e0e0e0")};
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 750px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  min-height: 500px;
  overflow: hidden; // 가로 스크롤 방지
`;
const SectionHeader = styled.h2`
  font-size: 1.4rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  color: ${({ $darkMode }) => ($darkMode ? "#eee" : "#333")};
  overflow: hidden; // 가로 스크롤 방지
`;
const IconWrapper = styled.div`
  font-size: 1.3rem;
  color: #ff9800;
  flex-shrink: 0; // 아이콘은 축소되지 않도록 설정
`;
const ExampleBox = styled.div`
  padding: 0.5rem 0;
  font-size: 0.95rem;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#555")};
  overflow: hidden; // 가로 스크롤 방지
  ul {
    list-style: none;
    padding: 0;
    margin-top: 1rem;
  }
`;
const ExampleItem = styled.li`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  transition: background 0.2s;
  border-radius: 8px;
  color: ${({ $darkMode }) => ($darkMode ? "#eee" : "#222")};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#eee")};
  overflow: hidden; // 가로 스크롤 방지
  &:hover {
    background: ${({ $darkMode }) => ($darkMode ? "#333" : "#f5f5f5")};
  }
`;
const CheckIcon = styled.span`
  margin-right: 0.75rem;
  color: #ffc107;
  flex-shrink: 0; // 아이콘은 축소되지 않도록 설정
`;
const LoadingText = styled.p`
  text-align: center;
  padding: 4rem 0;
  font-size: 1.1rem;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#555")};
`;
const ErrorMessage = styled.div`
  color: #f44336;
  font-weight: bold;
  text-align: center;
  padding: 4rem 0;
  overflow: hidden; // 가로 스크롤 방지
  word-wrap: break-word; // 긴 텍스트 줄바꿈
`;
const Reason = styled.div`
  font-size: 1rem;
  line-height: 1.6;
  background: ${({ $darkMode }) => ($darkMode ? "#333" : "#f7f7f7")};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  color: ${({ $darkMode }) => ($darkMode ? "#eee" : "#333")};
  overflow: hidden; // 가로 스크롤 방지
  word-wrap: break-word; // 긴 텍스트 줄바꿈
`;
const JobList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  overflow: hidden; // 가로 스크롤 방지
`;
const JobCard = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? "#333" : "#f9f9f9")};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#eee")};
  border-radius: 12px;
  padding: 1.2rem;
  position: relative;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;
const JobTitle = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
  color: ${({ $darkMode }) => ($darkMode ? "#fff" : "#000")};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 2rem; // 하트 아이콘 공간 확보
`;
const Company = styled.div`
  font-size: 0.9rem;
  color: ${({ $darkMode }) => ($darkMode ? "#bbb" : "#777")};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const MatchScore = styled.div`
  margin-top: 0.5rem;
  font-size: 0.9rem;
  font-weight: bold;
  color: #3f51b5;
`;
const LikeIcon = styled.div`
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
  font-size: 1.2rem;
  color: #e0e0e0;
  cursor: pointer;
  transition: color 0.2s;
  flex-shrink: 0; // 아이콘은 축소되지 않도록 설정
  &:hover {
    color: #f44336;
  }
`;
const BackBtn = styled.button`
  margin-top: 2rem;
  padding: 0.6rem 1rem;
  background: transparent;
  color: ${({ $darkMode }) => ($darkMode ? "#aaa" : "#555")};
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: center;
  overflow: hidden; // 가로 스크롤 방지
  &:hover {
    text-decoration: underline;
  }
`;