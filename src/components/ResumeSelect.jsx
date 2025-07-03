import React, { useRef } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ResumeSelect() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleFileUploadClick = () => {
    fileInputRef.current.click(); // input[type="file"] 클릭
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("resume_file", file);

    try {
      const res = await axios.post("http://localhost:8000/resume/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      alert("업로드 성공: " + res.data.message);
    } catch (err) {
      alert("업로드 실패: " + (err.response?.data?.detail || err.message));
    }
  };

  const goToDirectInput = () => {
    navigate("/registernext");
  };

  return (
    <Bg>
      <Card>
        <Title>이력서 등록</Title>

        {/* 파일 업로드 */}
        <UploadBtn onClick={handleFileUploadClick}>파일로 업로드</UploadBtn>
        <HiddenInput
          type="file"
          accept=".pdf,.doc,.docx,.hwp"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        {/* 직접 입력 */}
        <UploadBtn onClick={goToDirectInput}>직접 입력</UploadBtn>
      </Card>
    </Bg>
  );
}

const Bg = styled.div`
  background: #f5f5f5;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Card = styled.div`
  background: white;
  padding: 3rem 2.5rem;
  border-radius: 2rem;
  box-shadow: 0 0 15px rgba(0,0,0,0.1);
  width: 32rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #ffa500;
  margin-bottom: 2.5rem;
  font-weight: bold;
`;

const UploadBtn = styled.button`
  width: 100%;
  background: #ffc107;
  color: black;
  border: none;
  border-radius: 1rem;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 1.2rem;
  cursor: pointer;
  &:hover {
    background: #ffb300;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;
