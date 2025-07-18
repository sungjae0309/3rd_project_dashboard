/* ───────── src/components/TrendAnalysisSection.jsx ───────── */
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { 
  FaChartLine, 
  FaCloud, 
  FaChartBar, 
  FaCalendarAlt, 
  FaFilter,
  FaInfoCircle,
  FaStar,
  FaLightbulb,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaTimes,
  FaCog,
  FaHeart,
  FaUserTie
} from "react-icons/fa";
import WordCloud from "react-wordcloud";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://192.168.101.51:8000';

export default function TrendAnalysisSection({ darkMode = false }) {
  // 트렌드 분석 상태
  const [jobNames, setJobNames] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [selectedField, setSelectedField] = useState("tech_stack");
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [visualizationType, setVisualizationType] = useState("wordcloud");
  const [skillData, setSkillData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInsightsPopup, setShowInsightsPopup] = useState(false);

  // FastAPI 문서 기반 필드 타입 옵션
  const fieldOptions = [
    { value: "tech_stack", label: "기술 스택", icon: <FaCog /> },
    { value: "required_skills", label: "필수 스킬", icon: <FaCog /> },
    { value: "preferred_skills", label: "우대 스킬", icon: <FaStar /> },
    { value: "qualifications", label: "자격 요건", icon: <FaUserTie /> },
    { value: "preferences", label: "선호 사항", icon: <FaHeart /> },
    { value: "main_tasks_skills", label: "주요 업무 스킬", icon: <FaCog /> }
  ];

  // 직무명 조회 - FastAPI 엔드포인트 사용
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
        setJobNames(['백엔드 개발자', '프론트엔드 개발자', '데이터 분석가', 'AI 엔지니어', 'DevOps 엔지니어']);
        setSelectedJob('백엔드 개발자');
      } finally {
        setLoading(false);
      }
    };

    fetchJobNames();
  }, []);

  // FastAPI 문서 기반 스킬 데이터 조회
  useEffect(() => {
    if (!selectedJob) return;

    const fetchSkillData = async () => {
      try {
        setLoading(true);
        setError(null);

        let data;
        let apiResponse;

        if (visualizationType === "wordcloud") {
          // /visualization/weekly_skill_frequency 엔드포인트 사용
          apiResponse = await axios.get(`${BASE_URL}/visualization/weekly_skill_frequency`, {
            params: {
              job_name: selectedJob,
              field: selectedField
            }
          });
          data = apiResponse.data;
        } else if (visualizationType === "trend") {
          // /stats/trend/{job_name} 엔드포인트 사용
          apiResponse = await axios.get(`${BASE_URL}/stats/trend/${selectedJob}`, {
            params: {
              field_type: selectedField,
              week: selectedWeek
            }
          });
          data = apiResponse.data;
        } else {
          // /stats/weekly/{job_name} 엔드포인트 사용
          apiResponse = await axios.get(`${BASE_URL}/stats/weekly/${selectedJob}`, {
            params: { week: selectedWeek }
          });
          data = apiResponse.data;
        }

        // FastAPI 응답 구조에 맞게 데이터 변환
        const processedData = processApiResponse(data, visualizationType);
        setSkillData(processedData);

      } catch (error) {
        console.error('스킬 데이터 조회 실패:', error);
        setError('데이터를 불러오는데 실패했습니다. 샘플 데이터를 표시합니다.');
        // FastAPI 응답 구조에 맞는 샘플 데이터
        setSkillData([
          { skill: "Python", count: 45, trend: "up", year: 2025, week: 28, week_day: "28.3" },
          { skill: "Java", count: 32, trend: "down", year: 2025, week: 28, week_day: "28.3" },
          { skill: "JavaScript", count: 28, trend: "stable", year: 2025, week: 28, week_day: "28.3" },
          { skill: "SQL", count: 25, trend: "up", year: 2025, week: 28, week_day: "28.3" },
          { skill: "React", count: 22, trend: "up", year: 2025, week: 28, week_day: "28.3" },
          { skill: "Spring", count: 18, trend: "down", year: 2025, week: 28, week_day: "28.3" },
          { skill: "Docker", count: 15, trend: "up", year: 2025, week: 28, week_day: "28.3" },
          { skill: "AWS", count: 12, trend: "up", year: 2025, week: 28, week_day: "28.3" },
          { skill: "Kubernetes", count: 10, trend: "up", year: 2025, week: 28, week_day: "28.3" },
          { skill: "Node.js", count: 8, trend: "stable", year: 2025, week: 28, week_day: "28.3" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSkillData();
  }, [selectedJob, selectedField, selectedWeek, visualizationType]);

  // FastAPI 응답 구조에 맞게 데이터 처리
  const processApiResponse = (data, type) => {
    if (!data || !Array.isArray(data)) return [];

    if (type === "wordcloud" || type === "barchart") {
      // /visualization/weekly_skill_frequency 응답 구조: [{year, week, skill, count}]
      return data.map(item => ({
        skill: item.skill,
        count: item.count,
        year: item.year,
        week: item.week,
        week_day: `${item.week}.${item.year % 100}`,
        trend: "stable" // 기본값, 실제로는 계산 필요
      }));
    } else if (type === "trend") {
      // /stats/trend/{job_name} 응답 구조: [{week_day, skill, count, date}]
      return data.map(item => ({
        skill: item.skill,
        count: item.count,
        week_day: item.week_day,
        date: item.date,
        trend: "stable" // 기본값, 실제로는 계산 필요
      }));
    } else {
      // /stats/weekly/{job_name} 응답 구조
      return data.map(item => ({
        skill: item.skill || item.skill_name,
        count: item.count || item.frequency,
        week_day: item.week_day,
        trend: "stable"
      }));
    }
  };

  // 워드클라우드 옵션
  const wordCloudOptions = {
    fontSizes: [14, 45],
    rotations: 2,
    rotationAngles: [-90, 0],
    padding: 3,
    deterministic: true
  };

  // 워드클라우드 데이터 변환
  const wordCloudData = skillData.map(item => ({
    text: item.skill,
    value: item.count || 10
  }));

  // 차트 데이터 변환
  const chartData = skillData.slice(0, 8).map(item => ({
    skill: item.skill,
    count: item.count || 10,
    trend: item.trend || "stable"
  }));

  // 트렌드 아이콘
  const getTrendIcon = (trend) => {
    switch(trend) {
      case "up": return <FaArrowUp style={{ color: "#28a745" }} />;
      case "down": return <FaArrowDown style={{ color: "#dc3545" }} />;
      case "stable": return <FaMinus style={{ color: "#6c757d" }} />;
      default: return <FaMinus style={{ color: "#6c757d" }} />;
    }
  };

  // 인사이트 생성
  const generateInsights = () => {
    if (skillData.length === 0) return [];

    const topSkills = skillData.slice(0, 3);
    const insights = [];

    insights.push({
      type: "trend",
      icon: <FaChartLine />,
      title: "핵심 기술 트렌드",
      content: `${topSkills[0]?.skill}이 가장 높은 수요를 보이고 있으며, ${topSkills[1]?.skill}과 ${topSkills[2]?.skill}도 지속적으로 인기가 상승하고 있습니다.`
    });

    insights.push({
      type: "recommendation",
      icon: <FaLightbulb />,
      title: "학습 추천",
      content: `${topSkills[0]?.skill}과 ${topSkills[1]?.skill} 스킬을 우선적으로 학습하시면 취업에 유리할 것입니다.`
    });

    return insights;
  };

  return (
    <>
      {/* 컨트롤 패널 */}
      <ControlPanel $darkMode={darkMode}>
        <ControlGroup>
          <Label>직무 선택</Label>
          <Select 
            value={selectedJob} 
            onChange={(e) => setSelectedJob(e.target.value)}
            $darkMode={darkMode}
          >
            {jobNames.map(job => (
              <option key={job} value={job}>{job}</option>
            ))}
          </Select>
        </ControlGroup>

        <ControlGroup>
          <Label>분석 필드</Label>
          <Select 
            value={selectedField} 
            onChange={(e) => setSelectedField(e.target.value)}
            $darkMode={darkMode}
          >
            {fieldOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </ControlGroup>

        <ControlGroup>
          <Label>시각화 방식</Label>
          <ToggleGroup $darkMode={darkMode}>
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
              트렌드 분석
            </ToggleButton>
          </ToggleGroup>
        </ControlGroup>
      </ControlPanel>

      {/* 시각화 영역 */}
      <VisualizationArea $darkMode={darkMode}>
        {loading ? (
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>데이터를 불러오는 중...</LoadingText>
          </LoadingContainer>
        ) : error ? (
          <ErrorContainer>
            <FaExclamationTriangle />
            <ErrorText>{error}</ErrorText>
          </ErrorContainer>
        ) : (
          <>
            {visualizationType === "wordcloud" && (
              <WordCloudContainer>
                <WordCloud 
                  words={wordCloudData} 
                  options={wordCloudOptions}
                  size={[600, 400]}
                />
              </WordCloudContainer>
            )}

            {visualizationType === "barchart" && (
              <BarChartContainer>
                <BarChartTitle>상위 스킬 빈도</BarChartTitle>
                <BarChartList>
                  {chartData.map((item, index) => (
                    <BarChartItem key={index}>
                      <BarChartLabel>{item.skill}</BarChartLabel>
                      <BarChartBar>
                        <BarChartFill 
                          $width={(item.count / Math.max(...chartData.map(d => d.count))) * 100}
                          $darkMode={darkMode}
                        />
                        <BarChartValue>{item.count}</BarChartValue>
                      </BarChartBar>
                    </BarChartItem>
                  ))}
                </BarChartList>
              </BarChartContainer>
            )}

            {visualizationType === "trend" && (
              <TrendContainer>
                <TrendTitle>스킬 트렌드 분석</TrendTitle>
                <TrendList>
                  {skillData.slice(0, 10).map((item, index) => (
                    <TrendItem key={index}>
                      <TrendSkill>{item.skill}</TrendSkill>
                      <TrendCount>{item.count}</TrendCount>
                      <TrendIcon>{getTrendIcon(item.trend)}</TrendIcon>
                    </TrendItem>
                  ))}
                </TrendList>
              </TrendContainer>
            )}
          </>
        )}
      </VisualizationArea>

      {/* 인사이트 버튼 */}
      <InsightButton 
        onClick={() => setShowInsightsPopup(true)}
        $darkMode={darkMode}
      >
        <FaLightbulb />
        분석 인사이트 보기
      </InsightButton>

      {/* 인사이트 팝업 */}
      {showInsightsPopup && (
        <PopupOverlay onClick={() => setShowInsightsPopup(false)}>
          <PopupContent $darkMode={darkMode}>
            <PopupHeader>
              <PopupTitle>트렌드 분석 인사이트</PopupTitle>
              <CloseButton onClick={() => setShowInsightsPopup(false)}>
                <FaTimes />
              </CloseButton>
            </PopupHeader>
            <PopupBody>
              {generateInsights().map((insight, index) => (
                <InsightItem key={index}>
                  <InsightIcon>{insight.icon}</InsightIcon>
                  <InsightContent>
                    <InsightTitle>{insight.title}</InsightTitle>
                    <InsightText>{insight.content}</InsightText>
                  </InsightContent>
                </InsightItem>
              ))}
            </PopupBody>
          </PopupContent>
        </PopupOverlay>
      )}
    </>
  );
}

// Styled Components
const ControlPanel = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.$darkMode ? '#b0b0b0' : '#666666'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid ${props => props.$darkMode ? '#404040' : '#e0e0e0'};
  border-radius: 8px;
  background: ${props => props.$darkMode ? '#333333' : '#ffffff'};
  color: ${props => props.$darkMode ? '#ffffff' : '#333333'};
  font-size: 14px;
  min-width: 150px;
`;

const ToggleGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid ${props => props.$darkMode ? '#404040' : '#e0e0e0'};
  border-radius: 6px;
  background: ${props => props.$active ? '#007bff' : 'transparent'};
  color: ${props => props.$active ? '#ffffff' : (props.$darkMode ? '#b0b0b0' : '#666666')};
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$active ? '#0056b3' : (props.$darkMode ? '#404040' : '#f8f9fa')};
  }
`;

const VisualizationArea = styled.div`
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${props => props.$darkMode ? '#404040' : '#e0e0e0'};
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: ${props => props.$darkMode ? '#b0b0b0' : '#666666'};
  font-size: 14px;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #dc3545;
`;

const ErrorText = styled.p`
  font-size: 14px;
  text-align: center;
`;

const WordCloudContainer = styled.div`
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BarChartContainer = styled.div`
  width: 100%;
  max-width: 600px;
`;

const BarChartTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.$darkMode ? '#ffffff' : '#333333'};
  margin-bottom: 20px;
  text-align: center;
`;

const BarChartList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const BarChartItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BarChartLabel = styled.span`
  font-size: 14px;
  color: ${props => props.$darkMode ? '#b0b0b0' : '#666666'};
  min-width: 100px;
`;

const BarChartBar = styled.div`
  flex: 1;
  height: 24px;
  background: ${props => props.$darkMode ? '#404040' : '#f8f9fa'};
  border-radius: 12px;
  position: relative;
  overflow: hidden;
`;

const BarChartFill = styled.div`
  height: 100%;
  width: ${props => props.$width}%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  border-radius: 12px;
  transition: width 0.3s ease;
`;

const BarChartValue = styled.span`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
`;

const TrendContainer = styled.div`
  width: 100%;
  max-width: 500px;
`;

const TrendTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.$darkMode ? '#ffffff' : '#333333'};
  margin-bottom: 20px;
  text-align: center;
`;

const TrendList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TrendItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: ${props => props.$darkMode ? '#333333' : '#f8f9fa'};
  border-radius: 8px;
`;

const TrendSkill = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.$darkMode ? '#ffffff' : '#333333'};
`;

const TrendCount = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #007bff;
`;

const TrendIcon = styled.span`
  display: flex;
  align-items: center;
`;

const InsightButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  }
`;

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const PopupContent = styled.div`
  background: ${props => props.$darkMode ? '#2a2a2a' : '#ffffff'};
  border-radius: 16px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const PopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const PopupTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.$darkMode ? '#ffffff' : '#333333'};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.$darkMode ? '#b0b0b0' : '#666666'};
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    background: ${props => props.$darkMode ? '#404040' : '#f8f9fa'};
  }
`;

const PopupBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InsightItem = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px;
  background: ${props => props.$darkMode ? '#333333' : '#f8f9fa'};
  border-radius: 8px;
`;

const InsightIcon = styled.div`
  color: #007bff;
  font-size: 18px;
  flex-shrink: 0;
`;

const InsightContent = styled.div`
  flex: 1;
`;

const InsightTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.$darkMode ? '#ffffff' : '#333333'};
  margin: 0 0 8px 0;
`;

const InsightText = styled.p`
  font-size: 14px;
  color: ${props => props.$darkMode ? '#b0b0b0' : '#666666'};
  margin: 0;
  line-height: 1.5;
`; 