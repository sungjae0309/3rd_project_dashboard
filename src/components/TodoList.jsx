import React, { useState, useMemo, useCallback, useEffect } from "react";
import styled, { css } from "styled-components";
import axios from "axios";
import { FaTrash, FaPlus, FaCalendarAlt } from "react-icons/fa";
import { useJobNames } from "../contexts/JobNamesContext"; // 추가
import { useUserData } from "../contexts/UserDataContext"; // 추가

/* utils */
const toKey = (d) => d.toISOString().split("T")[0];
const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const prevDate = (d, n) => {
  const t = new Date(d);
  t.setDate(t.getDate() - n);
  return t;
};

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://192.168.101.51:8000';

export default function TodoList({ darkMode = false, onPage = "todo" }) {
  const now = new Date();
  const initialDate = localStorage.getItem("todoSelectedDate") || toKey(now);
  const [selected, setSel] = useState(initialDate);
  const [year, setYear] = useState(+selected.slice(0, 4));
  const [month, setMonth] = useState(+selected.slice(5, 7) - 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasExistingSchedule, setHasExistingSchedule] = useState(false);

  // Context에서 사용자 데이터 가져오기
  const { userData, fetchUserData, refreshUserData } = useUserData();
  const scheduleData = userData;

  // 기존 로컬 스토리지 기반 할 일 목록 (백업용)
  const [tasks, setTasks] = useState(() =>
    JSON.parse(localStorage.getItem("tasks") || "{}")
  );

  const save = useCallback((obj) => {
    setTasks(obj);
    localStorage.setItem("tasks", JSON.stringify(obj));
  }, []);

  // input, setInput 선언 추가
  const [input, setInput] = useState("");
  const [jobInput, setJobInput] = useState("");
  const [daysInput, setDaysInput] = useState("");
  const [showJobDropdown, setShowJobDropdown] = useState(false);
  const isGuest = !localStorage.getItem("accessToken");

  // 전역 직무명 상태 사용
  const { jobNames } = useJobNames();
  const jobNamesList = jobNames.map(job => job.name); // name 필드만 추출

  // 직무 목록 가져오기 - 제거 (JobNamesContext에서 관리)
  // useEffect(() => {
  //   const fetchJobNames = async () => {
  //     try {
  //       const response = await axios.get(`${BASE_URL}/job-skills/job-names`);
  //       setJobNames(response.data.map(job => job.name));
  //     } catch (err) {
  //       console.error("직무 목록 로딩 실패:", err);
  //       setJobNames([]);
  //     }
  //   };
  //   fetchJobNames();
  // }, []);

  // 기존 일정 조회 - Context 사용
  useEffect(() => {
    if (isGuest) {
      setHasExistingSchedule(false);
      return;
    }

    if (scheduleData) {
      setHasExistingSchedule(true);
    } else {
      setHasExistingSchedule(false);
    }
  }, [scheduleData, isGuest]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showJobDropdown && !event.target.closest('.job-input-container')) {
        setShowJobDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showJobDropdown]);

  // 1. 일정 리스트를 체크리스트(checkbox) 형태로 출력
  // 2. 폼은 생성 후 사라지고, 일정 리스트가 그 자리에 나오게
  const [showForm, setShowForm] = useState(false);

  // 모달(팝업) 상태 추가
  const [modalTask, setModalTask] = useState(null);

  // 선택된 날짜의 일정 가져오기
  const selectedDaySchedule = useMemo(() => {
    if (!scheduleData) return null;
    return scheduleData.schedule.find(day => day.date === selected);
  }, [scheduleData, selected]);

  const todays = selectedDaySchedule?.tasks || [];
  const done = todays.filter((t) => t.completed).length;
  const rate = todays.length ? Math.round((done / todays.length) * 100) : 0;

  // 연속 달성 일수 계산
  const streak = useMemo(() => {
    if (!scheduleData) return 0;
    
    let s = 0;
    for (let i = 0; i < 30; i++) {
      const key = toKey(prevDate(new Date(), i));
      const daySchedule = scheduleData.schedule.find(day => day.date === key);
      const dayTasks = daySchedule?.tasks || [];
      
      if (dayTasks.length && dayTasks.every((t) => t.completed)) s++;
      else break;
    }
    return s;
  }, [scheduleData]);

  const daysArr = useMemo(() => {
    const arr = [];
    const pad = (n) => String(n).padStart(2, "0");
    const first = new Date(year, month, 1).getDay();
    for (let i = 0; i < first; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth(year, month); d++) {
      arr.push(`${year}-${pad(month + 1)}-${pad(d)}`);
    }
    return arr;
  }, [year, month]);

  const add = () => {
    if (!input.trim()) return;
    save({
      ...tasks,
      [selected]: [...todays, { text: input.trim(), done: false }],
    });
    setInput("");
  };
  
  const toggle = (i) => {
    if (!scheduleData) return;
    
    const updatedSchedule = { ...scheduleData };
    const dayIndex = updatedSchedule.schedule.findIndex(day => day.date === selected);
    
    if (dayIndex !== -1) {
      updatedSchedule.schedule[dayIndex].tasks[i].completed = 
        !updatedSchedule.schedule[dayIndex].tasks[i].completed;
      
      // Context 새로고침
      refreshUserData();
      
      // 백엔드에 업데이트 전송 (필요시)
      // await axios.put(`${BASE_URL}/todo/update`, updatedSchedule);
    }
  };
  
  const remove = (i) => {
    if (!scheduleData) return;
    
    const updatedSchedule = { ...scheduleData };
    const dayIndex = updatedSchedule.schedule.findIndex(day => day.date === selected);
    
    if (dayIndex !== -1) {
      updatedSchedule.schedule[dayIndex].tasks.splice(i, 1);
      
      // Context 새로고침
      refreshUserData();
    }
  };

  // 일정 삭제 함수
  const handleDeleteSchedule = async () => {
    if (!window.confirm("정말로 학습 일정을 삭제하시겠습니까?")) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.delete(`${BASE_URL}/todo/clear`, { headers });
      
      // Context 새로고침
      refreshUserData();
      setHasExistingSchedule(false);
      setShowForm(true);
      
      alert("학습 일정이 삭제되었습니다.");
    } catch (err) {
      console.error("일정 삭제 실패:", err);
      alert("일정 삭제에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // handleGenerate 함수 정의 (컴포넌트 내에 추가)
  const handleGenerate = async () => {
    if (!jobInput.trim()) {
      setError("직무를 입력해주세요.");
      return;
    }
    if (!daysInput || Number(daysInput) < 1 || Number(daysInput) > 60) {
      setError("기간을 1-60일 사이로 입력해주세요.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // 일정 생성 API 호출
      await axios.post(
        `${BASE_URL}/todo/generate?job_title=${encodeURIComponent(jobInput)}&days=${Number(daysInput)}`,
        {},
        { headers }
      );
      
      // Context 새로고침
      await refreshUserData();
      setHasExistingSchedule(true);
      setShowForm(false); // 폼 숨기고 일정 리스트 보여주기
    } catch (e) {
      console.error("일정 생성 실패:", e);
      setError("일정 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 에러가 있어도 캘린더와 입력란은 항상 보이게
  if (error) {
    return (
      <Wrap>
        <Top>
          <Cal>
            <Header>
              <Nav onClick={() => setMonth(month === 0 ? 11 : month - 1)}>◀</Nav>
              <span>{year}년 {month + 1}월</span>
              <Nav onClick={() => setMonth(month === 11 ? 0 : month + 1)}>▶</Nav>
            </Header>
            <Grid7>
              {"일월화수목금토".split("").map((d) => (
                <Th key={d}>{d}</Th>
              ))}
              {daysArr.map((k, i) => {
                const daySchedule = scheduleData?.schedule.find(day => day.date === k);
                const hasTasks = daySchedule?.tasks?.length > 0;
                const allCompleted = hasTasks && daySchedule.tasks.every(task => task.completed);
                return (
                  <Td
                    key={i}
                    selected={k === selected}
                    has={hasTasks}
                    completed={allCompleted}
                    onClick={e => {
                      e.stopPropagation();
                      if (!k) return;
                      setSel(k);
                      localStorage.setItem("todoSelectedDate", k);
                    }}
                  >
                    {k ? +k.split("-")[2] : ""}
                  </Td>
                );
              })}
            </Grid7>
          </Cal>
          <ErrorMessage>{error}</ErrorMessage>
          <RetryButton onClick={() => setError(null)}>
            에러 메시지 닫기
          </RetryButton>
        </Top>
      </Wrap>
    );
  }

  // 일정 생성 중 로딩 상태를 명확하게 표시
  if (loading && !hasExistingSchedule) {
    return (
      <Wrap>
        <Top>
          <Cal>
            <Header>
              <Nav onClick={() => setMonth(month === 0 ? 11 : month - 1)}>◀</Nav>
              <span>{year}년 {month + 1}월</span>
              <Nav onClick={() => setMonth(month === 11 ? 0 : month + 1)}>▶</Nav>
            </Header>
            <Grid7>
              {"일월화수목금토".split("").map((d) => (
                <Th key={d}>{d}</Th>
              ))}
              {daysArr.map((k, i) => {
                const daySchedule = scheduleData?.schedule.find(day => day.date === k);
                const hasTasks = daySchedule?.tasks?.length > 0;
                const allCompleted = hasTasks && daySchedule.tasks.every(task => task.completed);
                return (
                  <Td
                    key={i}
                    selected={k === selected}
                    has={hasTasks}
                    completed={allCompleted}
                    onClick={e => {
                      e.stopPropagation();
                      if (!k) return;
                      setSel(k);
                      localStorage.setItem("todoSelectedDate", k);
                    }}
                  >
                    {k ? +k.split("-")[2] : ""}
                  </Td>
                );
              })}
            </Grid7>
          </Cal>
        </Top>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>
            사용자가 찜한 공고와 로드맵 그리고 갭 분석을 기반으로 학습 일정을 계획하고 있어요. 잠시만 기다려주세요…
          </LoadingText>
        </LoadingContainer>
      </Wrap>
    );
  }

  return (
    <Wrap>
      <Top>
        <Cal>
          <Header>
            <Nav onClick={() => setMonth(month === 0 ? 11 : month - 1)}>◀</Nav>
            <span>{year}년 {month + 1}월</span>
            <Nav onClick={() => setMonth(month === 11 ? 0 : month + 1)}>▶</Nav>
          </Header>
          <Grid7>
            {"일월화수목금토".split("").map((d) => (
              <Th key={d}>{d}</Th>
            ))}
            {daysArr.map((k, i) => {
              const daySchedule = scheduleData?.schedule.find(day => day.date === k);
              const hasTasks = daySchedule?.tasks?.length > 0;
              const allCompleted = hasTasks && daySchedule.tasks.every(task => task.completed);
              
              return (
                <Td
                  key={i}
                  selected={k === selected}
                  has={hasTasks}
                  completed={allCompleted}
                  onClick={e => {
                    e.stopPropagation();
                    if (!k) return;
                    setSel(k);
                    localStorage.setItem("todoSelectedDate", k);
                  }}
                >
                  {k ? +k.split("-")[2] : ""}
                </Td>
              );
            })}
          </Grid7>
        </Cal>

        {/* Top 아래 {onPage === "todo" && (<InputRow>...</InputRow>)} 부분도 완전히 삭제 */}
      </Top>

      {/* 기존 일정이 있으면 일정 표시, 없으면 생성 폼 표시 */}
      {!isGuest && (
        hasExistingSchedule ? (
          <Todo>
            <ScheduleHeader>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3>{selected} 학습 일정</h3>
                  {scheduleData && (
                    <JobTitle>{scheduleData.job_title} 개발자 과정</JobTitle>
                  )}
                </div>
                <DeleteButton onClick={handleDeleteSchedule} disabled={loading}>
                  <FaTrash />
                  일정 삭제
                </DeleteButton>
              </div>
              {/* goals 표시만 유지하고 notes 삭제 */}
              {selectedDaySchedule?.goals && selectedDaySchedule.goals.length > 0 && (
                <div style={{ margin: '0.5rem 0', fontWeight: 500, color: '#444' }}>
                  목표: {selectedDaySchedule.goals.join(', ')}
                </div>
              )}
            </ScheduleHeader>
            <List $preview={onPage === "home"}>
              {todays.length > 0 ? (
                todays.map((t, i) => (
                  <Li key={i} done={t.completed} $type={t.type}>
                    <label style={{ display: 'flex', alignItems: 'center', width: '100%', cursor: 'pointer', margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={() => toggle(i)}
                        style={{ marginRight: '0.7rem', marginTop: '0.2rem' }}
                      />
                      <span
                        style={{ fontWeight: 600, fontSize: '1rem', color: '#333', flex: 1, textAlign: 'left' }}
                        onClick={e => { e.stopPropagation(); setModalTask(t); }}
                      >
                        {t.title}
                      </span>
                    </label>
                  </Li>
                ))
              ) : (
                <Empty>
                  {onPage === "home" ? "오늘은 휴식일입니다" : "해당 날짜에 일정이 없습니다"}
                </Empty>
              )}
            </List>
            {/* 상세 정보 모달 */}
            {modalTask && (
              <ModalOverlay onClick={() => setModalTask(null)}>
                <ModalCard onClick={e => e.stopPropagation()}>
                  <ModalTitle>{modalTask.title}</ModalTitle>
                  <ModalDesc>{modalTask.description}</ModalDesc>
                  <ModalMeta>
                    <span>소요: {modalTask.duration}</span>
                    <span>유형: {modalTask.type === 'roadmap' ? '로드맵' : modalTask.type === 'skill_study' ? '스킬 학습' : modalTask.type === 'review' ? '복습' : modalTask.type}</span>
                    {modalTask.related_roadmap && <span>로드맵: {modalTask.related_roadmap}</span>}
                    {modalTask.related_job && <span>직무: {modalTask.related_job}</span>}
                  </ModalMeta>
                  <ModalCloseBtn onClick={() => setModalTask(null)}>닫기</ModalCloseBtn>
                </ModalCard>
              </ModalOverlay>
            )}
          </Todo>
        ) : (
          <InputForm>
            <FormHeader>
              <FaCalendarAlt />
              <span>새로운 학습 일정 생성</span>
            </FormHeader>
            <InputRow>
              <InputLabel>직무</InputLabel>
              <JobInputContainer className="job-input-container">
                <Inp
                  value={jobInput}
                  onChange={e => setJobInput(e.target.value)}
                  onClick={e => {
                    e.stopPropagation();
                    setShowJobDropdown(!showJobDropdown);
                  }}
                  placeholder="직무를 선택하세요"
                  readOnly
                />
                {showJobDropdown && (
                  <JobDropdown>
                    {jobNamesList.map((job, index) => (
                      <JobOption
                        key={index}
                        onClick={() => {
                          setJobInput(job);
                          setShowJobDropdown(false);
                        }}
                      >
                        {job}
                      </JobOption>
                    ))}
                  </JobDropdown>
                )}
              </JobInputContainer>
            </InputRow>
            <InputRow>
              <InputLabel>기간</InputLabel>
              <Inp
                type="number"
                min={1}
                max={60}
                value={daysInput}
                onChange={e => setDaysInput(e.target.value)}
                onClick={e => e.stopPropagation()}
                placeholder="15"
              />
              <DaysLabel>일</DaysLabel>
            </InputRow>
            <InputRow style={{ justifyContent: 'center' }}>
              <Add onClick={handleGenerate} disabled={loading}>
                {loading ? (
                  <>
                    <LoadingSpinner />
                    생성 중...
                  </>
                ) : (
                  <>
                    <FaPlus />
                    생성하기
                  </>
                )}
              </Add>
            </InputRow>
          </InputForm>
        )
      )}

      {/* 기존 체크리스트 기능 유지 */}
      {!isGuest && hasExistingSchedule && (
        <Todo>
          <ScheduleHeader>
            <h3>추가 할 일</h3>
          </ScheduleHeader>
          <InputRow>
            <Inp
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && add()}
              placeholder="할 일을 입력하세요"
            />
            <Add onClick={add}>추가</Add>
          </InputRow>
          <List $preview={onPage === "home"}>
            {(tasks[selected] || []).map((t, i) => (
              <Li key={i} done={t.done}>
                <label style={{ display: 'flex', alignItems: 'center', width: '100%', cursor: 'pointer', margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={t.done}
                    onChange={() => {
                      const newTasks = { ...tasks };
                      newTasks[selected][i].done = !t.done;
                      save(newTasks);
                    }}
                    style={{ marginRight: '0.7rem', marginTop: '0.2rem' }}
                  />
                  <span style={{ fontWeight: 600, fontSize: '1rem', color: '#333', flex: 1, textAlign: 'left' }}>
                    {t.text}
                  </span>
                </label>
                <button
                  onClick={() => {
                    const newTasks = { ...tasks };
                    newTasks[selected].splice(i, 1);
                    save(newTasks);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#dc3545',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    padding: '0.2rem 0.5rem'
                  }}
                >
                  삭제
                </button>
              </Li>
            ))}
          </List>
        </Todo>
      )}
    </Wrap>
  );
}

/* styled-components 생략하지 않고 전부 유지 */

// 카드 전체 영역(Wrap) 스타일 개선 - 흰색 배경 제거
const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 0.6rem;
  height: 100%;
  width: 100%;
  max-width: 100%;
  min-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
`;

const Top = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 0.6rem;
  width: 100%;
`;

const Cal = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 0.8rem;
  padding: 0.7rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 0.8rem;
  margin-bottom: 0.6rem;
  color: #1d1d1f;
  width: 100%;
`;

const Nav = styled.button`
  background: transparent;
  border: none;
  border-radius: 0.4rem;
  font-size: 0.7rem;
  cursor: pointer;
  padding: 0.3rem 0.6rem;
  color: #333;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 193, 7, 0.1);
    transform: translateY(-1px);
  }
`;

// 캘린더 스타일 개선 - 세로 길이 줄이고 가로로 넓히기
const Grid7 = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.1rem;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
`;

const Th = styled.div`
  text-align: center;
  font-weight: 600;
  font-size: 0.6rem;
  color: #86868b;
  padding: 0.2rem 0;
`;

const Td = styled.div`
  width: 32px;
  height: 18px;
  line-height: 18px;
  font-size: 0.6rem;
  border-radius: 0.3rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  
  ${({ has }) => has && css`
    font-weight: 600;
    background: rgba(255, 193, 7, 0.15);
    border: 1px solid rgba(255, 193, 7, 0.3);
  `}
  
  ${({ selected }) =>
    selected &&
    css`
      background: #ffc107;
      color: #333;
      transform: scale(1.05);
    `}
  
  ${({ completed }) =>
    completed &&
    css`
      background: #28a745;
      color: white;
    `}
    
  &:hover {
    transform: scale(1.05);
    background: rgba(255, 193, 7, 0.1);
  }
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
  line-height: 1.2;
`;

const Ring = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: ${({ percent }) =>
    `conic-gradient(#ffd54f ${percent * 3.6}deg,#eee 0)`};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Inner = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #fdfdfd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
`;

const Todo = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const InputForm = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0.8rem;
  padding: 1rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
`;

const FormHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  
  svg {
    color: #ffc107;
  }
`;

const InputRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  justify-content: flex-start;
  overflow: visible;
  padding: 0.3rem 0;
`;

const InputLabel = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: #1d1d1f;
  min-width: 45px;
  text-align: left;
`;

const DaysLabel = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: #1d1d1f;
  margin-left: 0.2rem;
`;

const Inp = styled.input`
  flex: 1 1 120px;
  padding: 0.5rem 0.8rem;
  border: 1px solid #d2d2d7;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  min-width: 100px;
  max-width: 150px;
  min-height: 36px;
  background: #fff;
  transition: all 0.2s ease;
  
  &:focus {
    border: 2px solid #ffc107;
    outline: none;
    background: #fff;
    box-shadow: 0 3px 12px rgba(255, 193, 7, 0.15);
  }
  
  &::placeholder {
    color: #adb5bd;
    font-size: 0.75rem;
  }
`;

const JobInputContainer = styled.div`
  position: relative;
  flex: 1 1 120px;
  min-width: 100px;
  max-width: 150px;
`;

const JobDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #d2d2d7;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 0.2rem;
`;

const JobOption = styled.div`
  padding: 0.5rem 0.8rem;
  cursor: pointer;
  font-size: 0.8rem;
  color: #333;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: rgba(255, 193, 7, 0.1);
  }
  
  &:first-child {
    border-radius: 0.5rem 0.5rem 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 0.5rem 0.5rem;
  }
`;

const Add = styled.button`
  flex-shrink: 0;
  width: 120px;
  min-width: 100px;
  max-width: 120px;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #ffc107 0%, #ffb300 100%);
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.8rem;
  min-height: 36px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  
  &:hover {
    background: linear-gradient(135deg, #ffb300 0%, #ff8f00 100%);
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(255, 193, 7, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: #f8f9fa;
    border-color: #dee2e6;
    color: #6c757d;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.8rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #c82333;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
  }
`;

const List = styled.div`
  max-height: ${({ $preview }) => ($preview ? "60px" : "120px")};
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

const Li = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 0.35rem;
  padding: 0.4rem 0.6rem;
  margin-bottom: 0.25rem;
  box-sizing: border-box;
  width: 100%;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #ffc107;
    box-shadow: 0 3px 12px rgba(255, 193, 7, 0.1);
    transform: translateY(-1px);
  }
  
  ${({ done }) => done && css`
    background: #f8f9fa;
    border-color: #28a745;
    opacity: 0.8;
    
    span {
      text-decoration: line-through;
      color: #6c757d !important;
  }
  `}
`;

const Empty = styled.div`
  font-size: 0.8rem;
  color: #6c757d;
  text-align: center;
  margin-top: 0.5rem;
  padding: 1rem;
  background: rgba(255,255,255,0.5);
  border-radius: 0.35rem;
  border: 2px dashed #dee2e6;
`;

const ScheduleHeader = styled.div`
  margin-bottom: 0.5rem;
  padding-bottom: 0.4rem;
  border-bottom: 2px solid #f8f9fa;
  
  h3 {
    margin: 0 0 0.4rem 0;
    color: #2c3e50;
    font-size: 0.95rem;
    font-weight: 700;
  }
`;

const JobTitle = styled.div`
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const TaskContent = styled.div`
  flex: 1;
  margin-left: 0.5rem;
`;

const TaskTitle = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 0.2rem;
`;

const TaskDescription = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.3rem;
`;

const TaskMeta = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const TaskDuration = styled.span`
  font-size: 0.7rem;
  color: #888;
  background: #f0f0f0;
  padding: 0.1rem 0.3rem;
  border-radius: 0.2rem;
`;

const TaskType = styled.span`
  font-size: 0.7rem;
  color: #fff;
  background: #ffc107;
  padding: 0.1rem 0.3rem;
  border-radius: 0.2rem;
`;

// 모달 스타일 개선
const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
`;

const ModalCard = styled.div`
  background: #fff;
  border-radius: 1.2rem;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  padding: 2.5rem 2.5rem 2rem 2.5rem;
  min-width: 360px;
  max-width: 95vw;
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border: 1px solid rgba(255,255,255,0.2);
`;

const ModalTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1rem;
`;

const ModalDesc = styled.div`
  font-size: 1.1rem;
  color: #495057;
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const ModalMeta = styled.div`
  font-size: 1rem;
  color: #6c757d;
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  margin-bottom: 2rem;
  
  span {
    background: #f8f9fa;
    padding: 0.4rem 0.8rem;
    border-radius: 0.5rem;
    border: 1px solid #e9ecef;
  }
`;

const ModalCloseBtn = styled.button`
  align-self: flex-end;
  background: linear-gradient(135deg, #ffc107 0%, #ffb300 100%);
  color: #fff;
  border: none;
  border-radius: 0.7rem;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover { 
    background: linear-gradient(135deg, #ffb300 0%, #ff8f00 100%);
    transform: translateY(-1px);
  }
`;

// 로딩 스피너 스타일 추가
const LoadingSpinner = styled.div`
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255, 193, 7, 0.3);
  border-radius: 50%;
  border-top-color: #ffc107;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.4rem;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
`;

const LoadingText = styled.div`
  text-align: center;
  margin: 1rem 0 0 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  max-width: 300px;
`;

const LoadingSubText = styled.div`
  text-align: center;
  color: #999;
  font-size: 0.7rem;
  margin-top: 0.25rem;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.85rem;
  text-align: center;
  margin: 0.4rem 0;
  padding: 0.4rem;
  background: rgba(220, 53, 69, 0.1);
  border-radius: 0.35rem;
`;

const RetryButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 0.35rem;
  padding: 0.35rem 0.7rem;
  font-size: 0.75rem;
  cursor: pointer;
  margin: 0.4rem auto;
  display: block;
  
  &:hover {
    background: #5a6268;
  }
`;
