/* ───────── src/components/GapAnalysis.jsx ───────── */
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { IoIosArrowUp } from "react-icons/io";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://192.168.101.51:8000";

export default function GapAnalysis({ darkMode = false, setSelectedPage }) {
  const [gapResult, setGapResult] = useState("");
  const [topSkills, setTopSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGapAnalysis = async () => {
      try {
        // 1. 사용자 이력 정보 가져오기
        const token = localStorage.getItem("accessToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const { data: resume } = await axios.get(`${BASE_URL}/users/me/resume`, { headers });
        // 2. 관심 직무(혹은 선택 직무) 추출
        const desiredJobs = resume.desired_job || [];
        const jobCategory = desiredJobs[0]; // 첫 번째 직무 사용 (필요시 선택 UI 추가)

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

        setGapResult(gapData.gap_result || "분석 결과가 없습니다.");
        setTopSkills(gapData.top_skills || []);
      } catch (err) {
        setGapResult("갭 분석 결과를 불러오지 못했습니다.");
        setTopSkills([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGapAnalysis();
  }, []);

  return (
    <Container $darkMode={darkMode}>
      <SectionCard>
        <Title>갭 분석 결과</Title>
        {loading ? (
          <p>분석 중...</p>
        ) : (
          <>
            <ResultText>
              {gapResult || "분석 결과가 없습니다."}
            </ResultText>
            {topSkills.length > 0 && (
              <SkillList>
                <b>Top 5 부족 역량:</b>
                <ul>
                  {topSkills.map((skill, idx) => (
                    <li key={idx}>{skill}</li>
                  ))}
                </ul>
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

const ResultText = styled.pre`
  font-size: 1.05rem;
  line-height: 1.6;
  white-space: pre-wrap;
  margin-bottom: 1.2rem;
`;

const SkillList = styled.div`
  font-size: 1rem;
  margin-top: 1rem;
  ul {
    margin: 0.5rem 0 0 1.2rem;
    padding: 0;
  }
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