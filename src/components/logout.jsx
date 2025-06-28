import React, { useState } from "react";

import Sidebar from "./Sidebar";
import { FaSpinner } from "react-icons/fa";
import styled, { keyframes } from "styled-components";



export default function LogoutPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Container sidebarOpen={sidebarOpen}>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <CenteredContent>
        <Spinner />
        <h2>죄송해요, 대시보드를 불러올 수 없습니다</h2>
        <p>다시 로그인해주세요</p>
        <ActionButtons>
          <button onClick={() => (window.location.href = "/login")}>로그인</button>
        </ActionButtons>
      </CenteredContent>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  background: #1c1c1c;
  color: white;
  min-height: 100vh;
`;

const CenteredContent = styled.div`
  margin-left: ${({ sidebarOpen }) => (sidebarOpen ? "18vw" : "4.5rem")};
  flex-grow: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  h2 {
    color: #ffc107;
    font-size: 1.8rem;
    margin-bottom: 1rem;
  }
  p {
    font-size: 1rem;
    color: #ccc;
    margin-bottom: 2rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1.5rem;
  button {
    background-color:rgb(179, 166, 127);
    color: #1c1c1c;
    font-weight: bold;
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.2s;

    &:hover {
      background-color: #e6b106;
    }
  }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled(FaSpinner)`
  font-size: 3rem;
  color: #ffc107;
  margin-bottom: 1.5rem;
  animation: ${spin} 1.2s linear infinite;
`;
