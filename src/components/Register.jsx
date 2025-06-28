import React, { useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  /* 1) SDK 로드 & 버튼 초기화 */
  useEffect(() => {
    // SDK 스크립트 주입
    const script = document.createElement("script");
    script.src =
      "https://static.nid.naver.com/js/naveridlogin_js_sdk_2.0.2.js"; // 최신 2.0.2 SDK :contentReference[oaicite:0]{index=0}
    script.async = true;
    script.onload = initNaver;
    document.head.appendChild(script);
  }, []);

  /* 2) 네이버 버튼 생성 */
  const initNaver = () => {
    if (!window.naver) return;

    const naverLogin = new window.naver.LoginWithNaverId({
      clientId: process.env.REACT_APP_NAVER_CLIENT_ID,
      callbackUrl: `${window.location.origin}/navercallback`,
      isPopup: false, // 팝업 대신 리다이렉트
      loginButton: { color: "green", type: 3, height: 48 }, // 기본 버튼 커스터마이징
    });
    naverLogin.init();
  };

  return (
    <Bg>
      <MainBox>
        <Header>
          <h1>네이버로 간편 가입</h1>
        </Header>

        {/* SDK가 이 div를 찾아서 버튼을 자동 렌더링 */}
        <div id="naverIdLogin" style={{ textAlign: "center" }} />
      </MainBox>
    </Bg>
  );
}


// ------ styled-components (네가 올린 거 그대로) ------
const Bg = styled.div`
  min-height: 100vh;
  background: #1e1e1e;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 2rem;
`;

const MainBox = styled.div`
  background: rgb(80, 79, 79);
  border-radius: 2rem;
  box-shadow: 0 3px 18px 0 #0002;
  width: 35rem;
  max-width: 97vw;
  margin-bottom: 3rem;
  padding-bottom: 2.2rem;
  color: #fff;
  position: relative;
`;

const TopBar = styled.div`
  width: 100%;
  padding: 1.5rem 2.3rem 0 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LogoArea = styled.div`
  display: flex; align-items: center;
`;

const JobMark = styled.span`
  font-size: 2.5rem;
  font-weight: bold;
  letter-spacing: -0.01em;
  color: #ffc107;
`;

const Header = styled.div`
  padding: 1.7rem 2.5rem 0.6rem 2.5rem;
  text-align: center;
  h1 {
    color: #ffc107;
    font-size: 2.2rem;
    font-weight: bold;
    margin-bottom: 0.4rem;
    letter-spacing: 0.03em;
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 2px solid #f0f0f0;
  margin: 1.2rem auto 2.2rem auto;
  width: 87%;
`;

const FormContainer = styled.form`
  padding: 0 2.5rem;
`;

const Section = styled.section`
  margin-bottom: 2.1rem;
`;

const Label = styled.label`
  min-width: 6rem;
  font-size: 1.01rem;
  font-weight: 500;
  color: #fff;
  display: block;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.85rem 1.1rem;
  border-radius: 0.6rem;
  border: none;
  background: #222;
  color: #fff;
  font-size: 1.13rem;
  height: 48px;
  &::placeholder { color: #aaa; }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.85rem;
  border-radius: 0.6rem;
  border: none;
  background: #222;
  color: #fff;
  font-size: 1.13rem;
  height: 48px;
`;

const PwInfo = styled.div`
  font-size: 0.96rem;
  margin: 0.5rem 0 0 0;
  color: ${({ $match }) => $match ? "#7bed7b" : "#e55b5b"};
  font-weight: 500;
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 1.1rem;
  background: #ffc107;
  color: #232323;
  border: none;
  border-radius: 0.7rem;
  font-size: 1.08rem;
  font-weight: bold;
  margin-top: 2rem;
  cursor: pointer;
  &:hover {
    background: #ffd955;
  }
`;

const EmailDropdownArea = styled.div`
  position: absolute;
  top: 3.1rem;
  left: 0;
  width: 100%;
  z-index: 15;
  background: #232323;
  border: none;
  border-radius: 0.55rem;
  box-shadow: 0 4px 16px 0 #0008;
  padding: 0.35rem 0.4rem;
  font-size: 1.07rem;
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
`;

const EmailDropdownItem = styled.div`
  padding: 0.7rem 1rem 0.7rem 1.3rem;
  color: #fff;
  background: transparent;
  border-radius: 0.35rem;
  cursor: pointer;
  &:hover { background: #222; }
`;
