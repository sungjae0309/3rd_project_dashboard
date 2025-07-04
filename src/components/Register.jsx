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

  /* ───────── form ───────── */
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    birthdate: "",
    phone: "",
    nickname: "",
    fullname: "",
    gender: "", // "male" | "female"
  });
  const [passwordMatch, setPasswordMatch] = useState(true);

  /* ───────── NAVER SDK ───────── */
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
    });
    naverLogin.init();
  };

  /* ───────── input handler ───────── */
  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "confirmPassword") {
      setPasswordMatch(value === formData.password);
    }
    if (name === "password") {
      setPasswordMatch(formData.confirmPassword === value);
    }

    // 자동 하이픈 전화번호
    if (name === "phone") {
      const numbers = value.replace(/\D/g, "");
      if (numbers.length <= 3) value = numbers;
      else if (numbers.length <= 7)
        value = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
      else
        value = `${numbers.slice(0, 3)}-${numbers.slice(
          3,
          7
        )}-${numbers.slice(7, 11)}`;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ───────── submit ───────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordMatch) return;

    try {
      await axios.post("/api/register", formData);
      alert("회원가입 완료!");
      // 프로필 기본값 저장
      const basicProfile = {
        name: formData.fullname,
        nickname: formData.nickname,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        bio: "안녕하세요! 더 나은 개발자가 되기 위해 노력 중입니다.",
      };
      localStorage.setItem("myProfile", JSON.stringify(basicProfile));
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("회원가입 실패");
    }
  };

  /* ───────── view ───────── */
  return (
    <Bg>
      <MainBox>
        <Header>
          <h1>회원가입</h1>
        </Header>

        {/* 이름 */}
        <InputGroup>
            <Icon>
              <FaIdBadge />
            </Icon>
            <Input
              name="fullname"
              placeholder="이름"
              value={formData.fullname}
              onChange={handleChange}
              required
            />
          </InputGroup>

          {/* 닉네임 */}
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

          {/* 성별 */}
          <InputGroup style={{ justifyContent: "flex-start" }}>
            <Icon>
              <FaVenusMars />
            </Icon>
            <RadioWrap>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === "male"}
                  onChange={handleChange}
                  required
                />
                <span>남</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === "female"}
                  onChange={handleChange}
                />
                <span>여</span>
              </label>
            </RadioWrap>
          </InputGroup>

        <FormContainer onSubmit={handleSubmit}>
          {/* 아이디 */}
          <InputGroup>
            <Icon>
              <FaUser />
            </Icon>
            <Input
              name="username"
              placeholder="아이디"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </InputGroup>

          {/* 비밀번호 */}
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

          {/* 비밀번호 확인 */}
          <InputGroup>
            <Icon>
              <FaLock />
            </Icon>
            <Input
              name="confirmPassword"
              type="password"
              placeholder="비밀번호 확인"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </InputGroup>
          {formData.confirmPassword && (
            <PwInfo $match={passwordMatch}>
              {passwordMatch
                ? "비밀번호가 일치합니다."
                : "비밀번호가 일치하지 않습니다."}
            </PwInfo>
          )}

          {/* 생년월일 */}
          <InputGroup>
            <Icon>
              <FaRegCalendarAlt />
            </Icon>
            <Input
              name="birthdate"
              type="text"
              placeholder="YYYYMMDD"
              value={formData.birthdate}
              maxLength={8}
              pattern="\d{8}"
              onChange={handleChange}
              required
            />
          </InputGroup>

          {/* 전화번호 */}
          <InputGroup>
            <Icon>
              <FaMobileAlt />
            </Icon>
            <Input
              name="phone"
              type="tel"
              placeholder="010-0000-0000"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <SubmitBtn type="submit">회원가입</SubmitBtn>
        </FormContainer>

        <Divider />

        <SnsLoginArea>
          <SNSButton id="naverIdLogin" />
        </SnsLoginArea>
      </MainBox>
    </Bg>
  );
}

/* ───── styled ───── */
const Bg = styled.div`
  min-height: 100vh;
  background: #f4f4f4;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 0.1rem 1rem 3rem;
`;

const MainBox = styled.div`
  background: #ffffff;
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
    letter-spacing: 0.03em;
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
  color: #333;
  font-size: 1rem;
  &::placeholder {
    color: #aaa;
  }
  &:focus {
    outline: none;
  }
`;

const RadioWrap = styled.div`
  display: flex;
  gap: 1.2rem;
  label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.95rem;
    input {
      accent-color: #ffc107;
      transform: translateY(1px);
    }
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 1rem;
  background: #ffc107;
  color: #1a1a1a;
  font-weight: bold;
  font-size: 1.1rem;
  border: none;
  border-radius: 0.6rem;
  margin-top: 1rem;
  cursor: pointer;
  transition: background 0.25s ease;
  &:hover {
    background: #ffd54f;
  }
`;

const PwInfo = styled.div`
  font-size: 0.9rem;
  color: ${({ $match }) => ($match ? "#33b96f" : "#f26a6a")};
  margin-bottom: 1rem;
`;

const Divider = styled.hr`
  margin: 2rem 0 1.2rem;
  border: none;
  border-top: 1px solid #ccc;
`;

const SnsLoginArea = styled.div`
  display: flex;
  justify-content: center;
`;

const SNSButton = styled.div`
  width: 100%;
  max-width: 240px;
  height: 48px;
`;
