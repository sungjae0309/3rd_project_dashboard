/* ───────── src/components/TrendAnalysisSection.jsx ───────── */
import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { 
  FaChartLine, 
  FaCloud, 
  FaChartBar, 
  FaCalendarAlt, 
  FaFilter,
  FaInfoCircle,
  FaStar,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaCog,
  FaHeart,
  FaUserTie,
  FaHistory,
  FaClock,
  FaCalendarDay,
  FaCalendarWeek,
  FaTimes
} from "react-icons/fa";
import WordCloud from "react-wordcloud";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://192.168.101.51:8000';

export default function TrendAnalysisSection({ darkMode = false }) {
  // 트렌드 분석 상태
  const [jobNames, setJobNames] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [selectedField, setSelectedField] = useState("tech_stack");
  const [visualizationType, setVisualizationType] = useState("wordcloud");
  const [skillData, setSkillData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // 일간/주간 스킬 통계 상태 추가
  const [dailyStats, setDailyStats] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedWeek, setSelectedWeek] = useState("");

  // 주간 비교를 위한 상태
  const [startWeek, setStartWeek] = useState("");
  const [endWeek, setEndWeek] = useState("");
  const [year, setYear] = useState("");
  const [comparisonData, setComparisonData] = useState(null);
  const [showComparisonPopup, setShowComparisonPopup] = useState(false);
  const [selectedComparisonType, setSelectedComparisonType] = useState("biggest_difference");

  // FastAPI 문서 기반 필드 타입 옵션
  const fieldOptions = [
    { value: "tech_stack", label: "기술 스택", icon: <FaCog /> },
    { value: "required_skills", label: "필수 스킬", icon: <FaCog /> },
    { value: "preferred_skills", label: "우대 스킬", icon: <FaStar /> },
    { value: "qualifications", label: "자격 요건", icon: <FaUserTie /> },
    { value: "preferences", label: "선호 사항", icon: <FaHeart /> }
  ];

  // 시각화 타입 옵션
  const visualizationOptions = [
    { value: "wordcloud", label: "워드클라우드", icon: <FaCloud /> },
    { value: "weekly_comparison", label: "주간 비교", icon: <FaChartBar /> }
  ];

  // 직무명 조회 및 사용자 관심직무 자동 적용
  useEffect(() => {
    // 이미 초기화되었으면 다시 호출하지 않음
    if (hasInitialized) {
      return;
    }

    const fetchJobNamesAndSetUserJob = async () => {
      try {
        setLoading(true);
        
        // 1. 직무명 목록 가져오기
        const response = await axios.get(`${BASE_URL}/job-skills/job-names`);
        const jobList = response.data;
        setJobNames(jobList);
        
        // 2. 사용자 관심직무 가져오기
        const token = localStorage.getItem("accessToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        try {
          const { data: userDesiredJob } = await axios.get(`${BASE_URL}/users/desired-job`, { headers });
          console.log('✅ [TrendAnalysis] 사용자 관심직무:', userDesiredJob);
          
          // 사용자 관심직무가 직무 목록에 있는지 확인
          if (userDesiredJob && jobList.includes(userDesiredJob)) {
            setSelectedJob(userDesiredJob);
          } else if (jobList.length > 0) {
            setSelectedJob(jobList[0]); // 없으면 첫 번째 직무
          }
        } catch (err) {
          console.warn('사용자 관심직무 조회 실패, 기본값 사용:', err);
          if (jobList.length > 0) {
            setSelectedJob(jobList[0]);
          }
        }
        
      } catch (error) {
        console.error('직무명 조회 실패:', error);
        setError('직무명을 불러오는데 실패했습니다.');
        setJobNames(['백엔드 개발자', '프론트엔드 개발자', '데이터 분석가', 'AI 엔지니어', 'DevOps 엔지니어']);
        setSelectedJob('백엔드 개발자');
      } finally {
        setLoading(false);
        setHasInitialized(true);
      }
    };

    fetchJobNamesAndSetUserJob();
  }, []); // 빈 의존성 배열로 변경

  // 워드클라우드 데이터 가져오기 (첫 번째 버튼)
  const fetchWordCloudData = async () => {
    if (!selectedJob) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // FastAPI 문서에 따른 엔드포인트 사용
      const response = await axios.get(`${BASE_URL}/visualization/weekly_skill_frequency`, {
        params: {
          job_name: selectedJob,
          field: selectedField,
          start_week: 1,
          end_week: 53,
          year: new Date().getFullYear()
        }
      });
      
      const data = response.data;
      console.log('✅ [TrendAnalysis] 워드클라우드 데이터:', data);
      
      // 워드클라우드 형식으로 변환
      const wordCloudData = data.map(item => ({
        text: item.skill,
        value: item.count
      }));
      
      setSkillData(wordCloudData);
    } catch (err) {
      console.error('❌ [TrendAnalysis] 워드클라우드 데이터 조회 실패:', err);
      setError('워드클라우드 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 일간 스킬 통계 가져오기
  const fetchDailyStats = async () => {
    if (!selectedJob) return;
    
    try {
      setStatsLoading(true);
      
      const response = await axios.get(`${BASE_URL}/visualization/daily/${encodeURIComponent(selectedJob)}`, {
        params: {
          field_type: selectedField,
          date: selectedDate
        }
      });
      
      setDailyStats(response.data);
      console.log('✅ [TrendAnalysis] 일간 스킬 통계:', response.data);
    } catch (err) {
      console.error('❌ [TrendAnalysis] 일간 스킬 통계 조회 실패:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // 주간 스킬 통계 가져오기
  const fetchWeeklyStats = async () => {
    if (!selectedJob) return;
    
    try {
      setStatsLoading(true);
      
      const response = await axios.get(`${BASE_URL}/visualization/weekly_stats/${encodeURIComponent(selectedJob)}`, {
        params: {
          field_type: selectedField,
          week: selectedWeek || undefined
        }
      });
      
      setWeeklyStats(response.data);
      console.log('✅ [TrendAnalysis] 주간 스킬 통계:', response.data);
    } catch (err) {
      console.error('❌ [TrendAnalysis] 주간 스킬 통계 조회 실패:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // 주간 비교 데이터 가져오기 (두 번째 버튼)
  const fetchWeeklyComparison = async () => {
    if (!selectedJob || !startWeek || !endWeek || !year) {
      setError('주차와 연도를 모두 입력해주세요.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${BASE_URL}/visualization/weekly_skill_frequency_comparison`, {
        params: {
          job_name: selectedJob,
          field: selectedField,
          week1: parseInt(startWeek),
          week2: parseInt(endWeek),
          year: parseInt(year)
        }
      });
      
      setComparisonData(response.data);
      setShowComparisonPopup(true);
      console.log('✅ [TrendAnalysis] 주간 비교 데이터:', response.data);
    } catch (err) {
      console.error('❌ [TrendAnalysis] 주간 비교 데이터 조회 실패:', err);
      setError('주간 비교 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 시각화 타입 변경 시 데이터 가져오기
  useEffect(() => {
    if (visualizationType === "wordcloud" && selectedJob) {
      fetchWordCloudData();
    }
  }, [visualizationType, selectedJob, selectedField]);

  // 일간/주간 통계 자동 조회
  useEffect(() => {
    if (selectedJob) {
      fetchDailyStats();
      fetchWeeklyStats();
    }
  }, [selectedJob, selectedField, selectedDate, selectedWeek]);

  // 데이터 처리 함수 - FastAPI docs 응답 구조 기반
  const processApiResponse = (data, type) => {
    if (!data || !Array.isArray(data)) return [];

    if (type === "weekly_comparison") {
      // FastAPI docs 응답 구조: [{year, week, skill, count}]
      const weeklyData = {};
      
      // 주차별로 데이터 그룹화
      data.forEach(item => {
        if (!weeklyData[item.week]) {
          weeklyData[item.week] = [];
        }
        weeklyData[item.week].push({
          skill: item.skill,
          count: item.count,
          week: item.week,
          year: item.year
        });
      });

      // 스킬별로 주차 간 비교 데이터 생성
      const skillComparison = {};
      Object.keys(weeklyData).forEach(week => {
        weeklyData[week].forEach(item => {
          if (!skillComparison[item.skill]) {
            skillComparison[item.skill] = {};
          }
          skillComparison[item.skill][week] = item.count;
        });
      });

      // 비교 데이터 배열로 변환
      return Object.keys(skillComparison).map(skill => {
        const weeks = Object.keys(skillComparison[skill]).sort();
        const beforeCount = skillComparison[skill][weeks[0]] || 0;
        const afterCount = skillComparison[skill][weeks[weeks.length - 1]] || 0;
        
        return {
          skill: skill,
          beforeCount: beforeCount,
          afterCount: afterCount,
          change: afterCount - beforeCount,
          changePercent: beforeCount > 0 ? ((afterCount - beforeCount) / beforeCount * 100) : 0,
          trend: afterCount > beforeCount ? "up" : afterCount < beforeCount ? "down" : "stable"
        };
      }).sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
    } else {
      // 워드클라우드와 트렌드 차트용 데이터 처리
      return data.map(item => ({
        skill: item.skill,
        count: item.count || item.frequency || 0,
        year: item.year,
        week: item.week,
        trend: "stable"
      }));
    }
  };

  // 워드클라우드 옵션
  const wordCloudOptions = {
    fontSizes: [14, 45],
    rotations: 2,
    rotationAngles: [-90, 90],
    padding: 5,
    deterministic: true,
    removeDuplicateWords: false,
    fontFamily: "Arial, sans-serif",
    fontWeight: "bold",
    colors: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57", "#ff9ff3", "#54a0ff", "#5f27cd"]
  };

  // 트렌드 아이콘
  const getTrendIcon = (trend) => {
    switch(trend) {
      case "up": return <FaArrowUp style={{ color: "#28a745" }} />;
      case "down": return <FaArrowDown style={{ color: "#dc3545" }} />;
      case "stable": return <FaMinus style={{ color: "#6c757d" }} />;
      default: return <FaMinus style={{ color: "#6c757d" }} />;
    }
  };

  // 주간 비교 입력 UI - FastAPI docs 기반
  const renderWeeklyComparisonInputs = () => {
    return (
      <WeeklyInputContainer $darkMode={darkMode}>
        <WeeklyInputTitle $darkMode={darkMode}>
          <FaHistory style={{ marginRight: '0.5rem' }} />
          주간 스킬 빈도 조회 (주차 범위 지정)
        </WeeklyInputTitle>
        <WeeklyInputDescription $darkMode={darkMode}>
          선택한 직무명과 분석 필드에 대해, 지정된 주차 범위의 채용공고에서 추출된 기술/키워드의 주별 등장 빈도를 집계하여 반환합니다.
        </WeeklyInputDescription>
        
        <WeeklyInputGrid>
          <FilterGroup>
            <FilterLabel $darkMode={darkMode}>시작 주차 *</FilterLabel>
            <FilterSelect 
              value={startWeek} 
              onChange={(e) => setStartWeek(e.target.value)}
              $darkMode={darkMode}
              required
            >
              <option value="">선택하세요</option>
              {Array.from({length: 53}, (_, i) => i + 1).map(week => (
                <option key={week} value={week}>{week}주차</option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel $darkMode={darkMode}>마감 주차 *</FilterLabel>
            <FilterSelect 
              value={endWeek} 
              onChange={(e) => setEndWeek(e.target.value)}
              $darkMode={darkMode}
              required
            >
              <option value="">선택하세요</option>
              {Array.from({length: 53}, (_, i) => i + 1).map(week => (
                <option key={week} value={week}>{week}주차</option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel $darkMode={darkMode}>연도 *</FilterLabel>
            <FilterSelect 
              value={year} 
              onChange={(e) => setYear(e.target.value)}
              $darkMode={darkMode}
              required
            >
              <option value="">선택하세요</option>
              {[2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}년</option>
              ))}
            </FilterSelect>
          </FilterGroup>
        </WeeklyInputGrid>
        
        {startWeek && endWeek && parseInt(startWeek) >= parseInt(endWeek) && (
          <InputError $darkMode={darkMode}>
            마감 주차는 시작 주차보다 커야 합니다.
          </InputError>
        )}
        
        <InputInfo $darkMode={darkMode}>
          <FaInfoCircle style={{ marginRight: '0.5rem' }} />
          현재 29주차, 30주차에 데이터가 있습니다. 해당 범위로 설정해보세요.
        </InputInfo>
      </WeeklyInputContainer>
    );
  };

  // 주간 비교 시각화 - FastAPI docs 기반
  const renderWeeklyComparison = () => {
    if (!startWeek || !endWeek || !year) {
      return renderWeeklyComparisonInputs();
    }

    if (parseInt(startWeek) >= parseInt(endWeek)) {
      return (
        <NoDataMessage>
          <div>주간 범위가 올바르지 않습니다.</div>
          <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
            마감 주차는 시작 주차보다 커야 합니다.
          </div>
        </NoDataMessage>
      );
    }

    if (!skillData || skillData.length === 0) {
      return (
        <NoDataMessage>
          <div>주간 비교 데이터가 없습니다.</div>
          <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
            {startWeek}주차 ~ {endWeek}주차 ({year}년) 데이터를 확인해주세요.
          </div>
        </NoDataMessage>
      );
    }

    return (
      <WeeklyComparisonContainer>
        <ComparisonHeader>
          <ComparisonTitle>주간 스킬 변화 분석</ComparisonTitle>
          <ComparisonSubtitle>
            {startWeek}주차 → {endWeek}주차 ({year}년)
          </ComparisonSubtitle>
        </ComparisonHeader>
        
        <ComparisonGrid>
          {skillData.slice(0, 10).map((item, index) => (
            <ComparisonCard key={index} $darkMode={darkMode}>
              <SkillName $darkMode={darkMode}>{item.skill}</SkillName>
              
              <ComparisonData>
                <BeforeAfterSection>
                  <BeforeSection>
                    <BeforeLabel>이전</BeforeLabel>
                    <BeforeCount>{item.beforeCount}</BeforeCount>
                  </BeforeSection>
                  
                  <ArrowSection>
                    {getTrendIcon(item.trend)}
                  </ArrowSection>
                  
                  <AfterSection>
                    <AfterLabel>이후</AfterLabel>
                    <AfterCount $trend={item.trend}>{item.afterCount}</AfterCount>
                  </AfterSection>
                </BeforeAfterSection>
                
                <ChangeInfo>
                  <ChangeAmount $trend={item.trend}>
                    {item.change > 0 ? '+' : ''}{item.change}
                  </ChangeAmount>
                  <ChangePercent $trend={item.trend}>
                    ({item.changePercent > 0 ? '+' : ''}{item.changePercent.toFixed(1)}%)
                  </ChangePercent>
                </ChangeInfo>
              </ComparisonData>
            </ComparisonCard>
          ))}
        </ComparisonGrid>
      </WeeklyComparisonContainer>
    );
  };

  // 시각화 렌더링
  const renderVisualization = () => {
    if (visualizationType === "weekly_comparison") {
      return renderWeeklyComparison();
    }

    if (!skillData || skillData.length === 0) {
      return <NoDataMessage>데이터가 없습니다.</NoDataMessage>;
    }

    switch (visualizationType) {
      case "wordcloud":
        return (
          <WordCloudContainer>
            <WordCloud 
              words={skillData.map(item => ({
                text: item.skill,
                value: item.count
              }))}
              options={wordCloudOptions}
            />
          </WordCloudContainer>
        );
      
      // case "trend":
      //   return (
      //     <TrendContainer>
      //       <TrendTitle $darkMode={darkMode}>트렌드 분석 결과</TrendTitle>
      //       <TrendList>
      //         {skillData.map((item, index) => (
      //           <TrendItem key={index} $darkMode={darkMode}>
      //             <SkillName $darkMode={darkMode}>{item.skill}</SkillName>
      //             <TrendData>
      //               <Count>{item.count}</Count>
      //           <TrendIcon>{getTrendIcon(item.trend)}</TrendIcon>
      //             </TrendData>
      //           </TrendItem>
      //         ))}
      //       </TrendList>
      //     </TrendContainer>
      //   );
      
      default:
        return <NoDataMessage>지원하지 않는 시각화 타입입니다.</NoDataMessage>;
    }
  };

  // 시간 단위 선택 UI 렌더링
  const renderTimeUnitSelector = () => {
    if (visualizationType !== "wordcloud") return null;

    return (
      <TimeUnitSelector $darkMode={darkMode}>
        <TimeUnitTitle $darkMode={darkMode}>
          <FaInfoCircle style={{ marginRight: '0.5rem' }} />
          분석 시간 단위
        </TimeUnitTitle>
        
        <TimeUnitButtons>
          <TimeUnitButton
            $active={timeUnit === "daily"}
            onClick={() => setTimeUnit("daily")}
            $darkMode={darkMode}
          >
            <FaCalendarDay />
            일자별
          </TimeUnitButton>
          <TimeUnitButton
            $active={timeUnit === "weekly"}
            onClick={() => setTimeUnit("weekly")}
            $darkMode={darkMode}
          >
            <FaCalendarWeek />
            주차별
          </TimeUnitButton>
        </TimeUnitButtons>

        {/* 일자별 선택 UI */}
        {timeUnit === "daily" && (
          <DateSelector $darkMode={darkMode}>
            <DateLabel $darkMode={darkMode}>날짜 선택:</DateLabel>
            <DateInput
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              $darkMode={darkMode}
            />
          </DateSelector>
        )}

        {/* 주차별 선택 UI */}
        {timeUnit === "weekly" && (
          <WeekSelector $darkMode={darkMode}>
            <WeekLabel $darkMode={darkMode}>주차 선택:</WeekLabel>
            <WeekSelect
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              $darkMode={darkMode}
            >
              <option value="">현재 주차 (기본값)</option>
              {Array.from({length: 53}, (_, i) => i + 1).map(week => (
                <option key={week} value={week}>{week}주차</option>
              ))}
            </WeekSelect>
          </WeekSelector>
        )}
      </TimeUnitSelector>
    );
  };

  // 일간/주간 통계 렌더링
  const renderStatsSection = () => (
    <StatsSection $darkMode={darkMode}>
      <StatsTitle $darkMode={darkMode}>스킬 통계</StatsTitle>
      <StatsGrid>
        <StatsCard $darkMode={darkMode}>
          <StatsCardHeader $darkMode={darkMode}>
            <FaCalendarDay />
            <span>일간 스킬 통계</span>
          </StatsCardHeader>
          <DateInput
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            $darkMode={darkMode}
          />
          {statsLoading ? (
            <LoadingText $darkMode={darkMode}>로딩 중...</LoadingText>
          ) : (
            <StatsList>
              {dailyStats.slice(0, 5).map((item, index) => (
                <StatsItem key={index} $darkMode={darkMode}>
                  <span>{item.skill}</span>
                  <span>{item.count}</span>
                </StatsItem>
              ))}
            </StatsList>
          )}
        </StatsCard>
        
        <StatsCard $darkMode={darkMode}>
          <StatsCardHeader $darkMode={darkMode}>
            <FaCalendarWeek />
            <span>주간 스킬 통계</span>
          </StatsCardHeader>
          <WeekInput
            type="number"
            min="1"
            max="53"
            placeholder="주차 입력"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            $darkMode={darkMode}
          />
          {statsLoading ? (
            <LoadingText $darkMode={darkMode}>로딩 중...</LoadingText>
          ) : (
            <StatsList>
              {weeklyStats.slice(0, 5).map((item, index) => (
                <StatsItem key={index} $darkMode={darkMode}>
                  <span>{item.skill}</span>
                  <span>{item.count}</span>
                </StatsItem>
              ))}
            </StatsList>
          )}
        </StatsCard>
      </StatsGrid>
    </StatsSection>
  );

  // 주간 비교 팝업 렌더링
  const renderComparisonPopup = () => {
    if (!showComparisonPopup || !comparisonData) return null;

    const comparisonTypes = [
      { key: "biggest_difference", label: "최대 차이", icon: <FaArrowUp /> },
      { key: "smallest_difference", label: "최소 차이", icon: <FaArrowDown /> },
      { key: "biggest_percentage", label: "최대 비율", icon: <FaArrowUp /> },
      { key: "smallest_percentage", label: "최소 비율", icon: <FaArrowDown /> }
    ];

    const currentData = comparisonData[selectedComparisonType];

    return (
      <PopupOverlay onClick={() => setShowComparisonPopup(false)}>
        <PopupContent onClick={(e) => e.stopPropagation()} $darkMode={darkMode}>
          <PopupHeader $darkMode={darkMode}>
            <h3>주간 비교 결과</h3>
            <CloseButton onClick={() => setShowComparisonPopup(false)}>
              <FaTimes />
            </CloseButton>
          </PopupHeader>
          
          <ComparisonButtons>
            {comparisonTypes.map(type => (
              <ComparisonButton
                key={type.key}
                $active={selectedComparisonType === type.key}
                onClick={() => setSelectedComparisonType(type.key)}
                $darkMode={darkMode}
              >
                {type.icon}
                {type.label}
              </ComparisonButton>
            ))}
          </ComparisonButtons>
          
          {currentData && (
            <ComparisonResult $darkMode={darkMode}>
              <h4>{currentData.skill}</h4>
              <ComparisonDetails $darkMode={darkMode}>
                <div>Week 1: {currentData.week1_count}</div>
                <div>Week 2: {currentData.week2_count}</div>
                <div>차이: {currentData.difference}</div>
                <div>비율 변화: {currentData.percentage_change}%</div>
              </ComparisonDetails>
            </ComparisonResult>
          )}
        </PopupContent>
      </PopupOverlay>
    );
  };

  return (
    <Container $darkMode={darkMode}>
      <Header>
        <Title $darkMode={darkMode}>
          <FaChartLine style={{ marginRight: '0.5rem' }} />
          직무 트렌드 분석
        </Title>
        <Description $darkMode={darkMode}>
          선택한 직무의 기술 스택 트렌드를 분석하여 시각화합니다.
        </Description>
      </Header>

      <ControlSection $darkMode={darkMode}>
        <FilterGroup>
          <FilterLabel $darkMode={darkMode}>직무명</FilterLabel>
          <FilterSelect
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            $darkMode={darkMode}
          >
            {jobNames.map((job) => (
              <option key={job} value={job}>
                {job}
              </option>
            ))}
          </FilterSelect>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel $darkMode={darkMode}>분석 필드</FilterLabel>
          <FilterSelect
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
            $darkMode={darkMode}
          >
            {fieldOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel $darkMode={darkMode}>시각화 방식</FilterLabel>
          <VisualizationTabs>
            {visualizationOptions.map((option) => (
              <VisualizationTab
                key={option.value}
                $active={visualizationType === option.value}
                $darkMode={darkMode}
                onClick={() => setVisualizationType(option.value)}
              >
                {option.icon}
                {option.label}
              </VisualizationTab>
            ))}
          </VisualizationTabs>
        </FilterGroup>
      </ControlSection>

      {/* 시간 단위 선택 UI */}
      {renderTimeUnitSelector()}

      <ContentSection $darkMode={darkMode}>
        {loading ? (
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText $darkMode={darkMode}>데이터를 불러오는 중...</LoadingText>
          </LoadingContainer>
        ) : error ? (
          <ErrorContainer>
            <FaExclamationTriangle />
            <ErrorMessage $darkMode={darkMode}>{error}</ErrorMessage>
          </ErrorContainer>
        ) : (
          <VisualizationContainer>
            {renderVisualization()}
          </VisualizationContainer>
        )}
      </ContentSection>
      
      {/* 일간/주간 통계 섹션 */}
      {renderStatsSection()}
      
      {/* 주간 비교 팝업 */}
      {renderComparisonPopup()}
    </Container>
  );
}

// --- 스타일 정의 ---

const Container = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? '#1a1a1a' : '#fff')};
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ $darkMode }) => ($darkMode ? '#fff' : '#333')};
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  color: ${({ $darkMode }) => ($darkMode ? '#ccc' : '#666')};
  font-size: 0.9rem;
  line-height: 1.5;
`;

const ControlSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: ${({ $darkMode }) => ($darkMode ? '#2a2a2a' : '#f8f9fa')};
  border-radius: 0.8rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ $darkMode }) => ($darkMode ? '#ccc' : '#666')};
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#444' : '#ddd')};
  border-radius: 0.4rem;
  background: ${({ $darkMode }) => ($darkMode ? '#333' : '#fff')};
  color: ${({ $darkMode }) => ($darkMode ? '#fff' : '#333')};
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #ffc400;
  }
`;

const VisualizationTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const VisualizationTab = styled.button`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem 1rem;
  border: 1px solid ${({ $active, $darkMode }) => 
    $active ? '#ffc400' : ($darkMode ? '#555' : '#ddd')};
  background: ${({ $active, $darkMode }) => 
    $active ? '#ffc400' : ($darkMode ? '#333' : '#fff')};
  color: ${({ $active, $darkMode }) => 
    $active ? '#333' : ($darkMode ? '#ccc' : '#666')};
  border-radius: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $active, $darkMode }) => 
      $active ? '#ffb300' : ($darkMode ? '#444' : '#f5f5f5')};
  }
`;

const ContentSection = styled.div`
  min-height: 400px;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 1rem;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ffc400;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  color: ${({ $darkMode }) => ($darkMode ? '#ccc' : '#666')};
  font-size: 0.9rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 1rem;
  color: #dc3545;
`;

const ErrorMessage = styled.div`
  color: ${({ $darkMode }) => ($darkMode ? '#ff6b6b' : '#dc3545')};
  font-size: 0.9rem;
  text-align: center;
`;

const VisualizationContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const WordCloudContainer = styled.div`
  width: 100%;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 4rem;
  color: ${({ $darkMode }) => ($darkMode ? '#ccc' : '#666')};
  font-size: 0.9rem;
`;

// 주간 입력 UI 스타일 - FastAPI docs 기반
const WeeklyInputContainer = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? '#2a2a2a' : '#f8f9fa')};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#444' : '#e0e0e0')};
  border-radius: 0.8rem;
  padding: 2rem;
  margin-bottom: 1rem;
`;

const WeeklyInputTitle = styled.h3`
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  font-weight: 700;
  color: ${({ $darkMode }) => ($darkMode ? '#fff' : '#333')};
  margin-bottom: 0.5rem;
`;

const WeeklyInputDescription = styled.p`
  color: ${({ $darkMode }) => ($darkMode ? '#ccc' : '#666')};
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
`;

const WeeklyInputGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const InputError = styled.div`
  color: #dc3545;
  font-size: 0.8rem;
  text-align: center;
  margin-top: 1rem;
  padding: 0.5rem;
  background: rgba(220, 53, 69, 0.1);
  border-radius: 0.4rem;
`;

const InputInfo = styled.div`
  display: flex;
  align-items: center;
  color: #ffc400;
  font-size: 0.8rem;
  text-align: center;
  padding: 0.5rem;
  background: rgba(255, 196, 0, 0.1);
  border-radius: 0.4rem;
`;

// 주간 비교 시각화 스타일
const WeeklyComparisonContainer = styled.div`
  width: 100%;
`;

const ComparisonHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const ComparisonTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${({ $darkMode }) => ($darkMode ? '#fff' : '#333')};
  margin-bottom: 0.5rem;
`;

const ComparisonSubtitle = styled.div`
  color: ${({ $darkMode }) => ($darkMode ? '#ccc' : '#666')};
  font-size: 0.9rem;
`;

const ComparisonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
`;

const ComparisonCard = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? '#2a2a2a' : '#f8f9fa')};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#444' : '#e0e0e0')};
  border-radius: 0.8rem;
  padding: 1.5rem;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const SkillName = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ $darkMode }) => ($darkMode ? '#fff' : '#333')};
  margin-bottom: 1rem;
`;

const ComparisonData = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const BeforeAfterSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const BeforeSection = styled.div`
  text-align: center;
  flex: 1;
`;

const BeforeLabel = styled.div`
  font-size: 0.8rem;
  color: ${({ $darkMode }) => ($darkMode ? '#ccc' : '#666')};
  margin-bottom: 0.3rem;
`;

const BeforeCount = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ $darkMode }) => ($darkMode ? '#ccc' : '#666')};
`;

const ArrowSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
`;

const AfterSection = styled.div`
  text-align: center;
  flex: 1;
`;

const AfterLabel = styled.div`
  font-size: 0.8rem;
  color: ${({ $darkMode }) => ($darkMode ? '#ccc' : '#666')};
  margin-bottom: 0.3rem;
`;

const AfterCount = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ $trend }) => {
    if ($trend === "up") return "#28a745";
    if ($trend === "down") return "#dc3545";
    return "#6c757d";
  }};
`;

const ChangeInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid ${({ $darkMode }) => ($darkMode ? '#444' : '#e0e0e0')};
`;

const ChangeAmount = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ $trend }) => {
    if ($trend === "up") return "#28a745";
    if ($trend === "down") return "#dc3545";
    return "#6c757d";
  }};
`;

const ChangePercent = styled.div`
  font-size: 0.8rem;
  color: ${({ $trend }) => {
    if ($trend === "up") return "#28a745";
    if ($trend === "down") return "#dc3545";
    return "#6c757d";
  }};
`;

// 기존 시각화 스타일들
const TrendContainer = styled.div`
  width: 100%;
`;

const TrendTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${({ $darkMode }) => ($darkMode ? '#fff' : '#333')};
  margin-bottom: 1rem;
`;

const TrendList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TrendItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
  background: ${({ $darkMode }) => ($darkMode ? '#2a2a2a' : '#f8f9fa')};
  border-radius: 0.5rem;
`;

const TrendData = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Count = styled.span`
  font-weight: 600;
  color: ${({ $darkMode }) => ($darkMode ? '#fff' : '#333')};
`;

const TrendIcon = styled.span`
  font-size: 0.9rem;
`;

const BarChartContainer = styled.div`
  width: 100%;
`;

const BarChartTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${({ $darkMode }) => ($darkMode ? '#fff' : '#333')};
  margin-bottom: 1rem;
`;

const BarChartList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const BarChartItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BarChartLabel = styled.div`
  width: 120px;
  font-size: 0.9rem;
  color: ${({ $darkMode }) => ($darkMode ? '#ccc' : '#666')};
`;

const BarChartBar = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BarChartFill = styled.div`
  height: 20px;
  width: ${({ $count, $maxCount }) => ($count / $maxCount * 100)}%;
  background: linear-gradient(90deg, #ffc400, #ff9800);
  border-radius: 10px;
  transition: width 0.3s ease;
`;

const BarChartValue = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ $darkMode }) => ($darkMode ? '#ccc' : '#666')};
  min-width: 40px;
`;

// 새로운 스타일 컴포넌트들 추가
const TimeUnitSelector = styled.div`
  background: ${({ $darkMode }) => $darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
  border-radius: 0.8rem;
  padding: 1rem;
  border: 1px solid ${({ $darkMode }) => $darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  margin-bottom: 1rem;
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

const DateSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DateLabel = styled.label`
  font-size: 0.8rem;
  color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#666'};
  font-weight: 500;
`;

const DateInput = styled.input`
  padding: 0.4rem 0.6rem;
  border: 1px solid ${({ $darkMode }) => $darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
  border-radius: 0.4rem;
  background: ${({ $darkMode }) => $darkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff'};
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
  font-size: 0.8rem;
`;

const WeekSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const WeekLabel = styled.label`
  font-size: 0.8rem;
  color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#666'};
  font-weight: 500;
`;

const WeekSelect = styled.select`
  padding: 0.4rem 0.6rem;
  border: 1px solid ${({ $darkMode }) => $darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
  border-radius: 0.4rem;
  background: ${({ $darkMode }) => $darkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff'};
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
  font-size: 0.8rem;
`;

const StatsSection = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: ${props => props.$darkMode ? '#2a2a2a' : '#f8f9fa'};
  border-radius: 12px;
  border: 1px solid ${props => props.$darkMode ? '#444' : '#e9ecef'};
`;

const StatsTitle = styled.h4`
  margin: 0 0 1rem 0;
  color: ${props => props.$darkMode ? '#fff' : '#333'};
  font-size: 1.1rem;
  font-weight: 600;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const StatsCard = styled.div`
  padding: 1rem;
  background: ${props => props.$darkMode ? '#333' : '#fff'};
  border-radius: 8px;
  border: 1px solid ${props => props.$darkMode ? '#555' : '#dee2e6'};
`;

const StatsCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: ${props => props.$darkMode ? '#fff' : '#333'};
  font-weight: 500;
`;

const WeekInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid ${props => props.$darkMode ? '#555' : '#dee2e6'};
  border-radius: 4px;
  background: ${props => props.$darkMode ? '#444' : '#fff'};
  color: ${props => props.$darkMode ? '#fff' : '#333'};
  margin-bottom: 0.5rem;
`;

const StatsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const StatsItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  font-size: 0.9rem;
  color: ${props => props.$darkMode ? '#ccc' : '#666'};
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
  background: ${props => props.$darkMode ? '#333' : '#fff'};
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const PopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h3 {
    margin: 0;
    color: ${props => props.$darkMode ? '#fff' : '#333'};
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.$darkMode ? '#ccc' : '#666'};
  cursor: pointer;
  font-size: 1.2rem;
  
  &:hover {
    color: ${props => props.$darkMode ? '#fff' : '#333'};
  }
`;

const ComparisonButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const ComparisonButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid ${props => props.$active ? '#007bff' : props.$darkMode ? '#555' : '#dee2e6'};
  border-radius: 6px;
  background: ${props => props.$active ? '#007bff' : props.$darkMode ? '#444' : '#fff'};
  color: ${props => props.$active ? '#fff' : props.$darkMode ? '#ccc' : '#333'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.$active ? '#0056b3' : props.$darkMode ? '#555' : '#f8f9fa'};
  }
`;

const ComparisonResult = styled.div`
  padding: 1rem;
  background: ${props => props.$darkMode ? '#444' : '#f8f9fa'};
  border-radius: 8px;
  
  h4 {
    margin: 0 0 1rem 0;
    color: ${props => props.$darkMode ? '#fff' : '#333'};
  }
`;

const ComparisonDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: ${props => props.$darkMode ? '#ccc' : '#666'};
`;

const ComparisonInputs = styled.div`
  display: flex;
  gap: 1rem;
  align-items: end;
  margin-bottom: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  
  label {
    font-size: 0.9rem;
    color: ${props => props.$darkMode ? '#ccc' : '#666'};
  }
  
  input {
    padding: 0.5rem;
    border: 1px solid ${props => props.$darkMode ? '#555' : '#dee2e6'};
    border-radius: 4px;
    background: ${props => props.$darkMode ? '#444' : '#fff'};
    color: ${props => props.$darkMode ? '#fff' : '#333'};
  }
`;

const CompareButton = styled.button`
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    background: #0056b3;
  }
`;

 