import React, { useEffect, useRef, useState, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import PromptBar from "./PromptBar";
import { FaPlus } from "react-icons/fa";
import {
  createChatSession,
  fetchChatHistory,
  sendChatMessage,
} from "../api/mcp";

export default function ChatPage({
  sessionId,
  token,
  darkMode,
  onNewSession,
}) {
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadOrCreateSession = useCallback(async () => {
    if (sessionId) {
      setLoadingHistory(true);
      try {
        const history = await fetchChatHistory(sessionId, token);
        if (isMounted.current) {
          setChatHistory(history);
        }
      } catch (e) {
        console.error("히스토리 조회 실패:", e);
      } finally {
        if (isMounted.current) {
          setLoadingHistory(false);
        }
      }
    } else if (token) {
      try {
        const data = await createChatSession(token);
        if (isMounted.current) {
          onNewSession(data.id);
        }
      } catch (e) {
        console.error("새 채팅 세션 생성 실패:", e);
      }
    }
  }, [sessionId, token, onNewSession]);

  useEffect(() => {
    loadOrCreateSession();
  }, [loadOrCreateSession]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // 새 채팅 세션 생성 함수
  const handleNewChat = async () => {
    try {
      const data = await createChatSession(token);
      if (isMounted.current && onNewSession) {
        onNewSession(data.id);
      }
    } catch (e) {
      console.error("새 채팅 세션 생성 실패:", e);
    }
  };

  // 안전한 날짜 포맷팅 함수 추가
  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "시간 정보 없음";
      }
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('날짜 파싱 오류:', error);
      return "시간 정보 없음";
    }
  };

  const handlePromptSubmit = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || !sessionId) return;

    const userMessage = {
      role: "user",
      content: trimmed,
      created_at: new Date().toISOString(), // timestamp → created_at으로 변경
    };

    setChatHistory((h) => [...h, userMessage]);
    setSending(true);

    try {
      const ans = await sendChatMessage(sessionId, trimmed, token);
      
      if (isMounted.current) {
        setChatHistory((h) => [
          ...h,
          {
            role: "assistant",
            content: ans.answer || "죄송합니다. 응답을 생성할 수 없습니다.",
            created_at: new Date().toISOString(), // timestamp → created_at으로 변경
          },
        ]);
      }
    } catch (e) {
      console.error("메시지 전송 실패:", e);
      if (isMounted.current) {
        setChatHistory((h) => [
          ...h,
          {
            role: "assistant",
            content: "오류가 발생했습니다.",
            created_at: new Date().toISOString(), // timestamp → created_at으로 변경
          },
        ]);
      }
    } finally {
      if (isMounted.current) {
        setSending(false);
      }
    }
  };

  if (!sessionId) {
    return (
      <Placeholder $darkMode={darkMode}>
        <p>새로운 채팅 세션을 생성하는 중입니다...</p>
      </Placeholder>
    );
  }

  return (
    <Container $darkMode={darkMode}>
      <Header>
        <Info>Session #{sessionId}</Info>
        {/* 새 채팅 버튼 추가 */}
        <NewChatButton onClick={handleNewChat} $darkMode={darkMode}>
          <FaPlus /> 새 채팅
        </NewChatButton>
      </Header>

      <ChatWindow>
        {loadingHistory && <Status>이력 불러오는 중…</Status>}
        {!loadingHistory &&
          chatHistory.map((m, i) => (
            <Bubble key={i} isUser={m.role === "user"}>
              <Message>{m.content}</Message>
              <Meta>{new Date(m.created_at).toLocaleTimeString()}</Meta>
            </Bubble>
          ))}
        {sending && chatHistory[chatHistory.length - 1]?.role === 'user' && (
          <Bubble isUser={false}>
            <TypingIndicator>
              <span></span><span></span><span></span>
            </TypingIndicator>
          </Bubble>
        )}
        <div ref={chatEndRef} />
      </ChatWindow>
      
      <PromptBarWrapper>
          <PromptBar
            onSubmit={(text) => {
                handlePromptSubmit(text);
            }}
            disabled={sending}
            darkMode={darkMode}
          />
      </PromptBarWrapper>
    </Container>
  );
}

// ─── Styled Components ────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(5px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${({ $darkMode }) => ($darkMode ? "rgb(255, 255, 255)" : "rgb(255, 255, 255)")};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid ${({ $darkMode }) => ($darkMode ? "#333" : "#eee")};
`;

const Info = styled.span`
  font-weight: bold;
`;

const NewChatButton = styled.button`
  background: #fbbf24;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: #f59e0b;
    transform: translateY(-1px);
  }
`;

const ChatWindow = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Status = styled.div`
  text-align: center;
  color: #888;
`;

const Placeholder = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1.6;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#555")};
`;

const Bubble = styled.div`
  align-self: ${({ isUser }) => (isUser ? "flex-end" : "flex-start")};
  background: ${({ isUser, $darkMode }) =>
    isUser
      ? $darkMode
        ? "#3a4a78"
        : "#bbdefb"
      : $darkMode
      ? "#333"
      : "#e0e0e0"};
  border-radius: 1rem;
  padding: 0.6rem 1rem;
  max-width: 70%;
  animation: ${fadeIn} 0.3s ease;
`;

const Message = styled.div`
  white-space: pre-wrap;
  word-break: break-word;
`;

const Meta = styled.div`
  font-size: 0.7rem;
  color: ${({ $darkMode }) => ($darkMode ? "#888" : "#555")};
  text-align: right;
  margin-top: 0.2rem;
`;

const typing = keyframes`
  0%, 80%, 100% {
    box-shadow: 0 0;
    height: 4px;
  }
  40% {
    box-shadow: 0 -4px;
    height: 8px;
  }
`;

const TypingIndicator = styled.div`
  span {
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: #888;
    margin: 0 2px;
    animation: ${typing} 1.4s infinite ease-in-out both;
  }
  span:nth-child(2) {
    animation-delay: 0.2s;
  }
  span:nth-child(3) {
    animation-delay: 0.4s;
  }
`;

const PromptBarWrapper = styled.div`
  padding: 1rem;
  border-top: 1px solid ${({ $darkMode }) => ($darkMode ? "#333" : "#eee")};
`;