// src/components/TodoList.jsx

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import styled, { css } from 'styled-components';
import axios from 'axios';
import { FaTrash, FaPlus, FaCalendarAlt, FaEdit, FaFilter, FaSync, FaSortAmountUp, FaSortAmountDown } from 'react-icons/fa';
import { useJobNames } from '../contexts/JobNamesContext';
import TodoModal from './TodoModal'; // 1. 방금 만든 모달 컴포넌트 import

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://192.168.101.51:8000';

// 헬퍼 함수
const toKey = (d) => new Date(d).toISOString().split("T")[0];
const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();

export default function TodoList({ darkMode = false }) {
  // 상태 관리
  const [allTodos, setAllTodos] = useState([]);
  const [stats, setStats] = useState({ total_count: 0, completed_count: 0, pending_count: 0 });
  // filters 기본값 설정
  const [filters, setFilters] = useState({
      is_completed: 'all', // 'all', true, false
      priority: 'all', // 'all', 'high', 'medium', 'low'
      sort_by: 'due_date',
      sort_order: 'asc'
  });
  const [selectedDate, setSelectedDate] = useState(toKey(new Date()));
  const [calendar, setCalendar] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() });
  const [loading, setLoading] = useState(true);

  // 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);

  // AI 일정 생성 관련 상태
  const { jobNames } = useJobNames();
  const jobNamesList = jobNames.map(job => job.name);
  const [genJob, setGenJob] = useState('');
  const [genDays, setGenDays] = useState('15');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScheduleInfo, setGeneratedScheduleInfo] = useState(null); // 생성된 일정 정보

  // 데이터 조회 함수
  const fetchTodos = useCallback(async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
          setLoading(false);
          return;
      }
      setLoading(true);
      try {
          // API에 보낼 파라미터 가공
          const apiParams = { ...filters };
          if (filters.is_completed === 'all') delete apiParams.is_completed;
          if (filters.priority === 'all') delete apiParams.priority;
          
          const response = await axios.get(`${BASE_URL}/todo-list/`, {
              headers: { Authorization: `Bearer ${token}` },
              params: apiParams
          });
          setAllTodos(response.data.todo_lists || []);
          setStats({
              total_count: response.data.total_count || 0,
              completed_count: response.data.completed_count || 0,
              pending_count: response.data.pending_count || 0,
          });
          
          // 전체 일정이 없으면 저장된 정보도 제거 (필터링이 아닌 실제 전체 일정 기준)
          if (response.data.total_count === 0) {
              setGeneratedScheduleInfo(null);
              localStorage.removeItem('generatedScheduleInfo');
          }
      } catch (err) {
          console.error("할 일 목록 조회 실패:", err);
      } finally {
          setLoading(false);
      }
  }, [filters]);

  useEffect(() => {
      // 페이지 로드 시 저장된 일정 정보 먼저 복원
      const savedScheduleInfo = localStorage.getItem('generatedScheduleInfo');
      if (savedScheduleInfo) {
          try {
              const parsedInfo = JSON.parse(savedScheduleInfo);
              setGeneratedScheduleInfo(parsedInfo);
          } catch (error) {
              console.error('저장된 일정 정보 파싱 실패:', error);
              localStorage.removeItem('generatedScheduleInfo');
          }
      }
      
      fetchTodos();
  }, [fetchTodos]);
      
  // ▼▼▼ 필터 변경 핸들러 함수 추가 ▼▼▼
  const handleFilterChange = (e) => {
      const { name, value } = e.target;
      setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // 정렬 순서 토글 핸들러
  const toggleSortOrder = () => {
      setFilters(prev => ({ ...prev, sort_order: prev.sort_order === 'asc' ? 'desc' : 'asc' }));
  };

    // 할 일 핸들러 (토글, 삭제)
    const handleToggle = async (todoId) => {
        const token = localStorage.getItem("accessToken");
        try {
            await axios.patch(`${BASE_URL}/todo-list/${todoId}/toggle`, {}, { headers: { Authorization: `Bearer ${token}` } });
            fetchTodos(); // 목록 새로고침
        } catch (err) { console.error("토글 실패", err); }
    };

    const handleDelete = async (todoId) => {
        if (!window.confirm("정말로 이 할 일을 삭제하시겠습니까?")) return;
        const token = localStorage.getItem("accessToken");
        try {
            await axios.delete(`${BASE_URL}/todo-list/${todoId}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchTodos(); // 목록 새로고침
        } catch (err) { console.error("삭제 실패", err); }
    };

    // AI 일정 생성 핸들러
    const handleGenerate = async () => {
        if (!genJob) return alert("직무를 선택해주세요.");
        if (!genDays || +genDays < 1 || +genDays > 60) return alert("기간은 1-60일 사이로 입력해주세요.");
        
        setIsGenerating(true);
        const token = localStorage.getItem("accessToken");
        try {
            // TodoPreview와 동일한 방식으로 수정 (query parameter 사용)
            await axios.post(`${BASE_URL}/todo-list/generate`, 
                {}, // Request Body는 비워둡니다.
                { 
                    headers: { Authorization: `Bearer ${token}` },
                    // params 옵션을 사용하여 쿼리 파라미터로 전송합니다.
                    params: {
                        job_title: genJob,
                        days: Number(genDays)
                    }
                }
            );
            
            // 생성 성공 시 일정 정보 저장
            const scheduleInfo = {
                job_title: genJob,
                days: genDays,
                created_at: new Date().toLocaleDateString()
            };
            setGeneratedScheduleInfo(scheduleInfo);
            localStorage.setItem('generatedScheduleInfo', JSON.stringify(scheduleInfo));
            
            fetchTodos(); // 성공 후 목록 새로고침
            alert("일정이 성공적으로 생성되었습니다!");
        } catch (err) {
            alert("일정 생성에 실패했습니다. 이미 생성된 일정이 있는지 확인해주세요.");
            console.error("생성 실패", err);
        } finally {
            setIsGenerating(false);
        }
    };

    // 전체 일정 삭제 핸들러
    const handleDeleteAllSchedule = async () => {
        if (!window.confirm("모든 일정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
            return;
        }
        
        const token = localStorage.getItem("accessToken");
        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }
        
        try {
            await axios.delete(`${BASE_URL}/todo-list/clear`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // 삭제 후 상태 초기화
            setGeneratedScheduleInfo(null);
            setGenJob('');
            setGenDays('15');
            localStorage.removeItem('generatedScheduleInfo');
            fetchTodos();
            alert("모든 일정이 삭제되었습니다.");
        } catch (err) {
            console.error("일정 삭제 실패:", err);
            alert("일정 삭제에 실패했습니다.");
        }
    };

    // 모달 핸들러
    const openModal = (todo = null) => {
        setEditingTodo(todo);
        setIsModalOpen(true);
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTodo(null);
    };

    const handleSave = () => {
        closeModal();
        fetchTodos();
    };
    
    // 캘린더 날짜 배열 생성
    const daysArr = useMemo(() => {
        const { year, month } = calendar;
        const arr = [];
        const pad = (n) => String(n).padStart(2, "0");
        const firstDay = new Date(year, month, 1).getDay();
        for (let i = 0; i < firstDay; i++) arr.push(null);
        for (let d = 1; d <= daysInMonth(year, month); d++) {
            arr.push(`${year}-${pad(month + 1)}-${pad(d)}`);
        }
        return arr;
    }, [calendar]);

    // 선택된 날짜의 할 일 필터링
    const dailyTasks = useMemo(() => 
      allTodos.filter(todo => todo.due_date && toKey(todo.due_date) === selectedDate), 
  [allTodos, selectedDate]);

   
    
    // 캘린더에 표시할 날짜별 할 일 유무
    const tasksByDate = useMemo(() => {
        const map = {};
        allTodos.forEach(todo => {
            if (todo.due_date) {
                const dateKey = toKey(todo.due_date);
                if (!map[dateKey]) map[dateKey] = { has: false, completed: true };
                map[dateKey].has = true;
                if (!todo.is_completed) map[dateKey].completed = false;
            }
        });
        return map;
    }, [allTodos]);

    return (
      <PageContainer $darkMode={darkMode}>
          {isModalOpen && <TodoModal darkMode={darkMode} todo={editingTodo} onClose={closeModal} onSave={handleSave} />}

          <HeaderRow>
              <SectionTitle>To-do List</SectionTitle>
              <StatBox>
                  <span>전체 {stats.total_count}</span>
                  <span style={{color: '#2ecc71'}}>완료 {stats.completed_count}</span>
                  <span style={{color: '#f39c12'}}>진행 {stats.pending_count}</span>
              </StatBox>
          </HeaderRow>

          <ContentGrid>
              <LeftPanel>
                    {/* AI 일정 생성 섹션 */}
                    <ControlBox>
                        {(generatedScheduleInfo || stats.total_count > 0) ? (
                            // 생성된 일정 정보 표시
                            <>
                                <ScheduleInfoHeader>
                                    <h4><FaCalendarAlt /> 생성된 학습 일정</h4>
                                    <ScheduleDeleteButton onClick={handleDeleteAllSchedule}>
                                        <FaTrash />
                                    </ScheduleDeleteButton>
                                </ScheduleInfoHeader>
                                <ScheduleInfoContent>
                                    <ScheduleInfoItem>
                                        <ScheduleInfoLabel>직무:</ScheduleInfoLabel>
                                        <ScheduleInfoValue>{generatedScheduleInfo?.job_title || "AI 추천"}</ScheduleInfoValue>
                                    </ScheduleInfoItem>
                                    <ScheduleInfoItem>
                                        <ScheduleInfoLabel>기간:</ScheduleInfoLabel>
                                        <ScheduleInfoValue>{generatedScheduleInfo?.days || "15"}일</ScheduleInfoValue>
                                    </ScheduleInfoItem>
                                </ScheduleInfoContent>
                            </>
                        ) : (
                            // 일정 생성 폼
                            <>
                                <h4><FaCalendarAlt /> AI 학습 일정 생성</h4>
                                <p>찜한 로드맵과 공고 기반으로 맞춤 일정을 생성합니다.</p>
                                <InputRow>
                                    <Select value={genJob} onChange={e => setGenJob(e.target.value)}>
                                        <option value="">직무 선택</option>
                                        {jobNamesList.map(job => <option key={job} value={job}>{job}</option>)}
                                    </Select>
                                    <Input type="number" value={genDays} onChange={e => setGenDays(e.target.value)} style={{width: '130px'}} />
                                    <span>일</span>
                                </InputRow>
                                <GenerateButton onClick={handleGenerate} disabled={isGenerating}>
                                    {isGenerating ? "생성 중..." : "일정 생성"}
                                </GenerateButton>
                            </>
                        )}
                    </ControlBox>
                    
                    {/* 캘린더 섹션 */}
                    <Cal>
                        <CalHeader>
                            <Nav onClick={() => setCalendar(c => ({...c, month: c.month === 0 ? 11 : c.month - 1}))}>◀</Nav>
                            <span>{calendar.year}년 {calendar.month + 1}월</span>
                            <Nav onClick={() => setCalendar(c => ({...c, month: c.month === 11 ? 0 : c.month + 1}))}>▶</Nav>
                        </CalHeader>
                        <Grid7>
                            {"일월화수목금토".split("").map(d => <Th key={d}>{d}</Th>)}
                            {daysArr.map((dateKey, i) => (
                                <Td key={i}
                                    selected={dateKey === selectedDate}
                                    has={tasksByDate[dateKey]?.has}
                                    completed={tasksByDate[dateKey]?.has && tasksByDate[dateKey]?.completed}
                                    onClick={() => dateKey && setSelectedDate(dateKey)}
                                >
                                    {dateKey ? new Date(dateKey).getDate() : ""}
                                </Td>
                            ))}
                        </Grid7>
                    </Cal>
                </LeftPanel>

                <RightPanel>
                    <ListHeader>
                        <h3>{selectedDate}</h3>
                        <AddButton onClick={() => openModal()}><FaPlus /> 새 할 일 추가</AddButton>
                    </ListHeader>

                    {/* ▼▼▼ 필터 UI 추가 ▼▼▼ */}
                    <FilterContainer>
                        <FilterGroup>
                            <FilterLabel><FaFilter /></FilterLabel>
                            <FilterSelect name="is_completed" value={filters.is_completed} onChange={handleFilterChange}>
                                <option value="all">전체 상태</option>
                                <option value="false">진행중</option>
                                <option value="true">완료</option>
                            </FilterSelect>
                            <FilterSelect name="priority" value={filters.priority} onChange={handleFilterChange}>
                                <option value="all">모든 우선순위</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </FilterSelect>
                        </FilterGroup>
                        <FilterGroup>
                            <FilterSelect name="sort_by" value={filters.sort_by} onChange={handleFilterChange}>
                                <option value="due_date">마감일순</option>
                                <option value="created_at">생성일순</option>
                                <option value="priority">우선순위순</option>
                            </FilterSelect>
                            <SortButton onClick={toggleSortOrder}>
                                {filters.sort_order === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                            </SortButton>
                        </FilterGroup>
                    </FilterContainer>


                    {loading ? <p>로딩 중...</p> : (
                        <TaskList>
                            {dailyTasks.length > 0 ? dailyTasks.map(todo => (
                                <TaskItem key={todo.id} $isCompleted={todo.is_completed}>
                                    <Checkbox onClick={() => handleToggle(todo.id)} $isCompleted={todo.is_completed} />
                                    <TaskContent>
                                        <TaskTitle $isCompleted={todo.is_completed}>{todo.title}</TaskTitle>
                                        <TaskPriority $priority={todo.priority}>{todo.priority}</TaskPriority>
                                    </TaskContent>
                                    <ActionButtons>
                                        <ActionButton onClick={() => openModal(todo)}><FaEdit /></ActionButton>
                                        <ActionButton onClick={() => handleDelete(todo.id)}><FaTrash /></ActionButton>
                                    </ActionButtons>
                                </TaskItem>
                            )) : <EmptyMessage>선택된 날짜에 할 일이 없습니다.</EmptyMessage>}
                        </TaskList>
                    )}
                </RightPanel>
            </ContentGrid>
        </PageContainer>
    );
}


// Styled Components (기존 스타일은 제거하고 새로운 스타일로 교체)
const PageContainer = styled.div`
    padding: 2rem;
    background: ${({ $darkMode }) => $darkMode ? '#1e1e1e' : '#f8f9fa'};
    overflow-x: hidden;
`;
const HeaderRow = styled.div`
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;
`;
const SectionTitle = styled.h2`
    font-size: 1.8rem; font-weight: 700;
`;
const StatBox = styled.div`
    display: flex; gap: 1rem; font-size: 0.9rem;
`;
const ContentGrid = styled.div`
    display: grid; grid-template-columns: 320px 1fr; gap: 2rem;
`;
const LeftPanel = styled.div`
    display: flex; flex-direction: column; gap: 1.5rem;
`;
const RightPanel = styled.div`
    background: ${({ $darkMode }) => $darkMode ? '#2a2a2a' : '#fff'};
    border-radius: 1rem; padding: 1.5rem;
`;
const ControlBox = styled.div`
    background: ${({ $darkMode }) => $darkMode ? '#2a2a2a' : '#fff'};
    border-radius: 1rem; padding: 1.5rem;
    h4 { margin: 0 0 0.5rem 0; }
    p { font-size: 0.8rem; color: #888; margin-bottom: 1rem; }
`;
const InputRow = styled.div`
    display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;
`;
const Select = styled.select`
    width: 130px; padding: 0.5rem; border-radius: 0.5rem; border: 1px solid #ccc;
`;
const Input = styled.input`
    padding: 0.5rem; border-radius: 0.5rem; border: 1px solid #ccc;
`;
const GenerateButton = styled.button`
    width: 100%; padding: 0.7rem; background: #ffc107; border: none;
    border-radius: 0.5rem; font-weight: 600; cursor: pointer;
    &:disabled { background: #ccc; }
`;
const Cal = styled.div`
    background: ${({ $darkMode }) => $darkMode ? '#2a2a2a' : '#fff'};
    border-radius: 1rem; padding: 1rem;
`;
const CalHeader = styled.div`
    display: flex; justify-content: space-between; align-items: center;
    font-weight: 600; margin-bottom: 1rem;
`;
const Nav = styled.button`
    background: none; border: none; cursor: pointer; font-size: 1rem;
`;
const Grid7 = styled.div`
    display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem;
`;
const Th = styled.div`
    text-align: center; font-size: 0.8rem; color: #888;
`;
const Td = styled.div`
    height: 32px; line-height: 32px; text-align: center; border-radius: 50%;
    cursor: pointer; font-size: 0.9rem;
    ${({ has }) => has && css` background: rgba(255, 193, 7, 0.2); `}
    ${({ completed }) => completed && css` background: #2ecc71; color: white; `}
    ${({ selected }) => selected && css` background: #ffc107; font-weight: 700; `}
`;
const ListHeader = styled.div`
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 1rem;
    h3 { margin: 0; }
`;
const AddButton = styled.button`
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.5rem 1rem; background: #ffc107; border: none;
    border-radius: 0.5rem; font-weight: 600; cursor: pointer;
`;
const TaskList = styled.div`
    display: flex; flex-direction: column; gap: 0.8rem;
`;
const TaskItem = styled.div`
    display: flex; align-items: center; gap: 1rem;
    padding: 1rem; border-radius: 0.5rem;
    background: ${({ $darkMode, $isCompleted }) => $isCompleted ? 'rgba(0,0,0,0.1)' : ($darkMode ? '#333' : '#f8f9fa')};
    color: ${({ $isCompleted }) => $isCompleted ? '#888' : 'inherit'};
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
const TaskContent = styled.div`
    flex: 1;
`;
const TaskTitle = styled.div`
    font-weight: 600;
    text-decoration: ${({ $isCompleted }) => $isCompleted ? 'line-through' : 'none'};
`;
const TaskPriority = styled.span`
    font-size: 0.7rem; padding: 0.1rem 0.4rem; border-radius: 0.5rem;
    color: white;
    background: ${({ $priority }) => $priority === 'high' ? '#e74c3c' : $priority === 'low' ? '#3498db' : '#f39c12'};
`;
const ActionButtons = styled.div`
    display: flex; gap: 0.5rem;
`;
const ActionButton = styled.button`
    background: none; border: none; cursor: pointer; color: #aaa;
    &:hover { color: #ffc107; }
`;
const EmptyMessage = styled.p`
    text-align: center; color: #888; padding: 2rem;
`;

// ▼▼▼ 필터 UI를 위한 스타일 컴포넌트 추가 ▼▼▼
const FilterContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem;
    background: ${({ $darkMode }) => $darkMode ? '#1e1e1e' : '#f8f9fa'};
    border-radius: 0.8rem;
    margin-bottom: 1.5rem;
`;
const FilterGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 0.8rem;
`;
const FilterLabel = styled.span`
    font-size: 1rem;
    color: #888;
`;
const FilterSelect = styled.select`
    padding: 0.5rem;
    border-radius: 0.5rem;
    border: 1px solid #ccc;
    background: #fff;
    font-size: 0.85rem;
`;
const SortButton = styled.button`
    padding: 0.5rem;
    background: none;
    border: 1px solid #ccc;
    border-radius: 0.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    &:hover {
        background: #f0f0f0;
    }
`;

// 생성된 일정 정보 스타일
const ScheduleInfoHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    
    h4 {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #333;
        font-size: 1rem;
    }
`;

const ScheduleDeleteButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    background: transparent;
    border: none;
    border-radius: 0.5rem;
    color: #666;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
    
    &:hover {
        background: #ff4757;
        color: white;
        transform: scale(1.05);
    }
`;

const ScheduleInfoContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
`;

const ScheduleInfoItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #e9ecef;
    
    &:last-child {
        border-bottom: none;
    }
`;

const ScheduleInfoLabel = styled.span`
    font-weight: 600;
    color: #495057;
    font-size: 0.9rem;
`;

const ScheduleInfoValue = styled.span`
    color: #333;
    font-weight: 500;
    font-size: 0.9rem;
`;