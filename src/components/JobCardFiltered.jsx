// ────────────── src/components/JobCardFiltered.jsx ──────────────
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { useJobNames } from "../contexts/JobNamesContext";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://192.168.101.51:8000";
export default function JobCardFiltered({ filters, setFilters, darkMode = false }) {

  const [techStacks, setTechStacks] = useState([]);
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [applicantTypes, setApplicantTypes] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // 전역 직무명 상태 사용
  const { jobNames } = useJobNames();

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [
          techStackRes,
          employmentRes,
          applicantRes
        ] = await Promise.all([
          axios.get(`${BASE_URL}/job_posts/unique_tech_stacks`),
          axios.get(`${BASE_URL}/job_posts/unique_employment_types`),
          axios.get(`${BASE_URL}/job_posts/unique_applicant_types`)
        ]);
      
        setTechStacks(techStackRes.data);
        setEmploymentTypes(employmentRes.data);
        setApplicantTypes(applicantRes.data);
      } catch (err) {
        console.error("필터 목록 로드 실패:", err);
      }
    };
    fetchFilters();
  }, []);

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // 검색 버튼 클릭 시
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
  };

  return (
    <FilterSection $darkMode={darkMode}>
      <FilterGroup>
        <FilterLabel $darkMode={darkMode}>기술스택</FilterLabel>
        <FilterSelect 
          value={filters.tech_stack || ""} 
          onChange={(e) => handleChange("tech_stack", e.target.value)}
          $darkMode={darkMode}
        >
          <option value="">전체</option>
          {techStacks.map((stack) => (
            <option key={stack} value={stack}>{stack}</option>
          ))}
        </FilterSelect>
      </FilterGroup>

      <FilterGroup>
        <FilterLabel $darkMode={darkMode}>고용형태</FilterLabel>
        <FilterSelect 
          value={filters.employment_type || ""} 
          onChange={(e) => handleChange("employment_type", e.target.value)}
          $darkMode={darkMode}
        >
          <option value="">전체</option>
          {employmentTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </FilterSelect>
      </FilterGroup>

      <FilterGroup>
        <FilterLabel $darkMode={darkMode}>지원자 유형</FilterLabel>
        <FilterSelect 
          value={filters.applicant_type || ""} 
          onChange={(e) => handleChange("applicant_type", e.target.value)}
          $darkMode={darkMode}
        >
          <option value="">전체</option>
          {applicantTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </FilterSelect>
      </FilterGroup>

      <FilterGroup>
        <FilterLabel $darkMode={darkMode}>직무</FilterLabel>
        <FilterSelect 
          value={filters.job_name || ""} 
          onChange={(e) => handleChange("job_name", e.target.value)}
          $darkMode={darkMode}
        >
          <option value="">전체</option>
          {jobNames.map(job => (
            <option key={job.name} value={job.name}>
              {job.name}
            </option>
          ))}
        </FilterSelect>
      </FilterGroup>
    </FilterSection>
  );
}

// ────────────── 💄 스타일링 개선
const FilterSection = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%; /* 그룹이 전체 너비를 사용하도록 */
`;

const FilterLabel = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#555")};
`;

const FilterSelect = styled.select`
  padding: 0.6rem 0.8rem;
  border: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#ddd")};
  border-radius: 0.5rem;
  background: ${({ $darkMode }) => ($darkMode ? "#333" : "#fff")};
  color: ${({ $darkMode }) => ($darkMode ? "#fff" : "#333")};
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 2.5rem; /* 모든 드롭다운의 높이를 동일하게 설정 */
  width: 100%; /* 각 드롭다운이 그룹의 전체 너비를 사용 */
  box-sizing: border-box; /* 패딩과 보더가 너비에 포함되도록 */
  
  &:focus {
    outline: none;
    border-color: #ffa500;
    box-shadow: 0 0 0 2px rgba(255, 165, 0, 0.1);
  }
`;