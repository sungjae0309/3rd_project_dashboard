import React, { useState } from "react";
import styled from "styled-components";
import { FaChevronDown } from "react-icons/fa";
import { useJobNames } from "../contexts/JobNamesContext";

export default function JobSelector({ selectedJob, onJobChange, darkMode }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // 전역 직무명 상태 사용
  const { jobNames, loading } = useJobNames();
  
  // jobNames에서 name 필드만 추출
  const jobs = jobNames.map(job => job.name);

  const handleJobSelect = (job) => {
    console.log("선택된 직무:", job);
    onJobChange(job);
    setIsOpen(false);
  };

  const handleButtonClick = (e) => {
    e.stopPropagation(); // 이벤트 전파 방지
    setIsOpen(!isOpen);
  };

  return (
    <SelectorContainer $darkMode={darkMode}>
      <SelectButton 
        onClick={handleButtonClick}
        $darkMode={darkMode}
        disabled={loading}
      >
        {loading ? "로딩 중..." : (selectedJob || "직무 선택")}
        <FaChevronDown />
      </SelectButton>
      
      {isOpen && (
        <Dropdown $darkMode={darkMode}>
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <DropdownItem
                key={job}
                onClick={(e) => {
                  e.stopPropagation(); // 이벤트 전파 방지
                  handleJobSelect(job);
                }}
                $isSelected={job === selectedJob}
                $darkMode={darkMode}
              >
                {job}
              </DropdownItem>
            ))
          ) : (
            <DropdownItem $darkMode={darkMode}>
              {loading ? "로딩 중..." : "직무 목록이 없습니다"}
            </DropdownItem>
          )}
        </Dropdown>
      )}
    </SelectorContainer>
  );
}

const SelectorContainer = styled.div`
  position: relative;
  z-index: 10;
`;

const SelectButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${({ $darkMode }) => $darkMode ? '#444' : '#fff'};
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
  border: 1px solid ${({ $darkMode }) => $darkMode ? '#666' : '#ddd'};
  border-radius: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $darkMode }) => $darkMode ? '#555' : '#f5f5f5'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${({ $darkMode }) => $darkMode ? '#333' : '#fff'};
  border: 1px solid ${({ $darkMode }) => $darkMode ? '#666' : '#ddd'};
  border-radius: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  margin-top: 0.25rem;
`;

const DropdownItem = styled.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
  background: ${({ $isSelected, $darkMode }) => 
    $isSelected ? ($darkMode ? '#555' : '#f0f0f0') : 'transparent'};

  &:hover {
    background: ${({ $darkMode }) => $darkMode ? '#444' : '#f5f5f5'};
  }
`; 