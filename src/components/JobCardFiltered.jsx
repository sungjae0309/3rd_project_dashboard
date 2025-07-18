// ────────────── src/components/JobCardFiltered.jsx ──────────────
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://192.168.101.51:8000";
export default function JobCardFiltered({ filters, setFilters }) {

  const [techStacks, setTechStacks] = useState([]);
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [applicantTypes, setApplicantTypes] = useState([]);
  const [jobNames, setJobNames] = useState([]);
  const [selectedJobName, setSelectedJobName] = useState("");
  const [jobs, setJobs] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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

    // 1. 직무명 리스트 불러오기
    const fetchJobNames = async () => {
      try {
        const response = await fetch(`${BASE_URL}/job-skills/job-names`);
        const data = await response.json();
        console.log("JobCardFiltered 직무명 응답:", data);
        setJobNames(data);
      } catch (error) {
        console.error("JobCardFiltered 직무명 불러오기 실패:", error);
      }
    };
    fetchJobNames();

    // 2. 공고 리스트 불러오기 (직무명 선택 시마다)
    let url = `${BASE_URL}/job_posts/?limit=50`;
    if (selectedJobName) {
      url += `&job_name=${encodeURIComponent(selectedJobName)}`;
    }
    console.log("API 요청 URL:", url); // ← 실제 요청 URL 확인
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        console.log("API 응답 데이터:", data);
        if (!Array.isArray(data)) {
          setJobs([]);
          return;
        }
        setJobs(data);
      })
      .catch((err) => console.error("공고 불러오기 실패:", err));
  }, [selectedJobName]);

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // 검색 버튼 클릭 시
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
  };

  // 필터링 로직
  const filteredJobs = jobs.filter((job) => {
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      const company = (job.company_name || "").toLowerCase();
      const title = (job.title || "").toLowerCase();
      // 회사명 또는 공고명에 포함되어야 통과
      if (!company.includes(lower) && !title.includes(lower)) {
        return false;
      }
    }
    // 직무명 필터
    if (selectedJobName && job.job_name !== selectedJobName) {
      return false;
    }
    return true;
  });

  return (
    <FilterWrapper>


      {/* 나머지 필터/드롭다운/공고 리스트 ... */}
      {/* 아래쪽에 입력칸/검색 버튼이 있었다면 완전히 삭제! */}

      {/* 2. 기술스택 필터 */}
      <Select onChange={(e) => handleChange("tech_stack", e.target.value)}>
        <option value="">기술스택</option>
        {techStacks.map((stack) => (
          <option key={stack} value={stack}>{stack}</option>
        ))}
      </Select>

      {/* 3. 고용형태 필터 */}
      <Select onChange={(e) => handleChange("employment_type", e.target.value)}>
        <option value="">고용형태</option>
        {employmentTypes.map((type) => (
          <option key={type} value={type}>{type}</option>
        ))}
      </Select>

      {/* 4. 지원자 유형 필터 */}
      <Select onChange={(e) => handleChange("applicant_type", e.target.value)}>
        <option value="">지원자 유형</option>
        {applicantTypes.map((type) => (
          <option key={type} value={type}>{type}</option>
        ))}
      </Select>

      {/* 3. 직무명 드롭다운 (라벨 제거, 전체 → 직무) */}
      <div style={{ marginBottom: "1rem" }}>
        <select
          id="jobNameDropdown"
          value={selectedJobName}
          onChange={(e) => setSelectedJobName(e.target.value)}
        >
          <option value="">직무</option>
          {jobNames.map(job => (
            <option key={job.name} value={job.name}>
              {job.name}
            </option>
          ))}
        </select>
      </div>

      {/* 공고 리스트 */}
      {filteredJobs.map((job) => (
        <div key={job.id}>
          <b>{job.title}</b> ({job.company_name})
        </div>
      ))}
    </FilterWrapper>
  );
}

// ────────────── 💄 스타일링
const FilterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  width: 100%;
  max-width: 260px;  // 💡 너무 넓어지지 않게 제한
`;

const Select = styled.select`
  padding: 6px 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  background: white;
  font-size: 13px;
  width: 100%;
  box-sizing: border-box;
  min-width: 200px;
  max-width: 100%;
`;
