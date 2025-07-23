import React, { useState } from "react";
import CareerRoadmapMain from "./CareerRoadmapMain";
import CareerRoadmapDetail from "./CareerRoadmapDetail";
import JobKeywordAnalysis from "./JobKeywordAnalysis";

export default function CareerRoadmap({ darkMode }) {
  const [selectedPage, setSelectedPage] = useState("summary");

  const handleBack = () => setSelectedPage("summary");

  return (
    <>
      {selectedPage === "summary" && (
        <CareerRoadmapMain darkMode={darkMode} onSelect={setSelectedPage} />
      )}

      {selectedPage === "analysis" && (
        <JobKeywordAnalysis />
      )}

      {(selectedPage === "gap" || selectedPage === "plan") && (
        <CareerRoadmapDetail
          section={selectedPage}
          darkMode={darkMode}
          onBack={handleBack}
        />
      )}
    </>
  );
}