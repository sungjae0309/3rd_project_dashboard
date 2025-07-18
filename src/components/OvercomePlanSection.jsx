/* ───────── src/components/OvercomePlanSection.jsx ───────── */
import React from "react";
import styled from "styled-components";
import { FaLightbulb, FaCheckCircle, FaArrowUp } from "react-icons/fa";

export default function OvercomePlanSection({ darkMode = false }) {
  return (
    <SectionCard $darkMode={darkMode}>
      <LeftSide>
        <TopTextBlock>
          <Title>극복 방안</Title>
          <Text>
            갭 분석을 통해 파악한 부족한 역량을 채우기 위한 구체적인 학습 계획과 실천 방안을 제시합니다.
            단계별 목표 설정과 체계적인 학습 로드맵을 통해 목표 직무에 한 걸음 더 가까워질 수 있습니다.
          </Text>
        </TopTextBlock>
      </LeftSide>
    </SectionCard>
  );
}

// Styled Components
const SectionCard = styled.div`
  background: ${props => props.$darkMode ? '#2a2a2a' : '#ffffff'};
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.$darkMode ? '#404040' : '#e0e0e0'};
  display: flex;
  align-items: center;
  gap: 24px;
`;

const LeftSide = styled.div`
  flex: 1;
`;

const TopTextBlock = styled.div`
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.$darkMode ? '#ffffff' : '#333333'};
  margin: 0 0 12px 0;
`;

const Text = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: ${props => props.$darkMode ? '#b0b0b0' : '#666666'};
  margin: 0;
`;