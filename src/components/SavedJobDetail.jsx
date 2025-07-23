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

  if (loading) return (
    <PageWrap>
      <Card $darkMode={darkMode}>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>공고 정보를 불러오는 중...</LoadingText>
        </LoadingContainer>
      </Card>
    </PageWrap>
  );
  
  if (!job) return (
    <PageWrap>
      <Card $darkMode={darkMode}>공고를 찾을 수 없습니다.</Card>
    </PageWrap>
  );

  return (
    <PageWrap>
      <Card $darkMode={darkMode}>
        <Header>
          <BackButton onClick={onBack} $darkMode={darkMode}>
            ← 뒤로가기
          </BackButton>
        </Header>
        
        <JobContent>
          <JobTitle $darkMode={darkMode}>{job.title}</JobTitle>
          <CompanyName $darkMode={darkMode}>{job.company_name}</CompanyName>
          
          <InfoSection>
            <InfoItem>
              <Label>주소:</Label>
              <Value $darkMode={darkMode}>{job.address}</Value>
            </InfoItem>
            <InfoItem>
              <Label>고용형태:</Label>
              <Value $darkMode={darkMode}>{job.employment_type}</Value>
            </InfoItem>
            <InfoItem>
              <Label>지원자 유형:</Label>
              <Value $darkMode={darkMode}>{job.applicant_type}</Value>
            </InfoItem>
            <InfoItem>
              <Label>기술스택:</Label>
              <Value $darkMode={darkMode}>{job.tech_stack}</Value>
            </InfoItem>
            <InfoItem>
              <Label>공고일:</Label>
              <Value $darkMode={darkMode}>{job.posting_date?.slice(0, 10)}</Value>
            </InfoItem>
            <InfoItem>
              <Label>마감일:</Label>
              <Value $darkMode={darkMode}>{job.deadline?.slice(0, 10) || "상시"}</Value>
            </InfoItem>
            <InfoItem>
              <Label>주요업무:</Label>
              <Value $darkMode={darkMode}>{job.main_tasks}</Value>
            </InfoItem>
            <InfoItem>
              <Label>자격요건:</Label>
              <Value $darkMode={darkMode}>{job.qualifications}</Value>
            </InfoItem>
            <InfoItem>
              <Label>선호사항:</Label>
              <Value $darkMode={darkMode}>{job.preferences}</Value>
            </InfoItem>
          </InfoSection>
        </JobContent>
      </Card>
    </PageWrap>
  );
}

// 스타일 컴포넌트
const PageWrap = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const Card = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? "#2a2a2a" : "#fff")};
  border-radius: 0.8rem;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#e9ecef")};
  max-height: 80vh;
  max-width: 600px;
  width: 100%;
  overflow-y: auto;
  animation: slideInRight 0.3s ease-out;
  margin-right: 2rem;
`;

const Header = styled.div`
  margin-bottom: 1.5rem;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #ffc107;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.3rem 0;
  transition: color 0.3s ease;
  
  &:hover {
    color: #ffdb4d;
  }
`;

const JobContent = styled.div`
  animation: fadeIn 0.3s ease-in-out;
`;

const JobTitle = styled.h1`
  font-size: 1.4rem;
  font-weight: 700;
  color: ${({ $darkMode }) => ($darkMode ? "#fff" : "#333")};
  margin-bottom: 0.3rem;
`;

const CompanyName = styled.h2`
  font-size: 1rem;
  color: #ffc107;
  margin-bottom: 1.5rem;
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: ${({ $darkMode }) => ($darkMode ? "#333" : "#f8f9fa")};
  border-radius: 0.6rem;
  border: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#e9ecef")};
`;

const InfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.3rem 0;
`;

const Label = styled.span`
  font-weight: 600;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#666")};
  min-width: 80px;
  flex-shrink: 0;
  font-size: 0.85rem;
`;

const Value = styled.span`
  color: ${({ $darkMode }) => ($darkMode ? "#fff" : "#333")};
  line-height: 1.4;
  word-break: break-word;
  font-size: 0.85rem;
`;

// 애니메이션
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const slideInRight = keyframes`
  0% { 
    opacity: 0; 
    transform: translateX(50px) scale(0.95); 
  }
  100% { 
    opacity: 1; 
    transform: translateX(0) scale(1); 
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const LoadingSpinner = styled.div`
  width: 30px;
  height: 30px;
  border: 2px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#e9ecef")};
  border-top: 2px solid #ffc107;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 0.8rem;
`;

const LoadingText = styled.div`
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#666")};
  font-size: 0.9rem;
`;