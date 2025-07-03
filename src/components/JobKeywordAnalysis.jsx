import React, { useMemo } from "react";
import styled from "styled-components";
import WordCloud from "react-wordcloud";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";

export default function JobKeywordAnalysis() {
  const words = useMemo(() => [
    { text: "Python", value: 120 },
    { text: "SQL", value: 100 },
    { text: "머신러닝", value: 95 },
    { text: "딥러닝", value: 90 },
    { text: "Pandas", value: 85 },
    { text: "Numpy", value: 80 },
    { text: "통계분석", value: 75 },
    { text: "시각화", value: 70 },
    { text: "Matplotlib", value: 68 },
    { text: "Seaborn", value: 66 },
    { text: "데이터 전처리", value: 65 },
    { text: "EDA", value: 60 },
    { text: "모델링", value: 58 },
    { text: "Scikit-Learn", value: 55 },
    { text: "TensorFlow", value: 50 },
    { text: "PyTorch", value: 48 },
    { text: "Kaggle", value: 45 },
    { text: "데이터 시각화", value: 40 },
    { text: "추천시스템", value: 38 },
    { text: "자연어 처리", value: 35 },
    { text: "데이터베이스", value: 33 },
    { text: "Git", value: 30 },
    { text: "Github", value: 28 },
    { text: "Jupyter Notebook", value: 26 },
    { text: "빅데이터", value: 25 },
    { text: "분류", value: 23 },
    { text: "회귀", value: 22 },
    { text: "클러스터링", value: 20 },
    { text: "차원 축소", value: 18 },
    { text: "정규화", value: 16 },
  ], []);

  const options = useMemo(() => ({
    rotations: 0,
    fontSizes: [14, 50],
    fontFamily: "Pretendard, sans-serif",
    enableTooltip: false,
    deterministic: true,
    colors: ["#264653", "#2a9d8f", "#e76f51", "#f4a261", "#e9c46a"],
  }), []);

  return (
    <CloudContainer>
      <WordCloud words={words} options={options} />
    </CloudContainer>
  );
}

const CloudContainer = styled.div`
  height: 250px;
  width: 100%;
  overflow: hidden;
  canvas {
    border-radius: 10px;
  }
`;
