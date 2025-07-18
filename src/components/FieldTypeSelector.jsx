import React, { useState } from "react";
import styled from "styled-components";
import { FaChevronDown } from "react-icons/fa";

const FIELD_TYPES = [
  { id: "tech_stack", label: "기술 스택" },
  { id: "required_skills", label: "요구 스택" },
  { id: "preferred_skills", label: "우대 사항" },
  { id: "main_tasks_skills", label: "주요 업무" }
];

export default function FieldTypeSelector({ selectedFieldType, onFieldTypeChange, darkMode }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFieldTypeSelect = (fieldType) => {
    onFieldTypeChange(fieldType);
    setIsOpen(false);
  };

  const handleButtonClick = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const selectedField = FIELD_TYPES.find(field => field.id === selectedFieldType);

  return (
    <SelectorContainer $darkMode={darkMode}>
      <SelectButton 
        onClick={handleButtonClick}
        $darkMode={darkMode}
      >
        {selectedField?.label || "기술 스택"}
        <FaChevronDown />
      </SelectButton>
      
      {isOpen && (
        <Dropdown $darkMode={darkMode}>
          {FIELD_TYPES.map((field) => (
            <DropdownItem
              key={field.id}
              onClick={(e) => {
                e.stopPropagation();
                handleFieldTypeSelect(field.id);
              }}
              $isSelected={field.id === selectedFieldType}
              $darkMode={darkMode}
            >
              {field.label}
            </DropdownItem>
          ))}
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
  gap: 0.3rem;
  padding: 0.3rem 0.6rem;
  background: ${({ $darkMode }) => $darkMode ? '#444' : '#fff'};
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
  border: 1px solid ${({ $darkMode }) => $darkMode ? '#666' : '#ddd'};
  border-radius: 0.4rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $darkMode }) => $darkMode ? '#555' : '#f5f5f5'};
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: ${({ $darkMode }) => $darkMode ? '#333' : '#fff'};
  border: 1px solid ${({ $darkMode }) => $darkMode ? '#666' : '#ddd'};
  border-radius: 0.4rem;
  max-height: 150px;
  overflow-y: auto;
  z-index: 1000;
  margin-top: 0.25rem;
  min-width: 100px;
`;

const DropdownItem = styled.div`
  padding: 0.5rem 0.8rem;
  cursor: pointer;
  font-size: 0.75rem;
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
  background: ${({ $isSelected, $darkMode }) => 
    $isSelected ? ($darkMode ? '#555' : '#f0f0f0') : 'transparent'};

  &:hover {
    background: ${({ $darkMode }) => $darkMode ? '#444' : '#f5f5f5'};
  }
`; 