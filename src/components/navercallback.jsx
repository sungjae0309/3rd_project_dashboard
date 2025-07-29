import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://192.168.101.51:8000';

export default function NaverCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleNaverCallback = async () => {
      try {
        // 1. URL에서 code와 state 파라미터 추출
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const state = urlParams.get("state");

        if (!code || !state) {
          throw new Error("네이버 인증 코드가 없습니다. 다시 로그인해주세요.");
        }

        console.log("✅ 네이버 인증 코드 받음:", { code, state });

        // 2. 기존 회원인지 확인 (POST /naver/login)
        try {
          const loginResponse = await axios.post(`${BASE_URL}/naver/login`, {
            code: code,
            state: state
          });

          console.log("✅ 기존 회원 로그인 성공:", loginResponse.data);
          
          // 로그인 성공 - 토큰 저장 및 홈으로 이동
          const { access_token, token_type } = loginResponse.data;
          login(access_token, null); // userId는 나중에 /users/me에서 가져올 수 있음
          
          alert("네이버 로그인 성공!");
          navigate("/aijob");
          return;

        } catch (loginError) {
          // 기존 회원이 아닌 경우 (422 에러 등)
          console.log("기존 회원이 아님, 회원가입 진행:", loginError.response?.status);
          
          // 3. 신규 회원가입 (POST /users/signup/naver)
          const signupResponse = await axios.post(`${BASE_URL}/users/signup/naver`, {
            code: code,
            state: state
          });

          console.log("✅ 신규 회원가입 성공:", signupResponse.data);
          
          // 회원가입 후 자동 로그인 처리
          const { id, email, nickname, name, phone_number, created_at } = signupResponse.data;
          
          // 회원가입 성공 후 다시 로그인 API 호출하여 토큰 받기
          const finalLoginResponse = await axios.post(`${BASE_URL}/naver/login`, {
            code: code,
            state: state
          });

          const { access_token, token_type } = finalLoginResponse.data;
          login(access_token, id);
          
          alert("네이버 회원가입 및 로그인 성공!");
          navigate("/aijob");
        }

      } catch (err) {
        console.error("❌ 네이버 로그인/회원가입 실패:", err);
        
        let errorMessage = "네이버 로그인 중 오류가 발생했습니다.";
        
        if (err.response?.status === 422) {
          errorMessage = "입력 정보가 올바르지 않습니다.";
        } else if (err.response?.status === 401) {
          errorMessage = "인증에 실패했습니다.";
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        alert(errorMessage);
        
        // 에러 발생 시 로그인 페이지로 이동
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleNaverCallback();
  }, [navigate, login]);

  if (error) {
    return (
      <div style={{ 
        color: "#fff", 
        textAlign: "center", 
        marginTop: "30vh",
        padding: "20px"
      }}>
        <h3>오류 발생</h3>
        <p>{error}</p>
        <p>로그인 페이지로 이동합니다...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      color: "#fff", 
      textAlign: "center", 
      marginTop: "30vh",
      padding: "20px"
    }}>
      {isProcessing ? (
        <>
          <h3>네이버 인증 처리 중...</h3>
          <p>잠시만 기다려주세요.</p>
        </>
      ) : (
        <>
          <h3>처리 완료</h3>
          <p>페이지를 이동합니다...</p>
        </>
      )}
    </div>
  );
}
