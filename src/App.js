// ───────── src/App.js ─────────
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
  Navigate,
} from "react-router-dom";
import Register from "./components/Register";
import RegisterNext from "./pages/RegisterNext";
import Logout from "./components/logout";
import Login from "./components/login";
import Aijob from "./components/aijob";
import NaverCallback from "./components/navercallback";


import AiJobRecommendation from "./components/AiJobRecommendation";
import CareerPlanFlow from "./components/CareerPlanFlow"; 
import CareerRoadmapDetail from "./components/CareerRoadmapDetail"; 


// OvercomeDetail은 CareerPlanFlow로 대체되므로 주석 처리하거나 제거할 수 있습니다.
// import OvercomeDetail from "./components/OvercomeDetail"; 

import GapDetail from "./components/GapDetail";
import TrendDetail from "./components/TrendDetail";
import SavedJobDetail from "./components/SavedJobDetail";

// 새로 추가된 컴포넌트
import ChatSessionsList from "./components/ChatSessionsList";
import ChatPage from "./components/ChatPage";
import MainContent from "./components/maincontent";
import Sidebar from "./components/Sidebar";

import RecommendationReason from "./components/RecommendationReason"; // RecommendationReason 컴포넌트 임포트
import { RecommendationProvider } from "./components/RecommendationContext"; // Provider 임포트
import { JobNamesProvider } from "./contexts/JobNamesContext"; // JobNames Provider 임포트
import { UserDataProvider } from "./contexts/UserDataContext"; // UserData Provider 임포트
import { RoadmapProvider } from "./contexts/RoadmapContext"; // Roadmap Provider 임포트
import { AuthProvider } from "./contexts/AuthContext"; // AuthProvider 임포트

import axios from 'axios';

// 모든 axios 요청에 ngrok 경고를 건너뛰는 헤더를 추가합니다.
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';
// 로드맵 흐름을 관리할 새로운 컨테이너 컴포넌트를 임포트합니다.



// 세션 아이디를 URL 파라미터로 받아서 ChatPage에 넘겨주는 래퍼
function ChatPageWrapper() {
  const { sessionId } = useParams();
  const token = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("userId"); // 혹은 다른 저장소에서 가져오기

  // 만약 세션 아이디나 토큰이 없으면 홈으로 리다이렉트
  if (!sessionId || !token || !userId) {
    return <Navigate to="/" replace />;
  }

  return (
    <ChatPage
      sessionId={sessionId}
      userId={userId}
      token={token}
    />
  );
}

export default function App() {
  // darkMode 상태가 App.js에 정의되어 있지 않아 임시로 false를 사용합니다.
  const darkMode = false; 
  // selectedPage, setSelectedPage 등 상태 추가 (필요시)
  const [selectedPage, setSelectedPage] = React.useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <AuthProvider>
    <UserDataProvider>
    <RoadmapProvider>
    <JobNamesProvider>
    <RecommendationProvider>
    <Router>
      <Routes>
        {/* 기존 라우트들 */}
        <Route path="/register" element={<Register />} />

        <Route path="/registernext" element={<RegisterNext />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/aijob" element={<Aijob />} />
        <Route path="/navercallback" element={<NaverCallback />} />
        <Route path="/aijobrecommendation" element={<AiJobRecommendation />} />

        {/* 채팅 세션 목록(대화 이력) */}
        <Route
          path="/chathistory"
          element={
            <ChatSessionsList
              userId={localStorage.getItem("userId")}
              token={localStorage.getItem("accessToken")}
              darkMode={darkMode}
              onSelect={(id) => {
                // 세션 선택 시 해당 URL로 네비게이트
                window.location.href = `/chat/${id}`;
              }}
            />
          }
        />

        {/* 선택된 세션의 실제 채팅 화면 */}
        <Route path="/chat/:sessionId" element={<ChatPageWrapper />} />

        {/* ───────── 수정된 부분 ───────── */}
        {/* 기존 OvercomeDetail 대신, 카테고리/목록/상세를 관리하는 CareerPlanFlow로 교체 */}
        <Route
          path="/aijob/career-summary/overcomedetail"
          element={<CareerPlanFlow darkMode={darkMode} />}
        />
        {/* ──────────────────────────── */}

        <Route
          path="/aijob/career-summary/gapdetail"
          element={<GapDetail />}
        />
        <Route
          path="/aijob/career-summary/trenddetail"
          element={<TrendDetail />}
        />

        <Route path="/job/:id" element={<SavedJobDetail />} />

        {/* ▼▼▼ 여기에 추천 이유 페이지를 위한 라우트를 추가합니다 ▼▼▼ */}
        <Route 
          path="/recommendation-reason/:jobId" 
          element={<RecommendationReason darkMode={darkMode} />} 
        />
        {/* ▲▲▲ 수정 완료 ▲▲▲ */}

        <Route path="/roadmap/:roadmapId" element={<CareerRoadmapDetail />} />
        {/* ▲▲▲ 여기까지 추가 ▲▲▲ */}

        {/* 홈(/) 경로에 Sidebar + MainContent 함께 렌더링 */}
        <Route path="/" element={
          <div style={{ display: 'flex' }}>
            <Sidebar
              collapsed={sidebarCollapsed}
              setCollapsed={setSidebarCollapsed}
              selectedPage={selectedPage}
              setSelectedPage={setSelectedPage}
              darkMode={darkMode}
            />
            <MainContent
              selectedPage={selectedPage}
              setSelectedPage={setSelectedPage}
              darkMode={darkMode}
              toggleTheme={() => {}} // 빈 함수로 전달
              sidebarCollapsed={sidebarCollapsed}
            />
          </div>
        } />
        {/* 그 외 없는 경로는 메인으로 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
    </RecommendationProvider>
    </JobNamesProvider>
    </RoadmapProvider>
    </UserDataProvider>
    </AuthProvider>
  );
}