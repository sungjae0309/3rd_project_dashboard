import React from "react";
import styled, { css } from "styled-components";
import { FaArrowLeft } from "react-icons/fa";

export default React.memo(function CareerRoadmapDetail({ section, darkMode, onBack }) {
  const titles = {
    analysis: "트렌드 분석",
    gap: "갭 분석",
    plan: "극복 방안",
  };

  const dummy = {
    analysis: [
      "• 요구 기술 키워드 12개 추출",
      "• 우대 조건 3건 요약",
      "• 직무 핵심 역량 그래프",
    ],
    gap: [
      "• 기술 스택 일치율 68%",
      "• 프로젝트 경험 부족 2건",
      "• 학위/자격증 요구 사항 없음",
    ],
    plan: [
      "• React 심화 강의(2주)",
      "• 사이드 프로젝트 1건 제안",
      "• 알고리즘 풀이 주 3회 추천",
    ],
  };

  return (
    <DetailCard $darkMode={darkMode}>
      <SectionHeader>
        <LocalBack onClick={onBack} $darkMode={darkMode}>
          <FaArrowLeft /> 뒤로가기
        </LocalBack>
        <h2>{titles[section]}</h2>
      </SectionHeader>

      <DetailList>
        {dummy[section].map((line) => (
          <li key={line}>{line}</li>
        ))}
      </DetailList>
    </DetailCard>
  );
});

/* ───── 스타일 ───── */
const DetailCard = styled.div`
  height: auto;
  width: 850px;
  border-radius: 1rem;
  padding: 2.5rem;
  background: ${({ $darkMode }) => ($darkMode ? "#333" : "#eeeae2")};
  align-items: flex-start;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.8rem;
  h2 {
    font-size: 1.6rem;
  }
`;

const LocalBack = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border: none;
  background: none;
  font-size: 0.9rem;
  cursor: pointer;
  ${({ $darkMode }) =>
    $darkMode
      ? css`
          color: #ffc107;
          &:hover {
            opacity: 0.8;
          }
        `
      : css`
          color: #614f25;
          &:hover {
            opacity: 0.8;
          }
        `}
`;

const DetailList = styled.ul`
  list-style: disc;
  padding-left: 1.4rem;
  line-height: 1.8;
  font-size: 0.97rem;
`;
