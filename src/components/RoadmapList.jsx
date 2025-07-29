import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaBookmark, FaFilter, FaSearch, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaGraduationCap, FaBook, FaMoneyBillWave, FaExternalLinkAlt, FaPlay, FaStop } from 'react-icons/fa';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://192.168.101.51:8000";

export default function RoadmapList({ category, onSelectRoadmap, onBack, darkMode, onSaveRoadmap, onUnsaveRoadmap }) {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [sortBy, setSortBy] = useState('최신순');
  
  // ✨ 1. 내가 찜한 로드맵의 ID를 저장할 상태 추가
  const [savedRoadmapIds, setSavedRoadmapIds] = useState(new Set());

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("accessToken");

        if (!token) {
          setError("로그인이 필요합니다. 다시 로그인해주세요.");
          setLoading(false);
          return;
        }

        // ✨ 2. 로그인 상태일 경우, 내가 찜한 로드맵 ID 목록을 미리 불러옵니다.
        try {
          const savedRes = await axios.get(`${BASE_URL}/user_roadmaps/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (Array.isArray(savedRes.data)) {
            setSavedRoadmapIds(new Set(savedRes.data.map(item => item.roadmaps_id)));
          }
        } catch (savedErr) {
          console.warn("찜한 로드맵 목록 로드 실패:", savedErr);
          // 찜한 목록 로드 실패는 전체 로드 실패로 처리하지 않음
        }

        // 전체 로드맵 목록을 불러옵니다.
        const res = await axios.get(`${BASE_URL}/roadmaps/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!Array.isArray(res.data)) {
          setError("로드맵 데이터 형식이 올바르지 않습니다.");
          return;
        }
        
        const filtered = res.data.filter(r => r.type === category);
        setRoadmaps(filtered);

      } catch (err) {
        console.error("데이터 로딩 실패:", err);
        
        // HTML 응답을 받았을 때 (로그인 페이지로 리디렉션된 경우)
        if (err.response?.data && typeof err.response.data === 'string' && err.response.data.includes('<!DOCTYPE')) {
          setError("로그인이 필요합니다. 다시 로그인해주세요.");
        } else if (err.response?.status === 401) {
          setError("인증이 만료되었습니다. 다시 로그인해주세요.");
        } else if (err.response?.status === 404) {
          setError("로드맵 데이터를 찾을 수 없습니다.");
        } else if (err.response?.status === 403) {
          setError("접근 권한이 없습니다.");
        } else if (err.code === 'NETWORK_ERROR') {
          setError("네트워크 연결을 확인해주세요.");
        } else {
          setError("로드맵 목록을 불러오는 데 실패했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [category]);

  // ✨ [제거] 이벤트 기반 시스템 제거 - 이제 직접 콜백 방식 사용

  // 필터링 및 정렬된 로드맵 목록
  const filteredAndSortedRoadmaps = roadmaps
    .filter(roadmap => {
      const matchesSearch = roadmap.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           roadmap.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === '전체' || roadmap.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case '최신순':
          return new Date(b.deadline || 0) - new Date(a.deadline || 0);
        case '오래된순':
          return new Date(a.deadline || 0) - new Date(b.deadline || 0);
        case '가나다순':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const handleSaveRoadmap = async (roadmapId) => {
    // ✨ 3. 이미 찜한 항목은 API 호출을 막습니다.
    if (savedRoadmapIds.has(roadmapId)) {
      alert("이미 찜한 로드맵입니다.");
      return;
    }

    // ✨ [추가] 디버깅을 위해 현재 토큰 값을 콘솔에 출력합니다.
    const token = localStorage.getItem("accessToken");
    console.log("찜하기 버튼 클릭 시 토큰:", token);
    
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      alert("로그인이 필요합니다. 다시 로그인해주세요.");
      return;
    }

    try {
      const requestData = {
        roadmaps_id: roadmapId
      };
      
      console.log("📤 찜하기 요청 데이터:", requestData);
      console.log("📤 요청 URL:", `${BASE_URL}/user_roadmaps/`);
      console.log("📤 roadmapId 타입:", typeof roadmapId, roadmapId);
      
      const response = await axios.post(`${BASE_URL}/user_roadmaps/`, requestData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
      });
      
      if (response.status === 200 || response.status === 201) {
        alert("로드맵이 찜 되었습니다!");
        // ✨ 4. 찜하기 성공 후, 화면에 바로 반영합니다.
        setSavedRoadmapIds(prev => new Set(prev).add(roadmapId));
        
        // ✨ [수정] 공고와 동일한 방식으로 직접 콜백 호출하여 즉시 상태 업데이트
        const newSavedRoadmap = {
          id: response.data.id,
          roadmaps_id: roadmapId,
          roadmap: roadmaps.find(r => r.id === roadmapId)
        };
        
        // 직접 콜백 호출 (공고와 동일한 방식)
        if (onSaveRoadmap) {
          console.log("✅ 직접 콜백 호출로 즉시 상태 업데이트:", newSavedRoadmap);
          onSaveRoadmap(newSavedRoadmap);
        }
      }
    } catch (err) {
      console.error("❌ 찜하기 API 호출 실패:", err); 
      console.error("❌ 에러 응답:", err.response?.data);
      console.error("❌ 에러 상태:", err.response?.status);
      
      // HTML 응답을 받았을 때 (로그인 페이지로 리디렉션된 경우)
      if (err.response?.data && typeof err.response.data === 'string' && err.response.data.includes('<!DOCTYPE')) {
        alert("로그인이 필요합니다. 다시 로그인해주세요.");
      } else if (err.response?.status === 401) {
        alert("인증이 만료되었습니다. 다시 로그인해주세요.");
      } else if (err.response?.status === 400) {
        const errorMessage = err.response?.data?.detail || err.response?.data?.message || "이미 찜한 로드맵이거나, 처리 중 오류가 발생했습니다.";
        alert(`찜하기 실패: ${errorMessage}`);
      } else if (err.response?.status === 403) {
        alert("접근 권한이 없습니다.");
      } else if (err.response?.status === 404) {
        alert("로드맵을 찾을 수 없습니다.");
      } else if (err.response?.status === 422) {
        alert("잘못된 데이터 형식입니다.");
      } else if (err.code === 'NETWORK_ERROR') {
        alert("네트워크 연결을 확인해주세요.");
      } else {
        const errorMessage = err.response?.data?.detail || err.response?.data?.message || "찜하기에 실패했습니다.";
        alert(`찜하기 실패: ${errorMessage}`);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '날짜 없음';
    
    try {
      // 전처리된 날짜 형식이 있으면 사용, 없으면 ISO 형식 파싱
    const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '날짜 형식 오류';
      }
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    } catch (error) {
      return '날짜 형식 오류';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '모집중': return '#4CAF50';
      case '마감임박': return '#FF9800';
      case '마감': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getCategoryIcon = () => {
    return category === '부트캠프' ? <FaGraduationCap /> : <FaBook />;
  };

  return (
    <Container $darkMode={darkMode}>
      <Header $darkMode={darkMode}>
        <BackButton onClick={onBack} $darkMode={darkMode}>
          <FaArrowLeft /> 뒤로가기
        </BackButton>
        <HeaderContent>
          <HeaderTitle>
            {getCategoryIcon()} {category} 목록
          </HeaderTitle>
          <HeaderSubtitle>
            총 {filteredAndSortedRoadmaps.length}개의 {category}를 찾았습니다
          </HeaderSubtitle>
        </HeaderContent>
      </Header>

      {/* 검색 및 필터 섹션 */}
      <FilterSection $darkMode={darkMode}>
        <SearchBox $darkMode={darkMode}>
          <FaSearch />
          <SearchInput
            type="text"
            placeholder={`${category} 이름이나 기관명으로 검색...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            $darkMode={darkMode}
          />
        </SearchBox>
        
        <FilterControls $darkMode={darkMode}>
          <FilterGroup>
            <FilterLabel>상태:</FilterLabel>
            <FilterSelect 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              $darkMode={darkMode}
            >
              <option value="전체">전체</option>
              <option value="모집중">모집중</option>
              <option value="마감임박">마감임박</option>
              <option value="마감">마감</option>
            </FilterSelect>
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>정렬:</FilterLabel>
            <FilterSelect 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              $darkMode={darkMode}
            >
              <option value="최신순">최신순</option>
              <option value="오래된순">오래된순</option>
              <option value="가나다순">가나다순</option>
            </FilterSelect>
          </FilterGroup>
        </FilterControls>
      </FilterSection>

      {loading && (
        <LoadingMessage $darkMode={darkMode}>
          <LoadingSpinner />
          목록을 불러오는 중...
        </LoadingMessage>
      )}
      {error && (
        <ErrorMessage $darkMode={darkMode}>
          <ErrorIcon>⚠️</ErrorIcon>
          {error}
        </ErrorMessage>
      )}
      
      {!loading && !error && (
        <>
          {filteredAndSortedRoadmaps.length === 0 ? (
            <EmptyState $darkMode={darkMode}>
              <EmptyIcon>{getCategoryIcon()}</EmptyIcon>
              <EmptyTitle>검색 결과가 없습니다</EmptyTitle>
              <EmptyText>다른 검색어나 필터를 시도해보세요</EmptyText>
            </EmptyState>
          ) : (
            <List>
              {filteredAndSortedRoadmaps.map((roadmap) => {
                const isSaved = savedRoadmapIds.has(roadmap.id);
                return (
                  <Card key={roadmap.id} $darkMode={darkMode}>
                    <CardContent onClick={() => onSelectRoadmap(roadmap.id)}>
                      <CardHeader>
                        <Company>{roadmap.company}</Company>
                        <StatusBadge $status={roadmap.status} $color={getStatusColor(roadmap.status)}>
                          {roadmap.status}
                        </StatusBadge>
                      </CardHeader>
                      <Title>{roadmap.name}</Title>
                      <CardDetails>
                        <DetailItem>
                          <FaCalendarAlt />
                          <span>마감: {formatDate(roadmap.deadline_display || roadmap.deadline)}</span>
                        </DetailItem>
                        {roadmap.location && (
                          <DetailItem>
                            <FaMapMarkerAlt />
                            <span>{roadmap.location}</span>
                          </DetailItem>
                        )}
                        {roadmap.participation_time && (
                          <DetailItem>
                            <FaClock />
                            <span>{roadmap.participation_time}</span>
                          </DetailItem>
                        )}
                        {/* 강의에만 있는 필드들 */}
                        {roadmap.type === '강의' && roadmap.price && (
                          <DetailItem>
                            <FaMoneyBillWave />
                            <span>{roadmap.price}</span>
                          </DetailItem>
                        )}
                        {roadmap.type === '강의' && roadmap.url && (
                          <DetailItem>
                            <FaExternalLinkAlt />
                            <span>링크 있음</span>
                          </DetailItem>
                        )}
                        {/* 부트캠프에만 있는 필드들 */}
                        {roadmap.type === '부트캠프' && roadmap.start_date_display && (
                          <DetailItem>
                            <FaPlay />
                            <span>시작: {formatDate(roadmap.start_date_display)}</span>
                          </DetailItem>
                        )}
                        {roadmap.type === '부트캠프' && roadmap.end_date_display && (
                          <DetailItem>
                            <FaStop />
                            <span>종료: {formatDate(roadmap.end_date_display)}</span>
                          </DetailItem>
                        )}
                      </CardDetails>
                    </CardContent>
                    <SaveButton 
                      isSaved={isSaved}
                      onClick={() => handleSaveRoadmap(roadmap.id)}
                      title={isSaved ? "이미 찜한 로드맵입니다" : "찜하기"}
                    >
                      <FaBookmark />
                    </SaveButton>
                  </Card>
                );
              })}
            </List>
          )}
        </>
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
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid ${({ $darkMode }) => ($darkMode ? '#333' : '#eee')};
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
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ $darkMode }) => ($darkMode ? '#333' : '#f0f0f0')};
  }
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const HeaderTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${({ $darkMode }) => ($darkMode ? '#fff' : '#333')};
  margin: 0 0 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const HeaderSubtitle = styled.p`
  font-size: 1rem;
  color: ${({ $darkMode }) => ($darkMode ? '#ccc' : '#666')};
  margin: 0;
`;

const FilterSection = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: ${({ $darkMode }) => ($darkMode ? '#2a2a2a' : '#fff')};
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#444' : '#eee')};
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 1rem;
  background: ${({ $darkMode }) => ($darkMode ? '#333' : '#f8f9fa')};
  border-radius: 0.8rem;
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#555' : '#ddd')};
  margin-bottom: 1rem;
  
  svg {
    color: ${({ $darkMode }) => ($darkMode ? '#999' : '#666')};
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: none;
  font-size: 1rem;
  color: ${({ $darkMode }) => ($darkMode ? '#fff' : '#333')};
  outline: none;
  
  &::placeholder {
    color: ${({ $darkMode }) => ($darkMode ? '#999' : '#999')};
  }
`;

const FilterControls = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ $darkMode }) => ($darkMode ? '#ccc' : '#666')};
`;

const FilterSelect = styled.select`
  padding: 0.5rem 0.8rem;
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#555' : '#ddd')};
  border-radius: 0.5rem;
  background: ${({ $darkMode }) => ($darkMode ? '#333' : '#fff')};
  color: ${({ $darkMode }) => ($darkMode ? '#fff' : '#333')};
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
  
  &:focus {
    border-color: #ffc107;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 3rem;
  font-size: 1.1rem;
  color: ${({ $darkMode }) => ($darkMode ? '#ccc' : '#666')};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${({ $darkMode }) => ($darkMode ? '#333' : '#f0f0f0')};
  border-top: 4px solid #ffc107;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 3rem;
  font-size: 1.1rem;
  color: #f44336;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background: ${({ $darkMode }) => ($darkMode ? '#2a1a1a' : '#fff5f5')};
  border-radius: 1rem;
  border: 1px solid #f44336;
  margin: 1rem 0;
`;

const ErrorIcon = styled.div`
  font-size: 2rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${({ $darkMode }) => ($darkMode ? '#ccc' : '#666')};
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  color: ${({ $darkMode }) => ($darkMode ? '#fff' : '#333')};
`;

const EmptyText = styled.p`
  font-size: 1rem;
  opacity: 0.8;
`;

const List = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  background: ${({ $darkMode }) => ($darkMode ? '#2a2a2a' : '#fff')};
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: all 0.3s ease-in-out;
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#444' : '#eee')};
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    border-color: #ffc107;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #ffc107, #ffa500);
  }
`;

const CardContent = styled.div`
  cursor: pointer;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
`;

const Company = styled.p`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ $darkMode }) => ($darkMode ? '#ffc107' : '#ffa500')};
  margin: 0;
`;

const StatusBadge = styled.span`
  background: ${({ $color }) => $color};
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
`;

const Title = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${({ $darkMode }) => ($darkMode ? '#fff' : '#000')};
  margin: 0;
  line-height: 1.4;
`;

const CardDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: ${({ $darkMode }) => ($darkMode ? '#ccc' : '#666')};
  
  svg {
    color: #ffc107;
    font-size: 0.8rem;
  }
`;

const SaveButton = styled.button`
  background: ${({ isSaved }) => (isSaved ? '#ffc107' : 'none')};
  border: 2px solid ${({ isSaved, $darkMode }) => (isSaved ? '#ffc107' : $darkMode ? '#555' : '#eee')};
  color: ${({ isSaved, $darkMode }) => (isSaved ? '#333' : $darkMode ? '#999' : '#ccc')};
  width: 44px;
  height: 44px;
  border-radius: 50%;
  font-size: 1.1rem;
  cursor: ${({ isSaved }) => (isSaved ? 'default' : 'pointer')};
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
  
  &:hover {
    ${({ isSaved }) => !isSaved && `
      background: #ffc107;
      color: #333;
      border-color: #ffc107;
      transform: scale(1.1);
    `}
  }
`;