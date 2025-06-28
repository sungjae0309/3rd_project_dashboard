// Aijob.jsx

import React, { useState } from "react";
import styled from "styled-components";
import Sidebar from "./Sidebar";
import MainContent from "./maincontent";

export default function Aijob() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedPage, setSelectedPage] = useState("dashboard");

  return (
    <Layout>
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
      />
      <MainContent
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
      />
    </Layout>
  );
}

const Layout = styled.div`
  display: flex;
  height: 100vh;
  background: rgb(36, 36, 35);
  overflow: hidden;
`;
