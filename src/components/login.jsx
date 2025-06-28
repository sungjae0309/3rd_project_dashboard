import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // 입력값 변경 핸들러
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // 로그인 버튼 클릭
  const handleLogin = async () => {
    if (!form.email || !form.password) {
      alert("이메일과 비밀번호를 입력해주세요.");
      navigate("/registernext");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://192.168.101.36:8000/auth/login", {
        email: form.email,
        password: form.password
      });
      // 토큰 저장 (localStorage 예시)
      localStorage.setItem("accessToken", res.data.access_token);
      alert("로그인 성공!");
      
      navigate("/"); // 대시보드로 이동
    } catch (err) {
      alert("로그인 실패: " + (err.response?.data?.detail || err.message));
    }
    setLoading(false);
  };

  const goToSignup = () => {
    navigate("/register");
  };

  return (
    <LoginContainer>
      <LoginBox>
        <Title>로그인</Title>
        <Input
          type="text"
          name="email"
          placeholder="이메일 입력"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
        />
        <Input
          type="password"
          name="password"
          placeholder="비밀번호"
          value={form.password}
          onChange={handleChange}
          autoComplete="current-password"
          onKeyDown={e => { if (e.key === "Enter") handleLogin(); }}
        />
        <LoginButton onClick={handleLogin} disabled={loading}>
          {loading ? "로딩 중..." : "완료"}
        </LoginButton>
        <SignupLink>
          아직 계정이 없으신가요? <a onClick={goToSignup}>회원가입</a>
        </SignupLink>
      </LoginBox>
    </LoginContainer>
  );
}

// ------ 스타일 (네 코드 그대로) ------
const LoginContainer = styled.div`
  background-color: #1c1c1c;
  color: white;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LoginBox = styled.div`
  background-color: #2b2b2b;
  padding: 3rem 4rem;
  border-radius: 16px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  text-align: center;
`;

const Title = styled.h1`
  color: #ffc107;
  margin-bottom: 2rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: none;
  border-radius: 8px;
  background-color: #3a3a3a;
  color: white;
  font-size: 1rem;

  &:focus {
    outline: 2px solid #ffc107;
  }
`;

const LoginButton = styled.button`
  background-color: #ffc107;
  color: #1c1c1c;
  font-weight: bold;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  margin-top: 1rem;

  &:hover {
    background-color: #e6b106;
  }
  &:disabled {
    background: #999; cursor: not-allowed;
  }
`;

const SignupLink = styled.p`
  color: #aaa;
  margin-top: 1.5rem;
  font-size: 0.9rem;

  a {
    color: #ffc107;
    text-decoration: underline;
    cursor: pointer;
  }
`;
