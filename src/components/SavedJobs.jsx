// src/components/SavedJobs.jsx
import React, { useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { FaHeart, FaTrashAlt } from "react-icons/fa";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://192.168.101.7:8000";

export const fetchSavedJobs = async (setSavedJobs) => {
  const token = localStorage.getItem("accessToken");
  if (!token) return;

  try {
    const res = await axios.get(`${BASE_URL}/preferences/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!Array.isArray(res.data)) {
      console.error("찜한 공고 API 응답이 배열이 아님:", res.data);
      setSavedJobs([]);
      return;
    }

    const transformed = res.data.map((item) => ({
      ...item.job_posting,
      job_post_id: item.job_post_id,
      preference_id: item.id,
    }));

    setSavedJobs(transformed);
  } catch (err) {
    console.error("❌ 찜한 공고 불러오기 실패:", err);
    setSavedJobs([]);
  }
};

export default function SavedJobs({ darkMode, savedJobs, setSavedJobs, onJobDetail }) {
  useEffect(() => {
    fetchSavedJobs(setSavedJobs);
  }, [setSavedJobs]);

  const handleUnsave = async (job_post_id) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return alert("로그인 후 이용해주세요.");

    try {
      await axios.delete(`${BASE_URL}/preferences/${job_post_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSavedJobs((prev) =>
        prev.filter((job) => job.job_post_id !== job_post_id)
      );
    } catch (err) {
      console.error("❌ 찜 해제 실패:", err);
      alert("찜 해제에 실패했습니다.");
    }
  };

  const handleDetailClick = (jobId) => {
    if (onJobDetail) {
      onJobDetail(jobId);
    }
  };

  return (
    <PageContainer $darkMode={darkMode}>
      <Header>
        <FaHeart /> 찜한 공고 <span>{savedJobs.length}개</span>
      </Header>

      {savedJobs.length === 0 ? (
        <Empty>찜한 공고가 없습니다.</Empty>
      ) : (
        <Grid>
          {savedJobs.map((job) => (
            <Card key={job.job_post_id} $darkMode={darkMode}>
              <Title>{job.title}</Title>
              <Company>{job.company_name}</Company>
              <Info>{job.address}</Info>
              <Dates>
                {job.posting_date?.slice(0, 10)} ~{" "}
                {job.deadline?.slice(0, 10) || "상시"}
              </Dates>

              {/* 내부 컴포넌트로 상세 페이지 이동 */}
              <DetailBtn onClick={() => handleDetailClick(job.job_post_id)}>
                상세 보기
              </DetailBtn>

              <DeleteBtn onClick={() => handleUnsave(job.job_post_id)}>
                <FaTrashAlt />
              </DeleteBtn>
            </Card>
          ))}
        </Grid>
      )}
    </PageContainer>
  );
}

/* ───────── styled-components ───────── */
const PageContainer = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? "#1a1a1a" : "#fff")};
  min-height: 100vh;
  padding: 2rem;
`;

const Header = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.6rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;

  span {
    font-size: 1rem;
    color: #999;
  }

  svg {
    color: #ff4d4d;
  }
`;

const Empty = styled.div`
  text-align: center;
  color: #888;
  font-size: 1rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.4rem;
`;

const Card = styled.div`
  position: relative;
  border-radius: 1rem;
  padding: 1.2rem;
  background: ${({ $darkMode }) => ($darkMode ? "#2a2a2a" : "#fffdf7")};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#ddd")};
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
`;

const Title = styled.div`
  font-weight: 700;
  font-size: 1.05rem;
  margin-bottom: 0.4rem;
`;

const Company = styled.div`
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
  color: #555;
`;

const Info = styled.div`
  font-size: 0.85rem;
  color: #666;
`;

const Dates = styled.div`
  font-size: 0.8rem;
  color: #aaa;
  margin-top: 0.4rem;
`;

const DeleteBtn = styled.button`
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
  font-size: 1.1rem;

  &:hover {
    color: red;
  }
`;

const DetailBtn = styled.button`
  margin-top: 0.8rem;
  padding: 0.5rem 1rem;
  background: #ffcc00;
  border: none;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  &:hover {
    background: #ffb300;
  }
`;