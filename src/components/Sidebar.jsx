import React, { useState, useEffect } from "react";
import styled, { css } from "styled-components";
import {
  FaBullseye,
  FaClipboardList,
  FaHeart,
  FaRocket,
  FaSearch,
  FaTimes,
  FaHistory,
  FaHome,
  FaComments,
  FaChevronRight
} from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";

export default function Sidebar({
  collapsed,
  setCollapsed,
  selectedPage,
  setSelectedPage,
  darkMode
}) {
  const [careerOpen, setCareerOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(true);
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });

  // 사이드바가 펼쳐질 때 토글 상태를 열린 상태로 설정
  useEffect(() => {
    if (!collapsed) {
      setCareerOpen(true);
      setSearchOpen(true);
    }
  }, [collapsed]);

  // 커스텀 툴팁 함수들
  const showTooltip = (text, event) => {
    if (!collapsed) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      show: true,
      text,
      x: rect.right + 10,
      y: rect.top + rect.height / 2
    });
  };

  const hideTooltip = () => {
    setTooltip({ show: false, text: '', x: 0, y: 0 });
  };

  const careerSubpages = [
    { key: "career-summary", label: "종합" },
    { key: "career-trend", label: "트렌드 분석" },
    { key: "career-gap", label: "갭 분석" },
    { key: "career-plan", label: "극복 방안" }
  ];

  const searchSubpages = [
    { key: "search", label: "공고" },
    { key: "roadmap-bootcamps", label: "부트캠프" },
    { key: "roadmap-courses", label: "강의" }
  ];

  // [추가] 커리어 하위 메뉴 클릭을 처리하는 함수입니다.
  const handleCareerSubpageClick = (key) => {
    // 모든 커리어 메뉴 클릭 시, 우선 'career-summary' 페이지를 보여줍니다.
    setSelectedPage("career-summary");
    
    const url = new URL(window.location);

    if (key === "career-gap") {
      // '갭 분석'을 클릭하면 해당 id를 가진 섹션으로 스크롤합니다.
      url.searchParams.set('section', 'gap-analysis-section');
      window.history.pushState({}, '', url);
      setTimeout(() => {
        document.getElementById("gap-analysis-section")?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } else if (key === "career-plan") {
      // '극복 방안'을 클릭하면 해당 id를 가진 섹션으로 스크롤합니다.
      url.searchParams.set('section', 'overcome-plan-section');
      window.history.pushState({}, '', url);
      setTimeout(() => {
        document.getElementById("overcome-plan-section")?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } else {
      // '종합' 또는 '트렌드 분석'을 클릭하면 페이지 맨 위로 이동합니다.
      url.searchParams.delete('section');
      window.history.pushState({}, '', url);
      setTimeout(() => window.scrollTo(0, 0), 150);
    }
  };

  return (
    <Wrapper $darkMode={darkMode} collapsed={collapsed}>
      <TopBar>
        <Logo onClick={() => setSelectedPage("dashboard")} collapsed={collapsed}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <LogoText collapsed={collapsed}>JOB</LogoText>
            <LogoText collapsed={collapsed} style={{ color: "#fff" }}>자</LogoText>
          </div>
          <LogoSubtitle collapsed={collapsed} $darkMode={darkMode}>
            당신의 취업 여정에 함께하겠습니다
          </LogoSubtitle>
        </Logo>
        <CollapseBtn onClick={() => setCollapsed(!collapsed)} $darkMode={darkMode}>
          {collapsed ? <FaChevronRight /> : <FaTimes />}
        </CollapseBtn>
      </TopBar>

      <NavSection>
        <NavItem 
          onClick={() => setSelectedPage("dashboard")} 
          $darkMode={darkMode} 
          collapsed={collapsed}
          onMouseEnter={(e) => showTooltip("홈", e)}
          onMouseLeave={hideTooltip}
        >
          <FaHome />
          <NavText collapsed={collapsed}><strong>홈</strong></NavText>
        </NavItem>
        {!collapsed && <Divider $darkMode={darkMode} />}

        <NavItem 
          onClick={() => setSelectedPage("todo")} 
          $darkMode={darkMode} 
          collapsed={collapsed}
          onMouseEnter={(e) => showTooltip("To-do List", e)}
          onMouseLeave={hideTooltip}
        >
          <FaClipboardList />
          <NavText collapsed={collapsed}><strong>To-do List</strong></NavText>
        </NavItem>
        {!collapsed && <Divider $darkMode={darkMode} />}

        <NavItem 
          onClick={() => setCareerOpen(!careerOpen)} 
          $darkMode={darkMode} 
          collapsed={collapsed}
          onMouseEnter={(e) => showTooltip("커리어 로드맵", e)}
          onMouseLeave={hideTooltip}
        >
          <FaBullseye />
          <NavText collapsed={collapsed}><strong>커리어 로드맵</strong></NavText>
          {!collapsed && (
            <ArrowIcon open={careerOpen}>
              <IoIosArrowDown />
            </ArrowIcon>
          )}
        </NavItem>

        {careerOpen && !collapsed &&
          careerSubpages.map(sub => (
            <SubItem
              // [수정] 위에서 만든 새 함수를 여기서 호출합니다.
              onClick={() => handleCareerSubpageClick(sub.key)}
              $darkMode={darkMode}
            >
              <Dot>•</Dot>
              <strong>{sub.label}</strong>
            </SubItem>
          ))
        }
        {!collapsed && <Divider $darkMode={darkMode} />}

        <NavItem 
          onClick={() => setSearchOpen(!searchOpen)} 
          $darkMode={darkMode} 
          collapsed={collapsed}
          onMouseEnter={(e) => showTooltip("검색", e)}
          onMouseLeave={hideTooltip}
        >
          <FaSearch />
          <NavText collapsed={collapsed}><strong>검색</strong></NavText>
          {!collapsed && (
            <ArrowIcon open={searchOpen}>
              <IoIosArrowDown />
            </ArrowIcon>
          )}
        </NavItem>

        {searchOpen && !collapsed &&
          searchSubpages.map(sub => (
            <SubItem
              key={sub.key}
              onClick={() => setSelectedPage(sub.key)}
              $darkMode={darkMode}
            >
              <Dot>•</Dot>
              <strong>{sub.label}</strong>
            </SubItem>
          ))
        }

        <NavItem 
          onClick={() => setSelectedPage("saved")} 
          $darkMode={darkMode} 
          collapsed={collapsed}
          onMouseEnter={(e) => showTooltip("찜한 페이지", e)}
          onMouseLeave={hideTooltip}
        >
          <FaHeart />
          <NavText collapsed={collapsed}><strong>찜한 페이지</strong></NavText>
        </NavItem>
        {!collapsed && <Divider $darkMode={darkMode} />}

        <NavItem 
          onClick={() => setSelectedPage("chat")} 
          $darkMode={darkMode} 
          collapsed={collapsed}
          onMouseEnter={(e) => showTooltip("채팅", e)}
          onMouseLeave={hideTooltip}
        >
          <FaComments />
          <NavText collapsed={collapsed}><strong>채팅</strong></NavText>
        </NavItem>

        <NavItem 
          onClick={() => setSelectedPage("history")} 
          $darkMode={darkMode} 
          collapsed={collapsed}
          onMouseEnter={(e) => showTooltip("대화 이력", e)}
          onMouseLeave={hideTooltip}
        >
          <FaHistory />
          <NavText collapsed={collapsed}><strong>대화 이력</strong></NavText>
        </NavItem>
      </NavSection>
      
      {/* 커스텀 툴팁 */}
      {tooltip.show && (
        <CustomTooltip 
          style={{ 
            left: tooltip.x, 
            top: tooltip.y,
            transform: 'translateY(-50%)'
          }}
          $darkMode={darkMode}
        >
          {tooltip.text}
        </CustomTooltip>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.aside`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: ${p => p.collapsed ? "90px" : "260px"};
  display: flex;
  flex-direction: column;
  padding: 1rem;
  transition: width .25s;
  z-index: 1000;
  overflow-y: auto;
  ${({ $darkMode }) => $darkMode ? css`
    background: #333;
    color: #ccc;
  ` : css`
    background: rgb(197, 196, 195);
    color: #51442a;
    box-shadow: 1px 0 4px rgba(0,0,0,.05);
  `}
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const Logo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  cursor: pointer;
`;

const LogoText = styled.span`
  margin-left: .5rem;
  display: ${p => p.collapsed ? "none" : "inline"};
  color: #ffc107;
  font-size: 1.8rem;
  font-weight: 700;
`;

const LogoSubtitle = styled.div`
  font-size: 0.7rem;
  font-weight: 400;
  color: #666;
  line-height: 1.2;
  margin-left: .5rem;
  display: ${p => p.collapsed ? "none" : "block"};
  ${({ $darkMode }) => $darkMode && css`color: #aaa;`}
`;

const NavSection = styled.div`
  flex: 1;
  margin-top: 1.7rem;
`;

const NavText = styled.div`
  display: ${p => p.collapsed ? "none" : "flex"};
  flex: 1;
  align-items: center;
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  gap: .6rem;
  padding: ${p => p.collapsed ? "1.2rem 0.5rem" : "0.6rem"};
  border-radius: .4rem;
  cursor: pointer;
  transition: all .2s;
  justify-content: ${p => p.collapsed ? "center" : "flex-start"};
  margin-bottom: ${p => p.collapsed ? "1rem" : "0"};
  ${({ $darkMode }) => $darkMode ? css`
    &:hover {
      background: #3a3a3a;
      svg { color: #ffc107; }
      ${NavText} strong { color: #ffc107; }
    }
  ` : css`
    &:hover {
      background: rgb(248, 211, 99);
      svg { color: rgb(30, 30, 29); }
      ${NavText} strong { color: rgb(26, 25, 24); }
    }
  `}
`;

const ArrowIcon = styled.div`
  margin-left: auto;
  font-size: 1rem;
  transition: transform 0.25s ease;
  ${({ open }) => open
    ? css`transform: rotate(0deg);`
    : css`transform: rotate(-90deg);`}
`;

const SubItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.6rem 0.4rem 2.2rem;
  margin-left: 0.2rem;
  font-size: 0.95rem;
  cursor: pointer;
  border-radius: 0.4rem;
  ${({ $darkMode }) => $darkMode ? css`
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
  height: 1px;
  margin: 1rem 0;
  ${({ $darkMode }) => $darkMode
    ? css`background: #555;`
    : css`background: #ddd;`}
`;

const Footer = styled.div`
  margin-top: auto;
  display: flex;
  justify-content: ${p => p.collapsed ? "center" : "flex-end"};
`;

const CollapseBtn = styled.div`
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
  color: ${({ $darkMode }) => $darkMode ? "#ccc" : "#666"};
  
  &:hover {
    color: #ff4757;
    background: ${({ $darkMode }) => $darkMode ? "#3a3a3a" : "#f0f0f0"};
  }
`;

const CustomTooltip = styled.div`
  position: fixed;
  background: ${({ $darkMode }) => $darkMode ? '#333' : '#000'};
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#fff'};
  padding: 0.5rem 0.75rem;
  border-radius: 0.4rem;
  font-size: 0.85rem;
  font-weight: 500;
  z-index: 10000;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  animation: tooltipFadeIn 0.1s ease-in-out;
  
  @keyframes tooltipFadeIn {
    from {
      opacity: 0;
      transform: translateY(-50%) translateX(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(-50%) translateX(0);
    }
  }
`;

const SubIcon = styled.div`
  font-size: 0.9rem;
  color: ${({ $darkMode }) => $darkMode ? "#ccc" : "#666"};
`;