import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import WordCloud from "react-wordcloud";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";
import axios from "axios";
import { FaCalendarDay, FaCalendarWeek, FaInfoCircle } from "react-icons/fa";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://192.168.101.7:8000";

export default function JobKeywordAnalysis({ selectedJob, darkMode, selectedFieldType, isMainPage = false, onDataUpdate }) {
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 일자별/주차별 선택 상태 추가 (메인페이지에서는 사용하지 않음)
  const [timeUnit, setTimeUnit] = useState("daily"); // "daily" 또는 "weekly"
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [selectedWeek, setSelectedWeek] = useState(""); // 주차 선택

  // 캐시 관련 상태 추가
  const [cacheKey, setCacheKey] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // 캐시 설정
  const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4시간
  const KEYWORD_CACHE_KEY = 'job_keywords_cache';
  const KEYWORD_CACHE_TIMESTAMP_KEY = 'job_keywords_timestamp';

  // 캐시된 데이터 로드
  const loadCachedData = (cacheKey) => {
    try {
      const cachedData = localStorage.getItem(`${KEYWORD_CACHE_KEY}_${cacheKey}`);
      const timestamp = localStorage.getItem(`${KEYWORD_CACHE_TIMESTAMP_KEY}_${cacheKey}`);
      
      if (cachedData && timestamp) {
        const now = Date.now();
        const cacheAge = now - parseInt(timestamp);
        
        if (cacheAge < CACHE_DURATION) {
          return JSON.parse(cachedData);
        }
      }
    } catch (error) {
      console.error('캐시 로드 실패:', error);
    }
    return null;
  };

  // 데이터 캐시 저장
  const saveCachedData = (cacheKey, data) => {
    try {
      localStorage.setItem(`${KEYWORD_CACHE_KEY}_${cacheKey}`, JSON.stringify(data));
      localStorage.setItem(`${KEYWORD_CACHE_TIMESTAMP_KEY}_${cacheKey}`, Date.now().toString());
    } catch (error) {
      console.error('캐시 저장 실패:', error);
    }
  };

  // 선택된 직무와 필드 타입의 트렌드 데이터 가져오기
  useEffect(() => {
    if (!selectedJob) return;

    // 메인페이지에서는 캐시를 더 적극적으로 활용
    const currentCacheKey = `${selectedJob}-${selectedFieldType}-${isMainPage}`;
    
    // 메인페이지이고 이미 초기화된 경우 중복 호출 방지
    if (isMainPage && hasInitialized && cacheKey === currentCacheKey) {
      return;
    }

    console.log("트렌드 데이터 요청 - 직무:", selectedJob, "필드:", selectedFieldType, "메인페이지:", isMainPage);

    const fetchTrendData = async () => {
      console.log('🔄 [JobKeywordAnalysis] fetchTrendData 시작:', { selectedJob, selectedFieldType, isMainPage });
      setLoading(true);
      setError(null);
      
      try {
        let response;
        
        if (isMainPage) {
          // 메인페이지: 첫 번째 엔드포인트 사용 (현재 주차 스킬 빈도)
          response = await axios.get(`${BASE_URL}/visualization/weekly_skill_frequency_current`, {
            params: {
              job_name: selectedJob,
              field: selectedFieldType
            }
          });
        } else {
          // 트렌드 분석 탭: 두 번째 엔드포인트 사용 (주차 범위 지정)
          if (timeUnit === "daily") {
            // 일자별 API 호출
            response = await axios.get(`${BASE_URL}/visualization/daily/${encodeURIComponent(selectedJob)}`, {
              params: {
                field_type: selectedFieldType,
                date: selectedDate
              }
            });
          } else {
            // 주차별 API 호출
            response = await axios.get(`${BASE_URL}/visualization/weekly_skill_frequency`, {
              params: {
                job_name: selectedJob,
                field: selectedFieldType,
                start_week: selectedWeek,
                end_week: selectedWeek,
                year: new Date().getFullYear()
              }
            });
          }
        }

        console.log("트렌드 데이터 API 응답:", response.data);

        // 응답 데이터를 워드클라우드 형식으로 변환
        let words = [];
        
        if (Array.isArray(response.data)) {
          // 배열 형태의 응답
          words = response.data.map(item => ({
            text: item.skill || item.skill_name,
            value: item.count || item.frequency || 10
          }));
        } else if (response.data && typeof response.data === 'object') {
          // 객체 형태의 응답
          words = Object.entries(response.data).map(([skill, count]) => ({
            text: skill,
            value: count
          }));
        }


         // ▼▼▼ 여기를 새로운 집계 코드로 교체 ▼▼▼
        // ▼▼▼ 이 부분이 핵심입니다 ▼▼▼
      // 1. Map을 사용해 중복된 스킬의 빈도수(value)를 합산합니다.
      const skillCounts = new Map();
      words.forEach(word => {
        if (word.text && typeof word.text === 'string' && word.value > 0) {
          const normalizedText = word.text.trim();
          const currentCount = skillCounts.get(normalizedText) || 0;
          skillCounts.set(normalizedText, currentCount + word.value);
        }
      });

      // 2. 집계된 Map을 워드클라우드용 배열 데이터로 변환합니다.
      const aggregatedData = Array.from(skillCounts, ([text, value]) => ({
        text,
        value,
      }));
      // ▲▲▲ 여기까지 ▲▲▲

      // 워드클라우드용 데이터는 여기서 바로 상태 업데이트
      setTrendData(aggregatedData);

      // ▼▼▼ 여기가 핵심 수정 부분 ▼▼▼
      if (onDataUpdate) {
        // 3. 부모 컴포넌트가 사용할 수 있도록 {skill, count} 형태로 변환
        let dataForParent = aggregatedData.map(item => ({
          skill: item.text,
          count: item.value
        }));

        // 4. count 기준으로 내림차순 정렬 (최고 인기 기술을 위해)
        dataForParent.sort((a, b) => b.count - a.count);

        // 5. 최종 가공된 데이터를 부모에게 전달
        onDataUpdate(dataForParent);
      }
      // ▲▲▲ 여기까지 수정 ▲▲▲
      
    } catch (err) {
      console.error("트렌드 데이터 로딩 실패:", err);
      setError("트렌드 데이터를 불러오는데 실패했습니다.");
      setTrendData([]);
    } finally {
      setLoading(false);
    }
  };

    // 메인페이지에서는 디바운싱 시간을 늘려서 중복 호출 방지
    const debounceTime = isMainPage ? 500 : 300;
    const timeoutId = setTimeout(fetchTrendData, debounceTime);
    return () => clearTimeout(timeoutId);
  }, [selectedJob, selectedFieldType, isMainPage, timeUnit, selectedDate, selectedWeek]);

  const options = useMemo(() => ({
    rotations: 0,
    fontSizes: isMainPage ? [18, 60] : [14, 50], // 메인페이지에서도 큰 폰트 크기 사용
    fontFamily: "Pretendard, sans-serif",
    enableTooltip: false,
    deterministic: true,
    removeDuplicateWords: true,
    colors: ["#264653", "#2a9d8f", "#e76f51", "#f4a261", "#e9c46a"],
  }), [isMainPage]);

  return (
    <AnalysisContainer>
      {/* 메인페이지가 아닐 때만 시간 단위 선택 UI 표시 */}
      {!isMainPage && (
        <TimeUnitSelector $darkMode={darkMode}>
          <TimeUnitTitle $darkMode={darkMode}>
            <FaInfoCircle style={{ marginRight: '0.5rem' }} />
            시간 단위 선택
          </TimeUnitTitle>
          <TimeUnitButtons>
            <TimeUnitButton
              $active={timeUnit === "daily"}
              $darkMode={darkMode}
              onClick={() => setTimeUnit("daily")}
            >
              <FaCalendarDay />
              일자별
            </TimeUnitButton>
            <TimeUnitButton
              $active={timeUnit === "weekly"}
              $darkMode={darkMode}
              onClick={() => setTimeUnit("weekly")}
            >
              <FaCalendarWeek />
              주차별
            </TimeUnitButton>
          </TimeUnitButtons>
          
          {timeUnit === "daily" && (
            <DateInput
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              $darkMode={darkMode}
            />
          )}
          
          {timeUnit === "weekly" && (
            <WeekInput
              type="number"
              placeholder="주차 입력 (1-53)"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              min="1"
              max="53"
              $darkMode={darkMode}
            />
          )}
        </TimeUnitSelector>
      )}

      {/* 워드클라우드 표시 */}
      <WordCloudContainer $darkMode={darkMode} $isMainPage={isMainPage}>
        {loading ? (
          <LoadingText $darkMode={darkMode}>로딩 중...</LoadingText>
        ) : error ? (
          <ErrorText $darkMode={darkMode}>{error}</ErrorText>
        ) : trendData.length > 0 ? (
          <WordCloud words={trendData} options={options} />
        ) : (
          <NoDataText $darkMode={darkMode}>
            {isMainPage ? "현재 주차 데이터가 없습니다." : "데이터가 없습니다."}
          </NoDataText>
        )}
      </WordCloudContainer>
    </AnalysisContainer>
  );
}

const AnalysisContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: 1rem;
`;

const TimeUnitSelector = styled.div`
  background: ${({ $darkMode }) => $darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
  border-radius: 0.8rem;
  padding: 1rem;
  border: 1px solid ${({ $darkMode }) => $darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
`;

const TimeUnitTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#666'};
  margin: 0 0 0.8rem 0;
  display: flex;
  align-items: center;
`;

const TimeUnitButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const TimeUnitButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid ${({ $active, $darkMode }) => 
    $active ? '#007bff' : ($darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)')};
  border-radius: 0.5rem;
  background: ${({ $active, $darkMode }) => 
    $active ? '#007bff' : ($darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)')};
  color: ${({ $active, $darkMode }) => 
    $active ? '#fff' : ($darkMode ? '#ccc' : '#666')};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.8rem;
  font-weight: 500;

  &:hover {
    background: ${({ $active, $darkMode }) => 
      $active ? '#0056b3' : ($darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')};
  }
`;

const DateInput = styled.input`
  padding: 0.4rem 0.6rem;
  border: 1px solid ${({ $darkMode }) => $darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
  border-radius: 0.4rem;
  background: ${({ $darkMode }) => $darkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff'};
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
  font-size: 0.8rem;
`;

const WeekInput = styled.input`
  padding: 0.4rem 0.6rem;
  border: 1px solid ${({ $darkMode }) => $darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
  border-radius: 0.4rem;
  background: ${({ $darkMode }) => $darkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff'};
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
  font-size: 0.8rem;
`;

const WordCloudContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: ${({ $isMainPage }) => $isMainPage ? '300px' : '180px'};
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
  color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#666'};
  font-size: 0.9rem;
  text-align: center;
`;
