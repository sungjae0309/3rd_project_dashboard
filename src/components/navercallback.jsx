import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function NaverCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // 1. URL 해시에서 access_token 추출
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.slice(1)); // #access_token=... 제거 후 파싱
    const accessToken = params.get("access_token");

    if (!accessToken) {
      alert("토큰이 없습니다. 다시 로그인 해주세요.");
      navigate("/register");
      return;
    }

    // 2. 테스트용으로 access_token 로컬에 저장하고 바로 홈으로 이동
    console.log("✅ 네이버 로그인 성공! 토큰:", accessToken);
    localStorage.setItem("accessToken", accessToken);

    alert("네이버 로그인 테스트 성공! 홈으로 이동합니다.");
    navigate("/aijob"); // 또는 원하는 페이지: "/registernext" 등
  }, [navigate]);

  return (
    <div style={{ color: "#fff", textAlign: "center", marginTop: "30vh" }}>
      네이버 인증 처리 중…
    </div>
  );
}
