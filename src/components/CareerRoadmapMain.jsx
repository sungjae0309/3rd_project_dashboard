import React from "react";
import styled from "styled-components";

export default React.memo(function CareerRoadmapMain({ darkMode, onSelect }) {
  const sections = [
    {
      id: "analysis",
      label: "공고 분석",
      desc: "공고 핵심 키워드를 추출합니다.",
      color: "#fdf5dd",
    },
    {
      id: "gap",
      label: "갭 분석",
      desc: "내 이력서와 공고를 비교합니다.",
      color: "#f3f1eb",
    },
    {
      id: "plan",
      label: "극복 방안",
      desc: "부족한 부분 학습 계획을 제안합니다.",
      color: "#efeffa",
    },
  ];

  return (
    <Card $darkMode={darkMode} style={{ padding: "2.5rem", alignItems: "center" }}>
      <FlowRow>
        {sections.map((s, i) => (
          <React.Fragment key={s.id}>
            <RoadmapCard
              $darkMode={darkMode}
              $bg={s.color}
              onClick={() => onSelect(s.id)}
            >
              <h3>{s.label}</h3>
              <p>{s.desc}</p>
              <SmallHint>(클릭하면 상세 보기)</SmallHint>
            </RoadmapCard>
            {i < sections.length - 1 && <ArrowBox>→</ArrowBox>}
          </React.Fragment>
        ))}
      </FlowRow>
    </Card>
  );
});

/* 스타일은 MainContent에서 쓰던 것 재사용 */
const Card = styled.div`
  height: auto;
  width: 850px;
  border-radius: 1rem;
  padding: 1.5rem;
  background: ${({ $darkMode }) => ($darkMode ? "#333" : "#eeeae2")};
`;

const FlowRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.2rem;
  flex-wrap: nowrap;
`;

const RoadmapCard = styled.div`
  width: 220px;
  height: 250px;
  background-color: ${({ $bg }) => $bg || "#f5f5f5"};
  text-align: center;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.6rem;
  cursor: pointer;
  border-radius: 1rem;
  font-weight: 500;

  h3 {
    font-size: 1.3rem;
    font-weight: bold;
    margin-bottom: 0.4rem;
  }

  p {
    font-size: 1rem;
    line-height: 1.5;
  }

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
  }
`;

const ArrowBox = styled.div`
  font-size: 2rem;
  color: #888;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SmallHint = styled.small`
  font-size: 0.85rem;
  opacity: 0.55;
  margin-top: auto;
`;
