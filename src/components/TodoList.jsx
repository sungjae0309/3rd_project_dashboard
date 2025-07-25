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
      } catch (err) {
          console.error("할 일 목록 조회 실패:", err);
      } finally {
          setLoading(false);
      }
  }, [filters]);

  useEffect(() => {
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
        setIsGenerating(true);
        const token = localStorage.getItem("accessToken");
        try {
            await axios.post(`${BASE_URL}/todo-list/generate`, 
                { job_title: genJob, days: Number(genDays) }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchTodos(); // 성공 후 목록 새로고침
        } catch (err) {
            alert("일정 생성 실패");
            console.error("생성 실패", err);
        } finally {
            setIsGenerating(false);
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
                        <h4><FaCalendarAlt /> AI 학습 일정 생성</h4>
                        <p>찜한 로드맵과 공고 기반으로 맞춤 일정을 생성합니다.</p>
                        <InputRow>
                            <Select value={genJob} onChange={e => setGenJob(e.target.value)}>
                                <option value="">직무 선택</option>
                                {jobNamesList.map(job => <option key={job} value={job}>{job}</option>)}
                            </Select>
                            <Input type="number" value={genDays} onChange={e => setGenDays(e.target.value)} style={{width: '80px'}} />
                            <span>일</span>
                        </InputRow>
                        <GenerateButton onClick={handleGenerate} disabled={isGenerating}>
                            {isGenerating ? "생성 중..." : "일정 생성"}
                        </GenerateButton>
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
                                        <TaskTitle>{todo.title}</TaskTitle>
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
    flex: 1; padding: 0.5rem; border-radius: 0.5rem; border: 1px solid #ccc;
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
    text-decoration: ${({ $isCompleted }) => $isCompleted ? 'line-through' : 'none'};
    color: ${({ $isCompleted }) => $isCompleted ? '#888' : 'inherit'};
`;
const Checkbox = styled.div`
    width: 20px; height: 20px; border-radius: 5px; cursor: pointer;
    border: 2px solid ${({ $isCompleted }) => $isCompleted ? '#2ecc71' : '#ccc'};
    background: ${({ $isCompleted }) => $isCompleted ? '#2ecc71' : 'transparent'};
`;
const TaskContent = styled.div`
    flex: 1;
`;
const TaskTitle = styled.div`
    font-weight: 600;
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