import React from "react";
import styled from "styled-components";

export default function GapDetail() {
  return (
    <Container>
      <h2>갭 분석 상세</h2>
      <p>
        이 페이지는 사용자의 현재 역량과 목표 직무 간의 격차를 분석합니다. 기술 스택,
        프로젝트 경험, 협업 능력 등을 기반으로 부족한 부분을 진단하고 추천을 제공합니다.
      </p>
    </Container>
  );
}

const Container = styled.div`
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
  h2 {
    font-size: 1.8rem;
    color: #ffa500;
    margin-bottom: 1rem;
  }
  p {
    font-size: 1.1rem;
    line-height: 1.6;
  }
`;
