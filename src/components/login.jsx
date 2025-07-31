import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";

import { useAuth } from "../contexts/AuthContext"; // 

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const { login } = useAuth(); 

  // ───── 네이버 SDK 로드 ─────
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://static.nid.naver.com/js/naveridlogin_js_sdk_2.0.2.js";
    script.async = true;
    script.onload = initNaver;
    document.head.appendChild(script);
  }, []);

  const initNaver = () => {
    if (!window.naver) return;
    new window.naver.LoginWithNaverId({
      clientId: process.env.REACT_APP_NAVER_CLIENT_ID,
      callbackUrl: `${window.location.origin}/navercallback`,
      isPopup: false,
      loginButton: { color: "green", type: 3, height: 48 },
      callbackHandle: true, // 콜백 처리를 위한 설정 추가
    }).init();
  };

  // ───── 입력 핸들러 ─────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ───── 로그인 요청 ─────
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = new URLSearchParams();
      payload.append("username", formData.username);
      payload.append("password", formData.password);
  
      const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://192.168.101.7:8000';
  
      const { data: tokenRes } = await axios.post(
        `${BASE_URL}/token`,
        payload,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
  
      const token = tokenRes.access_token;
  
      const { data: userRes } = await axios.get(
        `${BASE_URL}/users/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // 👇 [핵심] 이 함수를 호출하여 앱의 전역 로그인 상태를 즉시 업데이트합니다.
      login(token, userRes.id);
  
      alert("로그인 성공!");
      navigate("/"); // 홈으로 이동
  
    } catch (err) {
      console.error("로그인 실패:", err.response?.data || err.message);
      alert("로그인 실패: " + (err.response?.data?.detail || err.message));
    }
  };
  

  return (
    <Bg>
      <MainBox>
        <Header>
          <h1>로그인</h1>
        </Header>

        <FormContainer onSubmit={handleSubmit}>
          <InputGroup>
            <Icon>
              <FaUser />
            </Icon>
            <Input
              name="username"
              placeholder="아이디 또는 이메일"
              value={formData.username}
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

          <SubmitBtn type="submit">로그인</SubmitBtn>

          <SignupText>
            계정이 없으신가요?{" "}
            <a onClick={() => navigate("/register")}>회원가입</a>
          </SignupText>

          <Divider />
          <SnsLoginArea>
            <SNSButton id="naverIdLogin" />
          </SnsLoginArea>
        </FormContainer>
      </MainBox>
    </Bg>
  );
}

/* ───── styled-components ───── */
const Bg = styled.div`
  min-height: 100vh;
  background: #f4f4f4;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem 1rem;
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
  background: transparent;
`;

const SignupText = styled.div`
  margin-top: 1.8rem;
  text-align: center;
  font-size: 0.95rem;
  color: #555;

  a {
    color: #0076ff;
    font-weight: 600;
    margin-left: 0.4rem;
    cursor: pointer;
    text-decoration: underline;
    &:hover {
      color: #0055cc;
    }
  }
`;