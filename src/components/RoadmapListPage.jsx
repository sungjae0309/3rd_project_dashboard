import React, { useState, useEffect } from "react";
import styled, { css } from "styled-components";
import { FaHeart, FaRegHeart, FaArrowLeft, FaTimes, FaMoneyBillWave, FaExternalLinkAlt } from "react-icons/fa";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://192.168.101.51:8000';

export default function RoadmapListPage({ darkMode, type, onRoadmapDetail, setSelectedPage }) {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedRoadmaps, setBookmarkedRoadmaps] = useState([]);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  
  // 검색 및 필터링 상태
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedTechStack, setSelectedTechStack] = useState("");
  const [selectedPriceType, setSelectedPriceType] = useState(""); // 무료/유료 선택
  const [selectedPriceRange, setSelectedPriceRange] = useState(""); // 가격대 선택
  
  // 필터링 옵션
  const techStacks = ["Python", "Java", "JavaScript", "React", "Node.js", "Spring", "Docker", "AWS", "SQL", "MongoDB"];
  const priceTypes = [
    { value: "", label: "전체" },
    { value: "free", label: "무료" },
    { value: "paid", label: "유료" }
  ];
  const priceRanges = [
    { value: "", label: "전체" },
    { value: "0-50000", label: "5만원 이하" },
    { value: "50000-100000", label: "5만원-10만원" },
    { value: "100000-200000", label: "10만원-20만원" },
    { value: "200000-500000", label: "20만원-50만원" },
    { value: "500000+", label: "50만원 이상" }
  ];

  // 로드맵 목록 가져오기
  const fetchRoadmaps = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${BASE_URL}/roadmaps/`, { 
        params: { type: type },
        headers 
      });
      setRoadmaps(response.data || []);
    } catch (error) {
      console.error(`${type} 목록 조회 실패:`, error);
      setRoadmaps([]);
    } finally {
      setLoading(false);
    }
  };

  // 찜한 로드맵 가져오기
  const fetchBookmarkedRoadmaps = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${BASE_URL}/user_roadmaps/me`, { headers });
      
      // ✨ [수정] API 응답 구조에 맞게 수정: UserRoadmapResponse 배열에서 roadmap 객체 추출
      const items = response.data;
      if (Array.isArray(items)) {
        // 각 item은 { roadmaps_id, id, user_id, roadmap } 구조
        const roadmaps = items.map(item => item.roadmap);
        setBookmarkedRoadmaps(roadmaps);
      } else {
        setBookmarkedRoadmaps([]);
      }
    } catch (error) {
      console.error('찜한 로드맵 조회 실패:', error);
      setBookmarkedRoadmaps([]);
    }
  };

  // 찜하기/찜취소
  const toggleBookmark = async (roadmapId) => {
    try {
      const token = localStorage.getItem("accessToken");
      console.log("찜하기 버튼 클릭 시 토큰:", token);
      
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const isBookmarked = bookmarkedRoadmaps.some(item => item.id === roadmapId);

      if (isBookmarked) {
        // 찜취소
        await axios.delete(`${BASE_URL}/user_roadmaps/${roadmapId}`, { headers });
        setBookmarkedRoadmaps(prev => prev.filter(item => item.id !== roadmapId));
        alert("찜이 해제되었습니다.");
      } else {
        // 찜하기
        const response = await axios.post(`${BASE_URL}/user_roadmaps/`, { 
          roadmaps_id: roadmapId 
        }, { headers });
        
        const roadmap = roadmaps.find(item => item.id === roadmapId);
        if (roadmap) {
          setBookmarkedRoadmaps(prev => [...prev, roadmap]);
        }
        alert("찜이 추가되었습니다!");
      }
    } catch (error) {
      console.error('찜하기/찜취소 실패:', error);
      if (error.response?.status === 400) {
        alert("이미 찜한 로드맵입니다.");
      } else {
        alert("찜하기/찜취소에 실패했습니다.");
      }
    }
  };

  // 로드맵 상세 정보 가져오기 - 목록에서 직접 사용
  const fetchRoadmapDetail = async (roadmapId) => {
    try {
      // 목록에서 해당 로드맵 찾기
      const roadmap = roadmaps.find(item => item.id === roadmapId);
      if (roadmap) {
        setSelectedRoadmap(roadmap);
        setShowDetail(true);
      } else {
        // 목록에 없으면 API 호출
        const token = localStorage.getItem("accessToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.get(`${BASE_URL}/roadmaps/${roadmapId}`, { headers });
        setSelectedRoadmap(response.data);
        setShowDetail(true);
      }
    } catch (error) {
      console.error('로드맵 상세 정보 조회 실패:', error);
      alert('상세 정보를 불러오는데 실패했습니다.');
    }
  };

  // 가격 필터링 함수
  const isPriceInRange = (price, range) => {
    if (!price || !range) return true;
    
    // 가격에서 숫자만 추출
    const priceNumber = parseInt(price.replace(/[^0-9]/g, ''));
    
    switch (range) {
      case "0-50000":
        return priceNumber >= 0 && priceNumber <= 50000;
      case "50000-100000":
        return priceNumber > 50000 && priceNumber <= 100000;
      case "100000-200000":
        return priceNumber > 100000 && priceNumber <= 200000;
      case "200000-500000":
        return priceNumber > 200000 && priceNumber <= 500000;
      case "500000+":
        return priceNumber > 500000;
      default:
        return true;
    }
  };

  // 무료/유료 판단 함수
  const isFreeCourse = (price) => {
    if (!price) return false;
    return price.toLowerCase().includes('무료') || parseInt(price.replace(/[^0-9]/g, '')) === 0;
  };

  // 가격에서 숫자 추출 함수
  const extractPriceNumber = (price) => {
    if (!price) return 0;
    return parseInt(price.replace(/[^0-9]/g, '')) || 0;
  };

  // 필터링된 로드맵 목록
  const filteredRoadmaps = roadmaps.filter(roadmap => {
    const matchesKeyword = !searchKeyword || 
      roadmap.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      roadmap.company.toLowerCase().includes(searchKeyword.toLowerCase());
    
    const matchesTechStack = !selectedTechStack || 
      (roadmap.skill_description && roadmap.skill_description.some(skill => 
        skill.toLowerCase().includes(selectedTechStack.toLowerCase())
      ));
    
    // 가격 타입 필터링 (무료/유료)
    const matchesPriceType = !selectedPriceType || 
      (type === "강의" && (
        selectedPriceType === "free" ? isFreeCourse(roadmap.price) : 
        selectedPriceType === "paid" ? !isFreeCourse(roadmap.price) : true
      ));
    
    // 가격대 필터링 (유료 선택 시에만)
    const matchesPriceRange = !selectedPriceRange || 
      (type === "강의" && selectedPriceType === "paid" && isPriceInRange(roadmap.price, selectedPriceRange));
    
    return matchesKeyword && matchesTechStack && matchesPriceType && matchesPriceRange;
  }).sort((a, b) => {
    // 유료 강의 선택 시 가격 순서대로 정렬 (낮은 가격부터)
    if (type === "강의" && selectedPriceType === "paid") {
      const priceA = extractPriceNumber(a.price);
      const priceB = extractPriceNumber(b.price);
      return priceA - priceB;
    }
    return 0; // 기본 정렬 유지
  });

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchRoadmaps();
    fetchBookmarkedRoadmaps();
  }, [type]);

  // 찜 상태 변경 이벤트 리스너
  useEffect(() => {
    const handleRoadmapBookmarkChange = async () => {
      await fetchBookmarkedRoadmaps();
    };

    window.addEventListener('roadmapBookmarkChanged', handleRoadmapBookmarkChange);
    return () => {
      window.removeEventListener('roadmapBookmarkChanged', handleRoadmapBookmarkChange);
    };
  }, []);

  const isBookmarked = (roadmapId) => {
    return bookmarkedRoadmaps.some(item => item.id === roadmapId);
  };

  if (loading) {
    return (
      <Container $darkMode={darkMode}>
        <LoadingContainer $darkMode={darkMode}>
          <LoadingSpinner $darkMode={darkMode} />
          <LoadingText $darkMode={darkMode}>{type} 목록을 불러오는 중...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container $darkMode={darkMode}>
      {/* 검색 및 필터링 섹션 */}
      <SearchSection $darkMode={darkMode}>
        <SearchBar>
          <SearchInput
            type="text"
            placeholder="기관명, 프로그램명으로 검색"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            $darkMode={darkMode}
          />
          <SearchButton $darkMode={darkMode}>
            검색
          </SearchButton>
        </SearchBar>
        
        <FilterSection>
          <FilterGroup>
            <FilterLabel>기술스택</FilterLabel>
            <FilterSelect 
              value={selectedTechStack} 
              onChange={(e) => setSelectedTechStack(e.target.value)}
              $darkMode={darkMode}
            >
              <option value="">전체</option>
              {techStacks.map(tech => (
                <option key={tech} value={tech}>{tech}</option>
              ))}
            </FilterSelect>
          </FilterGroup>
          
          {type === "강의" && (
            <>
              <FilterGroup>
                <FilterLabel>가격</FilterLabel>
                <FilterSelect 
                  value={selectedPriceType} 
                  onChange={(e) => {
                    setSelectedPriceType(e.target.value);
                    // 가격 타입이 변경되면 가격대 필터 초기화
                    if (e.target.value !== "paid") {
                      setSelectedPriceRange("");
                    }
                  }}
                  $darkMode={darkMode}
                >
                  {priceTypes.map(price => (
                    <option key={price.value} value={price.value}>{price.label}</option>
                  ))}
                </FilterSelect>
              </FilterGroup>
              
              {selectedPriceType === "paid" && (
                <FilterGroup>
                  <FilterLabel>가격대</FilterLabel>
                  <FilterSelect 
                    value={selectedPriceRange} 
                    onChange={(e) => setSelectedPriceRange(e.target.value)}
                    $darkMode={darkMode}
                  >
                    {priceRanges.map(price => (
                      <option key={price.value} value={price.value}>{price.label}</option>
                    ))}
                  </FilterSelect>
                </FilterGroup>
              )}
            </>
          )}
        </FilterSection>
      </SearchSection>

      <Content>
        <ResultCount $darkMode={darkMode}>
          총 {filteredRoadmaps.length}개의 {type}을 찾았습니다.
        </ResultCount>
        
        {roadmaps.length > 0 ? (
          <RoadmapGrid>
            {filteredRoadmaps.map((roadmap) => (
              <RoadmapCard 
                key={roadmap.id} 
                $darkMode={darkMode}
                onClick={() => fetchRoadmapDetail(roadmap.id)}
              >
                <RoadmapHeader>
                  <RoadmapTitle>{roadmap.name}</RoadmapTitle>
                  <BookmarkButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(roadmap.id);
                    }}
                    $isBookmarked={isBookmarked(roadmap.id)}
                  >
                    {isBookmarked(roadmap.id) ? 
                      <FaHeart style={{ color: '#ff4757' }} /> : 
                      <FaRegHeart style={{ color: '#ccc' }} />
                    }
                  </BookmarkButton>
                </RoadmapHeader>
                
                <RoadmapCompany>{roadmap.company}</RoadmapCompany>
                
                {/* 강의는 제목, 회사, 가격만 표시 */}
                {roadmap.type === '강의' && roadmap.price && (
                  <RoadmapInfo>
                    <span style={{ color: '#28a745', fontWeight: '600' }}>{roadmap.price}</span>
                  </RoadmapInfo>
                )}
                
                {/* 부트캠프는 기존 정보 유지 */}
                {roadmap.type === '부트캠프' && (
                  <>
                    <RoadmapInfo>
                      {roadmap.location && `${roadmap.location} • `}
                      {roadmap.deadline_display || roadmap.deadline ? (roadmap.deadline_display || roadmap.deadline) : '상시'}
                    </RoadmapInfo>
                    
                    {roadmap.start_date_display && (
                      <RoadmapInfo>
                        <span>시작: {roadmap.start_date_display}</span>
                      </RoadmapInfo>
                    )}
                    
                    {roadmap.skill_description && roadmap.skill_description.length > 0 && (
                      <SkillTags>
                        {roadmap.skill_description.slice(0, 2).map((skill, index) => (
                          <SkillTag key={index}>{skill}</SkillTag>
                        ))}
                        {roadmap.skill_description.length > 2 && (
                          <MoreSkills>+{roadmap.skill_description.length - 2}</MoreSkills>
                        )}
                      </SkillTags>
                    )}
                  </>
                )}
              </RoadmapCard>
            ))}
          </RoadmapGrid>
        ) : (
          <NoDataText $darkMode={darkMode}>{type} 목록이 없습니다.</NoDataText>
        )}
      </Content>

      {/* 상세 정보 팝업 */}
      {showDetail && selectedRoadmap && (
        <DetailPopup onClick={() => setShowDetail(false)}>
          <DetailContent $darkMode={darkMode} onClick={(e) => e.stopPropagation()}>
            <DetailHeader $darkMode={darkMode}>
              <DetailTitle>
                {selectedRoadmap.type === '부트캠프' ? '' : ''} {selectedRoadmap.name}
              </DetailTitle>
              <CloseButton $darkMode={darkMode} onClick={() => setShowDetail(false)}>
                <FaTimes />
              </CloseButton>
            </DetailHeader>
            
            <DetailBody>
              {/* 기본 필드들 - 항상 표시 */}
              <DetailInfo>
                <DetailLabel>강의명</DetailLabel>
                <DetailValue>{selectedRoadmap.name}</DetailValue>
              </DetailInfo>
              
              <DetailInfo>
                <DetailLabel>타입</DetailLabel>
                <DetailValue>{selectedRoadmap.type}</DetailValue>
              </DetailInfo>
              
              <DetailInfo>
                <DetailLabel>기관/강사</DetailLabel>
                <DetailValue>{selectedRoadmap.company}</DetailValue>
              </DetailInfo>
              
              {/* 강의에만 있는 필드들 */}
              {selectedRoadmap.type === '강의' && (
                <DetailInfo>
                  <DetailLabel>가격</DetailLabel>
                  <DetailValue>
                    <FaMoneyBillWave style={{ marginRight: '0.5rem', color: '#28a745' }} />
                    {selectedRoadmap.price || '가격 정보 없음'}
                  </DetailValue>
                </DetailInfo>
              )}
              
              {selectedRoadmap.type === '강의' && (
                <DetailInfo>
                  <DetailLabel>강의 링크</DetailLabel>
                  <DetailValue>
                    {selectedRoadmap.url ? (
                      <a href={selectedRoadmap.url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                        <FaExternalLinkAlt style={{ marginRight: '0.5rem' }} />
                        링크 열기
                      </a>
                    ) : (
                      <span style={{ color: '#999' }}>링크 정보 없음</span>
                    )}
                  </DetailValue>
                </DetailInfo>
              )}
              
              {selectedRoadmap.skill_description && selectedRoadmap.skill_description.length > 0 && (
                <DetailInfo>
                  <DetailLabel>기술 스택</DetailLabel>
                  <DetailSkills>
                    {selectedRoadmap.skill_description.map((skill, index) => (
                      <DetailSkillTag key={index}>{skill}</DetailSkillTag>
                    ))}
                  </DetailSkills>
                </DetailInfo>
              )}
              
              {/* 추가 필드들 - 있으면 표시 */}
              {selectedRoadmap.status && (
                <DetailInfo>
                  <DetailLabel>상태</DetailLabel>
                  <DetailValue>{selectedRoadmap.status}</DetailValue>
                </DetailInfo>
              )}
              
              {selectedRoadmap.deadline && (
                <DetailInfo>
                  <DetailLabel>마감일</DetailLabel>
                  <DetailValue>{selectedRoadmap.deadline_display || selectedRoadmap.deadline}</DetailValue>
                </DetailInfo>
              )}
              
              {/* 부트캠프에만 있는 날짜 필드들 */}
              {selectedRoadmap.type === '부트캠프' && selectedRoadmap.start_date_display && (
                <DetailInfo>
                  <DetailLabel>시작일</DetailLabel>
                  <DetailValue>{selectedRoadmap.start_date_display}</DetailValue>
                </DetailInfo>
              )}
              
              {selectedRoadmap.type === '부트캠프' && selectedRoadmap.end_date_display && (
                <DetailInfo>
                  <DetailLabel>종료일</DetailLabel>
                  <DetailValue>{selectedRoadmap.end_date_display}</DetailValue>
                </DetailInfo>
              )}
              
              {selectedRoadmap.location && (
                <DetailInfo>
                  <DetailLabel>위치</DetailLabel>
                  <DetailValue>{selectedRoadmap.location}</DetailValue>
                </DetailInfo>
              )}
              
              {selectedRoadmap.onoff && (
                <DetailInfo>
                  <DetailLabel>진행 방식</DetailLabel>
                  <DetailValue>{selectedRoadmap.onoff}</DetailValue>
                </DetailInfo>
              )}
              
              {selectedRoadmap.participation_time && (
                <DetailInfo>
                  <DetailLabel>참여 시간</DetailLabel>
                  <DetailValue>{selectedRoadmap.participation_time}</DetailValue>
                </DetailInfo>
              )}
              
              {selectedRoadmap.program_course && (
                <DetailInfo>
                  <DetailLabel>프로그램 과정</DetailLabel>
                  <DetailValue>{selectedRoadmap.program_course}</DetailValue>
                </DetailInfo>
              )}
              
              {/* 모든 추가 필드들 출력 */}
              {selectedRoadmap.description && (
                <DetailInfo>
                  <DetailLabel>설명</DetailLabel>
                  <DetailValue>{selectedRoadmap.description}</DetailValue>
                </DetailInfo>
              )}
              
              {selectedRoadmap.target_audience && (
                <DetailInfo>
                  <DetailLabel>대상</DetailLabel>
                  <DetailValue>{selectedRoadmap.target_audience}</DetailValue>
                </DetailInfo>
              )}
              
              {selectedRoadmap.prerequisites && (
                <DetailInfo>
                  <DetailLabel>선수 지식</DetailLabel>
                  <DetailValue>{selectedRoadmap.prerequisites}</DetailValue>
                </DetailInfo>
              )}
              
              {selectedRoadmap.curriculum && (
                <DetailInfo>
                  <DetailLabel>커리큘럼</DetailLabel>
                  <DetailValue>{selectedRoadmap.curriculum}</DetailValue>
                </DetailInfo>
              )}
              
              {selectedRoadmap.duration && (
                <DetailInfo>
                  <DetailLabel>기간</DetailLabel>
                  <DetailValue>{selectedRoadmap.duration}</DetailValue>
                </DetailInfo>
              )}
              
              {selectedRoadmap.capacity && (
                <DetailInfo>
                  <DetailLabel>정원</DetailLabel>
                  <DetailValue>{selectedRoadmap.capacity}</DetailValue>
                </DetailInfo>
              )}
              
              {selectedRoadmap.contact && (
                <DetailInfo>
                  <DetailLabel>연락처</DetailLabel>
                  <DetailValue>{selectedRoadmap.contact}</DetailValue>
                </DetailInfo>
              )}
              
              {selectedRoadmap.website && (
                <DetailInfo>
                  <DetailLabel>웹사이트</DetailLabel>
                  <DetailValue>
                    <a href={selectedRoadmap.website} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'none' }}>
                      {selectedRoadmap.website}
                    </a>
                  </DetailValue>
                </DetailInfo>
              )}
            </DetailBody>
          </DetailContent>
        </DetailPopup>
      )}
    </Container>
  );
}

// 스타일 컴포넌트들
const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background: transparent;
  color: ${({ $darkMode }) => ($darkMode ? "#eee" : "#333")};
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  background: ${({ $darkMode }) => ($darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)')};
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 1.5rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid ${({ $darkMode }) => ($darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)')};
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #ffa500;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 165, 0, 0.1);
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #ffa500;
  margin: 0;
`;

const Content = styled.div`
  width: 100%;
`;

const RoadmapGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 1rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RoadmapCard = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.7)')};
  backdrop-filter: blur(10px);
  border: 1px solid ${({ $darkMode }) => ($darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)')};
  border-radius: 1.2rem;
  padding: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #ffa500, #ff8c00);
  }
  
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
    border-color: #ffa500;
    background: ${({ $darkMode }) => ($darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)')};
  }
`;

const RoadmapHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const CompatibilityScore = styled.div`
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.2);
`;

const RoadmapTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: ${({ $darkMode }) => ($darkMode ? "#fff" : "#333")};
  margin: 0;
  flex: 1;
  line-height: 1.4;
`;

const BookmarkButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  color: ${({ $isBookmarked }) => $isBookmarked ? "#ff4757" : "#ccc"};
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
  
  &:hover {
    color: #ff4757;
    transform: scale(1.1);
  }
`;

const RoadmapCompany = styled.div`
  font-size: 0.9rem;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#666")};
  margin-bottom: 0.4rem;
`;

const RoadmapInfo = styled.div`
  font-size: 0.85rem;
  color: ${({ $darkMode }) => ($darkMode ? "#aaa" : "#777")};
  margin-bottom: 0.5rem;
`;

const SkillTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0.5rem 0;
`;

const SkillTag = styled.span`
  background: #ffa500;
  color: #fff;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  font-weight: 500;
`;

const MoreSkills = styled.span`
  background: #6c757d;
  color: #fff;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  font-weight: 500;
`;

const DetailButton = styled.button`
  background: linear-gradient(135deg, #ffa500, #ff8c00);
  color: #fff;
  border: none;
  border-radius: 0.8rem;
  padding: 1rem 1.5rem;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  margin-top: 1.5rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    background: linear-gradient(135deg, #ff8c00, #ffa500);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 165, 0, 0.3);
    
    &::before {
      left: 100%;
    }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1.5rem;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid ${({ $darkMode }) => $darkMode ? '#333' : '#f3f3f3'};
  border-top: 4px solid #ffa500;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  text-align: center;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#666")};
  font-size: 1.1rem;
  font-weight: 500;
`;

const NoDataText = styled.div`
  text-align: center;
  color: ${({ $darkMode }) => ($darkMode ? "#888" : "#999")};
  font-size: 1.1rem;
  padding: 4rem;
`;

const TypeBadge = styled.div`
  display: inline-block;
  background: ${({ $type }) => $type === '부트캠프' ? 'linear-gradient(135deg, #ffa500, #ff8c00)' : 'linear-gradient(135deg, #28a745, #20c997)'};
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 0.8rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

// 검색 및 필터링 스타일
const SearchSection = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.7)')};
  backdrop-filter: blur(10px);
  border: 1px solid ${({ $darkMode }) => ($darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)')};
  border-radius: 1.5rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const SearchBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 1rem 1.5rem;
  border: 2px solid ${({ $darkMode }) => ($darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)')};
  border-radius: 1rem;
  background: ${({ $darkMode }) => ($darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)')};
  backdrop-filter: blur(10px);
  color: ${({ $darkMode }) => ($darkMode ? "#fff" : "#333")};
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:focus {
    outline: none;
    border-color: #ffa500;
    box-shadow: 0 0 0 3px rgba(255, 165, 0, 0.1);
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: ${({ $darkMode }) => ($darkMode ? "#888" : "#999")};
  }
`;

const SearchButton = styled.button`
  background: linear-gradient(135deg, #ffa500, #ff8c00);
  color: #fff;
  border: none;
  border-radius: 1rem;
  padding: 1rem 2rem;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  box-shadow: 0 4px 15px rgba(255, 165, 0, 0.2);
  
  &:hover {
    background: linear-gradient(135deg, #ff8c00, #ffa500);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 165, 0, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const FilterSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#555")};
`;

const FilterSelect = styled.select`
  padding: 0.8rem 1rem;
  border: 1px solid ${({ $darkMode }) => ($darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)')};
  border-radius: 0.8rem;
  background: ${({ $darkMode }) => ($darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)')};
  backdrop-filter: blur(10px);
  color: ${({ $darkMode }) => ($darkMode ? "#fff" : "#333")};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:focus {
    outline: none;
    border-color: #ffa500;
    box-shadow: 0 0 0 2px rgba(255, 165, 0, 0.1);
    transform: translateY(-1px);
  }
  
  &:hover {
    border-color: ${({ $darkMode }) => ($darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)')};
  }
`;

const ResultCount = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#555")};
  margin-bottom: 1.5rem;
  padding: 0 0.5rem;
`;

const TabSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#e9ecef")};
`;

const TabButton = styled.button`
  background: ${({ $active, $darkMode }) => 
    $active 
      ? 'linear-gradient(135deg, #ffa500, #ff8c00)' 
      : ($darkMode ? "#333" : "#f8f9fa")
  };
  color: ${({ $active, $darkMode }) => 
    $active ? "#fff" : ($darkMode ? "#ccc" : "#666")
  };
  border: 2px solid ${({ $active, $darkMode }) => 
    $active ? "#ffa500" : ($darkMode ? "#444" : "#e9ecef")
  };
  border-radius: 0.8rem 0.8rem 0 0;
  padding: 1rem 2rem;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    background: ${({ $active, $darkMode }) => 
      $active 
        ? 'linear-gradient(135deg, #ff8c00, #ffa500)' 
        : ($darkMode ? "#444" : "#e9ecef")
    };
    transform: ${({ $active }) => $active ? "none" : "translateY(-2px)"};
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ $active }) => $active ? "#ffa500" : "transparent"};
  }
`;

// 상세 팝업 스타일
const DetailPopup = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const DetailContent = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? "#2a2a2a" : "#fff")};
  border-radius: 1rem;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const DetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#e9ecef")};
  background: ${({ $darkMode }) => ($darkMode ? "#333" : "#f8f9fa")};
`;

const DetailTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: #ffa500;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#666")};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
  
  &:hover {
    color: #ff4757;
  }
`;

const DetailBody = styled.div`
  padding: 1.5rem 2rem;
  max-height: 60vh;
  overflow-y: auto;
`;

const DetailInfo = styled.div`
  margin-bottom: 1rem;
`;

const DetailLabel = styled.div`
  font-weight: 600;
  color: #ffa500;
  margin-bottom: 0.25rem;
`;

const DetailValue = styled.div`
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#333")};
  line-height: 1.5;
`;

const DetailSkills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const DetailSkillTag = styled.span`
  background: #ffa500;
  color: #fff;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  font-weight: 500;
`; 