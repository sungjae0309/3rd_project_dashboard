import React, { useRef } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUpload, FaKeyboard } from "react-icons/fa";

export default function ResumeSelect() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleFileUploadClick = () => {
    fileInputRef.current.click();
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
        <Title>이력서 등록 방법</Title>

        <Button onClick={handleFileUploadClick} $primary>
          <FaUpload style={{ marginRight: "0.5rem" }} />
          파일로 업로드
        </Button>
        <HiddenInput
          type="file"
          accept=".pdf,.doc,.docx,.hwp"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        <Button onClick={goToDirectInput}>
          <FaKeyboard style={{ marginRight: "0.5rem" }} />
          직접 입력
        </Button>
      </Card>
    </Bg>
  );
}

const Bg = styled.div`
  background: #f4f4f4;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Card = styled.div`
  background: #ffffff;
  padding: 3rem 2.5rem;
  border-radius: 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  width: 95%;
  max-width: 420px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 1.9rem;
  color: #ff9900;
  margin-bottom: 2.2rem;
  font-weight: 700;
  letter-spacing: -0.5px;
`;

const Button = styled.button`
  width: 100%;
  padding: 1rem;
  background: ${({ $primary }) => ($primary ? "#ffcc00" : "#eaeaea")};
  color: ${({ $primary }) => ($primary ? "#333" : "#555")};
  border: none;
  border-radius: 1rem;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ $primary }) => ($primary ? "#f4b400" : "#dcdcdc")};
  }
`;

const HiddenInput = styled.input`
  display: none;
`;
