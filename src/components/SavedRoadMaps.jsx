import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FaHeart, FaTrashAlt } from "react-icons/fa";
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://192.168.101.51:8000";
export default function SavedRoadmaps({ darkMode, userId, onRoadmapDetail }) {
  const [savedRoadmaps, setSavedRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedRoadmaps = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!userId || !token) {
      setSavedRoadmaps([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/user_roadmaps/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("✅ API 응답 원본 데이터:", response.data);

      const items = Array.isArray(response.data.items) ? response.data.items : response.data;

      if (Array.isArray(items)) {
        setSavedRoadmaps(items);
        console.log("✅ 최종적으로 화면에 표시될 목록:", items);
      } else {
        console.error("API 응답 데이터가 배열 형식이 아닙니다:", items);
        setSavedRoadmaps([]);
      }
    } catch (error) {
      console.error("찜한 로드맵 불러오기 실패:", error);
      setSavedRoadmaps([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSavedRoadmaps();
  }, [fetchSavedRoadmaps]);

  const handleDelete = async (roadmapIdToDelete) => {
    const token = localStorage.getItem("accessToken");
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
      setSavedRoadmaps(prev => prev.filter(item => item.roadmap.id !== roadmapIdToDelete));
      alert("찜이 해제되었습니다.");
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

  if (loading) return <p>찜한 로드맵을 불러오는 중...</p>;

  return (
    <div>
      <Header $darkMode={darkMode}>
        <FaHeart /> 찜한 로드맵 <span>{savedRoadmaps.length}개</span>
      </Header>
      {savedRoadmaps.length === 0 ? (
        <Empty>찜한 로드맵이 없습니다.</Empty>
      ) : (
        <Grid>
          {savedRoadmaps.map((item) => (
            <Card key={item.id} $darkMode={darkMode}>
              <Content onClick={() => handleViewDetail(item.roadmap.id)}>
                <Company>{item.roadmap.company}</Company>
                <Title>{item.roadmap.name}</Title>
              </Content>
              <DeleteBtn onClick={() => handleDelete(item.roadmap.id)}>
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