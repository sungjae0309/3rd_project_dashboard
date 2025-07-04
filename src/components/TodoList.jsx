import React, { useState, useMemo, useCallback } from "react";
import styled, { css } from "styled-components";

/* utils */
const toKey = (d) => d.toISOString().split("T")[0];
const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const prevDate = (d, n) => {
  const t = new Date(d);
  t.setDate(t.getDate() - n);
  return t;
};

export default function TodoList({ onPage = "todo" /* "home" | "todo" */ }) {
  const now = new Date();
  const initialDate = localStorage.getItem("todoSelectedDate") || toKey(now);
  const [selected, setSel] = useState(initialDate);
  const [year, setYear] = useState(+selected.slice(0, 4));
  const [month, setMonth] = useState(+selected.slice(5, 7) - 1);
  const [tasks, setTasks] = useState(() =>
    JSON.parse(localStorage.getItem("tasks") || "{}")
  );
  const [input, setInput] = useState("");
  const [isComposing, setIsComposing] = useState(false); // 한글 조합 여부

  const save = useCallback((obj) => {
    setTasks(obj);
    localStorage.setItem("tasks", JSON.stringify(obj));
  }, []);

  const todays = tasks[selected] || [];
  const done = todays.filter((t) => t.done).length;
  const rate = todays.length ? Math.round((done / todays.length) * 100) : 0;

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
            {daysArr.map((k, i) => (
              <Td
                key={i}
                selected={k === selected}
                has={k && tasks[k]?.length}
                onClick={() => {
                  if (!k) return;
                  setSel(k);
                  localStorage.setItem("todoSelectedDate", k);
                }}
              >
                {k ? +k.split("-")[2] : ""}
              </Td>
            ))}
          </Grid7>
        </Cal>

        {onPage === "todo" && (
          <Stat>
            <Ring percent={rate}>
              <Inner>{rate}%</Inner>
            </Ring>
            <p>
              완료 {done} / {todays.length}
              <br />
              남은 {todays.length - done}개
              <br />
              연속 100% {streak}일
            </p>
          </Stat>
        )}
      </Top>

      <Todo>
        {onPage === "todo" && <h3>{selected} 할 일</h3>}
        {onPage === "todo" && (
          <InputRow>
            <Inp
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isComposing) {
                  e.preventDefault();
                  add();
                }
              }}
              placeholder="할 일을 입력…" 
            />

            <Add onClick={add}>＋</Add>
          </InputRow>
        )}

        <List $preview={onPage === "home"}>
          {(onPage === "home" ? todays.slice(0, 4) : todays).map((t, i) => (
            <Li key={i} done={t.done}>
              {onPage === "todo" ? (
                <>
                  <label>
                    <input
                      type="checkbox"
                      checked={t.done}
                      onChange={() => toggle(i)}
                    />
                    <span>{t.text}</span>
                  </label>
                  <Del onClick={() => remove(i)}>🗑</Del>
                </>
              ) : (
                <span>{t.text}</span>
              )}
            </Li>
          ))}
          {todays.length === 0 && (
            <Empty>{onPage === "home" ? "없음" : "할 일이 없습니다"}</Empty>
          )}
        </List>
      </Todo>
    </Wrap>
  );
}

/* styled-components 생략하지 않고 전부 유지 */

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
  display: flex;
  justify-content: center;
  gap: 1rem;
  font-weight: 700;
  margin-bottom: 0.6rem;
`;
const Nav = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
`;
const Grid7 = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 36px);
  gap: 0.18rem;
`;
const Th = styled.div`
  text-align: center;
  font-weight: 700;
  font-size: 0.78rem;
`;
const Td = styled.div`
  width: 36px;
  height: 36px;
  line-height: 36px;
  text-align: center;
  border-radius: 8px;
  cursor: pointer;
  ${({ has }) => has && css`font-weight: 700;`}
  ${({ selected }) =>
    selected &&
    css`
      background: #ffe066;
    `}
`;
const Stat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.92rem;
  line-height: 1.4;
`;
const Ring = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${({ percent }) =>
    `conic-gradient(#ffd54f ${percent * 3.6}deg,#eee 0)`};
  display: flex;
  align-items: center;
  justify-content: center;
`;
const Inner = styled.div`
  width: 85px;
  height: 85px;
  border-radius: 50%;
  background: #fdfdfd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
`;
const Todo = styled.div``;
const InputRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin: 0.5rem 0 0.8rem;
`;
const Inp = styled.input`
  flex: 1;
  padding: 0.55rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 0.95rem;
`;
const Add = styled.button`
  padding: 0.55rem 1.1rem;
  background: #ffd54f;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  &:hover {
    background: #e5b000;
  }
`;
const List = styled.div`
  max-height: ${({ $preview }) => ($preview ? "160px" : "215px")};
  overflow-y: auto;
`;
const Li = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 0.45rem 0.7rem;
  margin-bottom: 0.35rem;
  span {
    margin-left: 0.42rem;
    text-decoration: ${({ done }) => (done ? "line-through" : "none")};
  }
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
