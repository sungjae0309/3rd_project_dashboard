
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import MainContent from "./maincontent";
import { useLocation } from "react-router-dom";
import { RecommendationProvider } from "./RecommendationContext";

export default function Aijob() {
  // localStorage에서 마지막 페이지 복원
  const [selectedPage, setSelectedPage] = useState(() => {
    return localStorage.getItem("lastSelectedPage") || "dashboard";
  });
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const location = useLocation();

  // 로그인 정보 상태화
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  // localStorage에서 읽기 + 유저 정보 API 호출(필요하면)
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const storedUserId = localStorage.getItem("userId");

    setToken(storedToken);
    setUserId(storedUserId);

    // 만약 userId가 없다면 API 호출로 받기
    // (여기서도 axios 쓸 수 있음)
  }, []);

  // 페이지 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem("lastSelectedPage", selectedPage);
  }, [selectedPage]);

  useEffect(() => {
    const state = location.state;
    if (state?.goTo === "search") setSelectedPage("search");
    else if (state?.goTo === "saved") setSelectedPage("saved");
  }, [location.state]);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  return (
    <RecommendationProvider>
    <div style={{ display: "flex" }}>
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
        darkMode={darkMode}
      />
      <MainContent
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
        userId={userId}
        token={token}
      />
    </div>
    </RecommendationProvider>
  );
}
