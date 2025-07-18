import React, { useState, useMemo, useCallback, useEffect } from "react";
import styled, { css } from "styled-components";
import axios from "axios";

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
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
  const [daysInput, setDaysInput] = useState(15);
  const isGuest = !localStorage.getItem("accessToken");

  // 1. 일정 리스트를 체크리스트(checkbox) 형태로 출력
  // 2. 폼은 생성 후 사라지고, 일정 리스트가 그 자리에 나오게
  const [showForm, setShowForm] = useState(true);

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
      setScheduleData(updatedSchedule);
      
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
      setScheduleData(updatedSchedule);
    }
  };

  // handleGenerate 함수 정의 (컴포넌트 내에 추가)
  const handleGenerate = async () => {
    if (!jobInput.trim()) {
      setError("직무를 입력해주세요.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(
        `${BASE_URL}/todo/generate?job_title=${encodeURIComponent(jobInput)}&days=${daysInput}`,
        {},
        { headers }
      );
      const { data: userSchedule } = await axios.get(`${BASE_URL}/todo/user`, { headers });
      setScheduleData(userSchedule.data);
      setShowForm(false); // 폼 숨기고 일정 리스트 보여주기
    } catch (e) {
      setError("일정 생성 실패");
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
          {/* 중복된 가로 입력폼 완전 삭제 */}
          {/* {onPage === "todo" && (
            <InputRow>
              <Inp
                value={jobInput}
                onChange={e => setJobInput(e.target.value)}
                onClick={e => e.stopPropagation()}
                placeholder="직무 입력"
              />
              <Inp
                type="number"
                min={1}
                max={60}
                value={daysInput}
                onChange={e => setDaysInput(Number(e.target.value))}
                onClick={e => e.stopPropagation()}
                style={{ width: 60 }}
                placeholder="기간(일)"
              />
              <Add onClick={handleGenerate}>생성하기</Add>
            </InputRow>
          )} */}
          <ErrorMessage>{error}</ErrorMessage>
          <RetryButton onClick={() => setError(null)}>
            에러 메시지 닫기
          </RetryButton>
        </Top>
      </Wrap>
    );
  }

  // 일정 생성 중 로딩 상태를 명확하게 표시
  if (loading) {
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
        {/* 입력 폼은 항상 보이게 */}
        {!isGuest && (
          <InputForm>
            <InputRow>
              <Inp
                value={jobInput}
                onChange={e => setJobInput(e.target.value)}
                onClick={e => e.stopPropagation()}
                placeholder="직무 입력"
              />
            </InputRow>
            <InputRow>
              <Inp
                type="number"
                min={1}
                max={60}
                value={daysInput}
                onChange={e => setDaysInput(Number(e.target.value))}
                onClick={e => e.stopPropagation()}
                style={{ width: 80, maxWidth: 100 }}
                placeholder="기간(일)"
              />
              <Add onClick={handleGenerate}>생성하기</Add>
            </InputRow>
          </InputForm>
        )}
        {/* 일정 리스트 부분에만 로딩 메시지 */}
        <div style={{ textAlign: 'center', margin: '2rem 0', color: '#888', fontSize: '1.1rem' }}>
          일정 생성 중...
        </div>
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

      {/* 2. 입력 폼 */}
      {!isGuest && (
        showForm ? (
          <InputForm>
            <InputRow>
              <Inp
                value={jobInput}
                onChange={e => setJobInput(e.target.value)}
                onClick={e => e.stopPropagation()}
                placeholder="직무 입력"
              />
            </InputRow>
            <InputRow>
              <Inp
                type="number"
                min={1}
                max={60}
                value={daysInput}
                onChange={e => setDaysInput(Number(e.target.value))}
                onClick={e => e.stopPropagation()}
                style={{ width: 80, maxWidth: 100 }}
                placeholder="기간(일)"
              />
              <Add onClick={handleGenerate}>생성하기</Add>
            </InputRow>
          </InputForm>
        ) : (
          <Todo>
            <ScheduleHeader>
              <h3>{selected} 학습 일정</h3>
              {scheduleData && (
                <JobTitle>{scheduleData.job_title} 개발자 과정</JobTitle>
              )}
              {/* goals, notes 표시 */}
              {selectedDaySchedule?.goals && selectedDaySchedule.goals.length > 0 && (
                <div style={{ margin: '0.5rem 0', fontWeight: 500, color: '#444' }}>
                  목표: {selectedDaySchedule.goals.join(', ')}
                </div>
              )}
              {selectedDaySchedule?.notes && (
                <div style={{ margin: '0.3rem 0', color: '#888', fontSize: '0.95rem' }}>
                  {selectedDaySchedule.notes}
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
                        style={{ fontWeight: 600, fontSize: '1.05rem', color: '#333', flex: 1, textAlign: 'left' }}
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
        )
      )}
    </Wrap>
  );
}

/* styled-components 생략하지 않고 전부 유지 */

// 카드 전체 영역(Wrap) 스타일 개선
const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: 1.2rem 1.6rem;
  height: 100%;
  width: 100%;
  max-width: 480px;
  min-width: 340px;
  box-sizing: border-box;
  background: #f5f4f1;
  border-radius: 2rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
`;
const Top = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 1.6rem;
  width: 100%;
`;
const Cal = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
`;
const Header = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.95rem;
  margin-bottom: 0.3rem;
`;
const Nav = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
`;
// 캘린더 스타일 개선
const Grid7 = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.08rem;
  width: 100%;
  max-width: 520px;
  min-width: 320px;
  margin: 0 auto 1.2rem auto;
`;
const Th = styled.div`
  text-align: center;
  font-weight: 700;
  font-size: 0.78rem;
`;
const Td = styled.div`
  width: 24px;
  height: 24px;
  line-height: 24px;
  font-size: 0.85rem;
  border-radius: 6px;
  text-align: center;
  cursor: pointer;
  ${({ has }) => has && css`font-weight: 700;`}
  ${({ selected }) =>
    selected &&
    css`
      background: #ffe066;
    `}
  ${({ completed }) =>
    completed &&
    css`
      background: #4CAF50;
      color: white;
    `}
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
const Todo = styled.div``;
const InputForm = styled.div`
  width: 90%;
  margin-left: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
`;
const InputRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  width: 100%;
  justify-content: flex-start;
  overflow: hidden;
`;
const Inp = styled.input`
  flex: 1 1 120px;
  padding: 0.65rem 1rem;
  border: 1.5px solid #ccc;
  border-radius: 12px;
  font-size: 1.05rem;
  min-width: 100px;
  max-width: 180px;
  min-height: 44px;
  background: #faf9f7;
  transition: border 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  &:focus {
    border: 1.5px solid #ffd54f;
    outline: none;
    background: #fffbe7;
  }
`;
const Add = styled.button`
  flex-shrink: 0;
  width: 90px;
  min-width: 70px;
  max-width: 90px;
  padding: 0.65rem 0;
  background: #ffd54f;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.05rem;
  min-height: 44px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  color: #333;
  box-shadow: 0 2px 8px rgba(255, 213, 79, 0.08);
  white-space: nowrap;
  overflow: hidden;
  &:hover {
    background: #ffb300;
    color: #fff;
  }
`;
const List = styled.div`
  max-height: ${({ $preview }) => ($preview ? "160px" : "215px")};
  overflow-y: auto;
`;
const Li = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #fff;
  border: 2px solid #ffc107;
  border-radius: 12px;
  padding: 1.1rem 1.2rem 1.1rem 1.2rem;
  margin-bottom: 0.7rem;
  box-sizing: border-box;
  width: 100%;
  box-shadow: 0 2px 8px rgba(255, 213, 79, 0.07);
`;
const Del = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #888;
  font-size: 0.9rem;
  &:hover {
    color: #d00;
  }
`;
const Empty = styled.div`
  font-size: 0.9rem;
  color: #999;
  text-align: center;
  margin-top: 0.6rem;
`;

// 새로운 스타일 컴포넌트들
const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
  font-size: 1rem;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #e74c3c;
  font-size: 1rem;
`;

const RetryButton = styled.button`
  background: #ffc107;
  color: #333;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  margin: 1rem auto;
  display: block;

  &:hover {
    background: #ffb300;
  }
`;

const ScheduleHeader = styled.div`
  margin-bottom: 1rem;
  
  h3 {
    margin: 0 0 0.5rem 0;
    color: #333;
  }
`;

const JobTitle = styled.div`
  font-size: 0.9rem;
  color: #666;
  font-weight: 600;
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

// 모달 스타일 추가
const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.18);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const ModalCard = styled.div`
  background: #fff;
  border-radius: 1.2rem;
  box-shadow: 0 4px 24px rgba(0,0,0,0.13);
  padding: 2.2rem 2.2rem 1.5rem 2.2rem;
  min-width: 320px;
  max-width: 95vw;
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;
const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffb300;
  margin-bottom: 0.7rem;
`;
const ModalDesc = styled.div`
  font-size: 1.05rem;
  color: #444;
  margin-bottom: 1.1rem;
`;
const ModalMeta = styled.div`
  font-size: 0.97rem;
  color: #888;
  display: flex;
  flex-wrap: wrap;
  gap: 1.1rem;
  margin-bottom: 1.5rem;
`;
const ModalCloseBtn = styled.button`
  align-self: flex-end;
  background: #ffc107;
  color: #333;
  border: none;
  border-radius: 0.7rem;
  padding: 0.6rem 1.3rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
  &:hover { background: #ffb300; color: #fff; }
`;
