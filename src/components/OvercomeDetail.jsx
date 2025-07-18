import React from "react";
import styled from "styled-components";

export default function OvercomeDetail() {
  return (
    <Container>
      <h2>직무 트렌드 분석 상세</h2>
      <p>
        이 페이지는 데이터 분석 직무의 최신 기술 트렌드를 보여줍니다. Python, SQL,
        Pandas 등의 언어와 라이브러리, 머신러닝 프레임워크 사용 현황 등을 포함합니다.
      </p>
      {/* 추가적인 데이터 시각화, 기사 링크, 분석 내용 등을 넣을 수 있음 */}
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