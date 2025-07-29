// dashboard_2/frontend_copy/src/components/CareerPlanFlow.jsx

import React, { useState, useEffect } from 'react'; // useEffect 추가
import RoadmapCategory from './RoadmapCategory';
import RoadmapList from './RoadmapList';
import CareerRoadmapDetail from './CareerRoadmapDetail';

export default function CareerPlanFlow({ darkMode, userId, initialCategory = null, onSaveRoadmap, onUnsaveRoadmap }) {
  // 초기 상태 설정은 그대로 둡니다.
  const [view, setView] = useState(initialCategory ? 'list' : 'category');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(null);

  // ========================= [페이지 이동 문제 해결] =========================
  // initialCategory prop이 변경될 때마다 view와 category 상태를 업데이트합니다.
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
      setView('list');
    }
  }, [initialCategory]); // initialCategory가 바뀔 때마다 이 효과가 실행됩니다.
  // =====================================================================

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setView('list');
  };

  const handleSelectRoadmap = (id) => {
    setSelectedRoadmapId(id);
    setView('detail');
  };

  const handleBack = () => {
    if (view === 'detail') {
      setView('list');
      setSelectedRoadmapId(null);
    } else if (view === 'list') {
      setView('category');
      setSelectedCategory(null);
    }
  };

  // switch 문은 기존과 동일합니다.
  switch (view) {
    case 'list':
      return (
        <RoadmapList
          category={selectedCategory}
          onSelectRoadmap={handleSelectRoadmap}
          onBack={handleBack}
          darkMode={darkMode}
          userId={userId}
          onSaveRoadmap={onSaveRoadmap}
          onUnsaveRoadmap={onUnsaveRoadmap}
        />
      );
    case 'detail':
      return (
        <CareerRoadmapDetail
          roadmapId={selectedRoadmapId}
          onBack={handleBack}
          darkMode={darkMode}
        />
      );
    case 'category':
    default:
      return (
        <RoadmapCategory
          onSelectCategory={handleSelectCategory}
          darkMode={darkMode}
        />
      );
  }
}