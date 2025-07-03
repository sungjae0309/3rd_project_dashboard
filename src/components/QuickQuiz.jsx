/* ───────── src/components/QuickQuiz.jsx ───────── */
import React, { useState } from "react";
import styled from "styled-components";

export default function QuickQuiz({ type = "trend" }) {
  const [answers, setAnswers] = useState({});

  const handleSelect = (question, answer) => {
    setAnswers((prev) => ({ ...prev, [question]: answer }));
  };

  const renderOptions = (questionKey, options) => (
    <OptionGroup>
      {options.map((opt) => (
        <OptionBtn
          key={opt}
          onClick={() => handleSelect(questionKey, opt)}
          $selected={answers[questionKey] === opt}
        >
          {opt}
        </OptionBtn>
      ))}
    </OptionGroup>
  );

  return (
    <QuizBox>
      <QuizTitle>📌 {type === "trend" ? "나만의 로드맵 진단 Quick Quiz" : "갭 분석 Quick Quiz"}</QuizTitle>

      {type === "trend" ? (
        <>
          <Question>
            <strong>1.</strong> 관심 있는 분야는?
            {renderOptions("부름", ["데이터 분석", "백엔드", "프론트엔드", "AI / 머신러닝"])}
          </Question>

          <Question>
            <strong>2.</strong> 현재 학년 또는 카리어 단계는?
            {renderOptions("단계", ["1~2학년", "3~4학년", "비전공생", "경력자 전직 준비"])}
          </Question>

          <Question>
            <strong>3.</strong> 실무 경험이 있나요?
            {renderOptions("실무 경험", ["있음", "없음", "인터년 경험 있음"])}
          </Question>

          <Note>※ 선택 후 더 구체적으로 입력하면 정교한 추천이 제공됩니다.</Note>
        </>
      ) : (
        <>
          <Question>
            <strong>1.</strong> 사용 가능한 기술 스택은?
            {renderOptions("스택", ["Python", "Java", "JavaScript", "React", "Node.js", "SQL", "Spring", "Django"])}
          </Question>

          <Question>
            <strong>2.</strong> 사용 경험이 있는 협업 도구는?
            {renderOptions("협어토의", ["Git", "Notion", "JIRA", "Figma", "Slack"])}
          </Question>

          <Question>
            <strong>3.</strong> 경험한 프레임워크는?
            {renderOptions("프레임워크", ["Django", "Spring", "Express", "Vue", "TensorFlow", "Next.js"])}
          </Question>

          <Note>※ 선택 항목을 바탕으로 스킬 갭을 분석합니다.</Note>
        </>
      )}
    </QuizBox>
  );
}

/* ────────────── styled-components ────────────── */
const QuizBox = styled.div`
  flex: 1;
  padding: 1.4rem 2rem;
  background: #fff5e1;
  border: 1px solid #ffd490;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const QuizTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 700;
  color: #ff8c00;
  margin-bottom: 0.6rem;
`;

const Question = styled.div`
  font-size: 1rem;
  font-weight: 600;
  margin: 0.8rem 0 0.3rem;
`;

const OptionGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin: 0.5rem 0 0.8rem;
`;

const OptionBtn = styled.button`
  padding: 0.4rem 1rem;
  border-radius: 2rem;
  border: none;
  background: ${({ $selected }) => ($selected ? "#ffa500" : "#fff")};
  color: ${({ $selected }) => ($selected ? "#fff" : "#333")};
  border: 1px solid #ccc;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  &:hover {
    opacity: 0.85;
  }
`;

const Note = styled.p`
  margin-top: 0.8rem;
  font-size: 0.88rem;
  color: #444;
`;
