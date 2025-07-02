import React, { useState } from "react";
import styled, { css } from "styled-components";
import PromptInput from "./PromptInput";

export default function PromptBar({ darkMode, activePage, onSubmit }) {
  const [text, setText] = useState("");

  return (
    <Wrapper>
      <Prompt $darkMode={darkMode}>
        <PromptText>JOB자에게 메시지</PromptText>

        <PromptInput
          placeholder={
            activePage === "ai-jobs"
              ? "추천받고 싶은 조건을 입력하세요…"
              : "무엇이든 물어보세요…"
          }
          darkMode={darkMode}
          userQuery={text}
          setUserQuery={setText}
          handleSubmit={() => {
            onSubmit(text);
            setText("");          // 전송 후 비우기
          }}
        />

        <PromptButton onClick={() => {
          onSubmit(text);
          setText("");
        }}>
          전송
        </PromptButton>
      </Prompt>
    </Wrapper>
  );
}

/* ─── 스타일 (MainContent 것 그대로 복사) ─── */
const Wrapper = styled.div`
  position: fixed;
  bottom: 2.5rem;
  left: 60%;
  transform: translateX(-50%);
  z-index: 20;
  width: 100%;
  max-width: 800px;
  display: flex;
  justify-content: center;
  height: 80px;
`;
const Prompt = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 800px;
  border-radius: 1rem;
  padding: 1rem;
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
  &:hover { background: #ffb300; }
`;
