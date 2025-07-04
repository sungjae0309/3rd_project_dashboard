// ─────── JobCardPreview.jsx ───────
import React from "react";
import styled, { css } from "styled-components";
import { FiSearch, FiHeart } from "react-icons/fi";

export default function JobCardPreview({ setSelectedPage, darkMode }) {
  return (
    <JobCardRow>
      <PrettyCard onClick={() => setSelectedPage("search")} $darkMode={darkMode}>
        <CardHead>
          <HighlightBar />
          <h3>공고 검색</h3>
        </CardHead>
        <CardBody>원하는 키워드로 채용 공고를 찾아보세요.</CardBody>
        <CardFoot>예: 백엔드 · 데이터 분석 · AI</CardFoot>
        <IconBg><FiSearch /></IconBg>
      </PrettyCard>

      <PrettyCard onClick={() => setSelectedPage("saved")} $darkMode={darkMode}>
        <CardHead>
          <HighlightBar />
          <h3>찜한 공고</h3>
        </CardHead>
        <CardBody>저장한 공고를 한곳에서 모아보세요.</CardBody>
        <CardFoot>최대 20개까지 자동 저장</CardFoot>
        <IconBg><FiHeart /></IconBg>
      </PrettyCard>
    </JobCardRow>
  );
}

// ─────── 스타일 ───────
const JobCardRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.4rem;
  margin-top: 1rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const PrettyCard = styled.div`
  position: relative;
  padding: 2.8rem 2.4rem 2.2rem;
  border-radius: 2rem;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.35s ease, box-shadow 0.35s ease;

  ${({ $darkMode }) =>
    $darkMode
      ? css`
          background: #222;
          border: 1px solid #444;
          color: #fefefe;
        `
      : css`
          background: #f3f0eb;
          border: 1px solid #ddd;
          color: #3d3215;
        `}

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 18px 30px rgba(0, 0, 0, 0.12);
  }
`;


const CardHead = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.2rem;

  h3 {
    font-size: 2rem;
    font-weight: 800;
    margin: 0;
  }
`;

const HighlightBar = styled.div`
  width: 8px;
  height: 1.6rem;
  background: #ffc400;
  border-radius: 4px;
`;

const CardBody = styled.p`
  font-size: 1.1rem;
  line-height: 1.56;
  margin: 0 0 4.5rem;
`;

const CardFoot = styled.div`
  font-size: 0.9rem;
  color: #8b8b8b;
`;

const IconBg = styled.div`
  position: absolute;
  right: -14%;
  top: -14%;
  font-size: 11rem;
  opacity: 0.06;
  pointer-events: none;
`;
