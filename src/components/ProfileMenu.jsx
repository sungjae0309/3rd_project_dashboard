import React, { useState, useRef, useEffect } from "react";
import styled, { css } from "styled-components";
// FaUser 아이콘을 추가로 import 합니다.
import { FaUser, FaUserCircle, FaSun, FaMoon, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function ProfileMenu({ darkMode, toggleTheme, setSelectedPage }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const navigate = useNavigate();
  // 로컬 스토리지의 토큰 유무로 로그인 상태를 판별합니다.
  const isLoggedIn = !!localStorage.getItem("accessToken");

  // 바깥 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 로그아웃 처리 함수
  const handleLogout = () => {
    setOpen(false); // 드롭다운 메뉴를 닫습니다.
    // logout 페이지로 이동시켜 로그아웃 관련 API 처리 및 토큰 제거를 위임합니다.
    navigate("/logout", { replace: true });
  };

  return (
    <Wrapper ref={ref}>
      {isLoggedIn ? (
        // ✅ 1. 로그인 상태일 때의 UI
        <>
          <ProfileIcon $darkMode={darkMode} onClick={() => setOpen(!open)}>
            <FaUserCircle />
          </ProfileIcon>

          {open && (
            <Dropdown $darkMode={darkMode}>
              {/* ✅ 2. "내 프로필"로 텍스트 변경, 아이콘 추가 및 순서 변경 */}
              <DropdownItem
                $darkMode={darkMode}
                onClick={() => {
                  setSelectedPage("profile");
                  setOpen(false);
                }}
              >
                <FaUser /> 내 프로필
              </DropdownItem>

              <DropdownItem $darkMode={darkMode} onClick={handleLogout}>
                <FaSignOutAlt /> 로그아웃
              </DropdownItem>
              
              <DropdownItem $darkMode={darkMode} onClick={toggleTheme}>
                {darkMode ? <><FaSun /> 라이트 모드</> : <><FaMoon /> 다크 모드</>}
              </DropdownItem>
            </Dropdown>
          )}
        </>
      ) : (
        // ✅ 3. 로그아웃 상태일 때의 UI
        <LoggedOutButtons>
          <AuthLink $darkMode={darkMode} onClick={() => navigate("/login")}>
            로그인
          </AuthLink>
          <Divider $darkMode={darkMode} />
          <AuthLink $darkMode={darkMode} onClick={() => navigate("/register")}>
            회원가입
          </AuthLink>
        </LoggedOutButtons>
      )}
    </Wrapper>
  );
}

/* ───────── 스타일 ───────── */
const Wrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

// ✅ 4. 로그아웃 상태일 때 버튼들을 감싸는 스타일 추가
const LoggedOutButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

// ✅ 5. 로그인/회원가입 링크 스타일 추가
const AuthLink = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#555")};
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: ${({ $darkMode }) => ($darkMode ? "#fff" : "#000")};
  }
`;

// ✅ 6. 구분선 스타일 추가
const Divider = styled.div`
  width: 1px;
  height: 1.2rem;
  background: ${({ $darkMode }) => ($darkMode ? "#555" : "#ccc")};
`;

const ProfileIcon = styled.div`
  font-size: 1.8rem;
  cursor: pointer;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#666")};

  &:hover {
    color: ${({ $darkMode }) => ($darkMode ? "#fff" : "#000")};
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 2.4rem;
  right: 0;
  background: ${({ $darkMode }) => ($darkMode ? "#444" : "#e9e4d7")};
  border-radius: 0.4rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  z-index: 10;
`;

const DropdownItem = styled.div`
  padding: 0.9rem 1rem;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  white-space: nowrap;
  word-break: keep-all;
  line-height: 1.4;

  ${({ $darkMode }) =>
    $darkMode
      ? css`
          color: #eee;
          &:hover { background: #555; }
        `
      : css`
          color: #333;
          &:hover { background: #d8d2c2; }
        `}
`;