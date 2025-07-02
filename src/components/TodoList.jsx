import React, { useState, useMemo, useCallback } from "react";
import styled, { css } from "styled-components";

/* ─ util ─ */
const toKey       = (d) => d.toISOString().split("T")[0];
const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const prevDate    = (d, n) => { const t=new Date(d); t.setDate(t.getDate()-n); return t; };

export default function TodoList() {
  /* 날짜 */
  const now = new Date();
  const [year,  setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSel] = useState(toKey(now));

  /* 데이터 */
  const [tasks, setTasks] = useState(() =>
    JSON.parse(localStorage.getItem("tasks") || "{}")
  );
  const [input, setInput] = useState("");

  /* 저장 util */
  const save = useCallback((obj) => {
    setTasks(obj);
    localStorage.setItem("tasks", JSON.stringify(obj));
  }, []);

  /* 오늘 */
  const todays = tasks[selected] || [];
  const done   = todays.filter((t) => t.done).length;
  const rate   = todays.length ? Math.round((done / todays.length) * 100) : 0;

  /* streak */
  const streak = useMemo(() => {
    let s = 0;
    for (let i = 0; i < 30; i++) {
      const key = toKey(prevDate(new Date(), i));
      const arr = tasks[key] || [];
      if (arr.length && arr.every((t) => t.done)) s++;
      else break;
    }
    return s;
  }, [tasks]);

  /* 캘린더 배열 */
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

  /* crud */
  const add = () => {
    if (!input.trim()) return;
    save({
      ...tasks,
      [selected]: [...todays, { text: input.trim(), done: false }],
    });
    setInput("");
  };
  const toggle = (i) => {
    const arr = [...todays];
    arr[i].done = !arr[i].done;
    save({ ...tasks, [selected]: arr });
  };
  const remove = (i) => {
    const arr = [...todays];
    arr.splice(i, 1);
    const next = { ...tasks };
    arr.length ? (next[selected] = arr) : delete next[selected];
    save(next);
  };

  /* ─ render ─ */
  return (
    <Wrap>
      {/* 캘린더 + 완료율 한줄 배치 */}
      <Top>
        <Cal>
          <Header>
            <Nav onClick={() => setMonth(month === 0 ? 11 : month - 1)}>◀</Nav>
            <span>{year}년 {month + 1}월</span>
            <Nav onClick={() => setMonth(month === 11 ? 0 : month + 1)}>▶</Nav>
          </Header>

          <Grid7>
            {"일월화수목금토".split("").map((d) => <Th key={d}>{d}</Th>)}
            {daysArr.map((k, i) => (
              <Td
                key={i}
                selected={k === selected}
                has={k && tasks[k]?.length}
                onClick={() => k && setSel(k)}
              >
                {k ? +k.split("-")[2] : ""}
              </Td>
            ))}
          </Grid7>
        </Cal>

        <Stat>
          <Ring percent={rate}>
            <Inner>{rate}%</Inner>
          </Ring>
          <p>
            완료 {done} / {todays.length} <br />
            남은 {todays.length - done}개 <br />
            연속 100% {streak}일
          </p>
        </Stat>
      </Top>

      {/* 할 일 */}
      <Todo>
        <h3>{selected} 할 일</h3>
        <InputRow>
          <Inp
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="할 일을 입력…"
          />
          <Add onClick={add}>＋</Add>
        </InputRow>

        <List>
          {todays.map((t, i) => (
            <Li key={i} done={t.done}>
              <label>
                <input type="checkbox" checked={t.done} onChange={() => toggle(i)} />
                <span>{t.text}</span>
              </label>
              <Del onClick={() => remove(i)}>🗑</Del>
            </Li>
          ))}
          {todays.length === 0 && <Empty>할 일이 없습니다</Empty>}
        </List>
      </Todo>
    </Wrap>
  );
}

/* ── styled ── */
const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: 1.2rem 1.6rem;
  height: 100%;
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.6rem;
`;

const Cal = styled.div``;
const Header = styled.div`
  display: flex; justify-content: center; gap: 1rem;
  font-weight: 700; margin-bottom: .6rem;
`;
const Nav = styled.button`background:none;border:none;font-size:1.2rem;cursor:pointer;`;
const Grid7 = styled.div`display:grid;grid-template-columns:repeat(7,36px);gap:.18rem;`;
const Th = styled.div`text-align:center;font-weight:700;font-size:.78rem;`;
const Td = styled.div`
  width: 36px; height: 36px; line-height: 36px; text-align:center;
  border-radius: 8px; cursor:pointer;
  ${({ has })      => has      && css`font-weight:700;`}
  ${({ selected }) => selected && css`background:#ffe066;`}
`;

const Stat = styled.div`
  display:flex; flex-direction:column; align-items:center; gap:.6rem;
  font-size:.92rem; line-height:1.4;
`;
const Ring = styled.div`
  width: 120px; height: 120px; border-radius:50%;
  background:${({percent}) => `conic-gradient(#ffd54f ${percent*3.6}deg,#eee 0)`};
  display:flex;align-items:center;justify-content:center;
`;
const Inner = styled.div`
  width: 85px; height: 85px; border-radius:50%; background:#fdfdfd;
  display:flex;align-items:center;justify-content:center;font-weight:700;
`;

const Todo = styled.div``;
const InputRow = styled.div`display:flex;gap:.5rem;margin:.5rem 0 .8rem;`;
const Inp = styled.input`
  flex:1;padding:.55rem .75rem;border:1px solid #ccc;border-radius:8px;font-size:.95rem;
`;
const Add = styled.button`
  padding:.55rem 1.1rem;background:#ffd54f;border:none;border-radius:8px;font-weight:700;
  cursor:pointer;&:hover{background:#e5b000;}
`;

const List = styled.div`max-height:215px;overflow-y:auto;`;
const Li = styled.div`
  display:flex;justify-content:space-between;align-items:center;
  background:#fff;border:1px solid #eee;border-radius:8px;padding:.45rem .7rem;margin-bottom:.35rem;
  span{margin-left:.42rem;text-decoration:${({done})=>done?"line-through":"none"};}
`;
const Del = styled.button`background:none;border:none;cursor:pointer;color:#888;font-size:.9rem;
  &:hover{color:#d00;}
`;
const Empty = styled.div`font-size:.9rem;color:#999;text-align:center;margin-top:.6rem;`;
