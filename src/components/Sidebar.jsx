import React from "react";
import styled from "styled-components";
import {
  FaBullseye, FaClipboardList, FaHeart, FaComments, FaRocket,
  FaSearch, FaBars, FaHistory, FaHome
} from "react-icons/fa";

export default function Sidebar({
  collapsed,
  setCollapsed,
  selectedPage,
  setSelectedPage
}) {
  return (
    <Wrapper collapsed={collapsed}>
      {/* 로고 */}
      <TopBar>
        <Logo onClick={() => setSelectedPage("dashboard")}>
          <LogoText collapsed={collapsed}>JOB자</LogoText>
        </Logo>
      </TopBar>

      {/* 내비게이션 */}
      <NavSection>
        <NavItem onClick={() => setSelectedPage("dashboard")}>
          <FaHome />
          <NavText collapsed={collapsed}><strong>홈</strong></NavText>
        </NavItem>
        <Divider />

        <NavItem onClick={() => setSelectedPage("ai-jobs")}>
          <FaRocket />
          <NavText collapsed={collapsed}><strong>AI 추천 공고</strong></NavText>
        </NavItem>
        <NavItem onClick={() => setSelectedPage("career-roadmap")}>
          <FaBullseye />
          <NavText collapsed={collapsed}><strong>커리어 로드맵</strong></NavText>
        </NavItem>
        <Divider />

        <NavItem onClick={() => setSelectedPage("todo")}>
          <FaClipboardList />
          <NavText collapsed={collapsed}><strong>To-do List</strong></NavText>
        </NavItem>
        <NavItem onClick={() => setSelectedPage("search")}>
          <FaSearch />
          <NavText collapsed={collapsed}><strong>공고 검색</strong></NavText>
        </NavItem>
        <NavItem onClick={() => setSelectedPage("saved")}>
          <FaHeart />
          <NavText collapsed={collapsed}><strong>찜한 공고</strong></NavText>
        </NavItem>
        <Divider />

        <NavItem onClick={() => setSelectedPage("history")}>
          <FaHistory />
          <NavText collapsed={collapsed}><strong>대화 이력</strong></NavText>
        </NavItem>
      </NavSection>

      {/* 접기 버튼 */}
      <Footer collapsed={collapsed}>
        <CollapseBtn onClick={() => setCollapsed(!collapsed)}>
          <FaBars />
        </CollapseBtn>
      </Footer>
    </Wrapper>
  );
}

/* ───────── 스타일 ───────── */
const Wrapper = styled.aside`
  width: ${(p) => (p.collapsed ? "56px" : "260px")};
  background: #333;
  color: #ccc;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  transition: width 0.25s;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const Logo = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
`;

const LogoText = styled.span`
  margin-left: 0.5rem;
  display: ${(p) => (p.collapsed ? "none" : "inline")};
  color: #ffc107;
`;

const NavSection = styled.div`
  flex: 1;
`;

const NavText = styled.div`
  display: ${(p) => (p.collapsed ? "none" : "flex")};
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem;
  border-radius: 0.4rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #3a3a3a;

    svg { color: #ffc107; }
    ${NavText} strong { color: #ffc107; }
  }
`;



const Divider = styled.div`
  height: 1px;
  background: #555;
  margin: 1rem 0;
`;

const Footer = styled.div`
  margin-top: auto;
  display: flex;
  justify-content: ${(p) => (p.collapsed ? "center" : "flex-end")};
`;

const CollapseBtn = styled.div`
  font-size: 1.2rem;
  cursor: pointer;
  color: #888;
`;
