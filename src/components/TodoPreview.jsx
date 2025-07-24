// src/components/TodoPreview.jsx

import React, { useState, useEffect, useCallback } from 'react';
import styled, { css } from 'styled-components';
import axios from 'axios';
import { FaClipboardCheck, FaPlus, FaCalendarAlt } from 'react-icons/fa';
import { useJobNames } from '../contexts/JobNamesContext'; // 직무 목록 Context

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://192.168.101.51:8000';

function TodoPreview({ darkMode, setSelectedPage }) {
  const [hasSchedule, setHasSchedule] = useState(false);
  const [todayTasks, setTodayTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { jobNames } = useJobNames();
  const jobNamesList = jobNames.map(job => job.name);
  const [jobInput, setJobInput] = useState("");
  const [daysInput, setDaysInput] = useState("15");
  const [isGenerating, setIsGenerating] = useState(false);

  const checkSchedule = useCallback(async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
          setLoading(false);
          return;
      }
      try {
          setLoading(true);
          const response = await axios.get(`${BASE_URL}/todo-list/`, {
              headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data.total_count > 0) {
              setHasSchedule(true);
              const today = new Date().toISOString().split('T')[0];
              const todayItems = response.data.todo_lists.filter(task => task.due_date && task.due_date.startsWith(today));
              const completedToday = todayItems.filter(t => t.is_completed).length;
              
              setTodayTasks(todayItems);
              setStats({
                  total: todayItems.length,
                  completed: completedToday,
                  pending: todayItems.length - completedToday
              });
          } else {
              setHasSchedule(false);
          }
      } catch (err) {
          setError("정보를 불러오는 데 실패했습니다.");
      } finally {
          setLoading(false);
      }
  }, []); // 이 useCallback은 의존성이 없으므로 []가 맞습니다.

  useEffect(() => {
      checkSchedule();
  }, [checkSchedule]);


  const handleGenerate = async () => {
    if (!jobInput.trim()) return alert("직무를 선택해주세요.");
    if (!daysInput || +daysInput < 1 || +daysInput > 60) return alert("기간은 1-60일 사이로 입력해주세요.");
    
    const token = localStorage.getItem("accessToken");
    setIsGenerating(true);
    try {
        // ▼▼▼ axios 요청 부분을 수정합니다 ▼▼▼
        await axios.post(`${BASE_URL}/todo-list/generate`, 
            {}, // Request Body는 비워둡니다.
            { 
                headers: { Authorization: `Bearer ${token}` },
                // params 옵션을 사용하여 쿼리 파라미터로 전송합니다.
                params: {
                    job_title: jobInput,
                    days: Number(daysInput)
                }
            }
        );
        // ▲▲▲ 수정 완료 ▲▲▲
        
        // 성공 후, 일정 다시 확인
        await checkSchedule();
    } catch (err) {
        alert("일정 생성에 실패했습니다. 이미 생성된 일정이 있는지 확인해주세요.");
        console.error(err);
    } finally {
        setIsGenerating(false);
    }
};

    const handleToggle = async (task) => {
        // ... (이전 코드와 동일)
    };
    
    // 로딩 중 UI
    if (loading) {
        return <HoverCard $darkMode={darkMode}><LoadingSpinner /></HoverCard>;
    }

    return (
        <HoverCard $darkMode={darkMode} onClick={() => setSelectedPage("todo")}>
            <CardIconBg><FaClipboardCheck /></CardIconBg>
            <SectionTitle>
                <HighlightBar />
                <span>To-do List</span>
            </SectionTitle>

            {hasSchedule ? (
                <>
                    <IntroText $darkMode={darkMode}>오늘의 학습 계획을 확인하고 관리하세요.</IntroText>
                    <StatsRow>
                        <StatBox><StatValue color="#3498db">{stats.total}</StatValue><StatLabel>오늘 할 일</StatLabel></StatBox>
                        <StatBox><StatValue color="#2ecc71">{stats.completed}</StatValue><StatLabel>완료</StatLabel></StatBox>
                        <StatBox><StatValue color="#f39c12">{stats.pending}</StatValue><StatLabel>진행중</StatLabel></StatBox>
                    </StatsRow>
                    <TaskList>
                        {todayTasks.length === 0 && <EmptyMessage>오늘은 할 일이 없습니다.</EmptyMessage>}
                        {todayTasks.slice(0, 3).map(task => (
                            <TaskItem key={task.id} $isCompleted={task.is_completed} onClick={(e) => { e.stopPropagation(); handleToggle(task); }}>
                                <Checkbox $isCompleted={task.is_completed} />
                                <TaskTitle>{task.title}</TaskTitle>
                            </TaskItem>
                        ))}
                    </TaskList>
                    <ViewAllButton onClick={(e) => { e.stopPropagation(); setSelectedPage("todo"); }}>전체 일정 보기 →</ViewAllButton>
                </>
            ) : (
                <>
                    <IntroText $darkMode={darkMode}>찜한 공고/로드맵 기반으로 맞춤 일정을 생성해보세요.</IntroText>
                    <InputForm onClick={(e) => e.stopPropagation()}>
                        <InputRow>
                            <InputLabel>목표 직무</InputLabel>
                            <select value={jobInput} onChange={e => setJobInput(e.target.value)}>
                                <option value="">직무 선택</option>
                                {jobNamesList.map(job => <option key={job} value={job}>{job}</option>)}
                            </select>
                        </InputRow>
                        <InputRow>
                            <InputLabel>학습 기간</InputLabel>
                            <input type="number" value={daysInput} onChange={e => setDaysInput(e.target.value)} placeholder="15" />
                            <span>일</span>
                        </InputRow>
                        <GenerateButton onClick={handleGenerate} disabled={isGenerating}>
                            {isGenerating ? "생성 중..." : "AI 일정 생성하기"}
                        </GenerateButton>
                    </InputForm>
                </>
            )}
        </HoverCard>
    );
}

// export default를 React.memo로 감싸줍니다.
export default React.memo(TodoPreview);

// Styled Components
// src/components/TodoPreview.jsx 의 styled-components 영역

const HoverCard = styled.div`
  position: relative;
  background: #edece9;
  border-radius: 2rem;
  padding: 1.5rem 1.8rem 1rem;
  cursor: pointer;
  transition: all 0.3s;
  ${({ $darkMode }) => $darkMode && css`background: #2b2b2b; color: #fff;`}
  
  /* ▼▼▼ 핵심 수정사항 ▼▼▼ */
  height: 470px; /* 높이를 고정합니다. (AI 추천 공고 카드 높이에 맞춰 조절) */
  display: flex;
  flex-direction: column;
  /* ▲▲▲ 수정 완료 ▲▲▲ */
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }
`;

const CardIconBg = styled.div`
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  font-size: 6.5rem;
  color: rgb(214, 214, 213);
  opacity: 0.5;
  z-index: 0;
  ${({ $darkMode }) => $darkMode && css`color: #444;`}
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.7rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
`;

const HighlightBar = styled.div`
  width: 8px;
  height: 1.6rem;
  background: #ffc400;
  border-radius: 4px;
`;

const IntroText = styled.p`
  font-size: 0.95rem;
  line-height: 1.6;
  color: #6c5f3f;
  margin-bottom: 1.5rem;
  ${({ $darkMode }) => $darkMode && css`color: #ccc;`}
`;

const StatsRow = styled.div`
    display: flex;
    justify-content: space-around;
    width: 100%;
    margin-bottom: 1.5rem;
    background: rgba(0,0,0,0.03);
    padding: 1rem 0;
    border-radius: 1rem;
`;

const StatBox = styled.div`
    text-align: center;
`;

const StatValue = styled.div`
    font-size: 1.8rem;
    font-weight: 700;
    color: ${props => props.color};
`;

const StatLabel = styled.div`
    font-size: 0.8rem;
    color: #888;
    margin-top: 0.2rem;
`;

const TaskList = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
`;

const TaskItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.8rem;
    background: ${({ $isCompleted, $darkMode }) => $isCompleted ? 'rgba(0,0,0,0.05)' : ($darkMode ? '#3a3a3a' : '#fff')};
    border-radius: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: ${({ $isCompleted }) => $isCompleted ? 'line-through' : 'none'};
    color: ${({ $isCompleted }) => $isCompleted ? '#888' : 'inherit'};

    &:hover {
        transform: translateX(4px);
    }
`;

const Checkbox = styled.div`
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid ${({ $isCompleted }) => $isCompleted ? '#2ecc71' : '#ccc'};
    background-color: ${({ $isCompleted }) => $isCompleted ? '#2ecc71' : 'transparent'};
    transition: all 0.2s;
    flex-shrink: 0;
`;

const TaskTitle = styled.span`
    font-weight: 600;
`;

const EmptyMessage = styled.p`
    text-align: center;
    color: #888;
    margin-top: 2rem;
`;

const ViewAllButton = styled.button`
    margin-top: auto;
    width: 100%;
    padding: 0.8rem;
    background: #ffc107;
    border: none;
    border-radius: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
        background: #ffb300;
    }
`;

const InputForm = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1rem;
    padding: 1rem;
`;

const InputRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    select, input {
        flex: 1;
        padding: 0.5rem;
        border-radius: 0.5rem;
        border: 1px solid #ddd;
    }
`;

const InputLabel = styled.label`
    font-weight: 600;
    width: 60px;
`;

const GenerateButton = styled.button`
    width: 100%;
    padding: 0.8rem;
    background: #ffc107;
    border: none;
    border-radius: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 1rem;
    &:hover { background: #ffb300; }
    &:disabled { background: #ccc; }
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #ffc107;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 2rem auto;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;