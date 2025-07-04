import React, { useState, useRef, useEffect } from "react";
import styled, { css } from "styled-components";
import { FaUserCircle, FaSun, FaMoon } from "react-icons/fa";

/**
 * ProfileMenu – 우측 상단 프로필 메뉴
 * -------------------------------------------
 * ▸ props
 *   - darkMode: boolean
 *   - toggleTheme: function
 *   - setSelectedPage: function (페이지 전환용)
 * -------------------------------------------
 */
export default function ProfileMenu({ darkMode, toggleTheme, setSelectedPage }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

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

  return (
    <Wrapper ref={ref}>
      <ProfileIcon $darkMode={darkMode} onClick={() => setOpen(!open)}>
        <FaUserCircle />
      </ProfileIcon>

      {open && (
        <Dropdown $darkMode={darkMode}>
          <DropdownItem
            $darkMode={darkMode}
            onClick={() => {
              setSelectedPage("profile");
              setOpen(false);
            }}
          >
            프로필 수정
          </DropdownItem>

          <DropdownItem $darkMode={darkMode} onClick={toggleTheme}>
            {darkMode ? <><FaSun /> 라이트 모드</> : <><FaMoon /> 다크 모드</>}
          </DropdownItem>
        </Dropdown>
      )}
    </Wrapper>
  );
}

/* ───────── 스타일 ───────── */
const Wrapper = styled.div`
  position: relative;
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
+  font-size: 1rem;
   display: flex;
   align-items: center;
   gap: 0.6rem;
+  white-space: nowrap;    /* 공백 줄바꿈 방지 */
+  word-break: keep-all;   /* 한글 단어 줄바꿈 방지 */
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
