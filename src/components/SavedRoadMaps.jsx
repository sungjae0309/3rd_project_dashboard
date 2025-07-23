import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FaHeart, FaTrashAlt } from "react-icons/fa";
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://192.168.101.51:8000";

// ✨ 1. [수정] props로 setSavedRoadmaps 대신 savedRoadmaps를 받습니다.
export default function SavedRoadmaps({ darkMode, userId, onRoadmapDetail, savedRoadmaps, title = "찜한 로드맵" }) {
  // ✨ 2. [삭제] 컴포넌트 내부의 모든 상태와 데이터 fetching 로직을 삭제합니다.
  // const [savedRoadmaps, setSavedRoadmaps] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [refreshKey, setRefreshKey] = useState(0);
  // const fetchSavedRoadmaps = useCallback(...);
  // useEffect(...);
  // ✨ [수정] 탭 기능을 제거하고 모든 로드맵을 하나로 표시합니다.
  // const [activeTab, setActiveTab] = useState('all');





  const handleDelete = async (roadmapIdToDelete) => {
    // ✨ [추가] 디버깅을 위해 현재 토큰 값을 콘솔에 출력합니다.
    const token = localStorage.getItem("accessToken");
    console.log("찜하기 버튼 클릭 시 토큰:", token);
    
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!window.confirm("이 로드맵을 찜 목록에서 삭제하시겠습니까?")) {
      return;
    }
    try {
      await axios.delete(`${BASE_URL}/user_roadmaps/${roadmapIdToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("찜이 해제되었습니다.");
      // ✨ 3. [수정] 상태를 직접 변경하는 대신, MainContent에 변경 신호를 보냅니다.
      window.dispatchEvent(new CustomEvent('roadmapBookmarkChanged'));
    } catch (error) {
      console.error("찜 해제 실패:", error);
      alert("찜 해제에 실패했습니다.");
    }
  };
  
  const handleViewDetail = (roadmapId) => {
    // navigate 대신 onRoadmapDetail 콜백 사용
    if (onRoadmapDetail) {
      onRoadmapDetail(roadmapId);
    }
  };





  // ✨ [수정] 부트캠프와 강의 분류를 제거하고 모든 로드맵을 하나로 표시합니다.
  // const bootcamps = savedRoadmaps.filter(item => item.roadmap?.type === '부트캠프');
  // const courses = savedRoadmaps.filter(item => item.roadmap?.type === '강의');

  return (
    <div>
      <Header $darkMode={darkMode}>
        <FaHeart /> {title} <span>{savedRoadmaps.length}개</span>
      </Header>

      {savedRoadmaps.length === 0 ? (
        <Empty>찜한 {title.includes('부트캠프') ? '부트캠프' : title.includes('강의') ? '강의' : '로드맵'}이 없습니다.</Empty>
      ) : (
        <Grid>
          {savedRoadmaps.map((item) => (
            <Card key={item.roadmaps_id} $darkMode={darkMode}>
              <Content onClick={() => handleViewDetail(item.roadmap?.id)}>
                <TypeBadge $type={item.roadmap?.type}>
                  {item.roadmap?.type === '부트캠프' ? '🎓' : '📚'} {item.roadmap?.type}
                </TypeBadge>
                <Company>{item.roadmap?.company}</Company>
                <Title>{item.roadmap?.name}</Title>
              </Content>
              <DeleteBtn onClick={() => handleDelete(item.roadmaps_id)}>
                <FaTrashAlt />
              </DeleteBtn>
            </Card>
          ))}
        </Grid>
      )}
    </div>
  );
}

/* ───── 스타일 (기존과 동일) ───── */
const Header = styled.h2`
  font-size: 1.5rem; margin-bottom: 1.6rem; display: flex; align-items: center; gap: 0.6rem;
  color: ${({ $darkMode }) => $darkMode ? '#eee' : '#333'};
  span { font-size: 1rem; color: #999; }
  svg { color: #ff4d4d; }
`;
const Empty = styled.div`
  text-align: center; padding: 3rem; color: #888; font-size: 1rem;
`;
const Grid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;
`;
const Card = styled.div`
  position: relative; border-radius: 1rem; padding: 1.5rem;
  background: ${({ $darkMode }) => ($darkMode ? "#2a2a2a" : "#fff")};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#eee")};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex; justify-content: space-between; align-items: flex-start;
`;
const Content = styled.div`
  cursor: pointer; flex: 1;
`;
const Title = styled.div`
  font-weight: 700; font-size: 1.1rem; margin-bottom: 0.4rem;
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#000'};
`;
const Company = styled.div`
  font-size: 0.9rem; margin-bottom: 0.5rem; color: #888;
`;
const DeleteBtn = styled.button`
  background: none; border: none; color: #aaa; cursor: pointer; font-size: 1rem; padding: 0.5rem;
  &:hover { color: #ff6b6b; }
`;

// ✨ [삭제] 사용하지 않는 탭 관련 스타일 컴포넌트들을 제거합니다.
// const TabContainer = styled.div`...`;
// const TabButton = styled.button`...`;

const TypeBadge = styled.div`
  display: inline-block;
  background: ${({ $type }) => $type === '부트캠프' ? '#ffa500' : '#28a745'};
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.7rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;