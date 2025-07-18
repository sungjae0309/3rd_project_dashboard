import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaArrowLeft, FaBuilding, FaCalendarAlt, FaCheckCircle, FaLaptop, FaClock, FaBookOpen } from "react-icons/fa";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://192.168.101.51:8000";
const fetchRoadmapById = async (roadmapId) => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.get(`${BASE_URL}/roadmaps/${roadmapId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const InfoItem = ({ icon, label, value }) => (
  <InfoItemWrapper>
    <InfoLabel>{icon} {label}</InfoLabel>
    <InfoValue>{value}</InfoValue>
  </InfoItemWrapper>
);

export default function CareerRoadmapDetail({ roadmapId, onBack, darkMode }) { 
  const navigate = useNavigate();
  const location = useLocation();

  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!roadmapId) return;

    const getRoadmapDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchRoadmapById(roadmapId);
        setRoadmap(data);
      } catch (err) {
        setError("로드맵 정보를 불러오는 데 실패했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getRoadmapDetails();
  }, [roadmapId]);

  const handleBackClick = () => {
    if (location.state?.from === 'saved') {
      navigate('/aijob', { state: { goTo: 'saved', initialTab: 'roadmaps' } });
    } else if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  if (loading) return <PageWrapper><p>상세 정보를 불러오는 중...</p></PageWrapper>;
  if (error) return <PageWrapper><p style={{ color: 'red' }}>오류: {error}</p></PageWrapper>;
  if (!roadmap) return <PageWrapper><p>로드맵 정보를 찾을 수 없습니다.</p></PageWrapper>;

  const backButtonText = location.state?.from === 'saved' ? '찜한 로드맵' : '뒤로가기';

  return (
    <OverlayContainer $darkMode={darkMode}>
      <Card $darkMode={darkMode}>
        <BackBtn onClick={onBack} $darkMode={darkMode}>
          ← 뒤로가기
        </BackBtn>

        <SectionHeader>
            <LocalBack onClick={handleBackClick} $darkMode={darkMode}>
                <FaArrowLeft /> {backButtonText}
            </LocalBack>
            <div>
                <SubTitle><FaBuilding /> {roadmap.company}</SubTitle>
                <Title>{roadmap.name}</Title>
            </div>
        </SectionHeader>

        <InfoGrid>
            <InfoItem icon={<FaCheckCircle />} label="모집 상태" value={roadmap.status} />
            <InfoItem icon={<FaCalendarAlt />} label="모집 마감" value={formatDate(roadmap.deadline)} />
            <InfoItem icon={<FaCalendarAlt />} label="코스 기간" value={`${formatDate(roadmap.start_date)} ~ ${formatDate(roadmap.end_date)}`} />
            <InfoItem icon={<FaLaptop />} label="장소" value={`${roadmap.location} (${roadmap.onoff})`} />
            <InfoItem icon={<FaClock />} label="참여 시간" value={roadmap.participation_time} />
            <InfoItem icon={<FaBookOpen />} label="코스 분야" value={roadmap.program_course} />
        </InfoGrid>

        <SkillsSection>
            <h3><span role="img" aria-label="tools">��️</span> 요구 기술 스택</h3>
            <SkillList>
            {(roadmap.skill_description || []).map((skill, index) => (
                <SkillTag key={index}>{skill}</SkillTag>
            ))}
            </SkillList>
        </SkillsSection>
      </Card>
    </OverlayContainer>
  );
}

/* ───── 스타일 (기존과 동일) ───── */
const PageWrapper = styled.div`
    min-height: 100vh;
    padding: 2rem;
    background: ${({ $darkMode }) => $darkMode ? '#121212' : '#f8f9fa'};
`;
const DetailCard = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  border-radius: 1rem;
  padding: 2.5rem 3rem;
  background: ${({ $darkMode }) => ($darkMode ? "#2a2a2a" : "#fff")};
  color: ${({ $darkMode }) => ($darkMode ? "#eee" : "#333")};
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;
const SectionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  border-bottom: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#eee")};
  padding-bottom: 1.5rem;
`;
const LocalBack = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  background: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  margin-top: 1rem;
  color: ${({ $darkMode }) => ($darkMode ? "#ffc107" : "#555")};
  &:hover { opacity: 0.8; }
`;
const SubTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#666")};
  margin: 0 0 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;
const Title = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
  color: ${({ $darkMode }) => ($darkMode ? "#fff" : "#000")};
`;
const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.8rem;
  margin-bottom: 2.5rem;
`;
const InfoItemWrapper = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? "#333" : "#fafafa")};
  padding: 1rem;
  border-radius: 0.5rem;
  border-left: 4px solid #ffc107;
`;
const InfoLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ $darkMode }) => ($darkMode ? "#aaa" : "#777")};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;
const InfoValue = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
  color: ${({ $darkMode }) => ($darkMode ? "#eee" : "#333")};
`;
const SkillsSection = styled.div`
  margin-top: 2.5rem;
  h3 {
    font-size: 1.4rem;
    margin-bottom: 1.2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: ${({ $darkMode }) => $darkMode ? '#eee' : '#333'};
  }
`;
const SkillList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
`;
const SkillTag = styled.span`
  background: #ffc107;
  color: #333;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 600;
`;

/* 상세 페이지 오버레이 스타일 추가 */
const OverlayContainer = styled.div`
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  background: ${({ $darkMode }) => $darkMode ? '#1a1a1a' : '#f8f6f1'};
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const Card = styled.div`
  position: relative;
  width: 100%;
  background: ${({ $darkMode }) => $darkMode ? '#2a2a2a' : '#fff'};
  border-radius: 1rem;
  padding: 2.5rem;
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
`;

const BackBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  background: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  margin-bottom: 2rem;
  color: ${({ $darkMode }) => ($darkMode ? "#ffc107" : "#555")};
  &:hover { opacity: 0.8; }
`;