import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import WordCloud from "react-wordcloud";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://192.168.101.51:8000";

export default function JobKeywordAnalysis({ selectedJob, darkMode, selectedFieldType }) {
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 선택된 직무와 필드 타입의 트렌드 데이터 가져오기
  useEffect(() => {
    if (!selectedJob) return;

    console.log("트렌드 데이터 요청 - 직무:", selectedJob, "필드:", selectedFieldType);

    const fetchTrendData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${BASE_URL}/stats/trend/${encodeURIComponent(selectedJob)}`, {
          params: {
            field_type: selectedFieldType,
            week: 29 // 현재 주차 또는 최신 주차
          }
        });

        console.log("트렌드 데이터 API 응답:", response.data);

        // 트렌드 데이터를 워드클라우드 형식으로 변환
        const words = response.data.trend_data.map(item => ({
          text: item.skill,
          value: item.count
        }));

        console.log("워드클라우드 데이터:", words);
        setTrendData(words);
      } catch (err) {
        console.error("트렌드 데이터 로딩 실패:", err);
        setError("트렌드 데이터를 불러오는데 실패했습니다.");
        setTrendData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendData();
  }, [selectedJob, selectedFieldType]);

  const options = useMemo(() => ({
    rotations: 0,
    fontSizes: [14, 50],
    fontFamily: "Pretendard, sans-serif",
    enableTooltip: false,
    deterministic: true,
    colors: ["#264653", "#2a9d8f", "#e76f51", "#f4a261", "#e9c46a"],
  }), []);

  return (
    <AnalysisContainer>
      {/* 워드클라우드 영역 */}
      <CloudSection>
        {loading ? (
          <LoadingText $darkMode={darkMode}>트렌드 분석 중...</LoadingText>
        ) : error ? (
          <ErrorText $darkMode={darkMode}>{error}</ErrorText>
        ) : !selectedJob ? (
          <NoDataText $darkMode={darkMode}>직무를 선택해주세요</NoDataText>
        ) : trendData.length === 0 ? (
          <NoDataText $darkMode={darkMode}>트렌드 데이터가 없습니다</NoDataText>
        ) : (
          <WordCloud words={trendData} options={options} />
        )}
      </CloudSection>
    </AnalysisContainer>
  );
}

const AnalysisContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const CloudSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 180px;
`;

const LoadingText = styled.div`
  color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#666'};
  font-size: 0.9rem;
`;

const ErrorText = styled.div`
  color: #e74c3c;
  font-size: 0.9rem;
  text-align: center;
`;

const NoDataText = styled.div`
  color: ${({ $darkMode }) => $darkMode ? '#888' : '#999'};
  font-size: 0.9rem;
  text-align: center;
`;
