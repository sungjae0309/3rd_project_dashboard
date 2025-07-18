import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaBookmark } from 'react-icons/fa';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://192.168.101.51:8000";
export default function RoadmapList({ category, onSelectRoadmap, onBack, darkMode }) {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ✨ 1. 내가 찜한 로드맵의 ID를 저장할 상태 추가
  const [savedRoadmapIds, setSavedRoadmapIds] = useState(new Set());

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("accessToken");

        // ✨ 2. 로그인 상태일 경우, 내가 찜한 로드맵 ID 목록을 미리 불러옵니다.
        if (token) {
          const savedRes = await axios.get(`${BASE_URL}/user_roadmaps/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (Array.isArray(savedRes.data)) {
            setSavedRoadmapIds(new Set(savedRes.data.map(item => item.roadmaps_id)));
          }
        }

        // 전체 로드맵 목록을 불러옵니다.
        const res = await axios.get(`${BASE_URL}/roadmaps/`);
        const filtered = Array.isArray(res.data) ? res.data.filter(r => r.type === category) : [];
        setRoadmaps(filtered);

      } catch (err) {
        setError("로드맵 목록을 불러오는 데 실패했습니다.");
        console.error("데이터 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [category]);

  const handleSaveRoadmap = async (roadmapId) => {
    // ✨ 3. 이미 찜한 항목은 API 호출을 막습니다.
    if (savedRoadmapIds.has(roadmapId)) {
      alert("이미 찜한 로드맵입니다.");
      return;
    }

    const token = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      alert("로그인이 필요합니다. 다시 로그인해주세요.");
      return;
    }

    try {
      await axios.post(`${BASE_URL}/user_roadmaps/`, {
        user_id: parseInt(userId, 10),
        roadmaps_id: roadmapId,
      }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
      });
      alert("로드맵이 찜 되었습니다!");
      // ✨ 4. 찜하기 성공 후, 화면에 바로 반영합니다.
      setSavedRoadmapIds(prev => new Set(prev).add(roadmapId));
    } catch (err) {
      console.error("❌ 찜하기 API 호출 실패:", err.response); 
      if (err.response?.status === 400) {
        alert("이미 찜한 로드맵이거나, 처리 중 오류가 발생했습니다.");
      } else {
        alert("찜하기에 실패했습니다.");
      }
    }
  };

  return (
    <Container $darkMode={darkMode}>
      <Header $darkMode={darkMode}>
        <BackButton onClick={onBack} $darkMode={darkMode}>
          <FaArrowLeft /> 뒤로가기
        </BackButton>
        <h2>{category} 목록</h2>
      </Header>
      {loading && <p>목록을 불러오는 중...</p>}
      {error && <p style={{ color: 'red' }}>오류: {error}</p>}
      {!loading && !error && (
        <List>
          {roadmaps.map((roadmap) => {
            // ✨ 5. 현재 로드맵이 찜한 상태인지 확인합니다.
            const isSaved = savedRoadmapIds.has(roadmap.id);
            return (
              <Card key={roadmap.id} $darkMode={darkMode}>
                <CardContent onClick={() => onSelectRoadmap(roadmap.id)}>
                  <Company>{roadmap.company}</Company>
                  <Title>{roadmap.name}</Title>
                  <Status $status={roadmap.status}>{roadmap.status}</Status>
                </CardContent>
                {/* ✨ 6. 찜 상태(isSaved)에 따라 버튼 스타일을 다르게 적용합니다. */}
                <SaveButton 
                  isSaved={isSaved}
                  onClick={() => handleSaveRoadmap(roadmap.id)}
                >
                  <FaBookmark />
                </SaveButton>
              </Card>
            );
          })}
        </List>
      )}
    </Container>
  );
}

/* ───── 스타일 ───── */
const Container = styled.div`
  padding: 2rem;
  min-height: 100vh;
  background: ${({ $darkMode }) => ($darkMode ? '#121212' : '#f8f9fa')};
`;
const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.8rem;
  h2 {
    font-size: 1.6rem;
    color: ${({ $darkMode }) => ($darkMode ? '#eee' : '#333')};
  }
`;
const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border: none;
  background: none;
  font-size: 0.9rem;
  cursor: pointer;
  color: ${({ $darkMode }) => ($darkMode ? '#ffc107' : '#614f25')};
   &:hover {
    opacity: 0.8;
  }
`;
const List = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;
const Card = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${({ $darkMode }) => ($darkMode ? '#2a2a2a' : '#fff')};
  border-radius: 0.8rem;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: all 0.2s ease-in-out;
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#444' : '#eee')};
`;
const CardContent = styled.div`
  cursor: pointer;
  flex: 1;
`;
const Company = styled.p`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ $darkMode }) => ($darkMode ? '#bbb' : '#666')};
  margin: 0 0 0.5rem;
`;
const Title = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${({ $darkMode }) => ($darkMode ? '#fff' : '#000')};
  margin: 0 0 1rem;
`;
const Status = styled.span`
  background: #ffc107;
  color: #000;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
`;
const SaveButton = styled.button`
  background: ${({ isSaved }) => (isSaved ? '#ffc107' : 'none')};
  border: 2px solid ${({ isSaved, $darkMode }) => (isSaved ? '#ffc107' : $darkMode ? '#555' : '#eee')};
  color: ${({ isSaved, $darkMode }) => (isSaved ? '#fff' : $darkMode ? '#999' : '#ccc')};
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1rem;
  cursor: ${({ isSaved }) => (isSaved ? 'default' : 'pointer')};
  transition: all 0.2s;
  
  &:hover {
    ${({ isSaved }) => !isSaved && `
      background: #ffc107;
      color: #fff;
      border-color: #ffc107;
    `}
  }
`;