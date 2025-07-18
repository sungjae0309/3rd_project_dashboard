// src/api/mcp.js

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://192.168.101.51:8000";

/**
 * 내 채팅 세션 ID 목록 조회
 * GET /chat_sessions/my
 * 반환: [id, id, …]
 */
export const getMyChatSessions = async (token) => {
  const res = await fetch(`${BASE_URL}/chat_sessions/my`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok) throw new Error("세션 목록 조회 실패");
  return await res.json();
};

/**
 * 새 채팅 세션 생성
 * POST /chat_sessions/
 *   body: {}
 * POST 422 시 → GET /chat_sessions/my 의 최신 ID 사용
 */
export const createChatSession = async (token) => {
  // 1) POST 시도
  let res = await fetch(`${BASE_URL}/chat_sessions/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({}),
  });

  // 2) 422 Unprocessable Entity → GET fallback
  if (res.status === 422) {
    console.warn("POST /chat_sessions/ 422 → GET /chat_sessions/my 로 대체");
    const ids = await getMyChatSessions(token);
    if (ids.length === 0) throw new Error("사용 가능한 세션이 없습니다.");
    return { id: ids[0] };
  }

  if (!res.ok) throw new Error("새 세션 생성 실패");
  return await res.json(); // { id, user_id, created_at, updated_at }
};

/**
 * 채팅 세션 삭제
 * DELETE /chat_sessions/{session_id}
 */
export const deleteChatSession = async (sessionId, token) => {
  const res = await fetch(`${BASE_URL}/chat_sessions/${sessionId}`, {
    method: "DELETE",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok) throw new Error("세션 삭제 실패");
};

/**
 * 세션별 대화 이력 조회
 * GET /mcp_chat/history?session_id={sessionId}
 * 반환: [{ role, content, timestamp }, …]
 */
export const fetchChatHistory = async (sessionId, token) => {
  const res = await fetch(
    `${BASE_URL}/mcp_chat/history?session_id=${sessionId}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }
  );
  if (!res.ok) throw new Error("히스토리 조회 실패");
  return await res.json();
};

/**
 * 메시지 전송 및 답변 수신
 * POST /mcp_chat/llm/chat/
 *   body: { data: { session_id, message }, model }
 * 반환: 챗봇 답변(문자열)
 */
export const sendChatMessage = async (sessionId, message, token) => {
  const res = await fetch(`${BASE_URL}/mcp_chat/llm/chat/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({
      data: { session_id: Number(sessionId), message },
    }),
  });
  if (!res.ok) throw new Error("메시지 전송 실패");
  return await res.json();
};

/**
 * 프롬프트(질문) → 챗봇 답변을 받아오는 통합 함수
 * (sessionId 관리 포함)
 */
export const fetchMcpResponse = async (text, userId, token) => {
  let sessionId = localStorage.getItem("chatSessionId");
  if (!sessionId) {
    const data = await createChatSession(token);
    sessionId = data.id;
    localStorage.setItem("chatSessionId", sessionId);
  }
  const answer = await sendChatMessage(sessionId, text, token);
  return { message: answer };
};