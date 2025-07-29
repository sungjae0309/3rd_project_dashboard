import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import SavedJobs from './SavedJobs';
// ✨ 파일 이름 오타 수정: SavedRoadMaps -> SavedRoadmaps
import SavedRoadmaps from './SavedRoadMaps';

export default function SavedPage({ 
  darkMode, 
  savedJobs, 
  setSavedJobs, 
  userId, 
  onJobDetail,
  onRoadmapDetail,
  // ✨ 1. [추가] MainContent로부터 savedRoadmaps를 props로 받습니다.
  savedRoadmaps,
  // ✨ [추가] 로드맵 찜하기/해제 콜백들
  onSaveRoadmap,
  onUnsaveRoadmap
}) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.initialTab || 'jobs');

  // 페이지 마운트 시 스크롤을 최상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // URL 파라미터 확인하여 탭 활성화
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    
    if (tab && ['jobs', 'bootcamps', 'courses'].includes(tab)) {
      setActiveTab(tab);
      // URL 파라미터 제거 (깔끔한 URL 유지)
      const newUrl = new URL(window.location);
      newUrl.searchParams.delete('tab');
      window.history.replaceState({}, '', newUrl);
    }
  }, [location.search]);

  // 부트캠프와 강의 분류
  const savedBootcamps = savedRoadmaps.filter(item => item.roadmap?.type === '부트캠프');
  const savedCourses = savedRoadmaps.filter(item => item.roadmap?.type === '강의');

  return (
    <PageContainer $darkMode={darkMode}>
      <TabHeader $darkMode={darkMode}>
        <TabButton active={activeTab === 'jobs'} onClick={() => setActiveTab('jobs')} $darkMode={darkMode}>
          찜한 공고
        </TabButton>
        <TabButton active={activeTab === 'bootcamps'} onClick={() => setActiveTab('bootcamps')} $darkMode={darkMode}>
          찜한 부트캠프
        </TabButton>
        <TabButton active={activeTab === 'courses'} onClick={() => setActiveTab('courses')} $darkMode={darkMode}>
          찜한 강의
        </TabButton>
      </TabHeader>
      <ContentArea $darkMode={darkMode}>
        {activeTab === 'jobs' && (
          <SavedJobs
            darkMode={darkMode}
            savedJobs={savedJobs}
            setSavedJobs={setSavedJobs}
            onJobDetail={onJobDetail}
          />
        )}
        {activeTab === 'bootcamps' && (
          <SavedRoadmaps 
            darkMode={darkMode} 
            savedRoadmaps={savedBootcamps}
            userId={userId} 
            onRoadmapDetail={onRoadmapDetail}
            title="찜한 부트캠프"
            onUnsaveRoadmap={onUnsaveRoadmap}
          />
        )}
        {activeTab === 'courses' && (
          <SavedRoadmaps 
            darkMode={darkMode} 
            savedRoadmaps={savedCourses}
            userId={userId} 
            onRoadmapDetail={onRoadmapDetail}
            title="찜한 강의"
            onUnsaveRoadmap={onUnsaveRoadmap}
          />
        )}
      </ContentArea>
    </PageContainer>
  );
}

/* ───── 스타일 (기존과 동일) ───── */
const PageContainer = styled.div`
  padding: 2rem;
  min-height: 100vh;
  background: transparent;
`;

const TabHeader = styled.div`
  display: flex;
  gap: 1rem;
  background: ${({ $darkMode }) => ($darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)')};
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid ${({ $darkMode }) => ($darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)')};
`;

const TabButton = styled.button`
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  background: ${({ active, $darkMode }) => 
    active 
      ? ($darkMode ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 193, 7, 0.15)')
      : 'transparent'
  };
  border-radius: 0.8rem;
  cursor: pointer;
  color: ${({ $darkMode, active }) => 
    active 
      ? ($darkMode ? '#ffc107' : '#d4a017')
      : ($darkMode ? '#bbb' : '#666')
  };
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: ${({ active, $darkMode }) => 
      active 
        ? ($darkMode ? 'rgba(255, 193, 7, 0.25)' : 'rgba(255, 193, 7, 0.2)')
        : ($darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)')
    };
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ContentArea = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.7)')};
  backdrop-filter: blur(10px);
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid ${({ $darkMode }) => ($darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)')};
  min-height: 60vh;
`;