import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://192.168.101.51:8000';

export default function RoadmapCategory({ onSelectCategory, darkMode }) {
  const [categoryStats, setCategoryStats] = useState({
    bootcamp: { count: 0, loading: true },
    lecture: { count: 0, loading: true }
  });

  const categories = [
    { key: "bootcamp", label: "부트캠프", type: "부트캠프", icon: "🎓" },
    { key: "lecture", label: "강의", type: "강의", icon: "📚" },
  ];

  // 각 카테고리별 데이터 개수 가져오기
  useEffect(() => {
    const fetchCategoryStats = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        console.log('🔍 [RoadmapCategory] 토큰 확인:', token ? '있음' : '없음');
        
        // 사용자 희망 직무 정보 가져오기
        let jobCategory;
        
        // 로그인 여부와 관계없이 API 호출 (API가 회원/비회원을 구분해서 처리)
        try {
          console.log('🔍 [RoadmapCategory] API 호출 시작...');
          const { data: desiredJobData } = await axios.get(`${BASE_URL}/users/desired-job`, { headers });
          console.log('✅ [RoadmapCategory] API 응답 성공:', desiredJobData);
          // 백엔드에서 직접 문자열로 보내주므로 data 자체가 직무명
          jobCategory = desiredJobData;
          console.log('✅ [RoadmapCategory] 추출된 직무:', jobCategory);
        } catch (err) {
          console.error('❌ [RoadmapCategory] 희망 직무 API 호출 실패:', err);
          console.error('❌ [RoadmapCategory] 에러 상세:', err.response?.data);
          // API 호출 실패 시에만 기본값 사용
          jobCategory = "프론트엔드 개발자";
        }

        console.log('🔍 [RoadmapCategory] 최종 사용할 직무:', jobCategory);

        // 로드맵 추천 데이터 가져오기
        const response = await axios.get(`${BASE_URL}/visualization/roadmap_recommendations`, {
          params: { category: jobCategory },
          headers: headers
        });

        const bootcampCount = response.data.filter(item => item.type === '부트캠프').length;
        const lectureCount = response.data.filter(item => item.type === '강의').length;

        setCategoryStats({
          bootcamp: { count: bootcampCount, loading: false },
          lecture: { count: lectureCount, loading: false }
        });
      } catch (error) {
        console.error('카테고리 통계 로드 실패:', error);
        setCategoryStats({
          bootcamp: { count: 0, loading: false },
          lecture: { count: 0, loading: false }
        });
      }
    };

    fetchCategoryStats();
  }, []);

  return (
    <Container $darkMode={darkMode}>
      <Header>로드맵 분야 별로 보기</Header>
      <SubHeader>당신의 관심 직무에 맞는 맞춤형 로드맵을 확인해보세요</SubHeader>
      <CategoryGrid>
        {categories.map(cat => {
          const stats = categoryStats[cat.key];
          return (
            <CategoryCard key={cat.key} onClick={() => onSelectCategory(cat.type)} $darkMode={darkMode}>
              <CardHeader>
                <CategoryIcon>{cat.icon}</CategoryIcon>
                <CategoryTitle>{cat.label}</CategoryTitle>
              </CardHeader>
              <CategoryDescription>
                {cat.key === "bootcamp" 
                  ? "집중적인 실무 교육으로 빠른 성장을 도와드립니다" 
                  : "체계적인 커리큘럼으로 단계별 학습을 진행합니다"
                }
              </CategoryDescription>
              <CategoryStats>
                {stats.loading ? (
                  <LoadingText>로딩 중...</LoadingText>
                ) : (
                  <>
                    <StatItem>
                      <StatNumber>{stats.count}</StatNumber>
                      <StatLabel>추천 {cat.label}</StatLabel>
                    </StatItem>
                    <StatItem>
                      <StatNumber>{cat.key === "bootcamp" ? "3-6개월" : "1-3개월"}</StatNumber>
                      <StatLabel>평균 기간</StatLabel>
                    </StatItem>
                  </>
                )}
              </CategoryStats>
              <ViewButton>자세히 보기 →</ViewButton>
            </CategoryCard>
          );
        })}
      </CategoryGrid>
    </Container>
  );
}

const Container = styled.div`
  padding: 2rem;
  background: ${({ $darkMode }) => ($darkMode ? "#121212" : "#fff")};
  color: ${({ $darkMode }) => ($darkMode ? "#eee" : "#333")};
  height: 100%;
`;

const Header = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-align: center;
  color: ${({ $darkMode }) => ($darkMode ? "#fff" : "#333")};
`;

const SubHeader = styled.p`
  font-size: 1rem;
  text-align: center;
  margin-bottom: 2rem;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#666")};
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const CategoryCard = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? "#333" : "#f9f9f9")};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#eee")};
  border-radius: 1.5rem;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    border-color: #ffc107;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #ffc107, #ffa500);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const CategoryIcon = styled.div`
  font-size: 2rem;
`;

const CategoryTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffa500;
  margin: 0;
`;

const CategoryDescription = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#666")};
  margin-bottom: 1.5rem;
`;

const CategoryStats = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const StatItem = styled.div`
  text-align: center;
  flex: 1;
`;

const StatNumber = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffa500;
  margin-bottom: 0.3rem;
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: ${({ $darkMode }) => ($darkMode ? "#aaa" : "#888")};
`;

const LoadingText = styled.div`
  font-size: 0.9rem;
  color: ${({ $darkMode }) => ($darkMode ? "#aaa" : "#888")};
  text-align: center;
  padding: 1rem;
`;

const ViewButton = styled.div`
  background: linear-gradient(90deg, #ffc107, #ffa500);
  color: #333;
  padding: 0.8rem 1.5rem;
  border-radius: 0.8rem;
  font-weight: 600;
  text-align: center;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
  }
`;