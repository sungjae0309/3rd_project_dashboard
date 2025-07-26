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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // 날짜 선택 상태 추가

  const { jobNames } = useJobNames();
  const jobNamesList = jobNames.map(job => job.name);
  const [jobInput, setJobInput] = useState("");
  const [daysInput, setDaysInput] = useState("15");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
              // 선택된 날짜의 일정만 필터링
              const selectedDateItems = response.data.todo_lists.filter(task => task.due_date && task.due_date.startsWith(selectedDate));
              const completedSelected = selectedDateItems.filter(t => t.is_completed).length;
              
              setTodayTasks(selectedDateItems);
              setStats({
                  total: selectedDateItems.length,
                  completed: completedSelected,
                  pending: selectedDateItems.length - completedSelected
              });
          } else {
              setHasSchedule(false);
          }
      } catch (err) {
          setError("정보를 불러오는 데 실패했습니다.");
      } finally {
          setLoading(false);
      }
  }, [selectedDate]); // selectedDate를 의존성에 추가

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
    
    const handleDeleteAll = async (e) => {
        e.stopPropagation();
        if (!window.confirm("모든 일정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
            return;
        }
        
        const token = localStorage.getItem("accessToken");
        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }
        
        setIsDeleting(true);
        try {
            console.log("삭제 API 호출 시작:", `${BASE_URL}/todo-list/clear`);
            const response = await axios.delete(`${BASE_URL}/todo-list/clear`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log("삭제 API 응답:", response);
            
            // 삭제 후 상태 초기화
            setHasSchedule(false);
            setTodayTasks([]);
            setStats({ total: 0, completed: 0, pending: 0 });
            alert("모든 일정이 삭제되었습니다.");
        } catch (err) {
            console.error("일정 삭제 실패:", err);
            console.error("에러 응답:", err.response);
            
            let errorMessage = "일정 삭제에 실패했습니다.";
            if (err.response?.status === 401) {
                errorMessage = "로그인이 필요합니다.";
            } else if (err.response?.status === 404) {
                errorMessage = "삭제할 일정이 없습니다.";
            } else if (err.response?.data?.detail) {
                errorMessage = err.response.data.detail;
            }
            
            alert(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };
    
    // 로딩 중 UI
    if (loading) {
        return <HoverCard $darkMode={darkMode}><LoadingSpinner /></HoverCard>;
    }

    return (
        <HoverCard $darkMode={darkMode} onClick={() => setSelectedPage("todo")}>
            
            <SectionTitle>
                <HighlightBar />
                <span>To-do List</span>
            </SectionTitle>

            {hasSchedule ? (
                <>
                    {/* <IntroText $darkMode={darkMode}>학습 계획을 확인하고 관리하세요</IntroText> */}
                    
                    {/* 간결한 날짜 선택기 */}
                    <DateSelector $darkMode={darkMode}>
                        <FaCalendarAlt />
                        <DateInput
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            $darkMode={darkMode}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </DateSelector>
                    
                    <StatsRow>
                        <StatBox><StatValue color="#3498db">{stats.total}</StatValue><StatLabel>할 일</StatLabel></StatBox>
                        <StatBox><StatValue color="#2ecc71">{stats.completed}</StatValue><StatLabel>완료</StatLabel></StatBox>
                        <StatBox><StatValue color="#f39c12">{stats.pending}</StatValue><StatLabel>진행중</StatLabel></StatBox>
                    </StatsRow>
                    <TaskList>
                        {todayTasks.length === 0 && <EmptyMessage>선택한 날짜에는 할 일이 없습니다.</EmptyMessage>}
                        {todayTasks.map(task => (
                            <TaskItem key={task.id} $isCompleted={task.is_completed} onClick={(e) => { e.stopPropagation(); handleToggle(task); }}>
                                <Checkbox $isCompleted={task.is_completed} />
                                <TaskTitle>{task.title}</TaskTitle>
                            </TaskItem>
                        ))}
                    </TaskList>
                    <ButtonRow>
                        <DeleteButton onClick={handleDeleteAll} disabled={isDeleting} $darkMode={darkMode}>
                            {isDeleting ? "삭제 중..." : "일정 삭제"}
                        </DeleteButton>
                        <ViewAllButton onClick={(e) => { e.stopPropagation(); setSelectedPage("todo"); }}>전체 일정 →</ViewAllButton>
                    </ButtonRow>
                </>
            ) : (
                <>
                    <IntroText $darkMode={darkMode}>찜한 공고/로드맵 기반으로 맞춤 일정을 생성해보세요.</IntroText>
                    {!isGenerating ? (
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
                                AI 일정 생성하기
                            </GenerateButton>
                        </InputForm>
                    ) : (
                        <LoadingContainer>
                            <LoadingSpinner />
                            <LoadingText $darkMode={darkMode}>로딩 중입니다. 잠시만 기다려 주세요.</LoadingText>
                        </LoadingContainer>
                    )}
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
  background: ${({ $darkMode }) => $darkMode ? '#2a2a2a' : '#f0f0f0'};
  border-radius: 2rem;
  padding: 1.5rem 1.8rem 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
  ${({ $darkMode }) => $darkMode && css`color: #fff;`}
  
  /* ▼▼▼ 핵심 수정사항 ▼▼▼ */
  height: 490px; /* 높이를 고정합니다. (AI 추천 공고 카드 높이에 맞춰 조절) */
  display: flex;
  flex-direction: column;
  /* ▲▲▲ 수정 완료 ▲▲▲ */
  
  /* 호버 시 배경색 수정 - 커리어 로드맵과 동일한 호버 배경색 */
  &:hover {
    background: ${({ $darkMode }) => $darkMode ? '#3a3a3a' : '#f8f9fa'};
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
    flex: 1; /* ★★★ 핵심: 남은 공간을 모두 차지하도록 설정 */
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    overflow-y: auto; /* 할 일이 3개를 넘어가면 스크롤 처리 */
    min-height: 0; /* flex 자식 요소의 크기 오류 방지 */
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

const DateSelector = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding: 0.6rem 0.8rem;
    background: ${({ $darkMode }) => $darkMode ? '#3a3a3a' : '#fff'};
    border-radius: 0.6rem;
    border: 1px solid ${({ $darkMode }) => $darkMode ? '#555' : '#e0e0e0'};
    color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#666'};
    font-size: 0.9rem;
`;

const DateInput = styled.input`
    flex: 1;
    padding: 0.3rem 0.5rem;
    border: none;
    background: transparent;
    color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
    font-size: 0.9rem;
    cursor: pointer;
    
    &:focus {
        outline: none;
    }
    
    &::-webkit-calendar-picker-indicator {
        filter: ${({ $darkMode }) => $darkMode ? 'invert(1)' : 'none'};
        cursor: pointer;
    }
`;

const ButtonRow = styled.div`
    display: flex;
    gap: 0.8rem;
    margin-top: auto;
    flex-shrink: 0;
`;

const ViewAllButton = styled.button`
    flex: 1;
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

const DeleteButton = styled.button`
    flex: 1;
    padding: 0.8rem;
    background: ${({ $darkMode }) => $darkMode ? '#dc3545' : '#dc3545'};
    color: white;
    border: none;
    border-radius: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    font-size: 0.9rem;

    &:hover:not(:disabled) {
        background: #c82333;
    }
    
    &:disabled {
        background: #6c757d;
        cursor: not-allowed;
    }
`;

const InputForm = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.8rem;
    padding: 0.5rem;
    min-height: 200px;
`;

const InputRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    select, input {
        flex: 1;
        padding: 0.4rem;
        border-radius: 0.4rem;
        border: 1px solid #ddd;
        font-size: 0.85rem;
    }
`;

const InputLabel = styled.label`
    font-weight: 600;
    width: 50px;
    font-size: 0.85rem;
`;

const GenerateButton = styled.button`
    width: 100%;
    padding: 0.6rem;
    background: #ffc107;
    border: none;
    border-radius: 0.6rem;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    margin-top: 0.8rem;
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

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 2rem;
`;

const LoadingText = styled.p`
    font-size: 0.9rem;
    color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#666'};
`;