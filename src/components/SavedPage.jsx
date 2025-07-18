import React, { useState } from 'react';
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
  onRoadmapDetail 
}) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.initialTab || 'jobs');

  return (
    <PageContainer $darkMode={darkMode}>
      <TabHeader>
        <TabButton active={activeTab === 'jobs'} onClick={() => setActiveTab('jobs')}>
          찜한 공고
        </TabButton>
        <TabButton active={activeTab === 'roadmaps'} onClick={() => setActiveTab('roadmaps')}>
          찜한 로드맵
        </TabButton>
      </TabHeader>
      <ContentArea>
        {activeTab === 'jobs' && (
          <SavedJobs
            darkMode={darkMode}
            savedJobs={savedJobs}
            setSavedJobs={setSavedJobs}
            onJobDetail={onJobDetail}
          />
        )}
        {activeTab === 'roadmaps' && (
          <SavedRoadmaps 
            darkMode={darkMode} 
            userId={userId} 
            onRoadmapDetail={onRoadmapDetail}
          />
        )}
      </ContentArea>
    </PageContainer>
  );
}

/* ───── 스타일 (기존과 동일) ───── */
const PageContainer = styled.div`
  padding: 2rem;
  background: ${({ $darkMode }) => ($darkMode ? '#121212' : '#f8f9fa')};
  min-height: 100vh;
`;
const TabHeader = styled.div`
  display: flex;
  gap: 1rem;
  border-bottom: 2px solid ${({ $darkMode }) => ($darkMode ? '#444' : '#dee2e6')};
  margin-bottom: 2rem;
`;
const TabButton = styled.button`
  padding: 0.8rem 1.2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  background: none;
  cursor: pointer;
  color: ${({ $darkMode, active }) => (active ? ($darkMode ? '#ffc107' : '#333') : ($darkMode ? '#888' : '#aaa'))};
  border-bottom: 3px solid ${({ active }) => (active ? '#ffc107' : 'transparent')};
  transition: all 0.2s ease-in-out;
  &:hover {
    color: ${({ $darkMode }) => ($darkMode ? '#fff' : '#000')};
  }
`;
const ContentArea = styled.div``;