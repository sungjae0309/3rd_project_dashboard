// src/components/TodoPreview.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { css, keyframes } from 'styled-components';
import axios from 'axios';
import { FaClipboardCheck, FaPlus, FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useJobNames } from '../contexts/JobNamesContext'; // 직무 목록 Context

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://192.168.101.7:8000';

function TodoPreview({ darkMode, setSelectedPage }) {
  const [hasSchedule, setHasSchedule] = useState(false);
  const [todayTasks, setTodayTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // 날짜 선택 상태 추가
  const [isTransitioning, setIsTransitioning] = useState(false); // 전환 애니메이션 상태 추가
  const [showCalendar, setShowCalendar] = useState(false); // 캘린더 표시 상태
  const dateInputRef = useRef(null); // 날짜 input 참조

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
          setIsTransitioning(false); // 전환 완료
      }
  }, [selectedDate]); // selectedDate를 의존성에 추가

  useEffect(() => {
      checkSchedule();
  }, [checkSchedule]);

  // 캘린더 자동 열기
  useEffect(() => {
      if (showCalendar && dateInputRef.current) {
          const timer = setTimeout(() => {
              try {
                  if (dateInputRef.current.showPicker) {
                      dateInputRef.current.showPicker();
                  } else {
                      dateInputRef.current.click();
                  }
              } catch (error) {
                  // 일부 브라우저에서 showPicker가 지원되지 않을 수 있음
                  dateInputRef.current.click();
              }
          }, 50);

          // 5초 후에 자동으로 캘린더 상태 닫기 (취소 시 대비)
          const autoCloseTimer = setTimeout(() => {
              setShowCalendar(false);
          }, 5000);

          return () => {
              clearTimeout(timer);
              clearTimeout(autoCloseTimer);
          };
      }
  }, [showCalendar]);

  // 날짜 이동 핸들러
  const moveDate = (direction) => {
      const currentDate = new Date(selectedDate);
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + direction);
      
      setIsTransitioning(true);
      setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  // 날짜 변경 핸들러 추가
  const handleDateChange = (e) => {
      setIsTransitioning(true); // 전환 시작
      setSelectedDate(e.target.value);
      setShowCalendar(false); // 캘린더 숨기기
  };

  // 날짜 포맷팅 함수
  const formatDisplayDate = (dateString) => {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}.${month}.${day}`;
  };


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
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        
        // 낙관적 업데이트: UI를 먼저 업데이트
        const updatedTasks = todayTasks.map(t => 
            t.id === task.id ? { ...t, is_completed: !t.is_completed } : t
        );
        setTodayTasks(updatedTasks);
        
        // 통계 즉시 업데이트
        const completedCount = updatedTasks.filter(t => t.is_completed).length;
        setStats({
            total: updatedTasks.length,
            completed: completedCount,
            pending: updatedTasks.length - completedCount
        });
        
        try {
            await axios.patch(`${BASE_URL}/todo-list/${task.id}/toggle`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error("일정 상태 변경 실패:", err);
            // 실패 시 이전 상태로 롤백
            await checkSchedule();
            alert("일정 상태 변경에 실패했습니다.");
        }
    };
    
    // 로딩 중 UI
    if (loading) {
        return <HoverCard $darkMode={darkMode}><LoadingSpinner /></HoverCard>;
    }

    return (
        <HoverCard $darkMode={darkMode} onClick={() => setSelectedPage("todo")}>
            
            <SectionTitle>
                <div>
                    <HighlightBar />
                    <span>To-do List</span>
                </div>
            </SectionTitle>

            {hasSchedule ? (
                <>
                    {/* <IntroText $darkMode={darkMode}>학습 계획을 확인하고 관리하세요</IntroText> */}
                    
                    {/* 개선된 날짜 선택기 */}
                    <DateNavigator $darkMode={darkMode}>
                        <DateNavButton 
                            onClick={(e) => { e.stopPropagation(); moveDate(-1); }}
                            $darkMode={darkMode}
                        >
                            <FaChevronLeft />
                        </DateNavButton>
                        
                        <DateDisplay 
                            onClick={(e) => { e.stopPropagation(); setShowCalendar(true); }}
                            $darkMode={darkMode}
                        >
                            {formatDisplayDate(selectedDate)}
                        </DateDisplay>
                        
                        <DateNavButton 
                            onClick={(e) => { e.stopPropagation(); moveDate(1); }}
                            $darkMode={darkMode}
                        >
                            <FaChevronRight />
                        </DateNavButton>
                        
                        {showCalendar && (
                            <HiddenDateInput
                                ref={dateInputRef}
                                type="date"
                                value={selectedDate}
                                onChange={handleDateChange}
                                $darkMode={darkMode}
                            />
                        )}
                    </DateNavigator>
                    
                    <AnimatedContainer $isTransitioning={isTransitioning || loading}>
                        <StatsRow>
                            <StatBox><StatValue color="#3498db">{stats.total}</StatValue><StatLabel>할 일</StatLabel></StatBox>
                            <StatBox><StatValue color="#2ecc71">{stats.completed}</StatValue><StatLabel>완료</StatLabel></StatBox>
                            <StatBox><StatValue color="#f39c12">{stats.pending}</StatValue><StatLabel>진행중</StatLabel></StatBox>
                        </StatsRow>
                        <TaskList>
                            {todayTasks.length === 0 && <EmptyMessage>선택한 날짜에는 할 일이 없습니다.</EmptyMessage>}
                            {todayTasks.map((task, index) => (
                                <TaskItem 
                                    key={task.id} 
                                    $isCompleted={task.is_completed} 
                                    $animationDelay={index * 0.1}
                                    $darkMode={darkMode}
                                    onClick={(e) => { e.stopPropagation(); handleToggle(task); }}
                                    title={task.is_completed ? "완료된 작업 - 클릭하여 미완료로 변경" : "미완료 작업 - 클릭하여 완료로 변경"}
                                >
                                    <Checkbox 
                                        $isCompleted={task.is_completed} 
                                        onClick={(e) => { e.stopPropagation(); handleToggle(task); }}
                                    />
                                    <TaskTitle $isCompleted={task.is_completed}>{task.title}</TaskTitle>
                                </TaskItem>
                            ))}
                        </TaskList>
                    </AnimatedContainer>
                    <ViewAllButton onClick={(e) => { e.stopPropagation(); setSelectedPage("todo"); }}>전체 일정 →</ViewAllButton>
                </>
            ) : (
                <>
                    {!isGenerating ? (
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
                                    <InputWithUnit>
                                        <input type="number" value={daysInput} onChange={e => setDaysInput(e.target.value)} placeholder="15" />
                                        <UnitText>일</UnitText>
                                    </InputWithUnit>
                                </InputRow>
                                <GenerateButton onClick={handleGenerate} disabled={isGenerating}>
                                        AI 일정 생성하기
                                </GenerateButton>
                            </InputForm>
                        </>
                    ) : (
                        <LoadingContainer>
                            <LoadingSpinner />
                            <LoadingText $darkMode={darkMode}>로딩 중...</LoadingText>
                            <LoadingSubText $darkMode={darkMode}>맞춤형 일정을 생성하고 있어요</LoadingSubText>
                        </LoadingContainer>
                    )}
                </>
            )}
        </HoverCard>
    );
}

// export default를 React.memo로 감싸줍니다.
export default React.memo(TodoPreview);

// 애니메이션 keyframes 추가
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0.3;
  }
`;

// 새로운 애니메이션 컨테이너 컴포넌트 추가
const AnimatedContainer = styled.div`
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
  opacity: ${({ $isTransitioning }) => $isTransitioning ? 0.3 : 1};
  transform: ${({ $isTransitioning }) => $isTransitioning ? 'translateY(5px)' : 'translateY(0)'};
  flex: 1;
  display: flex;
  flex-direction: column;
`;

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
  justify-content: space-between;
  gap: 0.6rem;
  font-size: 1.7rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  
  > div:first-child {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex: 1;
  }
`;

const HighlightBar = styled.div`
  width: 8px;
  height: 1.6rem;
  background: #ffc400;
  border-radius: 4px;
`;

const IntroText = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: #495057;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 500;
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
    transition: all 0.3s ease;
`;

const StatLabel = styled.div`
    font-size: 0.8rem;
    color: #888;
    margin-top: 0.2rem;
    transition: all 0.3s ease;
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
    background: ${({ $isCompleted, $darkMode }) => $isCompleted ? 'rgba(46, 204, 113, 0.1)' : ($darkMode ? '#3a3a3a' : '#fff')};
    border: 1px solid ${({ $isCompleted }) => $isCompleted ? 'rgba(46, 204, 113, 0.3)' : 'transparent'};
    border-radius: 0.8rem;
    cursor: pointer;
    transition: all 0.3s ease;
    color: ${({ $isCompleted }) => $isCompleted ? '#888' : 'inherit'};
    opacity: 0;
    transform: translateY(10px);
    animation: ${fadeInUp} 0.5s ease forwards;
    animation-delay: ${({ $animationDelay }) => $animationDelay}s;
    user-select: none;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        background: ${({ $isCompleted, $darkMode }) => 
            $isCompleted 
                ? 'rgba(46, 204, 113, 0.15)' 
                : ($darkMode ? '#444' : '#f8f9fa')};
    }
    
    &:active {
        transform: translateY(0px);
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
`;

const Checkbox = styled.div`
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid ${({ $isCompleted }) => $isCompleted ? '#2ecc71' : '#ccc'};
    background-color: ${({ $isCompleted }) => $isCompleted ? '#2ecc71' : 'transparent'};
    transition: all 0.3s ease;
    flex-shrink: 0;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    
    &:hover {
        border-color: #2ecc71;
        transform: scale(1.1);
    }
    
    &::after {
        content: '✓';
        color: white;
        font-size: 12px;
        font-weight: bold;
        opacity: ${({ $isCompleted }) => $isCompleted ? 1 : 0};
        transition: opacity 0.2s ease;
    }
`;

const TaskTitle = styled.span`
    font-weight: 600;
    transition: all 0.3s ease;
    flex: 1;
    font-size: 0.9rem;
    line-height: 1.4;
    text-decoration: ${({ $isCompleted }) => $isCompleted ? 'line-through' : 'none'};
`;

const EmptyMessage = styled.p`
    text-align: center;
    color: #888;
    margin-top: 2rem;
    opacity: 0;
    animation: ${fadeInUp} 0.5s ease forwards;
    animation-delay: 0.2s;
`;

const DateNavigator = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding: 0.6rem 0.8rem;
    background: transparent;
    border-radius: 0.6rem;
    border: none;
    transition: all 0.3s ease;

    &:hover {
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
`;

const DateNavButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: transparent;
    border: none;
    border-radius: 0.4rem;
    color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#666'};
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.8rem;
    
    &:hover {
        background: #ffc107;
        color: #fff;
        transform: scale(1.05);
    }
    
    &:active {
        transform: scale(0.95);
    }
`;

const DateDisplay = styled.div`
    flex: 1;
    text-align: center;
    padding: 0.4rem 0.8rem;
    background: transparent;
    border-radius: 0.4rem;
    color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
    
    &:hover {
        background: ${({ $darkMode }) => $darkMode ? '#555' : '#e9ecef'};
        transform: translateY(-1px);
    }
    
    &:active {
        transform: translateY(0);
    }
`;

const HiddenDateInput = styled.input`
    position: absolute;
    opacity: 0;
    pointer-events: none;
    width: 0;
    height: 0;
    border: none;
    padding: 0;
    margin: 0;
    overflow: hidden;
    z-index: -1;
`;

const ViewAllButton = styled.button`
    width: 100%;
    padding: 0.8rem;
    background: #ffc107;
    border: none;
    border-radius: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    margin-top: auto;

    &:hover {
        background: #ffb300;
    }
`;

const InputForm = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1.2rem;
    padding: 1.5rem;
    min-height: 200px;
    border-radius: 0.8rem;
`;

const InputRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    
    select, input {
        width: 100%;
        padding: 0.8rem 1rem;
        border-radius: 0.6rem;
        border: 1px solid #dee2e6;
        font-size: 0.95rem;
        background: white;
        transition: all 0.2s ease;
        
        &:focus {
            outline: none;
            border-color: #ffc107;
            box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.2);
        }
        
        &:hover {
            border-color: #adb5bd;
        }
    }
    
    span {
        font-size: 0.9rem;
        color: #6c757d;
        margin-left: 0.5rem;
    }
`;

const InputLabel = styled.label`
    font-weight: 600;
    font-size: 1rem;
    color: #495057;
    margin-bottom: 0.3rem;
`;

const InputWithUnit = styled.div`
    display: flex;
    align-items: center;
    position: relative;
    
    input {
        padding-right: 2.5rem !important;
    }
`;

const UnitText = styled.span`
    position: absolute;
    right: 1rem;
    font-size: 0.95rem;
    color: #6c757d;
    font-weight: 500;
    pointer-events: none;
`;

const GenerateButton = styled.button`
    width: 100%;
    padding: 1rem;
    background: #ffc107;
    border: none;
    border-radius: 0.8rem;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    margin-top: 1rem;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(255, 193, 7, 0.2);
    
    &:hover { 
        background: #ffb300; 
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(255, 193, 7, 0.3);
    }
    
    &:disabled { 
        background: #e9ecef; 
        color: #6c757d;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
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
    justify-content: flex-start;
    gap: 1rem;
    padding: 2rem;
    padding-top: 4rem;
    min-height: 200px;
`;

const LoadingText = styled.p`
    font-size: 0.9rem;
    color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#666'};
    margin-bottom: 0.5rem;
`;

const LoadingSubText = styled.p`
    font-size: 0.85rem;
    color: ${({ $darkMode }) => $darkMode ? '#aaa' : '#888'};
    margin-top: 0;
    margin-bottom: 0;
`;