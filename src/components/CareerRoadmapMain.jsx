/* ───────── src/components/CareerRoadmapMain.jsx ───────── */
import React from "react";
import styled, { keyframes } from "styled-components";
import WordCloud from "react-wordcloud";
import { IoIosArrowUp } from "react-icons/io";
import QuickQuiz from "./QuickQuiz";

export default function CareerRoadmapMain({ darkMode = false }) {
  const keywords = [
    { text: "Python", value: 80 },
    { text: "SQL", value: 60 },
    { text: "Pandas", value: 40 },
    { text: "머신러닝", value: 25 },
    { text: "분석경험", value: 15 },
    { text: "EDA", value: 30 },
    { text: "TensorFlow", value: 35 },
    { text: "PyTorch", value: 33 },
    { text: "모델링", value: 28 },
    { text: "Numpy", value: 27 },
  ];
  const wcOptions = { fontSizes: [12, 28], rotations: 2, rotationAngles: [-30, 0] };

  return (
    <Container $darkMode={darkMode}>
      {/* ───────────── 직무 트렌드 분석 ───────────── */}
      <SectionCard $first>
        <LeftSide>
          <TopTextBlock>
            <Title>직무 트렌드 분석</Title>
            <Text>
              최근 데이터 분석 직무에서는 Python, SQL, Pandas와 같은 언어·라이브러리에 대한
              수요가 높습니다. 특히 머신러닝 프레임워크(TensorFlow, PyTorch)도 중요하게
              평가됩니다.
            </Text>
          </TopTextBlock>
          <BottomWordCloud>
            <WordCloud words={keywords} options={wcOptions} />
          </BottomWordCloud>
        </LeftSide>

        {/* 우측 영역: QuickQuiz 삽입 */}
        <QuizWrapper>
          <QuickQuiz type="trend" />
        </QuizWrapper>
      </SectionCard>

      {/* ▼▼▼ 스크롤 힌트 */}
      <ScrollArrow>
        <IoIosArrowUp />
        <IoIosArrowUp />
        <IoIosArrowUp />
      </ScrollArrow>

      {/* ───────────── 갭 분석 ───────────── */}
      <SectionCard>
        <LeftSide>
          <TopTextBlock>
            <Title>갭 분석</Title>
            <Text>
              현재 나의 기술 수준과 목표 직무에서 요구하는 역량 사이에는 갭이 존재할 수 있습니다.
              부족한 부분을 파악하고, 이를 채우기 위한 실질적인 계획이 필요합니다.
            </Text>
          </TopTextBlock>
        </LeftSide>

        {/* 우측 영역: QuickQuiz for Gap */}
        <QuizWrapper>
          <QuickQuiz type="gap" />
        </QuizWrapper>
      </SectionCard>

      {/* ▼▼▼ 스크롤 힌트 */}
      <ScrollArrow>
        <IoIosArrowUp />
        <IoIosArrowUp />
        <IoIosArrowUp />
      </ScrollArrow>

      {/* ───────────── 극복 방안 ───────────── */}
      <SectionCard>
        <RightOnly>
          <Title>극복 방안</Title>
          <Text>
            부트캠프 수강, 사이드 프로젝트 수행, Kaggle 대회 참가 등을 통해 실무 경험과
            포트폴리오를 동시에 확보하는 전략이 효과적입니다. 또한 최신 논문‧블로그 정리를 통해
            이론적 깊이도 함께 쌓으세요.
          </Text>
        </RightOnly>
      </SectionCard>
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
  gap: 2rem;
  background: #f9f9f9;
  border-radius: 1rem;
  padding: 1.6rem 2.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  min-height: 53vh;
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

const BottomWordCloud = styled.div`
  height: 220px;
  width: 100%;
`;

const QuizWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: flex-start;
`;

const RightOnly = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
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