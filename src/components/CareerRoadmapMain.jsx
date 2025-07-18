/* ───────── src/components/CareerRoadmapMain.jsx ───────── */
import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { IoIosArrowUp } from "react-icons/io";
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
  FaExpand,
  FaUserTie,
  FaCog,
  FaBriefcase
} from "react-icons/fa";
import WordCloud from "react-wordcloud";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";
import axios from "axios";

// 메인 화면과 동일한 API 주소 사용
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://192.168.101.51:8000';

export default function CareerRoadmapMain({ darkMode = false, setSelectedPage }) {
  // 트렌드 분석 상태
  const [jobNames, setJobNames] = useState([]);
  const [selectedTrendJob, setSelectedTrendJob] = useState("");
  const [selectedField, setSelectedField] = useState("tech_stack");
  const [visualizationType, setVisualizationType] = useState("wordcloud");
  const [skillData, setSkillData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInsightsPopup, setShowInsightsPopup] = useState(false);

  // 갭 분석 상태
  const [gapResult, setGapResult] = useState("");
  const [topSkills, setTopSkills] = useState([]);
  const [gapLoading, setGapLoading] = useState(true);

  // 필드 타입 옵션 (수정된 아이콘)
  const fieldOptions = [
    { value: "tech_stack", label: "기술 스택", icon: <FaCog /> },
    { value: "required_skills", label: "요구 스택", icon: <FaUserTie /> },
    { value: "preferred_skills", label: "우대 사항", icon: <FaStar /> },
    { value: "main_tasks_skills", label: "주요 업무", icon: <FaBriefcase /> }
  ];

  // 1. 상태 분리
  const [trendJobNames, setTrendJobNames] = useState([]);
  const [gapJobNames, setGapJobNames] = useState([]);
  const [selectedGapJob, setSelectedGapJob] = useState("");

  // 2. 직무명 리스트 fetch (한 번만)
  useEffect(() => {
    const fetchJobNames = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/job-skills/job-names/with-posts`);
        const jobList = response.data.map(job => job.name);
        setJobNames(jobList);
        if (jobList.length > 0) {
          setSelectedTrendJob(jobList[0]);
          setSelectedGapJob(jobList[0]);
        }
      } catch (error) {
        setJobNames([]);
      }
    };
    fetchJobNames();
  }, []);

  // 3. 트렌드 분석 데이터 fetch (selectedTrendJob 기준)
  useEffect(() => {
    if (!selectedTrendJob) return;

    console.log("트렌드 데이터 요청 - 직무:", selectedTrendJob, "필드:", selectedField);

    const fetchSkillData = async () => {
      try {
        setLoading(true);
        setError(null);

        let data;
        let apiResponse;

        if (visualizationType === "wordcloud") {
          // 메인 화면과 동일하게 /stats/trend/{job_name} 엔드포인트 사용
          apiResponse = await axios.get(`${BASE_URL}/stats/trend/${encodeURIComponent(selectedTrendJob)}`, {
            params: {
              field_type: selectedField,
              week: 29 // 고정된 주차 사용 (메인 화면과 동일)
            }
          });

          console.log("트렌드 데이터 API 응답:", apiResponse.data);

          // 메인 화면과 동일한 응답 구조 사용
          data = apiResponse.data.trend_data || apiResponse.data;
        } else if (visualizationType === "trend") {
          // /stats/trend/{job_name} 엔드포인트 사용
          apiResponse = await axios.get(`${BASE_URL}/stats/trend/${selectedTrendJob}`, {
            params: {
              field_type: selectedField,
              week: 29
            }
          });
          data = apiResponse.data;
        } else {
          // /stats/weekly/{job_name} 엔드포인트 사용
          apiResponse = await axios.get(`${BASE_URL}/stats/weekly/${selectedTrendJob}`, {
            params: { week: 29 }
          });
          data = apiResponse.data;
        }

        // 메인 화면과 동일한 데이터 처리 방식
        const processedData = processApiResponse(data, visualizationType);
        setSkillData(processedData);

      } catch (error) {
        console.error('스킬 데이터 조회 실패:', error);
        setError('데이터를 불러오는데 실패했습니다. 샘플 데이터를 표시합니다.');
        // 메인 화면과 동일한 샘플 데이터 구조
        setSkillData([
          { skill: "Python", count: 45, trend: "up" },
          { skill: "Java", count: 32, trend: "down" },
          { skill: "JavaScript", count: 28, trend: "stable" },
          { skill: "SQL", count: 25, trend: "up" },
          { skill: "React", count: 22, trend: "up" },
          { skill: "Spring", count: 18, trend: "down" },
          { skill: "Docker", count: 15, trend: "up" },
          { skill: "AWS", count: 12, trend: "up" },
          { skill: "Kubernetes", count: 10, trend: "up" },
          { skill: "Node.js", count: 8, trend: "stable" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSkillData();
  }, [selectedTrendJob, selectedField, visualizationType]); // selectedWeek 제거

  // 4. 갭 분석 데이터 fetch (selectedGapJob 기준)
  useEffect(() => {
    if (!selectedGapJob) return;
    const fetchGapAnalysis = async () => {
      setGapLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const { data: resume } = await axios.get(`${BASE_URL}/users/me/resume`, { headers });
        const desiredJobs = resume.desired_job || [];
        const jobCategory = desiredJobs[0];
        if (!jobCategory) {
          setGapResult("관심 직무가 등록되어 있지 않습니다.");
          setTopSkills([]);
          setGapLoading(false);
          return;
        }
        const { data: gapData } = await axios.get(
          `${BASE_URL}/visualization/gap-analysis`,
          { params: { category: jobCategory }, headers }
        );
        setGapResult(gapData.gap_result || "분석 결과가 없습니다.");
        setTopSkills(gapData.top_skills || []);
      } catch (err) {
        setGapResult("갭 분석 결과를 불러오지 못했습니다.");
        setTopSkills([]);
      } finally {
        setGapLoading(false);
      }
    };
    fetchGapAnalysis();
  }, [selectedGapJob]); // 최초 1회만 실행

  // 메인 화면과 동일한 데이터 처리 방식
  const processApiResponse = (data, type) => {
    if (!data || !Array.isArray(data)) return [];

    if (type === "wordcloud") {
      // 메인 화면과 동일한 구조: [{skill, count}]
      return data.map(item => ({
        skill: item.skill,
        count: item.count,
        trend: "stable" // 기본값
      }));
    } else if (type === "trend") {
      // /stats/trend/{job_name} 응답 구조
      return data.map(item => ({
        skill: item.skill,
        count: item.count,
        trend: "stable"
      }));
    } else {
      // /stats/weekly/{job_name} 응답 구조
      return data.map(item => ({
        skill: item.skill || item.skill_name,
        count: item.count || item.frequency,
        trend: "stable"
      }));
    }
  };

  // 메인 화면과 동일한 워드클라우드 옵션
  const wordCloudOptions = {
    rotations: 0,
    fontSizes: [14, 50],
    fontFamily: "Pretendard, sans-serif",
    enableTooltip: false,
    deterministic: true,
    colors: ["#264653", "#2a9d8f", "#e76f51", "#f4a261", "#e9c46a"],
  };

  // 메인 화면과 동일한 워드클라우드 데이터 변환
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
      default: return <FaMinus style={{ color: "#6c757d" }} />;
    }
  };

  // 인사이트 계산
  const insights = {
    totalSkills: skillData.length,
    topSkill: chartData[0]?.skill || "N/A",
    topCount: chartData[0]?.count || 0,
    risingSkills: chartData.filter(item => item.trend === "up").length,
    decliningSkills: chartData.filter(item => item.trend === "down").length,
    stableSkills: chartData.filter(item => item.trend === "stable").length
  };

  // 갭 분석 카드 UI
  return (
    <Container $darkMode={darkMode}>
      {/* ───────────── 직무 트렌드 분석 (개선된 구조) ───────────── */}
      <SectionCard>
        {/* 헤더 섹션 */}
        <HeaderSection $darkMode={darkMode}>
          <HeaderLeft>
            <Title>직무 트렌드 분석</Title>
            <Subtitle>실시간 채용 시장 동향을 파악하고 트렌드를 분석해보세요</Subtitle>
          </HeaderLeft>
          <HeaderRight>
            <InsightsButton onClick={() => setShowInsightsPopup(true)} $darkMode={darkMode}>
              <FaLightbulb />
              인사이트 보기
            </InsightsButton>
          </HeaderRight>
        </HeaderSection>

        {/* 컴팩트한 컨트롤 패널 */}
        <CompactControlPanel $darkMode={darkMode}>
          <ControlGroup>
            <ControlLabel>
              <FaBriefcase />
              직무
            </ControlLabel>
            <Select 
              value={selectedTrendJob} 
              onChange={e => setSelectedTrendJob(e.target.value)}
              $darkMode={darkMode}
            >
              {jobNames.map(job => (
                <option key={job} value={job}>{job}</option>
              ))}
            </Select>
          </ControlGroup>

          <ControlGroup>
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
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
            </Select>
          </ControlGroup>

          <ControlGroup>
            <ControlLabel>
              <FaInfoCircle />
              시각화
            </ControlLabel>
            <VisualizationToggle>
              <ToggleButton 
                $active={visualizationType === "wordcloud"}
                onClick={() => setVisualizationType("wordcloud")}
                $darkMode={darkMode}
              >
                <FaCloud />
              </ToggleButton>
              <ToggleButton 
                $active={visualizationType === "barchart"}
                onClick={() => setVisualizationType("barchart")}
                $darkMode={darkMode}
              >
                <FaChartBar />
              </ToggleButton>
              <ToggleButton 
                $active={visualizationType === "trend"}
                onClick={() => setVisualizationType("trend")}
                $darkMode={darkMode}
              >
                <FaChartLine />
              </ToggleButton>
            </VisualizationToggle>
          </ControlGroup>
        </CompactControlPanel>

        {/* 메인 시각화 영역 */}
        <MainVisualizationArea $darkMode={darkMode}>
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
          ) : (
            <>
              {visualizationType === "wordcloud" && (
                <WordCloudContainer $darkMode={darkMode}>
                  <ChartTitle>스킬 빈도 워드클라우드</ChartTitle>
                  <WordCloudWrapper>
                    {wordCloudData.length > 0 ? (
                      <WordCloud 
                        words={wordCloudData} 
                        options={wordCloudOptions}
                        size={[600, 400]}
                      />
                    ) : (
                      <NoDataText $darkMode={darkMode}>데이터가 없습니다</NoDataText>
                    )}
                  </WordCloudWrapper>
                </WordCloudContainer>
              )}

              {visualizationType === "barchart" && (
                <BarChartContainer>
                  <ChartTitle>상위 스킬 빈도 순위</ChartTitle>
                  <CompactBarChart>
                    {chartData.map((item, index) => (
                      <BarItem key={index}>
                        <BarRank>#{index + 1}</BarRank>
                        <BarLabel>{item.skill}</BarLabel>
                        <BarWrapper>
                          <Bar 
                            $width={(item.count / Math.max(...chartData.map(d => d.count))) * 100}
                            $darkMode={darkMode}
                          />
                          <BarValue>{item.count}</BarValue>
                          <TrendIcon>{getTrendIcon(item.trend)}</TrendIcon>
                        </BarWrapper>
                      </BarItem>
                    ))}
                  </CompactBarChart>
                </BarChartContainer>
              )}

              {visualizationType === "trend" && (
                <TrendChartContainer>
                  <ChartTitle>스킬 트렌드 분석</ChartTitle>
                  <CompactTrendGrid>
                    {chartData.map((item, index) => (
                      <TrendCard key={index} $darkMode={darkMode}>
                        <TrendCardHeader>
                          <TrendCardTitle>{item.skill}</TrendCardTitle>
                          <TrendCardRank>#{index + 1}</TrendCardRank>
                        </TrendCardHeader>
                        <TrendCardBody>
                          <TrendCardCount>{item.count}</TrendCardCount>
                          <TrendCardTrend $trend={item.trend}>
                            {getTrendIcon(item.trend)}
                          </TrendCardTrend>
                        </TrendCardBody>
                      </TrendCard>
                    ))}
                  </CompactTrendGrid>
                </TrendChartContainer>
              )}
            </>
          )}
        </MainVisualizationArea>

        {/* 빠른 통계 요약 */}
        <QuickStats $darkMode={darkMode}>
          <StatItem>
            <StatIcon>📊</StatIcon>
            <StatValue>{insights.totalSkills}</StatValue>
            <StatLabel>분석 스킬</StatLabel>
          </StatItem>
          <StatItem>
            <StatIcon>🏆</StatIcon>
            <StatValue>{insights.topSkill}</StatValue>
            <StatLabel>최고 인기</StatLabel>
          </StatItem>
          <StatItem>
            <StatIcon>📈</StatIcon>
            <StatValue>{insights.risingSkills}</StatValue>
            <StatLabel>상승 중</StatLabel>
          </StatItem>
          <StatItem>
            <StatIcon>📉</StatIcon>
            <StatValue>{insights.decliningSkills}</StatValue>
            <StatLabel>하락 중</StatLabel>
          </StatItem>
        </QuickStats>
      </SectionCard>

      {/* 인사이트 팝업 */}
      {showInsightsPopup && (
        <InsightsPopup $darkMode={darkMode}>
          <InsightsPopupContent $darkMode={darkMode}>
            <InsightsPopupHeader>
              <InsightsPopupTitle>
                <FaLightbulb />
                상세 분석 인사이트
              </InsightsPopupTitle>
              <CloseButton onClick={() => setShowInsightsPopup(false)} $darkMode={darkMode}>
                <FaTimes />
              </CloseButton>
            </InsightsPopupHeader>

            <InsightsPopupBody>
              {/* 핵심 통계 */}
              <StatsGrid>
                <StatCard $darkMode={darkMode}>
                  <StatIcon>📊</StatIcon>
                  <StatValue>{insights.totalSkills}</StatValue>
                  <StatLabel>분석된 스킬</StatLabel>
                </StatCard>
                <StatCard $darkMode={darkMode}>
                  <StatIcon>🏆</StatIcon>
                  <StatValue>{insights.topSkill}</StatValue>
                  <StatLabel>최고 인기 스킬</StatLabel>
                </StatCard>
                <StatCard $darkMode={darkMode}>
                  <StatIcon>📈</StatIcon>
                  <StatValue>{insights.risingSkills}</StatValue>
                  <StatLabel>상승 중인 스킬</StatLabel>
                </StatCard>
                <StatCard $darkMode={darkMode}>
                  <StatIcon>📉</StatIcon>
                  <StatValue>{insights.decliningSkills}</StatValue>
                  <StatLabel>하락 중인 스킬</StatLabel>
                </StatCard>
              </StatsGrid>

              {/* 상세 분석 */}
              <AnalysisSection>
                <AnalysisTitle>🔍 상세 분석</AnalysisTitle>
                <AnalysisList>
                  <AnalysisItem>
                    <AnalysisIcon>💡</AnalysisIcon>
                    <AnalysisText>
                      <strong>{selectedTrendJob}</strong> 직무에서 <strong>{fieldOptions.find(f => f.value === selectedField)?.label}</strong> 분야를 분석한 결과입니다.
                    </AnalysisText>
                  </AnalysisItem>
                  <AnalysisItem>
                    <AnalysisIcon>🎯</AnalysisIcon>
                    <AnalysisText>
                      가장 많이 요구되는 스킬은 <strong>{insights.topSkill}</strong>로, 총 <strong>{insights.topCount}회</strong> 언급되었습니다.
                    </AnalysisText>
                  </AnalysisItem>
                  <AnalysisItem>
                    <AnalysisIcon>📈</AnalysisIcon>
                    <AnalysisText>
                      <strong>{insights.risingSkills}개</strong>의 스킬이 상승 추세를 보이고 있어 주목할 필요가 있습니다.
                    </AnalysisText>
                  </AnalysisItem>
                  <AnalysisItem>
                    <AnalysisIcon>💼</AnalysisIcon>
                    <AnalysisText>
                      이 데이터를 바탕으로 커리어 계획을 수립하고 학습 우선순위를 결정하세요.
                    </AnalysisText>
                  </AnalysisItem>
                </AnalysisList>
              </AnalysisSection>

              {/* 추천 액션 */}
              <RecommendationSection>
                <RecommendationTitle>🚀 추천 액션</RecommendationTitle>
                <RecommendationList>
                  <RecommendationItem>
                    <RecommendationIcon>⭐</RecommendationIcon>
                    <RecommendationText>상위 3개 스킬에 집중하여 학습하세요</RecommendationText>
                  </RecommendationItem>
                  <RecommendationItem>
                    <RecommendationIcon>📚</RecommendationIcon>
                    <RecommendationText>상승 중인 스킬들을 우선적으로 익히세요</RecommendationText>
                  </RecommendationItem>
                  <RecommendationItem>
                    <RecommendationIcon>🎯</RecommendationIcon>
                    <RecommendationText>실무 프로젝트에 해당 스킬들을 적용해보세요</RecommendationText>
                  </RecommendationItem>
                </RecommendationList>
              </RecommendationSection>
            </InsightsPopupBody>
          </InsightsPopupContent>
        </InsightsPopup>
      )}

      <ScrollArrow>
        <IoIosArrowUp />
        <IoIosArrowUp />
        <IoIosArrowUp />
      </ScrollArrow>

      {/* ───────────── 갭 분석 ───────────── */}
      <SectionCard id="gap-analysis-section">
        <GapHeader>
          <div>
            <Title>갭 분석</Title>
            <ShortDesc>선택한 직무와 나의 역량 간의 격차를 분석해드립니다.</ShortDesc>
          </div>
          <InsightsButton>인사이트 보기</InsightsButton>
        </GapHeader>
        <Divider />
        <GapControlRow>
          <label htmlFor="gap-job-dropdown" style={{ fontWeight: 600, marginRight: 8 }}>직무 선택</label>
          <select
            id="gap-job-dropdown"
            value={selectedGapJob}
            onChange={e => setSelectedGapJob(e.target.value)}
            style={{ padding: "6px 12px", borderRadius: 5, fontSize: 14 }}
          >
            {jobNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </GapControlRow>
        <GapResultArea>
          {gapLoading ? (
            <Text>분석 중...</Text>
          ) : (
            <StyledGapResult>
              {gapResult
                ? gapResult.split("\n").map((line, idx) =>
                    line.trim().startsWith("**") ? (
                      <GapHeadline key={idx}>{line.replace(/\*\*/g, "")}</GapHeadline>
                    ) : (
                      <span key={idx}>
                        {line}
                        <br />
                      </span>
                    )
                  )
                : <span>분석 결과가 없습니다.</span>
              }
            </StyledGapResult>
          )}
        </GapResultArea>
        {topSkills.length > 0 && (
          <GapSkillList>
            <b>Top 5 부족 역량</b>
            <ul>
              {topSkills.map((skill, idx) => (
                <li key={idx}>{skill}</li>
              ))}
            </ul>
          </GapSkillList>
        )}
      </SectionCard>

      <ScrollArrow>
        <IoIosArrowUp />
        <IoIosArrowUp />
        <IoIosArrowUp />
      </ScrollArrow>

      {/* ───────────── 극복 방안 ───────────── */}
      <SectionCard onClick={() => setSelectedPage("career-plan")}>
        <RightOnly>
          <Title>극복 방안</Title>
          <Text>
            부트캠프 수강, 사이드 프로젝트 수행, Kaggle 대회 참가 등을 통해 실무 경험과
            포트폴리오를 동시에 확보하는 전략이 효과적입니다. 또한 최신 논문‧블로그 정리를 통해
            이론적 깊이도 함께 쌓으세요.
          </Text>
        </RightOnly>
      </SectionCard>

      {/* SectionCard 하단에 극복 방안 미니맵 카드 추가 */}
      <SectionCard>
        <MiniMapTitle>극복 방안 미니맵</MiniMapTitle>
        <MiniMapGrid>
          <MiniMapItem tabIndex={0}>
            <MiniMapIcon>🎓</MiniMapIcon>
            <MiniMapLabel>부트캠프</MiniMapLabel>
          </MiniMapItem>
          <MiniMapItem tabIndex={0}>
            <MiniMapIcon>📜</MiniMapIcon>
            <MiniMapLabel>자격증</MiniMapLabel>
          </MiniMapItem>
          <MiniMapItem tabIndex={0}>
            <MiniMapIcon>💻</MiniMapIcon>
            <MiniMapLabel>강의</MiniMapLabel>
          </MiniMapItem>
        </MiniMapGrid>
      </SectionCard>
    </Container>
  );
}

/* ───────────── styled-components ───────────── */
const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 0 3rem;
  background: ${({ $darkMode }) => ($darkMode ? "#121212" : "#fff")};
  color: ${({ $darkMode }) => ($darkMode ? "#eee" : "#333")};
`;

const SectionCard = styled.div`
  display: flex;
  flex-direction: column;
  background: #f9f9f9;
  border-radius: 1rem;
  padding: 1.6rem 2.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  min-height: 53vh;
  transition: box-shadow 0.2s;
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const LeftSide = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const TopTextBlock = styled.div`
  margin-bottom: 1rem;
`;

const RightOnly = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
`;

const Title = styled.h3`
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 0.8rem;
  color: #ffa500;
`;

const Text = styled.p`
  font-size: 1.05rem;
  line-height: 1.6;
`;

// 새로운 스타일 컴포넌트들
const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid ${({ $darkMode }) => ($darkMode ? "#333" : "#e9ecef")};
`;

const HeaderLeft = styled.div``;

const HeaderRight = styled.div`
  display: flex;
  gap: 0.8rem;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#666")};
  margin-top: 0.5rem;
`;


const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  background: ${({ $darkMode }) => ($darkMode ? "#2a2a2a" : "#fff")};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#ddd")};
  color: #ffa500;
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 165, 0, 0.1);
  }
`;

// 컴팩트한 컨트롤 패널
const CompactControlPanel = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: ${({ $darkMode }) => ($darkMode ? "#2a2a2a" : "#f8f9fa")};
  border-radius: 0.8rem;
  border: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#e9ecef")};
  flex-wrap: wrap;
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 120px;
  flex: 1;
`;

const ControlLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#555")};
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#ddd")};
  border-radius: 0.4rem;
  background: ${({ $darkMode }) => ($darkMode ? "#1e1e1e" : "#fff")};
  color: ${({ $darkMode }) => ($darkMode ? "#eee" : "#333")};
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #ffa500;
    box-shadow: 0 0 0 2px rgba(255, 165, 0, 0.2);
  }
`;

const VisualizationToggle = styled.div`
  display: flex;
  gap: 0.3rem;
`;

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border: 1px solid ${({ $active, $darkMode }) => ($active ? "#ffa500" : ($darkMode ? "#444" : "#ddd"))};
  border-radius: 0.4rem;
  background: ${({ $active, $darkMode }) => ($active ? "#ffa500" : ($darkMode ? "#1e1e1e" : "#fff"))};
  color: ${({ $active, $darkMode }) => ($active ? "#fff" : ($darkMode ? "#eee" : "#333"))};
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;

  &:hover {
    background: ${({ $active }) => ($active ? "#ffa500" : "rgba(255, 165, 0, 0.1)")};
    transform: translateY(-1px);
  }
`;

// 메인 시각화 영역 (더 컴팩트)
const MainVisualizationArea = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? "#1e1e1e" : "#fff")};
  border-radius: 0.8rem;
  padding: 1.5rem;
  border: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#e9ecef")};
  min-height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
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
  font-size: 1rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 2rem;
`;

const ErrorMessage = styled.p`
  color: #dc3545;
  font-weight: 600;
`;

const ErrorNote = styled.p`
  color: #856404;
  font-size: 0.9rem;
`;

const WordCloudContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: ${props => props.$darkMode ? '#2a2a2a' : '#ffffff'};
  border-radius: 8px;
  border: 1px solid ${props => props.$darkMode ? '#404040' : '#e0e0e0'};
`;

const ChartTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffa500;
  margin-bottom: 1rem;
  text-align: center;
`;

const WordCloudWrapper = styled.div`
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const BarChartContainer = styled.div`
  width: 100%;
`;

const CompactBarChart = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const BarItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const BarRank = styled.div`
  min-width: 25px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #ffa500;
`;

const BarLabel = styled.div`
  min-width: 80px;
  font-size: 0.85rem;
  font-weight: 600;
`;

const BarWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const Bar = styled.div`
  height: 20px;
  background: linear-gradient(90deg, #ffa500, #ff8c00);
  border-radius: 10px;
  width: ${({ $width }) => $width}%;
  transition: width 0.3s ease;
  box-shadow: 0 2px 4px rgba(255, 165, 0, 0.2);
`;

const BarValue = styled.div`
  min-width: 35px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #ffa500;
`;

const TrendIcon = styled.div`
  font-size: 0.75rem;
`;

const TrendChartContainer = styled.div`
  width: 100%;
`;

const CompactTrendGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.8rem;
`;

const TrendCard = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? "#2a2a2a" : "#f8f9fa")};
  border-radius: 0.4rem;
  padding: 0.8rem;
  border: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#e9ecef")};
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const TrendCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
`;

const TrendCardTitle = styled.div`
  font-weight: 600;
  font-size: 0.8rem;
`;

const TrendCardRank = styled.div`
  font-size: 0.7rem;
  color: #ffa500;
  font-weight: 700;
`;

const TrendCardBody = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TrendCardCount = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #ffa500;
`;

const TrendCardTrend = styled.div`
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.7rem;
  color: ${({ $trend }) => 
    $trend === "up" ? "#28a745" : 
    $trend === "down" ? "#dc3545" : "#6c757d"
  };
`;

// 빠른 통계 요약
const QuickStats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  padding: 1rem;
  background: ${({ $darkMode }) => ($darkMode ? "#2a2a2a" : "#f8f9fa")};
  border-radius: 0.5rem;
  border: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#e9ecef")};
`;

const StatItem = styled.div`
  text-align: center;
  padding: 0.5rem;
`;

const StatIcon = styled.div`
  font-size: 1.2rem;
  margin-bottom: 0.3rem;
`;

const StatValue = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #ffa500;
  margin-bottom: 0.2rem;
`;

const StatLabel = styled.div`
  font-size: 0.7rem;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#666")};
`;

// 인사이트 팝업
const InsightsPopup = styled.div`
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
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const InsightsPopupContent = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? "#1e1e1e" : "#fff")};
  border-radius: 1rem;
  padding: 2rem;
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from { 
      opacity: 0; 
      transform: translateY(50px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
`;

const InsightsPopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#e9ecef")};
`;

const InsightsPopupTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffa500;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#666")};
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.5rem;
  border-radius: 0.3rem;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 165, 0, 0.1);
    color: #ffa500;
  }
`;

const InsightsPopupBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const StatCard = styled.div`
  background: ${({ $darkMode }) => ($darkMode ? "#2a2a2a" : "#f8f9fa")};
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: center;
  border: 1px solid ${({ $darkMode }) => ($darkMode ? "#444" : "#e9ecef")};
`;

const AnalysisSection = styled.div``;

const AnalysisTitle = styled.h5`
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffa500;
  margin-bottom: 1rem;
`;

const AnalysisList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const AnalysisItem = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
`;

const AnalysisIcon = styled.div`
  font-size: 1rem;
  margin-top: 0.1rem;
`;

const AnalysisText = styled.div`
  font-size: 0.95rem;
  line-height: 1.4;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#666")};
`;

const RecommendationSection = styled.div``;

const RecommendationTitle = styled.h5`
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffa500;
  margin-bottom: 1rem;
`;

const RecommendationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const RecommendationItem = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
`;

const RecommendationIcon = styled.div`
  font-size: 1rem;
  margin-top: 0.1rem;
`;

const RecommendationText = styled.div`
  font-size: 0.95rem;
  line-height: 1.4;
  color: ${({ $darkMode }) => ($darkMode ? "#ccc" : "#666")};
`;

const bounce = keyframes`
  0%,100% { transform: translateY(0);  opacity:.65; }
  50%     { transform: translateY(10px); opacity:1; }
`;

const ScrollArrow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -3.2rem;
  z-index: 5;

  svg {
    width: 54px;
    height: 54px;
    color: #ffa500;
    transform: rotate(180deg);
    filter: drop-shadow(0 1px 2px rgba(0,0,0,.18));
    margin-top: -28px;
  }
  animation: ${bounce} 1.6s infinite;
`;

const NoDataText = styled.div`
  color: ${({ $darkMode }) => $darkMode ? '#888' : '#999'};
  font-size: 0.9rem;
  text-align: center;
`;

// 갭 분석 카드 UI
const GapHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const ShortDesc = styled.div`
  font-size: 1rem;
  color: #888;
  margin-bottom: 0.5rem;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1.5px solid #eee;
  margin: 1rem 0 1.2rem 0;
`;

const GapControlRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.2rem;
`;

const GapResultArea = styled.div`
  min-height: 120px;
`;

const InsightsButton = styled.button`
  background: #fff7ed;
  color: #ffa500;
  border: 1px solid #ffa500;
  border-radius: 0.5rem;
  padding: 0.5rem 1.1rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s;
  &:hover {
    background: #ffa500;
    color: #fff;
  }
`;

const StyledGapResult = styled.div`
  background: #fffdfa;
  border-radius: 1rem;
  padding: 1.3rem 1.5rem;
  font-size: 1.08rem;
  color: #333;
  line-height: 1.8;
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.08);
  min-height: 120px;
  max-height: 320px;
  overflow-y: auto;
  margin-top: 0.5rem;
  word-break: keep-all;
`;

const GapHeadline = styled.div`
  font-weight: 700;
  color: #ffa500;
  margin: 1.1em 0 0.5em 0;
  font-size: 1.13em;
`;

const GapSkillList = styled.div`
  margin-top: 1.2rem;
  font-size: 1.05rem;
  ul {
    margin: 0.5rem 0 0 1.2rem;
    padding: 0;
    color: #444;
  }
  li {
    margin-bottom: 0.2em;
    font-weight: 500;
    letter-spacing: 0.01em;
  }
`;

// 스타일 추가
const MiniMapTitle = styled.h4`
  font-size: 1.15rem;
  font-weight: 700;
  color: #ffa500;
  margin-bottom: 1.2rem;
`;
const MiniMapGrid = styled.div`
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  align-items: center;
`;
const MiniMapItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fffdfa;
  border-radius: 1.1rem;
  padding: 1.2rem 2.2rem;
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.08);
  cursor: pointer;
  transition: box-shadow 0.18s, transform 0.18s, background 0.18s;
  border: 2px solid transparent;
  &:hover, &:focus {
    box-shadow: 0 4px 16px rgba(255, 193, 7, 0.13);
    background: #fffbe7;
    border: 2px solid #ffc107;
    transform: translateY(-2px) scale(1.04);
  }
`;
const MiniMapIcon = styled.div`
  font-size: 2.2rem;
  margin-bottom: 0.7rem;
`;
const MiniMapLabel = styled.div`
  font-size: 1.05rem;
  font-weight: 600;
  color: #333;
`;