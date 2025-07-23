import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { 
  FaChartLine, 
  FaCloud, 
  FaChartBar, 
  FaCalendarAlt, 
  FaFilter,
  FaArrowLeft,
  FaSyncAlt,
  FaDownload,
  FaInfoCircle
} from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import WordCloud from "react-wordcloud";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://192.168.101.51:8000';

export default function TrendDetail({ darkMode = false, setSelectedPage }) {
  // 상태 관리
  const [jobNames, setJobNames] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [selectedField, setSelectedField] = useState("tech_stack");
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [visualizationType, setVisualizationType] = useState("wordcloud"); // wordcloud, barchart, trend
  const [skillData, setSkillData] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 필드 타입 옵션
  const fieldOptions = [
    { value: "tech_stack", label: "기술 스택" },
    { value: "required_skills", label: "필수 스킬" },
    { value: "preferred_skills", label: "우대 스킬" },
    { value: "qualifications", label: "자격 요건" },
    { value: "preferences", label: "선호 사항" }
  ];

  // 직무명 조회
  useEffect(() => {
    const fetchJobNames = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/job-skills/job-names`);
        setJobNames(response.data);
        if (response.data.length > 0) {
          setSelectedJob(response.data[0]);
        }
      } catch (error) {
        console.error('직무명 조회 실패:', error);
        setError('직무명을 불러오는데 실패했습니다.');
        // 임시 데이터로 대체
        setJobNames(['백엔드 개발자', '프론트엔드 개발자', '데이터 분석가', 'AI 엔지니어']);
        setSelectedJob('백엔드 개발자');
      } finally {
        setLoading(false);
      }
    };

    fetchJobNames();
  }, []);

  // 스킬 데이터 조회
  useEffect(() => {
    if (!selectedJob) return;

    const fetchSkillData = async () => {
      try {
        setLoading(true);
        setError(null);

        let data;
        if (visualizationType === "wordcloud") {
          const response = await axios.get(`${BASE_URL}/visualization/weekly_skill_frequency_current`, {
            params: {
              job_name: selectedJob,
              field: selectedField
            }
          });
          data = response.data;
        } else if (visualizationType === "trend") {
          const response = await axios.get(`${BASE_URL}/stats/trend/${selectedJob}`, {
            params: {
              field_type: selectedField,
              week: selectedWeek
            }
          });
          data = response.data;
        } else {
          const response = await axios.get(`${BASE_URL}/stats/weekly/${selectedJob}`, {
            params: { week: selectedWeek }
          });
          data = response.data;
        }

        setSkillData(data);
      } catch (error) {
        console.error('스킬 데이터 조회 실패:', error);
        setError('데이터를 불러오는데 실패했습니다. 임시 데이터를 표시합니다.');
        // 임시 데이터
        setSkillData([
          { skill: "Python", count: 45, year: 2025, week: 28 },
          { skill: "Java", count: 32, year: 2025, week: 28 },
          { skill: "JavaScript", count: 28, year: 2025, week: 28 },
          { skill: "SQL", count: 25, year: 2025, week: 28 },
          { skill: "React", count: 22, year: 2025, week: 28 },
          { skill: "Spring", count: 18, year: 2025, week: 28 },
          { skill: "Docker", count: 15, year: 2025, week: 28 },
          { skill: "AWS", count: 12, year: 2025, week: 28 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSkillData();
  }, [selectedJob, selectedField, selectedWeek, visualizationType]);

  // 워드클라우드 옵션
  const wordCloudOptions = {
    fontSizes: [12, 60],
    rotations: 2,
    rotationAngles: [-90, 0],
    padding: 5,
    deterministic: true,
    removeDuplicateWords: false
  };

  // 워드클라우드 데이터 변환
  const wordCloudData = skillData.map(item => ({
    text: item.skill || item.skill_name,
    value: item.count || item.frequency || 10
  }));

  // 차트 데이터 변환
  const chartData = skillData.slice(0, 10).map(item => ({
    skill: item.skill || item.skill_name,
    count: item.count || item.frequency || 10
  }));

  return (
    <Container $darkMode={darkMode}>
      {/* 헤더 */}
      <Header>
        <BackButton onClick={() => setSelectedPage("career-summary")}>
          <FaArrowLeft />
          <span>뒤로 가기</span>
        </BackButton>
        <Title>직무 트렌드 분석</Title>
        <RefreshButton onClick={() => window.location.reload()}>
          <FaSyncAlt />
        </RefreshButton>
      </Header>

      {/* 컨트롤 패널 */}
      <ControlPanel $darkMode={darkMode}>
        <ControlSection>
          <ControlLabel>
            <FaFilter />
            직무 선택
          </ControlLabel>
          <Select 
            value={selectedJob} 
            onChange={(e) => setSelectedJob(e.target.value)}
            $darkMode={darkMode}
          >
            {jobNames.map(job => (
              <option key={job} value={job}>{job}</option>
            ))}
          </Select>
        </ControlSection>

        <ControlSection>
          <ControlLabel>
            <FaChartLine />
            분석 필드
          </ControlLabel>
          <Select 
            value={selectedField} 
            onChange={(e) => setSelectedField(e.target.value)}
            $darkMode={darkMode}
          >
            {fieldOptions.map(field => (
              <option key={field.value} value={field.value}>{field.label}</option>
            ))}
          </Select>
        </ControlSection>

        <ControlSection>
          <ControlLabel>
            <FaCalendarAlt />
            기간 설정
          </ControlLabel>
          <Select 
            value={selectedWeek || ""} 
            onChange={(e) => setSelectedWeek(e.target.value || null)}
            $darkMode={darkMode}
          >
            <option value="">전체 기간</option>
            <option value="28">최근 4주</option>
            <option value="12">최근 12주</option>
            <option value="26">최근 26주</option>
          </Select>
        </ControlSection>

        <AdvancedToggle onClick={() => setShowAdvanced(!showAdvanced)}>
          <span>고급 설정</span>
          <IoIosArrowDown style={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)' }} />
        </AdvancedToggle>
      </ControlPanel>

      {/* 고급 설정 */}
      {showAdvanced && (
        <AdvancedPanel $darkMode={darkMode}>
          <ControlSection>
            <ControlLabel>
              <FaInfoCircle />
              시각화 방식
            </ControlLabel>
            <VisualizationToggle>
              <ToggleButton 
                $active={visualizationType === "wordcloud"}
                onClick={() => setVisualizationType("wordcloud")}
                $darkMode={darkMode}
              >
                <FaCloud />
                워드클라우드
              </ToggleButton>
              <ToggleButton 
                $active={visualizationType === "barchart"}
                onClick={() => setVisualizationType("barchart")}
                $darkMode={darkMode}
              >
                <FaChartBar />
                막대 그래프
              </ToggleButton>
              <ToggleButton 
                $active={visualizationType === "trend"}
                onClick={() => setVisualizationType("trend")}
                $darkMode={darkMode}
              >
                <FaChartLine />
                트렌드 차트
              </ToggleButton>
            </VisualizationToggle>
          </ControlSection>
        </AdvancedPanel>
      )}

      {/* 메인 콘텐츠 */}
      <MainContent>
        {loading ? (
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>데이터를 분석하고 있습니다...</LoadingText>
          </LoadingContainer>
        ) : error ? (
          <ErrorContainer>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorMessage>{error}</ErrorMessage>
            <ErrorNote>실제 데이터가 부족하여 샘플 데이터를 표시합니다.</ErrorNote>
          </ErrorContainer>
        ) : null}

        {/* 시각화 영역 */}
        <VisualizationContainer $darkMode={darkMode}>
          {visualizationType === "wordcloud" && (
            <WordCloudContainer>
              <ChartTitle>스킬 빈도 워드클라우드</ChartTitle>
              <WordCloudWrapper>
                <WordCloud words={wordCloudData} options={wordCloudOptions} />
              </WordCloudWrapper>
            </WordCloudContainer>
          )}

          {visualizationType === "barchart" && (
            <BarChartContainer>
              <ChartTitle>상위 스킬 빈도</ChartTitle>
              <BarChart>
                {chartData.map((item, index) => (
                  <BarItem key={index}>
                    <BarLabel>{item.skill}</BarLabel>
                    <BarWrapper>
                      <Bar 
                        $width={(item.count / Math.max(...chartData.map(d => d.count))) * 100}
                        $darkMode={darkMode}
                      />
                      <BarValue>{item.count}</BarValue>
                    </BarWrapper>
                  </BarItem>
                ))}
              </BarChart>
            </BarChartContainer>
          )}

          {visualizationType === "trend" && (
            <TrendChartContainer>
              <ChartTitle>스킬 트렌드 분석</ChartTitle>
              <TrendInfo>
                <TrendItem>
                  <TrendLabel>분석 직무:</TrendLabel>
                  <TrendValue>{selectedJob}</TrendValue>
                </TrendItem>
                <TrendItem>
                  <TrendLabel>분석 필드:</TrendLabel>
                  <TrendValue>{fieldOptions.find(f => f.value === selectedField)?.label}</TrendValue>
                </TrendItem>
                <TrendItem>
                  <TrendLabel>데이터 포인트:</TrendLabel>
                  <TrendValue>{skillData.length}개</TrendValue>
                </TrendItem>
              </TrendInfo>
              <TrendChart>
                {skillData.slice(0, 8).map((item, index) => (
                  <TrendBar key={index} $height={item.count || 10} $darkMode={darkMode}>
                    <TrendBarLabel>{item.skill || item.skill_name}</TrendBarLabel>
                  </TrendBar>
                ))}
              </TrendChart>
            </TrendChartContainer>
          )}
        </VisualizationContainer>

        {/* 분석 결과 요약 */}
        <AnalysisSummary $darkMode={darkMode}>
          <SummaryTitle>분석 결과 요약</SummaryTitle>
          <SummaryGrid>
            <SummaryCard $darkMode={darkMode}>
              <SummaryCardTitle> 인기 스킬</SummaryCardTitle>
              <SummaryCardContent>
                {chartData.slice(0, 3).map((item, index) => (
                  <SummaryItem key={index}>
                    <span>{index + 1}.</span> {item.skill} ({item.count}회)
                  </SummaryItem>
                ))}
              </SummaryCardContent>
            </SummaryCard>

            <SummaryCard $darkMode={darkMode}>
              <SummaryCardTitle>📈 트렌드</SummaryCardTitle>
              <SummaryCardContent>
                <SummaryItem>• {selectedJob} 직무에서 {selectedField} 분야 분석</SummaryItem>
                <SummaryItem>• 총 {skillData.length}개의 스킬이 분석됨</SummaryItem>
                <SummaryItem>• 최고 빈도: {chartData[0]?.skill || 'N/A'}</SummaryItem>
              </SummaryCardContent>
            </SummaryCard>

            <SummaryCard $darkMode={darkMode}>
              <SummaryCardTitle>💡 인사이트</SummaryCardTitle>
              <SummaryCardContent>
                <SummaryItem>• {selectedField} 분야의 핵심 스킬 파악</SummaryItem>
                <SummaryItem>• 시장 수요와 기술 트렌드 분석</SummaryItem>
                <SummaryItem>• 커리어 계획 수립에 활용 가능</SummaryItem>
              </SummaryCardContent>
            </SummaryCard>
          </SummaryGrid>
        </AnalysisSummary>
      </MainContent>
    </Container>
  );
}

/* ───────────── styled-components ───────────── */
const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background: ${({ $darkMode }) => ($darkMode ? "#121212" : "#f8f9fa")};
  color: ${({ $darkMode }) => ($darkMode ? "#eee" : "#333")};
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid ${({ $darkMode }) => ($darkMode ? "#333" : "#e9ecef")};
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #ffa500;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 165, 0, 0.1);
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #ffa500;
  margin: 0;
`;

const RefreshButton = styled.button`
  background: none;
  border: none;
  color: #ffa500;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 165, 0, 0.1);
  }
`;

const ControlPanel = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  background: ${({ $darkMode }) => ($darkMode ? "#1e1e1e" : "#fff")};
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const ControlSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
`;

const ControlLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#555")};
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#ddd")};
  border-radius: 0.5rem;
  background: ${({ $darkMode }) => ($darkMode ? "#2a2a2a" : "#fff")};
  color: ${({ $darkMode }) => ($darkMode ? "#eee" : "#333")};
  font-size: 1rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #ffa500;
  }
`;

const AdvancedToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #ffa500;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 165, 0, 0.1);
  }
`;

const AdvancedPanel = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? "#1e1e1e" : "#fff")};
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const VisualizationToggle = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid ${({ $active, $darkMode }) => ($active ? "#ffa500" : ($darkMode ? "#444" : "#ddd"))};
  border-radius: 0.5rem;
  background: ${({ $active, $darkMode }) => ($active ? "#ffa500" : ($darkMode ? "#2a2a2a" : "#fff"))};
  color: ${({ $active, $darkMode }) => ($active ? "#fff" : ($darkMode ? "#eee" : "#333"))};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ $active }) => ($active ? "#ffa500" : "rgba(255, 165, 0, 0.1)")};
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ffa500;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: #666;
  font-size: 1.1rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 0.5rem;
`;

const ErrorIcon = styled.div`
  font-size: 2rem;
`;

const ErrorMessage = styled.p`
  color: #856404;
  font-weight: 600;
`;

const ErrorNote = styled.p`
  color: #856404;
  font-size: 0.9rem;
`;

const VisualizationContainer = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? "#1e1e1e" : "#fff")};
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 500px;
`;

const ChartTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffa500;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const WordCloudContainer = styled.div`
  width: 100%;
  height: 400px;
`;

const WordCloudWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const BarChartContainer = styled.div`
  width: 100%;
`;

const BarChart = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const BarItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BarLabel = styled.div`
  min-width: 120px;
  font-weight: 600;
`;

const BarWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Bar = styled.div`
  height: 30px;
  background: linear-gradient(90deg, #ffa500, #ff8c00);
  border-radius: 15px;
  width: ${({ $width }) => $width}%;
  transition: width 0.3s ease;
`;

const BarValue = styled.div`
  min-width: 40px;
  font-weight: 600;
  color: #ffa500;
`;

const TrendChartContainer = styled.div`
  width: 100%;
`;

const TrendInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: ${({ $darkMode }) => ($darkMode ? "#2a2a2a" : "#f8f9fa")};
  border-radius: 0.5rem;
`;

const TrendItem = styled.div`
  display: flex;
  justify-content: space-between;
`;

const TrendLabel = styled.span`
  font-weight: 600;
  color: #666;
`;

const TrendValue = styled.span`
  color: #ffa500;
  font-weight: 600;
`;

const TrendChart = styled.div`
  display: flex;
  align-items: end;
  gap: 1rem;
  height: 300px;
  padding: 1rem 0;
`;

const TrendBar = styled.div`
  flex: 1;
  background: linear-gradient(to top, #ffa500, #ff8c00);
  border-radius: 4px 4px 0 0;
  height: ${({ $height }) => Math.max($height * 2, 20)}px;
  min-height: 20px;
  position: relative;
  transition: height 0.3s ease;
`;

const TrendBarLabel = styled.div`
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#666")};
`;

const AnalysisSummary = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? "#1e1e1e" : "#fff")};
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SummaryTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffa500;
  margin-bottom: 1.5rem;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const SummaryCard = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? "#2a2a2a" : "#f8f9fa")};
  border-radius: 0.5rem;
  padding: 1.5rem;
  border-left: 4px solid #ffa500;
`;

const SummaryCardTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffa500;
  margin-bottom: 1rem;
`;

const SummaryCardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SummaryItem = styled.div`
  font-size: 0.95rem;
  line-height: 1.4;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#666")};
`;