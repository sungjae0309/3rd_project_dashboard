/* ───────── src/components/GapAnalysis.jsx ───────── */
import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import axios from "axios";
import { IoIosArrowUp } from "react-icons/io";
import { useAuth } from "../contexts/AuthContext"; // AuthContext 사용

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://192.168.101.51:8000";

export default function GapAnalysis({ darkMode = false, setSelectedPage }) {
  const [gapResult, setGapResult] = useState("");
  const [topSkills, setTopSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userJob, setUserJob] = useState(""); // 사용자 관심직무 상태 추가
  const [hasInitialized, setHasInitialized] = useState(false); // 초기화 상태 추가
  
  // AuthContext에서 로그인 상태 가져오기
  const { isLoggedIn } = useAuth();

  // 갭 분석 결과를 파싱하고 포맷팅하는 함수
  const formatGapResult = (result) => {
    if (!result) return "";
    
    console.log('🔍 [formatGapResult] 입력값:', result);
    console.log('🔍 [formatGapResult] 입력값 길이:', result.length);
    
    let formatted = result;
    
    // 방법 1: eval을 사용한 처리 (가장 확실한 방법)
    try {
      // eval을 사용하여 문자열 리터럴로 처리
      formatted = eval(`"${result}"`);
      console.log('🔍 [formatGapResult] eval 성공:', formatted);
    } catch (e) {
      console.log('🔍 [formatGapResult] eval 실패:', e);
      
      // 방법 2: 직접 replace (모든 경우 처리)
      formatted = result
        .replace(/\\n/g, '\n')
        .replace(/\\r\\n/g, '\n')
        .replace(/\\r/g, '\n')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n');
      
      console.log('🔍 [formatGapResult] 직접 replace 사용:', formatted);
    }
    
    console.log('🔍 [formatGapResult] 최종 결과:', formatted);
    console.log('🔍 [formatGapResult] 최종 결과 길이:', formatted.length);
    
    return formatted.trim();
  };

  useEffect(() => {
    // 로그인하지 않았으면 API 호출하지 않음
    if (!isLoggedIn) {
      setGapResult("로그인이 필요합니다.");
      setTopSkills([]);
      setLoading(false);
      return;
    }

    // 이미 초기화되었으면 다시 호출하지 않음
    if (hasInitialized) {
      return;
    }

    const fetchGapAnalysis = async () => {
      try {
        // 1. 사용자 희망 직무 정보 가져오기
        const token = localStorage.getItem("accessToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        console.log('🔍 [GapAnalysis] 토큰 확인:', token ? '있음' : '없음');
        console.log('🔍 [GapAnalysis] API 호출 URL:', `${BASE_URL}/users/desired-job`);

        let jobCategory;
        
        // 로그인 여부와 관계없이 API 호출 (API가 회원/비회원을 구분해서 처리)
        try {
          console.log('🔍 [GapAnalysis] API 호출 시작...');
          const { data: desiredJobData } = await axios.get(`${BASE_URL}/users/desired-job`, { headers });
          console.log('✅ [GapAnalysis] API 응답 성공:', desiredJobData);
          // 백엔드에서 직접 문자열로 보내주므로 data 자체가 직무명
          jobCategory = desiredJobData;
          setUserJob(desiredJobData); // 사용자 관심직무 상태 업데이트
          console.log('✅ [GapAnalysis] 추출된 직무:', jobCategory);
        } catch (err) {
          console.error('❌ [GapAnalysis] 희망 직무 API 호출 실패:', err);
          console.error('❌ [GapAnalysis] 에러 상세:', err.response?.data);
          // API 호출 실패 시에만 기본값 사용
          jobCategory = "프론트엔드 개발자";
          setUserJob("프론트엔드 개발자");
        }

        console.log('🔍 [GapAnalysis] 최종 사용할 직무:', jobCategory);

        if (!jobCategory) {
          setGapResult("관심 직무가 등록되어 있지 않습니다.");
          setTopSkills([]);
          setLoading(false);
          return;
        }

        // 3. 갭 분석 API 호출
        const { data: gapData } = await axios.get(
          `${BASE_URL}/visualization/gap-analysis`,
          { params: { category: jobCategory }, headers }
        );

        // 디버깅: 원본 데이터 확인
        console.log('🔍 [GapAnalysis] 원본 gap_result:', gapData.gap_result);
        console.log('🔍 [GapAnalysis] 원본 데이터 타입:', typeof gapData.gap_result);

        // 결과를 포맷팅하여 설정
        const formattedResult = formatGapResult(gapData.gap_result);
        console.log('🔍 [GapAnalysis] 포맷팅된 결과:', formattedResult);
        
        setGapResult(formattedResult || "분석 결과가 없습니다.");
        setTopSkills(gapData.top_skills || []);
      } catch (err) {
        console.error('갭 분석 오류:', err);
        
        // API 키 제한 오류인지 확인
        if (err.response?.status === 403 && err.response?.data?.error?.message?.includes('Key limit exceeded')) {
          setGapResult("AI 분석 서비스가 일시적으로 제한되었습니다. 잠시 후 다시 시도해주세요.");
        } else if (err.response?.status === 401) {
          setGapResult("로그인이 필요합니다.");
        } else if (err.response?.status === 404) {
          setGapResult("분석할 데이터가 없습니다.");
        } else {
          setGapResult("갭 분석 결과를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
        }
        setTopSkills([]);
      } finally {
        setLoading(false);
        setHasInitialized(true); // 초기화 완료
      }
    };

    fetchGapAnalysis();
  }, [isLoggedIn, hasInitialized]); // isLoggedIn을 의존성에 추가

  return (
    <Container $darkMode={darkMode}>
      <SectionCard>
        <Title>
          갭 분석 결과
          {userJob && <UserJobBadge $darkMode={darkMode}>관심직무: {userJob}</UserJobBadge>}
        </Title>
        {loading ? (
          <LoadingText>분석 중...</LoadingText>
        ) : (
          <>
            <ResultText $darkMode={darkMode}>
              {gapResult || "분석 결과가 없습니다."}
            </ResultText>
            {topSkills.length > 0 && (
              <SkillList>
                <SkillTitle>Top 5 부족 역량:</SkillTitle>
                <SkillGrid>
                  {topSkills.slice(0, 5).map((skill, idx) => (
                    <SkillItem key={idx} $darkMode={darkMode}>
                      <SkillRank>{idx + 1}</SkillRank>
                      <SkillName>{skill}</SkillName>
                    </SkillItem>
                  ))}
                </SkillGrid>
              </SkillList>
            )}
          </>
        )}
      </SectionCard>

      <ScrollArrow>
        <IoIosArrowUp />
        <IoIosArrowUp />
        <IoIosArrowUp />
      </ScrollArrow>
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
  padding: 1.6rem 2.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  min-height: 53vh;
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

const Title = styled.h3`
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 0.8rem;
  color: #ffa500;
`;

const Text = styled.p`
  font-size: 1.05rem;
  line-height: 1.6;
`;

const ResultText = styled.div`
  font-size: 1.05rem;
  line-height: 1.8;
  white-space: pre-wrap !important;
  word-wrap: break-word;
  word-break: break-word;
  margin-bottom: 1.2rem;
  padding: 1rem;
  background: ${({ $darkMode }) => $darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'};
  border-radius: 0.5rem;
  border: 1px solid ${({ $darkMode }) => $darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  color: ${({ $darkMode }) => $darkMode ? '#eee' : '#333'};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  overflow-wrap: break-word;
  hyphens: auto;
`;

const SkillList = styled.div`
  font-size: 1rem;
  margin-top: 1rem;
`;

const SkillTitle = styled.div`
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.8rem;
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
`;

const SkillGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SkillItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.7rem;
  border-radius: 0.4rem;
  background: ${({ $darkMode }) => $darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
`;

const SkillRank = styled.div`
  width: 1.3rem;
  height: 1.3rem;
  border-radius: 50%;
  background: #ffc107;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
`;

const SkillName = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LoadingText = styled.div`
  font-size: 0.8rem;
  color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#666'};
  text-align: center;
  margin-top: 0.8rem;
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
