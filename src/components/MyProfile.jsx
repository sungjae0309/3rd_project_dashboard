/* ────────────── src/pages/MyProfile.jsx ────────────── */
import React, { useState, useEffect, useRef } from "react";
import styled, { css } from "styled-components";
import axios from "axios";
import { FaEdit, FaSave } from "react-icons/fa";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://192.168.101.51:8000";
const trimLines = (str = "") => str.split(/\n|\r/).map((l) => l.trim()).filter(Boolean);

// 어학 점수 문자열 <-> 객체 변환 헬퍼
const parseLanguageScoresToObject = (scores_str) => {
  if (!scores_str || typeof scores_str !== 'string') return null;
  try {
    return scores_str.split(',').reduce((acc, part) => {
      const [key, value] = part.split(':').map(s => s.trim());
      if (key && value) acc[key] = value;
      return acc;
    }, {});
  } catch { return null; }
};

const formatLanguageScoresToString = (scores_obj) => {
  if (!scores_obj || typeof scores_obj !== 'object') return "";
  return Object.entries(scores_obj).map(([k, v]) => `${k}: ${v}`).join(", ");
};

export default function MyProfile({ darkMode = false }) {
  const defaultProfile = {
    email: "", nickname: "", name: "", phone_number: "", degree: "",
    education_status: "", career_type: "신입", career_years: "", university: "",
    major: "", gpa: "", certificateText: "", experienceText: "",
    desired_job: "", skillsText: "", language_score: "",
  };

  const [profile, setProfile] = useState(defaultProfile);
  const [edit, setEdit] = useState({});
  const textRefs = useRef({});

  // ✨ 누락되었던 toggleEdit 함수를 다시 추가합니다.
  const toggleEdit = (field) => setEdit((p) => ({ ...p, [field]: !p[field] }));

  useEffect(() => {
    const fetchResume = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setProfile(defaultProfile);
        return;
      }

      try {
        const { data } = await axios.get(`${BASE_URL}/users/me/resume`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("✅ [MyProfile] 서버에서 받은 데이터:", data);

        const certificateText = (data.certificates || []).map(c => `${c.certificate_name || ''} (${c.acquired_date || ''})`).join("\n");
        const skillsText = (data.skills || []).map(s => `${s.skill_name || ''} – ${s.proficiency || ''}`).join(", ");
        const experienceText = (data.experience || []).map(e => {
            const [main, sub] = (e.type || "").split("-");
            const title = sub ? `[${main}-${sub}]` : `[${main}]`;
            return `${title} ${e.name || ''} | ${e.period || ''}\n${e.description || ''}`;
        }).join("\n\n");
        
        const workingYear = data.working_year;
        const careerType = (workingYear === '신입' || !workingYear || workingYear === 0 || workingYear === '0') ? "신입" : "경력";

        setProfile({
          email: data.email || "",
          nickname: data.nickname || "",
          name: data.name || "",
          phone_number: data.phone_number || "",
          degree: data.degree || "",
          education_status: data.education_status || "",
          career_type: careerType,
          career_years: careerType === "경력" ? String(workingYear) : "",
          university: data.university || "",
          major: data.major || "",
          gpa: data.gpa || "",
          desired_job: Array.isArray(data.desired_job) ? data.desired_job.join(", ") : (data.desired_job || ""),
          language_score: formatLanguageScoresToString(data.language_score),
          certificateText,
          experienceText,
          skillsText,
        });

      } catch (err) {
        console.error("❌ [MyProfile] 프로필 정보 불러오기 실패:", err);
        setProfile(defaultProfile);
      }
    };

    fetchResume();
  }, []);

  const autoResize = (field) => {
    const el = textRefs.current[field];
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  };

  const onChange = (k, v) => {
    setProfile(p => ({ ...p, [k]: v }));
  };

  const triggerSimilarityCalculation = async (token) => {
    try {
      await axios.post(`${BASE_URL}/similarity/compute`, {}, { headers: { Authorization: `Bearer ${token}` } });
      console.log("✅ 유사도 계산 요청 성공.");
    } catch (err) {
      console.error("❌ 유사도 계산 요청 실패:", err);
    }
  };

  const saveAll = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return alert("다시 로그인해주세요.");

    const certificateArr = trimLines(profile.certificateText).map(line => {
      const match = line.match(/^(.*)\s+\((\d{4}[-\.].*)\)$/);
      return match ? { certificate_name: match[1].trim(), acquired_date: match[2].trim() } : { certificate_name: line.trim(), acquired_date: null };
    });

    const expArr = profile.experienceText.split(/\n\n+/).map(block => {
      const [head, ...body] = block.split("\n");
      if (!head) return null;
      const [title, rest] = head.split("|");
      const type = title.match(/\[(.*)\]/)?.[1] || "";
      return { type: type || "기타", name: rest ? rest.trim() : title.replace(/\[.*\]/, "").trim(), period: body[0] || "", description: body.slice(1).join("\n") || "" };
    }).filter(Boolean);

    const payload = {
      university: profile.university || null,
      major: profile.major || null,
      gpa: profile.gpa ? Number(profile.gpa) : null,
      education_status: profile.education_status || null,
      degree: profile.degree || null,
      desired_job: profile.desired_job.split(',').map(s => s.trim()).filter(Boolean),
      working_year: profile.career_type === "경력" ? String(profile.career_years || "") : "신입",
      language_score: parseLanguageScoresToObject(profile.language_score),
      skills: null,
      certificates: certificateArr,
      experience: expArr,
    };

    try {
      await axios.put(`${BASE_URL}/users/me/resume`, payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      alert("✅ 저장되었습니다!");
      setEdit({});
      await triggerSimilarityCalculation(token);
    } catch (err) {
      console.error("❌ 저장 실패:", err);
      alert("저장 실패: " + (err.response?.data?.detail || err.message));
    }
  };

  const Field = ({ label, keyName, type = "text", placeholder = "" }) => (
    <FieldRow>
      <Label>{label}</Label>
      {edit[keyName] ? (
        <Input as={type === "textarea" ? "textarea" : "input"} ref={el => (textRefs.current[keyName] = el)}
          value={profile[keyName] || ''} placeholder={placeholder} rows={type === "textarea" ? 3 : undefined}
          onInput={() => autoResize(keyName)} onChange={e => onChange(keyName, e.target.value)} autoFocus
        />
      ) : (
        <Value>{profile[keyName] || "-"}</Value>
      )}
      <IconBtn onClick={() => toggleEdit(keyName)}>{edit[keyName] ? <FaSave /> : <FaEdit />}</IconBtn>
    </FieldRow>
  );

  return (
    <Wrapper>
      <Card $darkMode={darkMode}>
        <FormArea>
          <Field label="이메일" keyName="email" />
          <Field label="닉네임" keyName="nickname" />
          <Field label="이름" keyName="name" />
          <Field label="전화번호" keyName="phone_number" />
          <Field label="최종 학력" keyName="degree" />
          <Field label="학적 상태" keyName="education_status" />
          <Field label="구분" keyName="career_type" />
          {profile.career_type === "경력" && <Field label="경력 년차" keyName="career_years" />}
          <Field label="학교명" keyName="university" />
          <Field label="전공" keyName="major" />
          <Field label="학점" keyName="gpa" placeholder="4.5 만점 기준" />
          <Field label="자격증" keyName="certificateText" type="textarea" placeholder="자격증명 (취득일자) 형식으로 입력하세요." />
          <Field label="경험" keyName="experienceText" type="textarea" placeholder="[경험 종류] 경험명 | 기간&#10;주요 내용 순으로 입력하세요." />
          <Field label="관심 직무" keyName="desired_job" type="textarea" placeholder="콤마(,)로 구분하여 여러 개 입력 가능합니다." />
          <Field label="기술 스택" keyName="skillsText" type="textarea" placeholder="보유 기술 스택을 입력하세요." />
          <Field label="어학 점수" keyName="language_score" type="textarea" placeholder="시험명:점수 형식으로 입력하세요. (예: TOEIC:950)" />
        </FormArea>
        <SaveAllBtn onClick={saveAll}>전체 저장</SaveAllBtn>
      </Card>
    </Wrapper>
  );
}

/* 💅 styled-components (기존과 동일) */
const Wrapper = styled.div`
  display: flex; justifyContent: center; padding: 2rem 0 6rem;
`;
const Card = styled.div`
  width: 100%; max-width: 880px;
  background: ${({ $darkMode }) => ($darkMode ? "#2f2f2f" : "#eeeae2")};
  color: ${({ $darkMode }) => ($darkMode ? "#fff" : "#3c2f12")};
  border-radius: 1.5rem; padding: 3rem;
`;
const FormArea = styled.div`
  display: flex; flex-direction: column; gap: 0.9rem;
`;
const FieldRow = styled.div`
  display: flex; align-items: flex-start; gap: 0.8rem;
`;
const Label = styled.div`
  width: 140px; font-weight: 700; padding-top: 0.4rem; flex-shrink: 0;
`;
const sharedBox = css`
  flex: 1; border: none; border-radius: 0.5rem;
  padding: 0.7rem 0.9rem; font-size: 0.95rem;
  background: #fff; color: #333; line-height: 1.45;
  width: 100%;
`;
const Value = styled.div`
  ${sharedBox}; background: #fafafa; white-space: pre-wrap; min-height: 38px;
`;
const Input = styled.textarea.attrs(({ as }) => ({ as }))`
  ${sharedBox};
  ${({ as }) => as === "textarea" && css`resize: none; overflow-y: hidden; min-height: 38px;`}
`;
const IconBtn = styled.button`
  border: none; background: none; font-size: 1.15rem; cursor: pointer;
  padding: 0.4rem; color: #ffbb00;
  &:hover { opacity: 0.8; }
`;
const SaveAllBtn = styled.button`
  display: block; margin: 2rem auto 0;
  background: #ffc107; color: #000;
  font-weight: 700; border: none; border-radius: 0.8rem;
  padding: 0.95rem 2.6rem; font-size: 1rem; cursor: pointer;
  &:hover { background: #ffb300; }
`;