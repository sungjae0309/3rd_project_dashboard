import React, { useState, useRef, useEffect } from "react";
import styled, { css } from "styled-components";
import { FaUserCircle } from "react-icons/fa";

const ProfileMenu = React.memo(({ darkMode, toggleTheme }) => {
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Wrapper ref={profileRef}>
      <ToggleWrapper>
        <SwitchWrapper onClick={toggleTheme} $darkMode={darkMode}>
          <SwitchKnob $darkMode={darkMode} />
        </SwitchWrapper>
        <ProfileIcon onClick={() => setShowProfile((prev) => !prev)}>
          <FaUserCircle />
        </ProfileIcon>
      </ToggleWrapper>

      {showProfile && (
        <Dropdown $darkMode={darkMode}>
          <DropdownItem $darkMode={darkMode}>프로필 수정</DropdownItem>
          <DropdownItem $darkMode={darkMode}>로그아웃</DropdownItem>
        </Dropdown>
      )}
    </Wrapper>
  );
});

export default ProfileMenu;

/* 스타일 */
const Wrapper = styled.div`
  position: absolute;
  top: 1.2rem;
  right: 2rem;
`;
const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;
const SwitchWrapper = styled.div`
  width: 48px;
  height: 28px;
  border-radius: 14px;
  cursor: pointer;
  background: ${({ $darkMode }) => ($darkMode ? "#555" : "#ccc")};
  position: relative;
  transition: background 0.3s;
`;
const SwitchKnob = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${({ $darkMode }) => ($darkMode ? "#0f0" : "#fff")};
  position: absolute;
  top: 4px;
  left: ${({ $darkMode }) => ($darkMode ? "24px" : "4px")};
  transition: left 0.3s;
`;
const ProfileIcon = styled.div`
  font-size: 1.8rem;
  color: #ccc;
  cursor: pointer;
  &:hover {
    color: #fff;
  }
`;
const Dropdown = styled.div`
  margin-top: 0.4rem;
  border-radius: 0.4rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  ${({ $darkMode }) => ($darkMode ? "background:#444;" : "background:#e9e4d7;")}
`;
const DropdownItem = styled.div`
  padding: 0.6rem 1rem;
  cursor: pointer;
  ${({ $darkMode }) =>
    $darkMode
      ? css`
          color: #eee;
          &:hover {
            background: #555;
          }
        `
      : css`
          color: #333;
          &:hover {
            background: #d8d2c2;
          }
        `}
`;
