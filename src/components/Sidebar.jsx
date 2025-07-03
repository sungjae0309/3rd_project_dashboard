import React, { useState } from "react";
import styled, { css } from "styled-components";
import {
  FaBullseye, FaClipboardList, FaHeart, FaRocket,
  FaSearch, FaBars, FaHistory, FaHome
} from "react-icons/fa";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io"; // 토글 아이콘

export default function Sidebar({
  collapsed,
  setCollapsed,
  selectedPage,
  setSelectedPage,
  darkMode
}) {
  const [careerOpen, setCareerOpen] = useState(true); // 디폴트 열림

  const careerSubpages = [
    { key: "career-summary", label: "종합" },
    { key: "career-requirements", label: "트렌드 분석" },
    { key: "career-gap", label: "갭 분석" },
    { key: "career-plan", label: "극복 방안" }
  ];

  return (
    <Wrapper $darkMode={darkMode} collapsed={collapsed}>
      {/* 로고 */}
      <TopBar>
        <Logo onClick={() => setSelectedPage("aijob")}>
          <LogoText collapsed={collapsed}>JOB</LogoText>
          <span style={{ color: "#fff" }}>자</span>
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

        <NavItem
          onClick={() => setCareerOpen(!careerOpen)}
          $darkMode={darkMode}
        >
          <FaBullseye />
          <NavText collapsed={collapsed}>
            <strong>커리어 로드맵</strong>
          </NavText>
          {!collapsed && (
            <ArrowIcon open={careerOpen}>
            <IoIosArrowDown />
          </ArrowIcon>
          
          )}
        </NavItem>

        {careerOpen && !collapsed && (
          careerSubpages.map((sub) => (
            <SubItem
              key={sub.key}
              onClick={() => setSelectedPage(sub.key)}
              $darkMode={darkMode}
            >
              <Dot>•</Dot>
              <strong>{sub.label}</strong>
            </SubItem>
          ))
        )}

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
  width:${p => p.collapsed ? "56px" : "260px"};
  display:flex; flex-direction:column; padding:1rem; transition:width .25s;
  ${({$darkMode})=>$darkMode?css`
    background:#333; color:#ccc;
  `:css`
    background:rgb(206, 205, 204); color:#51442a; box-shadow:1px 0 4px rgba(0,0,0,.05);
  `}
`;

const TopBar = styled.div` display:flex; align-items:center; margin-bottom:1rem; `;
const Logo = styled.div` font-size:1.2rem; font-weight:bold; cursor:pointer; `;
const LogoText = styled.span`
  margin-left:.5rem; display:${p=>p.collapsed?"none":"inline"};
  color:#ffc107;
`;

const NavSection = styled.div` flex:1; `;
const NavText = styled.div` display:${p=>p.collapsed?"none":"flex"}; flex: 1; align-items: center; `;

const NavItem = styled.div`
  display:flex; align-items:center; gap:.6rem; padding:.6rem; border-radius:.4rem;
  cursor:pointer; transition:all .2s;
  ${({$darkMode})=>$darkMode?css`
    &:hover{ background:#3a3a3a; svg{color:#ffc107;} ${NavText} strong{color:#ffc107;} }
  `:css`
    &:hover{ background:rgb(248, 211, 99); 
    svg{color:rgb(30, 30, 29);} ${NavText} strong{color:rgb(26, 25, 24);} }
  `}
`;

const ArrowIcon = styled.div`
  margin-left: auto;
  font-size: 1rem;
  transition: transform 0.25s ease;  // ← 추가

  ${({ open }) =>
    open
      ? css`transform: rotate(0deg);`
      : css`transform: rotate(-90deg);`}
`;


const SubItem = styled.div`
  display:flex; align-items:center; gap:0.4rem;
  padding: 0.4rem 0.6rem 0.4rem 2.2rem;
  margin-left: 0.2rem;
  font-size: 0.95rem;
  cursor:pointer; border-radius:0.4rem;
  ${({$darkMode}) => $darkMode ? css`
  &:hover {
    background: #3a3a3a;
    strong { color: #ffc107; }
  }
` : css`
  &:hover {
    background: rgb(248, 211, 99);
    strong { color: rgb(26, 25, 24); }
  }
`}

`;

const Dot = styled.span`
  font-size: 1.2rem;
  line-height: 1;
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
