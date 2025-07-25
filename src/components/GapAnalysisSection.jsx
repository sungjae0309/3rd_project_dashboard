/* ───────── src/components/GapAnalysisSection.jsx ───────── */
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { useUserData } from "../contexts/UserDataContext";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://192.168.101.51:8000';

export default function GapAnalysisSection({ selectedJob, darkMode }) {
  const [gapData, setGapData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false); // 초기화 상태 추가
  const [lastFetchTime, setLastFetchTime] = useState(0); // 캐싱을 위한 시간 추가
  const [currentJob, setCurrentJob] = useState(null); // 현재 직무 추적

  // Context에서 desired job 정보 가져오기
  const { desiredJob } = useUserData();

  // 캐시 유효 시간 (API 문서에 따르면 1시간)
  const CACHE_DURATION = 60 * 60 * 1000; // 1시간

  const isCacheValid = () => {
    const now = Date.now();
    return (now - lastFetchTime) < CACHE_DURATION;
  };

  useEffect(() => {
    // desiredJob이 없으면 기다림
    if (!desiredJob) {
      return;
    }

    // 이미 초기화되었고 같은 직무라면 다시 호출하지 않음
    if (hasInitialized && selectedJob === desiredJob) {
      return;
    }

    // 캐시가 유효하면 API 호출하지 않음
    if (isCacheValid() && gapData.length > 0 && currentJob === desiredJob) {
      console.log('캐시된 갭 분석 데이터 사용');
      setHasInitialized(true);
      return;
    }

    let isMounted = true; // 컴포넌트 마운트 상태 추적

    const fetchGapData = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        setError(null);
        
        // 사용자 희망 직무 정보 가져오기 - Context 사용
        let jobCategory;
        
        // Context에서 desired job 정보 사용
        jobCategory = desiredJob || selectedJob || "프론트엔드 개발자";
        
        if (!jobCategory) {
          if (isMounted) {
          setError('관심 직무가 등록되어 있지 않습니다.');
          setGapData([]);
          }
          return;
        }
        
        // 갭 분석 API 호출 - API 문서에 따른 파라미터 설정
        const token = localStorage.getItem("accessToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        // API 문서에 따른 파라미터 설정 (1시간 캐싱, force_refresh 지원)
        const params = {
          category: jobCategory,
          force_refresh: false // 캐시 사용 (1시간 캐싱)
        };
        
        const { data: gapData } = await axios.get(
          `${BASE_URL}/visualization/gap-analysis`,
          { params, headers }
        );
        
        // 컴포넌트가 언마운트된 경우 상태 업데이트하지 않음
        if (!isMounted) return;
        
        // API 문서에 따른 응답 구조 처리
        // gap_result: 자연어 설명 (프론트엔드 표시용)
        // top_skills: Top 5 부족 역량 (내부 사용용)
        const topSkills = gapData.top_skills || [];
        setGapData(topSkills.slice(0, 5));
        setLastFetchTime(Date.now()); // 캐시 시간 업데이트
        setCurrentJob(jobCategory); // 현재 직무 설정
        
      } catch (error) {
        console.error('갭 분석 데이터 조회 실패:', error);
        if (isMounted) {
        setError('데이터를 불러오는데 실패했습니다.');
        // 임시 데이터
        setGapData([
          { skill: "React", gap_score: 85 },
          { skill: "TypeScript", gap_score: 78 },
          { skill: "Node.js", gap_score: 72 },
          { skill: "Docker", gap_score: 68 },
          { skill: "AWS", gap_score: 65 }
        ]);
        }
      } finally {
        if (isMounted) {
        setLoading(false);
        setHasInitialized(true); // 초기화 완료
        }
      }
    };

    fetchGapData();

    // cleanup 함수: 컴포넌트 언마운트 시 실행
    return () => {
      isMounted = false;
    };
  }, [desiredJob, selectedJob]); // desiredJob 또는 selectedJob이 변경될 때만 실행

  if (loading) {
    return (
      <GapContainer $darkMode={darkMode}>
        <LoadingText>분석 중...</LoadingText>
      </GapContainer>
    );
  }

  if (error) {
    return (
      <GapContainer $darkMode={darkMode}>
        <ErrorText>{error}</ErrorText>
      </GapContainer>
    );
  }

  return (
    <GapContainer $darkMode={darkMode}>
      <GapTitle>Top5 부족 역량</GapTitle>
      <GapList>
        {gapData.map((item, index) => (
          <GapItem key={index} $darkMode={darkMode}>
            <GapRank>{index + 1}</GapRank>
            <GapSkill>{typeof item === 'string' ? item : (item.skill || item.skill_name)}</GapSkill>
          </GapItem>
        ))}
      </GapList>
    </GapContainer>
  );
}

const GapContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  height: 100%;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 0.5rem;
`;

const GapTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 700;
  color: ${({ $darkMode }) => $darkMode ? '#fff' : 'rgb(27, 26, 25)'};
  margin-top: -1rem;
  margin-left: 2rem;
  text-align: center;
  padding: 0.4rem 0.8rem;
  background: ${({ $darkMode }) => ($darkMode ? 'rgba(255, 193, 7, 0.15)' : 'rgba(243, 217, 141, 0.15)')};
  border-radius: 0.4rem;
  border: 1px solid ${({ $darkMode }) => ($darkMode ? 'rgba(255, 193, 7, 0.25)' : 'rgba(248, 217, 126, 0.25)')};
`;

const GapList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
  align-items: center;
  margin-left: 2.2rem;
`;

const GapItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.7rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  justify-content: center;
  width: 100%;
  
  &:hover {
    transform: translateY(-1px);
  }
`;

const GapRank = styled.div`  width: 1.2rem;
  height: 1.2rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffc107, #ff8c00);
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(255, 193, 7, 0.3);
`;

const GapSkill = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LoadingText = styled.div`
  font-size: 0.75rem;
  color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#666'};
  text-align: center;
  padding: 0.8rem;
  background: ${({ $darkMode }) => ($darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.9)')};
  border-radius: 0.4rem;
  border: 1px solid ${({ $darkMode }) => ($darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)')};
`;

const ErrorText = styled.div`
  font-size: 0.75rem;
  color: #e74c3c;
  text-align: center;
  padding: 0.8rem;
  background: ${({ $darkMode }) => ($darkMode ? 'rgba(231, 76, 60, 0.1)' : 'rgba(231, 76, 60, 0.05)')};
  border-radius: 0.4rem;
  border: 1px solid ${({ $darkMode }) => ($darkMode ? 'rgba(231, 76, 60, 0.2)' : 'rgba(231, 76, 60, 0.1)')};
`;
