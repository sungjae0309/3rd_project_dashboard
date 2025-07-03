// src/components/aijob.jsx
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import MainContent from "./maincontent";

export default function Aijob() {
  const [selectedPage, setSelectedPage] = useState("dashboard"); // 대시보드 시작
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false); // 다크모드 상태

  const toggleTheme = () => setDarkMode((prev) => !prev); // 스위치 버튼 핸들러

  return (
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
      />
    </div>
  );
}
