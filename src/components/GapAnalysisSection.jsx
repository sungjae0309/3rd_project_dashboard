/* ───────── src/components/GapAnalysisSection.jsx ───────── */
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://192.168.101.51:8000'; // CareerRoadmapMain과 동일한 BASE_URL 사용

export default function GapAnalysisSection({ selectedJob, darkMode }) {
  const [gapData, setGapData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedJob) return;

    const fetchGapData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // CareerRoadmapMain과 동일한 방식으로 API 호출
        const token = localStorage.getItem("accessToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        // 사용자 이력서에서 desired_job 가져오기
        const { data: resume } = await axios.get(`${BASE_URL}/users/me/resume`, { headers });
        const desiredJobs = resume.desired_job || [];
        const jobCategory = desiredJobs[0] || selectedJob; // 이력서에 없으면 선택된 직무 사용
        
        if (!jobCategory) {
          setError('관심 직무가 등록되어 있지 않습니다.');
          setGapData([]);
          return;
        }
        
        // 갭 분석 API 호출
        const { data: gapData } = await axios.get(
          `${BASE_URL}/visualization/gap-analysis`,
          { params: { category: jobCategory }, headers }
        );
        
        // Top5 부족 역량만 추출
        const topSkills = gapData.top_skills || [];
        setGapData(topSkills.slice(0, 5));
        
      } catch (error) {
        console.error('갭 분석 데이터 조회 실패:', error);
        setError('데이터를 불러오는데 실패했습니다.');
        // 임시 데이터
        setGapData([
          { skill: "React", gap_score: 85 },
          { skill: "TypeScript", gap_score: 78 },
          { skill: "Node.js", gap_score: 72 },
          { skill: "Docker", gap_score: 68 },
          { skill: "AWS", gap_score: 65 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchGapData();
  }, [selectedJob]);

  if (loading) {
    return (
      <GapContainer $darkMode={darkMode}>
        <GapTitle>Top5 부족 역량</GapTitle>
        <LoadingText>분석 중...</LoadingText>
      </GapContainer>
    );
  }

  if (error) {
    return (
      <GapContainer $darkMode={darkMode}>
        <GapTitle>Top5 부족 역량</GapTitle>
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
  gap: 0.8rem; /* 간격 증가 */
  height: 100%;
  justify-content: flex-start;
  flex: 1;
`;

const GapTitle = styled.h4`
  font-size: 1rem; /* 폰트 크기 증가 */
  font-weight: 700;
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
  margin: 0;
  text-align: center;
`;

const GapList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem; /* 간격 증가 */
  flex: 1;
`;

const GapItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem; /* 간격 증가 */
  padding: 0.4rem 0.7rem; /* 패딩 증가 */
  border-radius: 0.4rem;
  background: ${({ $darkMode }) => $darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
`;

const GapRank = styled.div`
  width: 1.3rem; /* 크기 증가 */
  height: 1.3rem; /* 크기 증가 */
  border-radius: 50%;
  background: #ffc107;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem; /* 폰트 크기 증가 */
  font-weight: 700;
  flex-shrink: 0;
`;

const GapSkill = styled.div`
  font-size: 0.85rem; /* 폰트 크기 증가 */
  font-weight: 600;
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
  flex: 1;
  white-space: nowrap; /* 한 줄로 표시 */
  overflow: hidden; /* 넘치는 텍스트 숨김 */
  text-overflow: ellipsis; /* 넘치는 텍스트를 ...으로 표시 */
`;

const LoadingText = styled.div`
  font-size: 0.8rem; /* 폰트 크기 증가 */
  color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#666'};
  text-align: center;
  margin-top: 0.8rem; /* 여백 증가 */
`;

const ErrorText = styled.div`
  font-size: 0.8rem; /* 폰트 크기 증가 */
  color: #e74c3c;
  text-align: center;
  margin-top: 0.8rem; /* 여백 증가 */
`;