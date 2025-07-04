import React from "react";
import styled from "styled-components";

export default function OvercomeDetail() {
  return (
    <Container>
      <h2>극복 방안 상세</h2>
      <p>
        이 페이지는 커리어 갭을 극복하기 위한 실질적인 방법을 제시합니다. 예를 들어,
        부트캠프 수강, 사이드 프로젝트, 대회 참가, 논문 정리 등을 포함합니다.
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
