/* ───────────── src/pages/Logout.jsx ───────────── */
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import { clearVisualizationCache, clearRecommendationCache } from "../api/mcp";
import { useAuth } from "../contexts/AuthContext"; // AuthContext 사용

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://192.168.101.51:8000";

export default function LogoutPage() {
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth(); // AuthContext의 logout 함수 사용

  useEffect(() => {
    const logout = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          // 로그아웃 API 호출
          await axios.post(
            `${BASE_URL}/auth/logout`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // 캐시 초기화 API 호출
          try {
            await Promise.all([
              clearVisualizationCache(token),
              clearRecommendationCache(token)
            ]);
            console.log("✅ 캐시 초기화 완료");
          } catch (cacheError) {
            console.error("❌ 캐시 초기화 실패:", cacheError);
          }
        }
      } catch (err) {
        console.error("❌ 로그아웃 API 실패:", err);
      } finally {
        // AuthContext의 logout 함수 사용 (페이지 새로고침 없이)
        authLogout();
        
        // 홈화면으로 이동
        navigate("/", { replace: true });
      }
    };

    // 즉시 로그아웃 실행
    logout();
  }, [navigate, authLogout]);

  return (
    <Container>
      <LogoutMessage>
        <h2>로그아웃 중...</h2>
      </LogoutMessage>
    </Container>
  );
}

/* ───────── styled-components ───────── */
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f4f4f4;
`;

const LogoutMessage = styled.div`
  text-align: center;
  
  h2 {
    color: #666;
    font-size: 1.2rem;
  }
`;