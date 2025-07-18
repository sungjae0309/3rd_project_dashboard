/* ───────────── src/pages/Logout.jsx ───────────── */
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://192.168.101.51:8000";

export default function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          await axios.post(
            `${BASE_URL}/auth/logout`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
      } catch (err) {
        console.error("❌ 로그아웃 API 실패:", err);
      } finally {
        // 모든 로컬 스토리지 데이터 삭제
        const userId = localStorage.getItem("userId");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("chatSessionId");
        localStorage.removeItem("lastSelectedPage");
        
        // 사용자별 캐시된 추천 공고도 삭제
        if (userId) {
          localStorage.removeItem(`cachedRecommendations_${userId}`);
        }

        // 즉시 홈화면으로 이동 (SPA 방식)
        navigate("/", { replace: true });
      }
    };

    // 즉시 로그아웃 실행
    logout();
  }, [navigate]);

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
