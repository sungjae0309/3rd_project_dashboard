import React from 'react';
import styled from 'styled-components';

export default function RoadmapCategory({ onSelectCategory, darkMode }) {
  const categories = [
    { key: "bootcamp", label: "부트캠프", type: "부트캠프" },
    { key: "certificate", label: "자격증", type: "자격증" },
    { key: "lecture", label: "강의", type: "강의" },
  ];

  return (
    <Container $darkMode={darkMode}>
      <Header>로드맵 분야 별로 보기</Header>
      <CategoryGrid>
        {categories.map(cat => (
          <CategoryCard key={cat.key} onClick={() => onSelectCategory(cat.type)}>
            <h3>{cat.label}</h3>
            <p>{cat.label} 목록을 확인하고 커리어 플랜을 세워보세요.</p>
          </CategoryCard>
        ))}
      </CategoryGrid>
    </Container>
  );
}

const Container = styled.div`
  padding: 2rem;
  background: ${({ $darkMode }) => ($darkMode ? "#121212" : "#fff")};
  color: ${({ $darkMode }) => ($darkMode ? "#eee" : "#333")};
  height: 100%;
`;

const Header = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  text-align: center;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const CategoryCard = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? "#333" : "#f9f9f9")};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#eee")};
  border-radius: 1rem;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #ffc107;
  }

  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: #ffa500;
  }

  p {
    font-size: 1rem;
    line-height: 1.5;
  }
`;