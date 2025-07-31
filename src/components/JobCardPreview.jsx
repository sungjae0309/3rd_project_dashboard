// src/components/JobCardPreview.jsx
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import JobCardFiltered from "./JobCardFiltered";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://192.168.101.7:8000";
export default function JobCardPreview({ darkMode, savedJobs, setSavedJobs, onJobDetail }) {
  const [jobPosts, setJobPosts] = useState([]);
  const [filters, setFilters] = useState({
    company_name: "",
    employment_type: "",
    applicant_type: "",
    tech_stack: "",
    job_name: "",
  });

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchInput, setDebouncedSearchInput] = useState("");

  useEffect(() => {
    fetchJobs();
  }, [filters, debouncedSearchInput]);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  // 디바운싱을 300ms로 단축하여 더 빠른 검색
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchInput(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchJobs = async () => {
    try {
      // ✨ 1. 유사도 점수를 받기 위해 로그인 토큰을 함께 보냅니다.
      const token = localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // 검색어가 있을 경우 회사명과 공고명에 검색어 포함
      const params = { ...filters };
      
      // 검색어가 있으면 회사명과 공고명 필터에 추가
      if (debouncedSearchInput.trim()) {
        params.company_name = debouncedSearchInput.trim();
        params.title = debouncedSearchInput.trim();
      }

      const res = await axios.get(`${BASE_URL}/job_posts/`, {
        params: params,
        headers: headers, // 헤더에 토큰 추가
      });

      if (!Array.isArray(res.data)) {
        console.error("공고 API 응답이 배열이 아님:", res.data);
        setJobPosts([]);
        return;
      }

      // ✨ 2. API로부터 받은 공고 목록을 유사도(similarity) 점수가 높은 순으로 정렬합니다.
      const sortedData = res.data.sort((a, b) => {
        const simA = a.similarity ?? -1;
        const simB = b.similarity ?? -1;
        return simB - simA;
      });

      setJobPosts(sortedData);
    } catch (err) {
      console.error("❌ 공고 불러오기 실패:", err);
      setJobPosts([]);
    }
  };

  const fetchSavedJobs = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const res = await axios.get(`${BASE_URL}/preferences/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jobs = res.data.map((item) => ({
        ...item.job_posting,
        job_post_id: item.job_post_id,
        preference_id: item.id,
      }));
      setSavedJobs(jobs);
    } catch (err) {
      console.error("찜한 공고 불러오기 실패", err);
    }
  };

  const handleToggleSave = async (jobPostId) => {
    // ✨ 1. 디버깅을 위해 현재 토큰 값을 콘솔에 출력합니다.
    const token = localStorage.getItem("accessToken");
    console.log("찜하기 버튼 클릭 시 토큰:", token);

    if (!token) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    const isSaved = savedJobs.some((job) => job.job_post_id === jobPostId);

    if (isSaved) {
      try {
        await axios.delete(`${BASE_URL}/preferences/${jobPostId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSavedJobs((prev) => prev.filter((job) => job.job_post_id !== jobPostId));
      } catch (err) {
        alert("찜 해제 실패");
      }
    } else {
      try {
        const res = await axios.post(
          `${BASE_URL}/preferences/`,
          { job_post_id: jobPostId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const newJob = {
          ...res.data.job_posting,
          job_post_id: res.data.job_post_id,
          preference_id: res.data.id,
        };
        setSavedJobs((prev) => [...prev, newJob]);
      } catch (err) {
        if (err.response?.status === 400) {
          alert("이미 찜한 공고입니다.");
        } else {
          console.error("❌ 찜 추가 오류:", err);
        }
      }
    }
  };

  const handleCardClick = (jobId) => {
    // 내부 컴포넌트로 상세 페이지 이동
    if (onJobDetail) {
      onJobDetail(jobId);
    }
  };

  return (
    <Container $darkMode={darkMode}>
      {/* ✨ [스타일 개선] 검색 및 필터링을 더 컴팩트하게 */}
      <SearchSection $darkMode={darkMode}>
        <SearchBar>
          <SearchInput
            type="text"
            placeholder="회사명, 공고명으로 검색"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            $darkMode={darkMode}
          />
        </SearchBar>
        
        <FilterSection>
          <JobCardFiltered filters={filters} setFilters={setFilters} darkMode={darkMode} />
        </FilterSection>
      </SearchSection>
      <CardGrid>
        {jobPosts.map((job) => (
          <Card
            key={job.id}
            $darkMode={darkMode}
            onClick={() => handleCardClick(job.id)}
          >
            {/* ✨ 3. 유사도 점수가 있을 경우, 배지로 표시합니다. */}
            {job.similarity !== null && typeof job.similarity === 'number' && (
              <SimilarityBadge $score={job.similarity}>
                적합도 {(job.similarity * 100).toFixed(0)}%
              </SimilarityBadge>
            )}

            <Title>{job.title}</Title>
            <Company>{job.company_name}</Company>
            <Info>{job.address}</Info>
            <Dates>
              {job.posting_date?.slice(0, 10)} ~{" "}
              {job.deadline?.slice(0, 10) || "상시"}
            </Dates>
            <HeartButton
              onClick={(e) => {
                e.stopPropagation();
                handleToggleSave(job.id);
              }}
            >
              {savedJobs.some((saved) => saved.job_post_id === job.id) ? (
                <FaHeart color="red" />
              ) : (
                <FaRegHeart />
              )}
            </HeartButton>
          </Card>
        ))}
      </CardGrid>
    </Container>
  );
}

/* ───────── styled-components ───────── */

// ✨ [개선] 검색 및 필터링 스타일을 더 컴팩트하게
const SearchSection = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? "#2a2a2a" : "#f8f9fa")};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#e9ecef")};
  border-radius: 0.8rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const SearchBar = styled.div`
  margin-bottom: 1rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.8rem 1.2rem;
  border: 2px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#e9ecef")};
  border-radius: 0.6rem;
  background: ${({ $darkMode }) => ($darkMode ? "#333" : "#fff")};
  color: ${({ $darkMode }) => ($darkMode ? "#fff" : "#333")};
  font-size: 0.95rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #ffa500;
    box-shadow: 0 0 0 2px rgba(255, 165, 0, 0.1);
  }
  
  &::placeholder {
    color: ${({ $darkMode }) => ($darkMode ? "#888" : "#999")};
  }
`;

const FilterSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const SimilarityBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: ${({ $score }) =>
    $score >= 0.7 ? '#2a9d8f' : $score >= 0.4 ? '#f4a261' : '#e76f51'};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  z-index: 2;
`;

const Container = styled.div`
  padding: 20px;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.4rem;
`;

const Card = styled.div`
  position: relative;
  border-radius: 1rem;
  padding: 1.2rem;
  padding-top: 2rem; // 배지 공간 확보
  background: ${({ $darkMode }) => ($darkMode ? "#2a2a2a" : "#fffdf7")};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#ddd")};
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const Title = styled.div`
  font-weight: 700;
  font-size: 1.05rem;
  margin-bottom: 0.4rem;
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
`;

const Company = styled.div`
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
  color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#555'};
`;

const Info = styled.div`
  font-size: 0.85rem;
  color: ${({ $darkMode }) => $darkMode ? '#bbb' : '#666'};
`;

const Dates = styled.div`
  font-size: 0.8rem;
  color: ${({ $darkMode }) => $darkMode ? '#888' : '#aaa'};
  margin-top: 0.4rem;
`;

const HeartButton = styled.button`
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  z-index: 2;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;