import React, { useState, useMemo, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { FaSearch, FaExclamationTriangle, FaArrowLeft } from "react-icons/fa";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://192.168.101.51:8000';

// 선 그래프를 그리기 위한 간단한 SVG 차트 컴포넌트 (이전과 동일)
const SimpleLineChart = ({ data, darkMode }) => {
    const width = 650;
    const height = 300;
    const margin = { top: 20, right: 100, bottom: 50, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const { skills, allDates, maxCount } = useMemo(() => {
        const skillsMap = new Map();
        const dateSet = new Set();
        let maxCount = 0;

        data.forEach(d => {
            if (!skillsMap.has(d.skill)) {
                skillsMap.set(d.skill, []);
            }
            const date = new Date(d.date);
            skillsMap.get(d.skill).push({ date, count: d.count });
            dateSet.add(d.date);
            if (d.count > maxCount) maxCount = d.count;
        });

        const allDates = Array.from(dateSet).map(d => new Date(d)).sort((a, b) => a - b);
        skillsMap.forEach(points => points.sort((a, b) => a.date - b.date));
        
        return { skills: skillsMap, allDates, maxCount };
    }, [data]);

    if (allDates.length < 2) {
        return <div style={{ textAlign: 'center', padding: '2rem', color: darkMode ? '#888' : '#666' }}>데이터가 부족하여 추세선을 그릴 수 없습니다. 기간을 이틀 이상으로 설정해주세요.</div>;
    }

    const xScale = (date) => margin.left + ((date - allDates[0]) / (allDates[allDates.length - 1] - allDates[0])) * innerWidth;
    const yScale = (count) => margin.top + innerHeight - ((count / maxCount) * innerHeight);

    const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];
    let colorIndex = 0;

    const skillEntries = Array.from(skills.entries());

    return (
        <ChartWrapper>
            <svg width={width} height={height} style={{ fontFamily: 'Arial, sans-serif' }}>
                {/* Y축 */}
                {Array.from({ length: 5 }).map((_, i) => (
                    <g key={i}>
                        <text x={margin.left - 10} y={yScale(maxCount * i / 4)} textAnchor="end" dy="0.32em" fontSize="10" fill={darkMode ? "#ccc" : "#666"}>{Math.round(maxCount * i / 4)}</text>
                        <line x1={margin.left} x2={width - margin.right} y1={yScale(maxCount * i / 4)} y2={yScale(maxCount * i / 4)} stroke={darkMode ? "#444" : "#e0e0e0"} strokeDasharray="2" />
                    </g>
                ))}
                
                {/* X축 */}
                 {allDates.map((date, i) => (
                    <text key={i} x={xScale(date)} y={height - margin.bottom + 15} textAnchor="middle" fontSize="10" fill={darkMode ? "#ccc" : "#666"}>
                        {date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                    </text>
                ))}

                {/* 데이터 라인 */}
                {skillEntries.map(([skill, points]) => {
                    const color = colors[colorIndex % colors.length];
                    colorIndex++;
                    const pathD = "M" + points.map(p => `${xScale(p.date)},${yScale(p.count)}`).join(" L ");
                    return <path key={skill} d={pathD} fill="none" stroke={color} strokeWidth="2" />;
                })}
                
                {/* 범례 */}
                {skillEntries.map(([skill], i) => (
                     <g key={skill} transform={`translate(${width - margin.right + 10}, ${margin.top + i * 20})`}>
                        <rect width="10" height="10" fill={colors[i % colors.length]} />
                        <text x="15" y="10" fontSize="12" fill={darkMode ? "#eee" : "#333"}>{skill}</text>
                    </g>
                ))}
            </svg>
        </ChartWrapper>
    );
};


export default function DailySkillTrend({ selectedJob, selectedField, darkMode, onDataUpdate }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startRank, setStartRank] = useState('');
  const [endRank, setEndRank] = useState('');

  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState('input');
  
  const isInitialMount = useRef(true);

  useEffect(() => {
      if (isInitialMount.current) {
          isInitialMount.current = false;
          return;
      }
      if (view === 'results') {
          handleFetchData();
      }
  }, [selectedJob, selectedField]);

  const handleFetchData = async () => {
      if (!startDate || !endDate) {
          setError("시작 날짜와 종료 날짜는 필수입니다.");
          if (onDataUpdate) onDataUpdate([]); // 데이터 초기화 전달
          setView('results');
          return;
      }
      if (new Date(startDate) > new Date(endDate)) {
          setError("시작 날짜는 종료 날짜보다 이전이어야 합니다.");
          if (onDataUpdate) onDataUpdate([]); // 데이터 초기화 전달
          setView('results');
          return;
      }

      setLoading(true);
      if (view === 'input') {
          setView('results');
      }

      try {
          const params = {
              job_name: selectedJob,
              field: selectedField,
              start_date: startDate,
              end_date: endDate,
          };
          if (startRank) params.rank_start = parseInt(startRank);
          if (endRank) params.rank_end = parseInt(endRank);
          
          const response = await axios.get(`${BASE_URL}/visualization/daily_skill_frequency`, { params });
          
          if (response.data && response.data.length > 0) {
              setTrendData(response.data);
              setError(null);
              if (onDataUpdate) onDataUpdate(response.data); // 성공 시 데이터 전달
          } else {
              setTrendData(null);
              setError("해당 조건에 맞는 데이터가 없습니다. 다른 날짜나 직무를 선택해보세요.");
              if (onDataUpdate) onDataUpdate([]); // 데이터 없음 전달
          }
      } catch (err) {
          setTrendData(null);
          console.error("일별 스킬 빈도 조회 실패:", err);
          setError("데이터를 불러오는 중 오류가 발생했습니다.");
          if (onDataUpdate) onDataUpdate([]); // 에러 시 데이터 초기화 전달
      } finally {
          setLoading(false);
      }
  };

  const handleBackToInput = () => {
    setView('input');
    setTrendData(null);
    setError(null);
};
  // 뷰 상태에 따라 다른 UI 렌더링
  if (view === 'input') {
      return (
          <Container $darkMode={darkMode}>
              <InputGrid>
                  <InputGroup>
                      <Label $darkMode={darkMode}>시작 날짜*</Label>
                      <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} $darkMode={darkMode} />
                  </InputGroup>
                  <InputGroup>
                      <Label $darkMode={darkMode}>종료 날짜*</Label>
                      <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} $darkMode={darkMode} />
                  </InputGroup>
                  <InputGroup>
                      <Label $darkMode={darkMode}>시작 순위</Label>
                      <Input type="number" placeholder="(선택) 예: 1" value={startRank} onChange={e => setStartRank(e.target.value)} $darkMode={darkMode} />
                  </InputGroup>
                  <InputGroup>
                      <Label $darkMode={darkMode}>종료 순위</Label>
                      <Input type="number" placeholder="(선택) 예: 5" value={endRank} onChange={e => setEndRank(e.target.value)} $darkMode={darkMode} />
                  </InputGroup>
              </InputGrid>
              <SearchButton onClick={handleFetchData}>
                  <FaSearch />
                  트렌드 조회
              </SearchButton>
          </Container>
      );
  }
  
  // 결과 뷰 렌더링
  return (
      <ResultContainer $darkMode={darkMode}>
          <BackButton onClick={handleBackToInput} $darkMode={darkMode}>
              <FaArrowLeft />
              다시 설정하기
          </BackButton>
          
          {loading && (
              <LoadingContainer>
                  <LoadingSpinner />
                  <p>데이터를 불러오는 중입니다...</p>
              </LoadingContainer>
          )}

          {error && !loading && (
              <ErrorContainer $darkMode={darkMode}>
                  <FaExclamationTriangle />
                  <p>{error}</p>
              </ErrorContainer>
          )}
          
          {trendData && !loading && <SimpleLineChart data={trendData} darkMode={darkMode} />}
      </ResultContainer>
  );
}

// Styled Components
const Container = styled.div`
  width: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#555'};
`;

const Input = styled.input`
  padding: 0.6rem;
  border-radius: 0.4rem;
  border: 1px solid ${({ $darkMode }) => $darkMode ? '#444' : '#ddd'};
  background: ${({ $darkMode }) => $darkMode ? '#333' : '#fff'};
  color: ${({ $darkMode }) => $darkMode ? '#eee' : '#333'};
  font-size: 0.9rem;
  &:focus {
    outline: none;
    border-color: #ffa500;
  }
`;

const SearchButton = styled.button`
  width: 100%;
  padding: 0.8rem;
  margin-top: 1rem;
  border: none;
  border-radius: 0.4rem;
  background-color: #ffa500;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: #e69500;
  }
`;

const ResultContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${({ $darkMode }) => $darkMode ? '#1e1e1e' : '#fff'};
  padding: 1rem;
  border-radius: 0.8rem;
`;

const BackButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    align-self: flex-start;
    margin-bottom: 1rem;
    padding: 0.5rem 1rem;
    border-radius: 0.4rem;
    border: 1px solid ${({ $darkMode }) => $darkMode ? '#555' : '#ddd'};
    background: ${({ $darkMode }) => $darkMode ? '#333' : '#fff'};
    color: ${({ $darkMode }) => $darkMode ? '#eee' : '#333'};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        background: ${({ $darkMode }) => $darkMode ? '#444' : '#f8f9fa'};
        border-color: #ffa500;
    }
`;

const LoadingContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#666'};
`;

const LoadingSpinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ffa500;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #dc3545;
  padding: 2rem;
  background: rgba(220, 53, 69, 0.1);
  border-radius: 0.5rem;
  width: 100%;
  
  svg {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
`;

const ChartWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;