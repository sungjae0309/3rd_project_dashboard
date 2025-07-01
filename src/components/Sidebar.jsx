// components/Sidebar.jsx
import React from "react";
import styled, { css } from "styled-components";
import {
  FaBullseye, FaClipboardList, FaHeart, FaComments, FaRocket,
  FaSearch, FaBars, FaHistory, FaHome
} from "react-icons/fa";

export default function Sidebar({
  collapsed,
  setCollapsed,
  selectedPage,
  setSelectedPage,
  darkMode            // ⬅ 부모에서 전달
}) {
  return (
    <Wrapper $darkMode={darkMode} collapsed={collapsed}>
      {/* 로고 */}
      <TopBar>
        <Logo onClick={() => setSelectedPage("aijob")}>
          <LogoText collapsed={collapsed}>JOB자</LogoText>
        </Logo>
      </TopBar>

      {/* 내비게이션 */}
      <NavSection>
        <NavItem onClick={() => setSelectedPage("dashboard")} $darkMode={darkMode}>
          <FaHome />
          <NavText collapsed={collapsed}><strong>홈</strong></NavText>
        </NavItem>
        <Divider $darkMode={darkMode} />

        <NavItem onClick={() => setSelectedPage("ai-jobs")} $darkMode={darkMode}>
          <FaRocket />
          <NavText collapsed={collapsed}><strong>AI 추천 공고</strong></NavText>
        </NavItem>
        <NavItem onClick={() => setSelectedPage("career-roadmap")} $darkMode={darkMode}>
          <FaBullseye />
          <NavText collapsed={collapsed}><strong>커리어 로드맵</strong></NavText>
        </NavItem>
        <Divider $darkMode={darkMode} />

        <NavItem onClick={() => setSelectedPage("todo")} $darkMode={darkMode}>
          <FaClipboardList />
          <NavText collapsed={collapsed}><strong>To-do List</strong></NavText>
        </NavItem>
        <NavItem onClick={() => setSelectedPage("search")} $darkMode={darkMode}>
          <FaSearch />
          <NavText collapsed={collapsed}><strong>공고 검색</strong></NavText>
        </NavItem>
        <NavItem onClick={() => setSelectedPage("saved")} $darkMode={darkMode}>
          <FaHeart />
          <NavText collapsed={collapsed}><strong>찜한 공고</strong></NavText>
        </NavItem>
        <Divider $darkMode={darkMode} />

        <NavItem onClick={() => setSelectedPage("history")} $darkMode={darkMode}>
          <FaHistory />
          <NavText collapsed={collapsed}><strong>대화 이력</strong></NavText>
        </NavItem>
      </NavSection>

      {/* 접기 버튼 */}
      <Footer collapsed={collapsed}>
        <CollapseBtn>
          <FaBars onClick={() => setCollapsed(!collapsed)} />
        </CollapseBtn>
      </Footer>
    </Wrapper>
  );
}

/* ───────── 스타일 ───────── */
const Wrapper = styled.aside`
  width:${p=>p.collapsed?"56px":"260px"};
  display:flex; flex-direction:column; padding:1rem; transition:width .25s;
  ${({$darkMode})=>$darkMode?css`
    background:#333; color:#ccc;
  `:css`
    background:#f7f4ec; color:#51442a; box-shadow:1px 0 4px rgba(0,0,0,.05);
  `}
`;

const TopBar = styled.div` display:flex; align-items:center; margin-bottom:1rem; `;
const Logo = styled.div` font-size:1.2rem; font-weight:bold; cursor:pointer; `;
const LogoText = styled.span`
  margin-left:.5rem; display:${p=>p.collapsed?"none":"inline"};
  color:#ffc107;
`;

const NavSection = styled.div` flex:1; `;
const NavText = styled.div` display:${p=>p.collapsed?"none":"flex"}; `;

const NavItem = styled.div`
  display:flex; align-items:center; gap:.6rem; padding:.6rem; border-radius:.4rem;
  cursor:pointer; transition:all .2s;
  ${({$darkMode})=>$darkMode?css`
    &:hover{ background:#3a3a3a; svg{color:#ffc107;} ${NavText} strong{color:#ffc107;} }
  `:css`
    &:hover{ background:#e8e2d6; svg{color:#d39b00;} ${NavText} strong{color:#d39b00;} }
  `}
`;

const Divider = styled.div`
  height:1px; margin:1rem 0;
  ${({$darkMode})=>$darkMode?css`background:#555;`:`background:#ddd;`}
`;

const Footer = styled.div`
  margin-top:auto;
  display:flex; justify-content:${p=>p.collapsed?"center":"flex-end"};
`;
const CollapseBtn = styled.div`
  font-size:1.2rem; cursor:pointer;
  ${({theme})=>css`color:${theme?.colors?.textSecondary||"#888"};`}
`;
