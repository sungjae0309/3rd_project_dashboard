import React, { useState } from 'react';
import RoadmapCategory from './RoadmapCategory';
import RoadmapList from './RoadmapList';
import CareerRoadmapDetail from './CareerRoadmapDetail';

// 1. props로 userId를 받도록 추가
export default function CareerPlanFlow({ darkMode, userId }) {
  const [view, setView] = useState('category');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(null);

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

  switch (view) {
    case 'list':
      return (
        <RoadmapList
          category={selectedCategory}
          onSelectRoadmap={handleSelectRoadmap}
          onBack={handleBack}
          darkMode={darkMode}
          userId={userId} // 2. RoadmapList에 userId 전달
        />
      );
    case 'detail':
      return (
        <CareerRoadmapDetail
          roadmapId={selectedRoadmapId}
          onBack={handleBack}
          darkMode={darkMode}
          // 상세 페이지에도 찜하기 버튼을 추가한다면 userId 전달 필요
          // userId={userId} 
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