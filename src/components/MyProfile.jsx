import React, { useState, useEffect } from "react";
import styled, { css } from "styled-components";
import axios from "axios";
import { FaCamera, FaEdit, FaSave } from "react-icons/fa";

/**
 * 깔끔 ‣ 인라인 수정용 MyProfile
 * ─────────────────────────────────────────
 * • GET /resume/me 로 기존 이력서 불러오기
 * • 각 필드는 *보기 모드* ▶︎ *수정 모드* 전환 (✎ 아이콘)
 * • 수정 후 ✔️(저장) 클릭 → localStorage & 서버 PATCH (선택)
 * • 저장 성공 시 다시 보기 모드
 * ─────────────────────────────────────────
 */
export default function MyProfile({ darkMode }) {
  /* ───────── local state ───────── */
  const defaultProfile = {
    name: "김취준",
    email: "test@example.com",
    phone: "010-1234-5678",
    birthdate: "19990101",
    degree: "대학교4",
    university: "서울대학교",
    major: "컴퓨터공학과",
    gpa: "3.8/4.5",
    certificate: "정보처리기사, TOEIC 900",
    bio: "안녕하세요! 더 나은 개발자를 꿈꾸는 취준생입니다.",
    photo: null,
  };

  const [profile, setProfile] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("myProfile") || "{}");
    return { ...defaultProfile, ...saved };
  });

  // field별 edit 모드 여부 저장
  const [edit, setEdit] = useState({});
  const toggleEdit = (key) => setEdit((prev) => ({ ...prev, [key]: !prev[key] }));

  /* ───────── 서버에서 이력서 불러오기 (한 번) ───────── */
  useEffect(() => {
    const fetchResume = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        const { data } = await axios.get("http://localhost:8000/resume/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const mapped = {
          degree: data.degree || "",
          university: data.university || "",
          major: data.major || "",
          gpa: data.gpa || "",
          certificate: (data.certificate_ids || []).join(", ") || "",
        };
        setProfile((p) => ({ ...p, ...mapped }));
      } catch (err) {
        console.error(err);
      }
    };
    fetchResume();
  }, []);

  /* ───────── 핸들러 ───────── */
  const onChange = (key, val) => setProfile((prev) => ({ ...prev, [key]: val }));

  const saveAll = async () => {
    /* ① localStorage 저장 */
    localStorage.setItem("myProfile", JSON.stringify(profile));

    /* ② 서버 PATCH (필요 시) */
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        await axios.patch(
          "http://localhost:8000/resume/me",
          {
            degree: profile.degree,
            university: profile.university,
            major: profile.major,
            gpa: profile.gpa,
            certificate_ids: profile.certificate
              ? profile.certificate.split(/,|\n/).map((s) => s.trim())
              : [],
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      alert("✅ 저장되었습니다!");
      setEdit({});
    } catch (err) {
      console.error(err);
      alert("저장 실패 – 콘솔 확인");
    }
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange("photo", ev.target.result);
    reader.readAsDataURL(file);
  };

  /* ───────── render helpers ───────── */
  const Field = ({ label, keyName, type = "text", placeholder = "" }) => (
    <FieldRow>
      <Label>{label}</Label>

      {edit[keyName] ? (
        <Input
          as={type === "textarea" ? "textarea" : "input"}
          value={profile[keyName]}
          placeholder={placeholder}
          rows={type === "textarea" ? 3 : undefined}
          onChange={(e) => onChange(keyName, e.target.value)}
          autoFocus
        />
      ) : (
        <Value>{profile[keyName] || "-"}</Value>
      )}

      <IconBtn onClick={() => toggleEdit(keyName)}>
        {edit[keyName] ? <FaSave /> : <FaEdit />}
      </IconBtn>
    </FieldRow>
  );

  return (
    <Wrapper>
      <Card $darkMode={darkMode}>
        <TopFlex>
          <PhotoBox>
            {profile.photo ? (
              <img src={profile.photo} alt="profile" />
            ) : (
              <Placeholder>
                <FaCamera />
              </Placeholder>
            )}
            <input id="photo" type="file" accept="image/*" onChange={handlePhoto} />
            <label htmlFor="photo">사진 변경</label>
          </PhotoBox>

          <FormArea>
            <Field label="이름" keyName="name" />
            <Field label="이메일" keyName="email" type="email" />
            <Field label="전화번호" keyName="phone" />
            <Field label="생년월일" keyName="birthdate" placeholder="YYYYMMDD" />
            <Field label="최종 학력" keyName="degree" />
            <Field label="학교" keyName="university" />
            <Field label="전공" keyName="major" />
            <Field label="학점" keyName="gpa" placeholder="3.8/4.5" />
            <Field label="자격증/수상/어학" keyName="certificate" type="textarea" />
            <Field label="한줄 소개" keyName="bio" type="textarea" />
          </FormArea>
        </TopFlex>

        <SaveAllBtn onClick={saveAll}>전체 저장</SaveAllBtn>
      </Card>
    </Wrapper>
  );
}

/* ───────────────── 스타일 ───────────────── */
const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem 0 6rem;
`;

const Card = styled.div`
  width: 100%;
  max-width: 880px;
  background: ${({ $darkMode }) => ($darkMode ? "#2f2f2f" : "#eeeae2")};
  color: ${({ $darkMode }) => ($darkMode ? "#fff" : "#3c2f12")};
  border-radius: 1.5rem;
  padding: 3rem;
`;

const TopFlex = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
`;

/* 사진 */
const PhotoBox = styled.div`
  width: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  input {
    display: none;
  }
  label {
    font-size: 0.83rem;
    cursor: pointer;
    text-decoration: underline;
    opacity: 0.8;
    &:hover {
      opacity: 1;
    }
  }
  img,
  div {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    object-fit: cover;
    background: #ccc;
  }
`;
const Placeholder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.6rem;
  color: #777;
`;

/* 오른쪽 입력 영역 */
const FormArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
`;

const FieldRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
`;

const Label = styled.div`
  width: 115px;
  font-weight: 700;
  padding-top: 0.4rem;
`;

const sharedBox = css`
  flex: 1;
  border: none;
  border-radius: 0.5rem;
  padding: 0.7rem 0.9rem;
  font-size: 0.95rem;
  background: #fff;
  color: #333;
  line-height: 1.45;
`;

const Value = styled.div`
  ${sharedBox};
  background: #fafafa;
`;

const Input = styled.input`
  ${sharedBox};
  ${({ as }) =>
    as === "textarea" &&
    css`
      height: 90px;
      resize: vertical;
    `}
`;

const IconBtn = styled.button`
  border: none;
  background: none;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.4rem;
  color: #ffbb00;
  &:hover {
    opacity: 0.8;
  }
`;

const SaveAllBtn = styled.button`
  margin-top: 2rem;
  background: #ffc107;
  color: #000;
  font-weight: 700;
  border: none;
  border-radius: 0.8rem;
  padding: 0.9rem 2.4rem;
  font-size: 1rem;
  cursor: pointer;
  &:hover {
    background: #ffb300;
  }
`;
