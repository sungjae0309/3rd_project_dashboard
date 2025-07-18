// src/components/SavedJobDetail.jsx
import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://192.168.101.51:8000";

export default function SavedJobDetail({ jobId, onBack, darkMode }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;

    const fetchJobDetail = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await axios.get(`${BASE_URL}/job_posts/${jobId}`, { headers });
        setJob(res.data);
      } catch (err) {
        if (err.response?.status === 404) {
          alert("존재하지 않는 공고입니다.");
        } else {
          alert("공고를 불러오는 데 실패했습니다.");
        }
        console.error(err);
        if (onBack) onBack(); // 에러 발생 시 뒤로가기
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetail();
  }, [jobId, onBack]);

  if (loading) return <PageWrap><Card>⏳ 로딩 중...</Card></PageWrap>;
  if (!job) return <PageWrap><Card>공고를 찾을 수 없습니다.</Card></PageWrap>;

  return (
    <OverlayContainer $darkMode={darkMode}>
      <Card $darkMode={darkMode}>
        {/* 뒤로가기 버튼 */}
        <BackBtn onClick={onBack} $darkMode={darkMode}>
          ← 뒤로가기
        </BackBtn>

        {/* 유사도 배지 */}
        {job.similarity !== null && typeof job.similarity === 'number' && (
          <SimilarityBadge $score={job.similarity}>
            적합도 {(job.similarity * 100).toFixed(0)}%
          </SimilarityBadge>
        )}

        <Title $darkMode={darkMode}>{job.title}</Title>
        <Sub $darkMode={darkMode}>{job.company_name} · {job.address}</Sub>

        <Section $darkMode={darkMode}>
          <h3>주요 업무</h3>
          <p>{job.main_tasks || "정보 없음"}</p>
        </Section>
        <Section $darkMode={darkMode}>
          <h3>자격 요건</h3>
          <p>{job.qualifications || "정보 없음"}</p>
        </Section>
        <Section $darkMode={darkMode}>
          <h3>기술 스택</h3>
          <p>{job.tech_stack || "정보 없음"}</p>
        </Section>
        <Section $darkMode={darkMode}>
          <h3>고용 형태</h3>
          <p>{job.employment_type} · {job.applicant_type}</p>
        </Section>
        <Section $darkMode={darkMode}>
          <h3>공고 기간</h3>
          <p>{job.posting_date?.slice(0,10)} ~ {job.deadline?.slice(0,10) || "상시"}</p>
        </Section>
      </Card>
    </OverlayContainer>
  );
}

/* ───── 스타일 수정 ───── */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageWrap = styled.div`
  min-height: 100vh;
  background: ${({ $darkMode }) => $darkMode ? '#1a1a1a' : '#f8f6f1'};
  padding: 2rem 1rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

const OverlayContainer = styled.div`
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  background: ${({ $darkMode }) => $darkMode ? '#1a1a1a' : '#f8f6f1'};
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const Card = styled.div`
  position: relative;
  width: 100%;
  background: ${({ $darkMode }) => $darkMode ? '#2a2a2a' : '#fff'};
  border-radius: 1rem;
  padding: 2.5rem;
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
`;

const BackBtn = styled.button`
  background: none;
  border: none;
  color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#555'};
  font-size: 0.95rem;
  margin-bottom: 1.2rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ $darkMode }) => $darkMode ? '#fff' : '#000'};
    background: ${({ $darkMode }) => $darkMode ? '#444' : '#f0f0f0'};
    font-weight: bold;
  }
`;

const Title = styled.h1`
  font-size: 1.8rem;
  color: #ff9900;
  margin-bottom: 0.5rem;
`;

const Sub = styled.div`
  font-size: 1rem;
  color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#555'};
  margin-bottom: 2rem;
`;

const Section = styled.section`
  margin-bottom: 1.5rem;
  h3 {
    font-size: 1.1rem;
    color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
    margin-bottom: 0.3rem;
  }
  p {
    white-space: pre-wrap;
    line-height: 1.6;
    color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#444'};
  }
`;

const SimilarityBadge = styled.div`
  position: absolute;
  top: 2.5rem;
  right: 2.5rem;
  background-color: ${({ $score }) =>
    $score >= 0.7 ? '#2a9d8f' : $score >= 0.4 ? '#f4a261' : '#e76f51'};
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.9rem;
  font-weight: bold;
`;