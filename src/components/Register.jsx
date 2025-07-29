/* ────────────── src/pages/Register.jsx ────────────── */
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaLock,
  FaMobileAlt,
  FaRegCalendarAlt,
  FaVenusMars,
  FaIdBadge,
} from "react-icons/fa";

export default function Register() {
  const navigate = useNavigate();

  /* ── 폼 상태 ─────────────────────────────── */
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirm_password: "",
    nickname: "",
    name: "",
    phone_number: "",
    birth_date: "",
    gender: "",
  });

  /* ── 생년월일 선택을 위한 상태 ─────────────── */
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");

  /* ── 년도, 월, 일 옵션 생성 ────────────────── */
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1930 + 1 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // 선택된 년도와 월에 따른 일 수 계산
  const getDaysInMonth = (year, month) => {
    if (!year || !month) return 31;
    return new Date(year, month, 0).getDate();
  };
  
  const days = Array.from({ length: getDaysInMonth(birthYear, birthMonth) }, (_, i) => i + 1);

  const [passwordMatch, setPasswordMatch] = useState(true);

  /* ── 네이버 SDK 로드 ─────────────────────── */
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://static.nid.naver.com/js/naveridlogin_js_sdk_2.0.2.js";
    script.async = true;
    script.onload = initNaver;
    document.head.appendChild(script);
  }, []);

  const initNaver = () => {
    if (!window.naver) return;
    const naverLogin = new window.naver.LoginWithNaverId({
      clientId: process.env.REACT_APP_NAVER_CLIENT_ID,
      callbackUrl: `${window.location.origin}/navercallback`,
      isPopup: false,
      loginButton: { color: "green", type: 3, height: 48 },
      callbackHandle: true, // 콜백 처리를 위한 설정 추가
    });
    naverLogin.init();
  };

  /* ── 네이버 콜백 처리는 별도 컴포넌트에서 처리 ───── */

  /* ── 생년월일 선택 핸들러 ─────────────────── */
  const handleBirthDateChange = (type, value) => {
    if (type === "year") {
      setBirthYear(value);
      // 년도가 바뀔 때 일 초기화
      if (birthMonth && birthDay > getDaysInMonth(value, birthMonth)) {
        setBirthDay("");
      }
    } else if (type === "month") {
      setBirthMonth(value);
      // 월이 바뀔 때 일 초기화
      if (birthDay > getDaysInMonth(birthYear, value)) {
        setBirthDay("");
      }
    } else if (type === "day") {
      setBirthDay(value);
    }

    // 년, 월, 일이 모두 선택되면 birth_date 업데이트
    let year = type === "year" ? value : birthYear;
    let month = type === "month" ? value : birthMonth;
    let day = type === "day" ? value : birthDay;

    if (year && month && day) {
      const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      setFormData(prev => ({ ...prev, birth_date: formattedDate }));
    } else {
      setFormData(prev => ({ ...prev, birth_date: "" }));
    }
  };

  /* ── 입력 핸들러 ─────────────────────────── */
  const handleChange = (e) => {
    let { name, value } = e.target;

    /* 비밀번호 일치 검사 */
    if (name === "confirm_password")
      setPasswordMatch(value === formData.password);
    if (name === "password")
      setPasswordMatch(formData.confirm_password === value);

    /* 전화번호 하이픈 자동 삽입 */
    if (name === "phone_number") {
      const digits = value.replace(/\D/g, "");
      if (digits.length <= 3) value = digits;
      else if (digits.length <= 7)
        value = `${digits.slice(0, 3)}-${digits.slice(3)}`;
      else
        value = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(
          7,
          11
        )}`;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ── 프론트 유효성 검사 ───────────────────── */
  const validateForm = () => {
    const phoneDigits = formData.phone_number.replace(/-/g, "");
    if (phoneDigits.length !== 11)
      return "휴대폰 번호는 숫자 11자리여야 합니다";
    if (!birthYear || !birthMonth || !birthDay)
      return "생년월일을 모두 선택해주세요";
    if (!passwordMatch) return "비밀번호가 일치하지 않습니다";
    return null;
  };

  /* ── 제출: 회원가입 → 자동 로그인 → 이동 ─── */
  /* ── 제출: 회원가입 → 자동 로그인 → 이동 ─── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateForm();
    if (err) return alert(err);

    try {
      const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://192.168.101.51:8000';
      // 1) 회원가입
      await axios.post(`${BASE_URL}/users/signup/id`, {
        ...formData,
        phone_number: formData.phone_number.replace(/-/g, ""),
      });

      // 2) 바로 로그인 (토큰 발급)
      const payload = new URLSearchParams();
      payload.append("username", formData.email);
      payload.append("password", formData.password);

      const { data: tokenRes } = await axios.post(
        `${BASE_URL}/token`,
        payload,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      
      const token = tokenRes.access_token;
      
      // ✨ 3) 토큰을 사용하여 사용자 정보(ID 포함) 가져오기 (수정된 부분)
      const { data: userRes } = await axios.get(
        `${BASE_URL}/users/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✨ 4) 토큰과 userId 모두 저장 (수정된 부분)
      localStorage.setItem("accessToken", token);
      localStorage.setItem("userId", userRes.id);
      localStorage.removeItem("chatSessionId"); // 혹시 모를 채팅 세션 초기화

      alert("회원가입 및 자동 로그인 완료!");

      // 5) 프로필 입력 페이지로 바로 이동
      navigate("/registernext");
      
      // 페이지 이동 후 스크롤을 최상단으로 이동
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    } catch (err) {
      console.error(err.response?.data || err);
      alert("회원가입 실패: " + (err.response?.data?.detail || err.message));
    }
  };

  /* ── JSX 렌더링 ───────────────────────────── */
  return (
    <Bg>
      <MainBox>
        <Header>
          <h1>회원가입</h1>
        </Header>

        <FormContainer onSubmit={handleSubmit}>
          <InputGroup>
            <Icon>
              <FaUser />
            </Icon>
            <Input
              name="email"
              placeholder="아이디 또는 이메일"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <Icon>
              <FaLock />
            </Icon>
            <Input
              name="password"
              type="password"
              placeholder="비밀번호"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <Icon>
              <FaLock />
            </Icon>
            <Input
              name="confirm_password"
              type="password"
              placeholder="비밀번호 확인"
              value={formData.confirm_password}
              onChange={handleChange}
              required
            />
          </InputGroup>

          {formData.confirm_password && (
            <PwInfo $match={passwordMatch}>
              {passwordMatch
                ? "비밀번호가 일치합니다."
                : "비밀번호가 일치하지 않습니다."}
            </PwInfo>
          )}

          <InputGroup>
            <Icon>
              <FaIdBadge />
            </Icon>
            <Input
              name="name"
              placeholder="이름"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <Icon>
              <FaUser />
            </Icon>
            <Input
              name="nickname"
              placeholder="닉네임"
              value={formData.nickname}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <Icon>
              <FaVenusMars />
            </Icon>
            <GenderContainer>
              <GenderLabel>성별</GenderLabel>
              <GenderButtonContainer>
                <GenderButton
                  type="button"
                  $selected={formData.gender === "남자"}
                  onClick={() => setFormData(prev => ({ ...prev, gender: "남자" }))}
                >
                  남자
                </GenderButton>
                <GenderButton
                  type="button"
                  $selected={formData.gender === "여자"}
                  onClick={() => setFormData(prev => ({ ...prev, gender: "여자" }))}
                >
                  여자
                </GenderButton>
              </GenderButtonContainer>
            </GenderContainer>
          </InputGroup>

          <BirthDateGroup>
            <Icon>
              <FaRegCalendarAlt />
            </Icon>
            <BirthDateContainer>
              <BirthDateLabel>생년월일</BirthDateLabel>
              <SelectContainer>
                <Select
                  value={birthYear}
                  onChange={(e) => handleBirthDateChange("year", e.target.value)}
                  required
                >
                  <option value="">년도</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}년</option>
                  ))}
                </Select>
                <Select
                  value={birthMonth}
                  onChange={(e) => handleBirthDateChange("month", e.target.value)}
                  required
                >
                  <option value="">월</option>
                  {months.map(month => (
                    <option key={month} value={month}>{month}월</option>
                  ))}
                </Select>
                <Select
                  value={birthDay}
                  onChange={(e) => handleBirthDateChange("day", e.target.value)}
                  required
                >
                  <option value="">일</option>
                  {days.map(day => (
                    <option key={day} value={day}>{day}일</option>
                  ))}
                </Select>
              </SelectContainer>
            </BirthDateContainer>
          </BirthDateGroup>

          <InputGroup>
            <Icon>
              <FaMobileAlt />
            </Icon>
            <Input
              name="phone_number"
              placeholder="010-0000-0000"
              value={formData.phone_number}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <SubmitBtn type="submit">회원가입</SubmitBtn>
        </FormContainer>

        <Divider />
        <NaverArea>
          <div id="naverIdLogin" />
        </NaverArea>
      </MainBox>
    </Bg>
  );
}

/* ───────────────────────────────────────────
 * 🎨 styled-components (변경 없음)
 * ─────────────────────────────────────────── */
const Bg = styled.div`
  min-height: 100vh;
  background: #f4f4f4;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 0.1rem 1rem 3rem;
`;
const MainBox = styled.div`
  background: #fff;
  border-radius: 1.8rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
  padding: 2.5rem 2rem;
  color: #333;
`;
const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  h1 {
    color: #ff9e00;
    font-size: 2rem;
    font-weight: 700;
  }
`;
const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
`;
const InputGroup = styled.div`
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border: 2px solid #ccc;
  border-radius: 10px;
  padding: 0.85rem 1rem;
  margin-bottom: 1rem;
  transition: border 0.2s ease;
  &:focus-within {
    border-color: #ffcc00;
  }
`;
const Icon = styled.div`
  font-size: 1.2rem;
  color: #777;
  margin-right: 0.8rem;
`;
const Input = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  font-size: 1rem;
  &::placeholder {
    color: #aaa;
  }
  &:focus {
    outline: none;
  }
`;
const SubmitBtn = styled.button`
  width: 100%;
  padding: 1rem;
  margin-top: 1rem;
  background: #ffc107;
  border: none;
  border-radius: 0.6rem;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  &:hover {
    background: #ffd54f;
  }
`;
const PwInfo = styled.div`
  font-size: 0.9rem;
  margin-bottom: 1rem;
  color: ${({ $match }) => ($match ? "#33b96f" : "#f26a6a")};
`;
const Divider = styled.hr`
  margin: 2rem 0 1.2rem;
  border: none;
  border-top: 1px solid #ccc;
`;
const NaverArea = styled.div`
  display: flex;
  justify-content: center;
`;

const GenderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex: 1;
  height: 100%;
`;

const GenderLabel = styled.span`
  font-size: 1rem;
  color: #aaa;
  min-width: 2.2rem;
  font-weight: normal;
`;

const GenderButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex: 1;
`;

const GenderButton = styled.button`
  padding: 0.4rem 0.8rem;
  border: 1px solid ${props => props.$selected ? '#ffc107' : '#ddd'};
  background: ${props => props.$selected ? '#ffc107' : '#fff'};
  color: ${props => props.$selected ? '#fff' : '#333'};
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: ${props => props.$selected ? 'bold' : 'normal'};
  cursor: pointer;
  transition: all 0.2s ease;
  height: 100%;
  
  &:hover {
    border-color: #ffc107;
    background: ${props => props.$selected ? '#ffd54f' : '#fff9e6'};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.3);
  }
`;

const BirthDateGroup = styled.div`
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border: 2px solid #ccc;
  border-radius: 10px;
  padding: 0.85rem 1rem;
  margin-bottom: 1rem;
  transition: border 0.2s ease;
  &:focus-within {
    border-color: #ffcc00;
  }
`;

const BirthDateContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex: 1;
  height: 100%;
`;

const BirthDateLabel = styled.span`
  font-size: 1rem;
  color: #aaa;
  min-width: 4rem;
  font-weight: normal;
`;

const SelectContainer = styled.div`
  display: flex;
  gap: 0.4rem;
  flex: 1;
`;

const Select = styled.select`
  flex: 1;
  padding: 0.4rem 0.3rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  font-size: 0.85rem;
  color: #333;
  cursor: pointer;
  transition: border-color 0.2s ease;
  min-width: 0;
  max-width: 5rem;
  
  &:focus {
    outline: none;
    border-color: #ffc107;
    box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.1);
  }
  
  &:hover {
    border-color: #ffc107;
  }
  
  option {
    padding: 0.2rem;
  }
`;
