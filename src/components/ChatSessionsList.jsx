import React, { useEffect, useState, useMemo, useCallback } from "react";
import styled from "styled-components";
import {
  getMyChatSessions,
  createChatSession,
  deleteChatSession,
  fetchChatHistory,
} from "../api/mcp";
import { FaRegClock, FaTrashAlt, FaCommentDots, FaCheck } from "react-icons/fa";

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
const SessionCard = React.memo(({ 
  session, 
  onSelect, 
  onDelete, 
  darkMode, 
  isSelected, 
  onToggleSelect 
}) => {
  // API에서 받은 updated_at 사용
  const sessionDate = session.updated_at ? new Date(session.updated_at) : new Date();

  const handleCardClick = (e) => {
    // 체크박스를 클릭한 경우가 아니라면 세션 선택
    if (!e.target.closest('.checkbox-area')) {
      onSelect(session.id);
    }
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onToggleSelect(session.id);
  };

  return (
    <Card 
      onClick={handleCardClick} 
      $darkMode={darkMode}
      $isSelected={isSelected}
    >
      <SelectionCheckbox 
        className="checkbox-area"
        $isSelected={isSelected}
        onClick={handleCheckboxClick}
      >
        {isSelected ? <FaCheck /> : null}
      </SelectionCheckbox>
      <CardIcon $darkMode={darkMode}><FaCommentDots /></CardIcon>
      <CardTitle>{session.title || `Session #${session.id}`}</CardTitle>
      <CardPreview $darkMode={darkMode}>
        대화 내용을 보려면 클릭하세요.
      </CardPreview>
      <CardFooter $darkMode={darkMode}>
        <Timestamp>
          <FaRegClock />
          {timeSince(sessionDate)}
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
  const [selectedSessions, setSelectedSessions] = useState(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const sessions = await getMyChatSessions(token);
      // 각 세션의 첫 번째 메시지를 가져와서 제목으로 사용
      const sessionsWithTitles = await Promise.all(
        sessions.sort((a, b) => b.id - a.id).map(async (session) => {
          try {
            const history = await fetchChatHistory(session.id, token);
            const firstMessage = history.find(msg => msg.role === "user");
            return {
              id: session.id,
              title: firstMessage ? firstMessage.content.substring(0, 30) + (firstMessage.content.length > 30 ? "..." : "") : `Session #${session.id}`,
              updated_at: session.updated_at // API에서 받은 updated_at 사용
            };
          } catch (error) {
            console.error(`세션 ${session.id} 히스토리 조회 실패:`, error);
            return {
              id: session.id,
              title: `Session #${session.id}`,
              updated_at: session.updated_at // API에서 받은 updated_at 사용
            };
          }
        })
      );
      setSessions(sessionsWithTitles);
    } catch (e) {
      console.error("세션 목록 조회 실패:", e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) load();
  }, [token, load]);

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

  const handleBulkDelete = async () => {
    const selectedIds = Array.from(selectedSessions);
    if (selectedIds.length === 0) return;
    
    if (window.confirm(`선택된 ${selectedIds.length}개의 세션을 정말 삭제하시겠습니까?`)) {
      try {
        await Promise.all(selectedIds.map(id => deleteChatSession(id, token)));
        if (selectedIds.includes(selectedSession)) onSelect(null);
        setSelectedSessions(new Set());
        await load();
      } catch (e) {
        console.error("일괄 삭제 실패", e);
      }
    }
  };

  const handleDeleteAll = async () => {
    if (sessions.length === 0) return;
    
    if (window.confirm(`모든 대화 이력 (${sessions.length}개)을 정말 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      try {
        await Promise.all(sessions.map(session => deleteChatSession(session.id, token)));
        onSelect(null);
        setSelectedSessions(new Set());
        await load();
        alert("모든 대화 이력이 삭제되었습니다.");
      } catch (e) {
        console.error("전체 삭제 실패", e);
        alert("삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    }
  };

  const handleToggleSelect = (sessionId) => {
    const newSelected = new Set(selectedSessions);
    if (newSelected.has(sessionId)) {
      newSelected.delete(sessionId);
    } else {
      newSelected.add(sessionId);
    }
    setSelectedSessions(newSelected);
  };


  
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const filtered = useMemo(() => {
    const kw = filter.trim();
    return sessions.filter((s) => 
      String(s.id).includes(kw) || 
      s.title.toLowerCase().includes(kw.toLowerCase())
    );
  }, [sessions, filter]);

  return (
    <Container $darkMode={darkMode}>
      <TopBar>
        <Title>대화 이력</Title>
        <ActionButtons>
          <SelectionButton onClick={handleDeleteAll} $darkMode={darkMode} $isDeleteAll>
            <FaTrashAlt /> 전체 삭제
          </SelectionButton>
          <SelectionButton onClick={handleBulkDelete} $darkMode={darkMode} $isDelete disabled={selectedSessions.size === 0}>
            <FaTrashAlt /> 선택 삭제{selectedSessions.size > 0 ? ` (${selectedSessions.size})` : ''}
          </SelectionButton>
        </ActionButtons>
      </TopBar>

      <SearchInput
        placeholder="세션 ID 또는 제목 검색"
        value={filter}
        onChange={handleFilterChange}
        $darkMode={darkMode}
      />

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
              isSelected={selectedSessions.has(s.id)}
              onToggleSelect={handleToggleSelect}
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

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const SelectionButton = styled.button`
  background: ${({ $isDelete, $isDeleteAll, $darkMode, disabled }) => 
    disabled ? "#6b7280" : $isDeleteAll ? "#dc2626" : $isDelete ? "#ef4444" : "#fbbf24"};
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: ${({ disabled }) => disabled ? "not-allowed" : "pointer"};
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: bold;
  font-size: 0.9rem;
  transition: all 0.2s ease-in-out;
  opacity: ${({ disabled }) => disabled ? 0.6 : 1};

  &:hover:not(:disabled) {
    background: ${({ $isDelete, $isDeleteAll }) => 
      $isDeleteAll ? "#b91c1c" : $isDelete ? "#dc2626" : "#f59e0b"};
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
    border-color: #fbbf24;
    box-shadow: 0 0 0 2px rgba(251, 191, 36, 0.3);
  }
`;

const CardGrid = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
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
  border: 2px solid ${({ $isSelected, $darkMode }) => 
    $isSelected ? "#fbbf24" : 
    $darkMode ? "#333" : "#eee"};
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  min-height: 150px;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    border-color: #fbbf24;
  }
`;

const SelectionCheckbox = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 20px;
  height: 20px;
  border: 2px solid #fbbf24;
  border-radius: 4px;
  background: ${({ $isSelected }) => $isSelected ? "#fbbf24" : "transparent"};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 4px rgba(251, 191, 36, 0.3);
  }
`;

const CardIcon = styled.div`
  font-size: 1.5rem;
  color: #fbbf24;
  margin-bottom: 0.5rem;
`;

const CardTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: ${({ $darkMode }) => ($darkMode ? "#fff" : "#333")};
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
  grid-column: 1 / -1;
  padding: 2rem;
`;