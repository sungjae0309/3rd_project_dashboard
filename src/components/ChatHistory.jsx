import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { fetchChatHistory } from "../api/mcp";

export default function ChatHistory({ sessionId, token, darkMode }) {
  const chatEndRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId || !token) return;

    const loadHistory = async () => {
      
      setLoading(true);
      setError(null);
      try {
        const data = await fetchChatHistory(Number(sessionId), token);
        const formatted = data.map((msg) => ({
          sender: msg.role === "user" ? "user" : "assistant",
          text: msg.message,
        }));
        setHistory(formatted);
      } catch (err) {
        console.error("대화 이력 로드 실패:", err);
        setError("대화 이력을 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [sessionId, token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  if (!sessionId || !token) {
    return <Msg>로그인 후 이용 가능합니다.</Msg>;
  }

  return (
    <Wrapper>
      {loading && <Msg>로딩 중...</Msg>}
      {error && <ErrorMsg>{error}</ErrorMsg>}
      <ChatBox>
        {history.map((msg, idx) => (
          <MessageBubble key={idx} isUser={msg.sender === "user"}>
            {msg.text}
          </MessageBubble>
        ))}
        <div ref={chatEndRef} />
      </ChatBox>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  height: 100%;
  overflow-y: auto;
  padding: 1rem 2rem;
  background-color: ${({ darkMode }) => (darkMode ? "#1a1a1a" : "#fafafa")};
`;

const ChatBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 0.8rem 1rem;
  border-radius: 1rem;
  background: ${({ isUser }) => (isUser ? "#ffe082" : "#e0e0e0")};
  color: #333;
  font-size: 0.95rem;
  align-self: ${({ isUser }) => (isUser ? "flex-end" : "flex-start")};
  word-break: break-word;
`;

const Msg = styled.div`
  text-align: center;
  color: #999;
  padding: 1rem 0;
`;

const ErrorMsg = styled.div`
  color: #a70000;
  background: #ffd6d6;
  text-align: center;
  padding: 1rem 0;
  font-weight: bold;
`;
