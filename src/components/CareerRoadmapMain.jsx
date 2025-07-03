import React from "react";
import styled from "styled-components";
import WordCloud from "react-wordcloud";

export default function CareerRoadmapMain({ darkMode }) {
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

  const options = {
    fontSizes: [12, 28],
    rotations: 2,
    rotationAngles: [-30, 0],
  };

  return (
    <Container $darkMode={darkMode}>
      <WordCloud words={keywords} options={options} />
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  height: 150px;
`;
