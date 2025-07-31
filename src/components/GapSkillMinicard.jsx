import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";

export default function GapSkillMiniCard({ selectedJob, darkMode }) {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedJob) return;
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://192.168.101.7:8000";
    axios
      .get(`${BASE_URL}/visualization/gap-analysis`, {
        params: { category: selectedJob },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => {
        setSkills(res.data.top_skills?.slice(0, 5) || []);
      })
      .catch((error) => {
        console.error('갭 분석 미니카드 오류:', error);
        setSkills([]);
      })
      .finally(() => setLoading(false));
  }, [selectedJob]);

  return (
    <GapCardWrapper $darkMode={darkMode}>
      <h3>갭 분석</h3>
      <MiniLabel>Top 5 부족 역량</MiniLabel>
      {loading ? (
        <LoadingText>불러오는 중...</LoadingText>
      ) : (
        <SkillList>
          {skills.length === 0 ? (
            <NoSkill>데이터 없음</NoSkill>
          ) : (
            skills.map((skill, idx) => <SkillItem key={idx}>{skill}</SkillItem>)
          )}
        </SkillList>
      )}
    </GapCardWrapper>
  );
}

const GapCardWrapper = styled.div`
  width: 100%;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: none;
  color: inherit;
`;

const MiniLabel = styled.div`
  font-size: 0.95rem;
  color: #ffa500;
  margin-bottom: 0.7rem;
  font-weight: 600;
`;

const SkillList = styled.ul`
  margin: 0;
  padding: 0 0 0 1.1em;
  list-style: disc;
`;

const SkillItem = styled.li`
  font-size: 1.05rem;
  margin-bottom: 0.3em;
  color: #333;
  font-weight: 500;
`;

const NoSkill = styled.div`
  color: #aaa;
  font-size: 0.95rem;
`;

const LoadingText = styled.div`
  color: #aaa;
  font-size: 0.95rem;
`;