import React, { useState } from "react";
import styled, { css } from "styled-components";

export default function PromptInput({ userQuery, setUserQuery, handleSubmit, darkMode }) {
  const [isComposing, setIsComposing] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isComposing) {
      e.preventDefault();
      handleSubmit(); // ✅ 상태값은 이미 바깥에서 참조
    }
  };

  return (
    <Input
      type="text"
      value={userQuery}
      onChange={(e) => setUserQuery(e.target.value)}
      onKeyDown={handleKeyDown}
      onCompositionStart={() => setIsComposing(true)}
      onCompositionEnd={() => setIsComposing(false)}
      placeholder="메시지를 입력하세요..."
      $darkMode={darkMode}
    />
  );
}

/* 스타일 생략 */


const Input = styled.input`
  flex: 1;
  font-size: 1rem;
  border: none;
  border-radius: 0.5rem;
  padding: 1.3rem 1rem;

  ${({ $darkMode }) =>
    $darkMode
      ? css`
          background: #333;
          color: #fff;
          &::placeholder {
            color: #999;
          }
        `
      : css`
          background: #fff;
          color: #000;
          &::placeholder {
            color: #aaa;
          }
        `}
  &:focus {
    outline: none;
  }
`;
