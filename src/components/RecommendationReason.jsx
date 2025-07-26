// src/components/RecommendationReason.jsx (모달/팝업용으로 수정)

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

export default function RecommendationReason({ darkMode, job, onClose }) {
    const [explanation, setExplanation] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("accessToken");
    const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://192.168.101.51:8000";

    useEffect(() => {
        if (!job) return;
        if (!token) {
            setError("추천 이유를 보려면 로그인이 필요합니다.");
            setIsLoading(false);
            return;
        }
        const fetchExplanation = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.post(
                    `${BASE_URL}/recommend/jobs/explanation`,
                    [job.id],
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const reasonText = response.data?.explanations;
                if (reasonText) {
                    setExplanation(reasonText);
                } else {
                    setError("응답 데이터 형식이 올바르지 않습니다.");
                }
            } catch (err) {
                console.error("추천 이유 로딩 실패:", err);
                setError("추천 이유를 불러오는 중 오류가 발생했습니다.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchExplanation();
    }, [job, token]);

    return (
        <ModalCard $darkMode={darkMode}>
            <ModalHeader>
                <Title>{job?.title || "공고 정보 로딩 중..."}</Title>
                <CloseBtn onClick={onClose} $darkMode={darkMode}>×</CloseBtn>
            </ModalHeader>
            <SubTitle>AI 추천 이유</SubTitle>
            <ContentArea>
                {isLoading ? (
                    <LoadingContainer>
                        <LoadingSpinner />
                        <LoadingText $darkMode={darkMode}>추천 이유를 분석 중입니다...</LoadingText>
                    </LoadingContainer>
                ) : error ? (
                    <ErrorMessage>{error}</ErrorMessage>
                ) : (
                    <ExplanationText $darkMode={darkMode}>{explanation}</ExplanationText>
                )}
            </ContentArea>
        </ModalCard>
    );
}

const ModalCard = styled.div`
  background: ${({ $darkMode }) => $darkMode ? '#232323' : '#fff'};
  color: ${({ $darkMode }) => $darkMode ? '#eee' : '#222'};
  border-radius: 18px;
  padding: 2.8rem 2.6rem 2.4rem 2.6rem;
  width: 100%;
  max-width: 700px;
  min-width: 340px;
  min-height: 320px;
  max-height: 80vh;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;
const ModalHeader = styled.div`
    display: flex;
    align-items: center;
  justify-content: space-between;
  margin-bottom: 0.7rem;
`;
const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  flex: 1;
  white-space: pre-line;
`;
const SubTitle = styled.div`
  font-size: 1.05rem;
  color: #ff9800;
  font-weight: 600;
  margin-bottom: 0.7rem;
`;
const CloseBtn = styled.button`
  background: none;
    border: none;
  color: ${({ $darkMode }) => $darkMode ? '#aaa' : '#888'};
  font-size: 2.1rem;
  font-weight: 700;
    cursor: pointer;
  margin-left: 1.2rem;
  margin-top: -0.5rem;
    transition: color 0.2s;
  &:hover { color: ${({ $darkMode }) => $darkMode ? '#fff' : '#222'}; }
`;
const ContentArea = styled.div`
  min-height: 160px;
  max-height: 420px;
  overflow-y: auto;
    margin-bottom: 0.5rem;
  scrollbar-width: thin;
  scrollbar-color: #bbb #eee;
  &::-webkit-scrollbar {
    width: 8px;
    background: #eee;
  }
  &::-webkit-scrollbar-thumb {
    background: #bbb;
    border-radius: 4px;
  }
`;
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  gap: 1rem;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #ffc107;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  text-align: center;
  font-size: 1.1rem;
  color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#666'};
  margin: 0;
`;
const ErrorMessage = styled.div`
  color: #f44336;
  font-weight: bold;
  text-align: center;
  padding: 2.5rem 0;
`;
const ExplanationText = styled.div`
  font-size: 1.18rem;
  line-height: 2.15;
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#222'};
  background: ${({ $darkMode }) => $darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'};
  border-radius: 10px;
  padding: 1.5rem 1.2rem;
  white-space: pre-line;
  word-break: keep-all;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  letter-spacing: 0.01em;
  /* 단락 간 여백 */
  p, ul, ol, li {
    margin-bottom: 1.1em;
    margin-top: 0.2em;
  }
`;