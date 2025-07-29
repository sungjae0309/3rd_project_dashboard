import React, { useState } from "react";
import styled from "styled-components";
import PromptInput from "./PromptInput";

export default function PromptBar({ darkMode, activePage, onSubmit }) {
  const [userQuery, setUserQuery] = useState("");

  const handleSubmit = () => {
    const trimmed = userQuery.trim();
    if (!trimmed) return;
    onSubmit(trimmed);      // ✅ 먼저 전달
    setUserQuery("");       // ✅ 그 다음에 초기화
  };
  
  

  return (
    <Wrapper> 
      <Prompt $darkMode={darkMode}>
        <PromptText>JOB자에게 메시지</PromptText>

        <PromptInput
          userQuery={userQuery}
          setUserQuery={setUserQuery}
          handleSubmit={handleSubmit}
          darkMode={darkMode}
        />

        <PromptButton onClick={handleSubmit}>전송</PromptButton>
      </Prompt>
    </Wrapper>
  );
}

/* 스타일 생략 */


const Wrapper = styled.div`
  position: fixed;
  bottom: 1rem;
  left: 59.5%;
  transform: translateX(-50%);
  z-index: 20;
  width: 100%;
  max-width: 850px;
  display: flex;
  justify-content: center;
  height: 100px;
`;

const Prompt = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 900px;
  border-radius: 1rem;
  padding: 1.2rem;
  ${({ $darkMode }) =>
    $darkMode ? "background:#333;" : "background:rgb(188, 185, 179);"}
`;

const PromptText = styled.div`
  font-size: 1rem;
  color: rgb(25, 19, 1);
`;

const PromptButton = styled.button`
  padding: 1.4rem 1.2rem;
  background: #ffc107;
  color: #222;
  font-weight: bold;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  &:hover {
    background: #ffb300;
  }
`;
