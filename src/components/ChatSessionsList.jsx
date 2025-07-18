import React, { useEffect, useState, useMemo, useCallback } from "react";
import styled from "styled-components";
import {
  getMyChatSessions,
  createChatSession,
  deleteChatSession,
} from "../api/mcp";
import { FaPlus, FaRegClock, FaTrashAlt, FaCommentDots } from "react-icons/fa";

// 시간 차이를 계산하여 "방금 전", "어제" 등으로 변환하는 함수
const timeSince = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "년 전";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "달 전";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "일 전";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "시간 전";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "분 전";
  return "방금 전";
};


// ✅ 세션 정보를 표시할 새로운 카드 컴포넌트
const SessionCard = React.memo(({ session, onSelect, onDelete, darkMode }) => {
  // 현재 API는 ID만 반환하므로, 실제 생성 시간을 ID 기반으로 시뮬레이션합니다.
  // 최신 ID일수록 최신 시간으로 표시됩니다.
  const simulatedDate = new Date(Date.now() - (928 - session.id) * 3600000);

  return (
    <Card onClick={() => onSelect(session.id)} $darkMode={darkMode}>
      <CardIcon $darkMode={darkMode}><FaCommentDots /></CardIcon>
      <CardTitle>Session #{session.id}</CardTitle>
      <CardPreview $darkMode={darkMode}>
        이전 대화 내용을 보려면 클릭하세요.
      </CardPreview>
      <CardFooter $darkMode={darkMode}>
        <Timestamp>
          <FaRegClock />
          {timeSince(simulatedDate)}
        </Timestamp>
        <DeleteButton onClick={(e) => {
          e.stopPropagation();
          onDelete(session.id);
        }}>
          <FaTrashAlt />
        </DeleteButton>
      </CardFooter>
    </Card>
  );
});


export default function ChatSessionsList({
  token,
  selectedSession,
  onSelect,
  darkMode,
}) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const ids = await getMyChatSessions(token);
      const list = ids.sort((a, b) => b - a).map((id) => ({ id }));
      setSessions(list);
    } catch (e) {
      console.error("세션 목록 조회 실패:", e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) load();
  }, [token, load]);

  const handleNew = async () => {
    try {
      const data = await createChatSession(token);
      onSelect(data.id);
      await load();
    } catch (e) {
      console.error("새 세션 생성 실패", e);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Session #${id}를 정말 삭제하시겠습니까?`)) {
      try {
        await deleteChatSession(id, token);
        if (id === selectedSession) onSelect(null);
        await load();
      } catch (e) {
        console.error("세션 삭제 실패", e);
      }
    }
  };
  
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const filtered = useMemo(() => {
    const kw = filter.trim();
    return sessions.filter((s) => String(s.id).includes(kw));
  }, [sessions, filter]);

  return (
    <Container $darkMode={darkMode}>
      <TopBar>
        <Title>대화 이력</Title>
        <NewBtn onClick={handleNew} $darkMode={darkMode}>
          <FaPlus /> 새 채팅
        </NewBtn>
      </TopBar>

      <SearchInput
        placeholder="세션 ID 검색"
        value={filter}
        onChange={handleFilterChange}
        $darkMode={darkMode}
      />

      {/* ✅ 카드 그리드 레이아웃으로 변경 */}
      <CardGrid>
        {loading && <Msg>로딩 중…</Msg>}
        {!loading && filtered.length > 0 &&
          filtered.map((s) => (
            <SessionCard
              key={s.id}
              session={s}
              onSelect={onSelect}
              onDelete={handleDelete}
              darkMode={darkMode}
            />
          ))}
        {!loading && filtered.length === 0 && <Msg>대화 이력이 없습니다.</Msg>}
      </CardGrid>
    </Container>
  );
}

// --- ✅ 새롭게 디자인된 Styled Components ---

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${({ $darkMode }) => ($darkMode ? "rgb(255, 255, 255)" : "rgb(255, 255, 255)")};
  color: ${({ $darkMode }) => ($darkMode ? "#e0e0e0" : "#333")};
  padding: 1.5rem;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ $darkMode }) => ($darkMode ? "#fff" : "#000")};
`;

const NewBtn = styled.button`
  background: #5a67d8;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: bold;
  font-size: 0.9rem;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: #434190;
    transform: translateY(-2px);
  }
`;

const SearchInput = styled.input`
  margin-bottom: 1.5rem;
  padding: 0.8rem 1rem;
  width: 100%;
  border-radius: 8px;
  border: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#ddd")};
  background-color: ${({ $darkMode }) => ($darkMode ? "#1e1e1e" : "#fff")};
  color: ${({ $darkMode }) => ($darkMode ? "#e0e0e0" : "#333")};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #5a67d8;
    box-shadow: 0 0 0 2px rgba(90, 103, 216, 0.3);
  }
`;

const CardGrid = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 10px; // for scrollbar
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? "#1e1e1e" : "#ffffff")};
  border-radius: 12px;
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid ${({ $darkMode }) => ($darkMode ? "#333" : "#eee")};
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  min-height: 150px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    border-color: #5a67d8;
  }
`;

const CardIcon = styled.div`
  font-size: 1.5rem;
  color: ${({ $darkMode }) => ($darkMode ? "#5a67d8" : "#5a67d8")};
  margin-bottom: 0.5rem;
`;

const CardTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
`;

const CardPreview = styled.p`
  font-size: 0.9rem;
  color: #888;
  margin: 0;
  flex-grow: 1;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid ${({ $darkMode }) => ($darkMode ? "#333" : "#f0f0f0")};
  font-size: 0.8rem;
  color: #888;
`;

const Timestamp = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.2rem;
  
  &:hover {
    color: #ef4444;
  }
`;

const Msg = styled.div`
  text-align: center;
  color: #666;
  width: 100%;
  grid-column: 1 / -1; // 그리드 전체 너비 차지
  padding: 2rem;
`;