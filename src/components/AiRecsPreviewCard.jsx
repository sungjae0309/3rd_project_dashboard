// src/components/AiRecsPreviewCard.jsx (최종 완성본)

import React, { useState, useEffect, useRef } from 'react';
import styled, { css, keyframes } from 'styled-components'; // css, keyframes 추가
import { FaBullseye, FaChevronLeft, FaChevronRight, FaBriefcase, FaRobot } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useRecommendations } from './RecommendationContext';

// 환경변수 안전하게 접근
const BASE_URL = typeof process !== 'undefined' && process.env.REACT_APP_API_BASE_URL 
  ? process.env.REACT_APP_API_BASE_URL 
  : "http://192.168.101.7:8000";

// 애니메이션 정의
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// 로딩 관련 컴포넌트들
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;
`;
const LoadingSpinner = styled.div`
  display: flex;
  gap: 0.3rem;
`;
const LoadingDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $darkMode }) => ($darkMode ? '#ffc400' : '#ffc400')};
  animation: ${pulse} 1.4s ease-in-out infinite both;
  animation-delay: ${({ $delay }) => $delay};
`;
const LoadingText = styled.div`
  font-size: 0.9rem;
  color: ${({ $darkMode }) => ($darkMode ? '#ccc' : '#666')};
  text-align: center;
`;

// 회사명 표시 컴포넌트
const CompanyNameTag = styled.span`
  background: ${({ $darkMode }) => ($darkMode ? '#444' : '#f0f0f0')};
  color: ${({ $darkMode }) => ($darkMode ? '#ccc' : '#555')};
  padding: 0.2rem 0.4rem;
  border-radius: 0.3rem;
  font-size: 0.7rem;
  margin-right: 0.3rem;
  white-space: nowrap;
`;
const CompanyNameContainer = styled.div`
  flex: 3;
  text-align: left;
  white-space: nowrap;
  overflow: visible;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: ${({ $darkMode }) => ($darkMode ? '#bbb' : '#555')};
  padding-left: 1.8rem;
`;
function CompanyNameDisplay({ company, darkMode, maxVisible = 2 }) {
    if (!company) return <div style={{ flex: 3 }}>-</div>;
    const companies = company.split(',').map(c => c.trim()).filter(Boolean);
    const visibleCompanies = companies.slice(0, maxVisible);
    const hiddenCompaniesCount = companies.length - maxVisible;
    const fullListTooltip = companies.join(', ');
    return (
        <CompanyNameContainer $darkMode={darkMode} title={hiddenCompaniesCount > 0 ? fullListTooltip : ''}>
            {visibleCompanies.map((company, index) => <CompanyNameTag key={index} $darkMode={darkMode}>{company}</CompanyNameTag>)}
            {hiddenCompaniesCount > 0 && (
                <CompanyNameTag $darkMode={darkMode}>+{hiddenCompaniesCount}</CompanyNameTag>
            )}
        </CompanyNameContainer>
    );
}

// --- 메인 컴포넌트 ---
export default function AiRecsPreviewCard({ darkMode, onJobDetail, onShowReason }) {
  // RecommendationContext 사용
  const { 
      recommendations: contextRecommendations, 
      isLoading: contextLoading,
      fetchFirstPageRecommendations,
      isFirstPage 
  } = useRecommendations();
  
  // 기존 상태들 (적합도순 공고용으로만 사용)
  const [similarityRecommendations, setSimilarityRecommendations] = useState([]);
  const [similarityLoading, setSimilarityLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('ai'); // 'ai' 또는 'similarity' 또는 'job_recommendation'
  const [isAiRecommendation, setIsAiRecommendation] = useState(true);
  
  // 캐시된 데이터 상태들 (적합도순 공고용)
  const [similarityDataCache, setSimilarityDataCache] = useState({}); // 페이지별 캐시
  
  // AI 추천 공고 ID 목록 (적합도순에서 AI 태그 표시용)
  const [aiRecommendedIds, setAiRecommendedIds] = useState(new Set());

  // 직무 추천 관련 상태 추가
  const [jobRecommendations, setJobRecommendations] = useState([]);
  const [jobRecommendationLoading, setJobRecommendationLoading] = useState(false);

  // 추천 이유 팝업 관련 상태 추가
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [selectedJobReason, setSelectedJobReason] = useState('');
  const [reasonModalLoading, setReasonModalLoading] = useState(false);

  // 중복 호출 방지를 위한 ref들
  const isFetchingSimilarityRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const lastFetchPageRef = useRef(1);

      const token = localStorage.getItem("accessToken");

  // AI 추천 공고는 Context에서 가져오기
  useEffect(() => {
      if (category === 'ai') {
          if (!contextRecommendations.length && !contextLoading) {
              console.log(' [AiRecsPreviewCard] AI 추천 공고 로딩 시작');
              fetchFirstPageRecommendations();
          } else if (contextRecommendations.length > 0) {
              console.log('✅ [AiRecsPreviewCard] AI 추천 공고 데이터 있음:', contextRecommendations.length);
          }
      }
  }, [category, contextRecommendations.length, contextLoading]);

  // AI 추천 공고 ID 목록 업데이트
  useEffect(() => {
      if (contextRecommendations.length > 0) {
          const aiIds = new Set(contextRecommendations.map(job => job.id));
          setAiRecommendedIds(aiIds);
      }
  }, [contextRecommendations]);

  // 적합도순 공고 가져오기 (페이지네이션 지원) - 완전 수정
  const fetchSimilarityRecommendations = async (page = 1, forceFetch = false) => {
    if (!token) return;
    
    // 중복 호출 방지
    if (isFetchingSimilarityRef.current) {
        console.log(' [AiRecsPreviewCard] 적합도순 API 호출 중 - 중복 방지');
        return;
    }
    
    // 캐시가 있고 강제 새로고침이 아닌 경우 캐시 사용
    if (!forceFetch && similarityDataCache[page]) {
        console.log(` [AiRecsPreviewCard] 캐시된 데이터 사용 - 페이지 ${page}`);
        setSimilarityRecommendations(similarityDataCache[page]);
        setCurrentPage(page);
        setIsAiRecommendation(false);
        return;
    }

    console.log(` [AiRecsPreviewCard] 적합도순 공고 요청 - 페이지: ${page}, 크기: 5`);
    isFetchingSimilarityRef.current = true;
    setSimilarityLoading(true);
    
    try {
        const response = await axios.get(`${BASE_URL}/recommend/jobs/paginated`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { 
                page: page, // API 문서에 따르면 1부터 시작 (page + 1 제거)
                jobs_per_page: 5
            }
        });
        
        console.log(' [AiRecsPreviewCard] 적합도순 API 응답:', response.data);
        
        let data = [];
        let totalPages = 1;
        let totalCount = 0;
        
        if (response.data.jobs && response.data.pagination) {
            data = response.data.jobs;
            totalPages = response.data.pagination.total_pages || 1;
            totalCount = response.data.pagination.total_jobs || data.length;
        } else if (response.data.recommended_jobs) {
            data = response.data.recommended_jobs;
            totalPages = response.data.total_pages || 1;
            totalCount = response.data.total || data.length;
        } else if (Array.isArray(response.data)) {
            data = response.data;
            totalPages = 1;
            totalCount = data.length;
        } else {
            console.error('❌ [AiRecsPreviewCard] 예상하지 못한 API 응답 구조:', response.data);
            data = [];
            totalPages = 1;
            totalCount = 0;
        }
        
        console.log(`✅ [AiRecsPreviewCard] 받은 데이터: ${data.length}개, 총 페이지: ${totalPages}, 총 개수: ${totalCount}`);
        
        // 백엔드에서 이미 company_name을 포함해서 보내주므로 바로 사용
        const processedData = data.map((job) => {
            return {
                ...job,
                company: job.company_name || '회사명 없음',
                isAiRecommended: aiRecommendedIds.has(job.id)
            };
        });
        
        // 상태 업데이트 순서 중요
        setSimilarityRecommendations(processedData);
        setSimilarityDataCache(prev => ({ ...prev, [page]: processedData }));
        setCurrentPage(page);
        setTotalPages(totalPages);
        setIsAiRecommendation(false);
        
        console.log(`✅ [AiRecsPreviewCard] 적합도순 공고 로딩 완료 - 현재 페이지: ${page}, 총 페이지: ${totalPages}`);
    } catch (error) {
        console.error('❌ [AiRecsPreviewCard] 적합도순 공고 로딩 실패:', error);
        setSimilarityRecommendations([]);
        setTotalPages(1);
        setIsAiRecommendation(false);
    } finally {
        setSimilarityLoading(false);
        isFetchingSimilarityRef.current = false;
    }
};

// 직무 추천 데이터 가져오기
const fetchJobRecommendations = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    
    console.log(' [AiRecsPreviewCard] 직무 추천 데이터 요청');
    setJobRecommendationLoading(true);
    
    try {
        // 1. 직무 추천 상위 5개 가져오기
        const top5Response = await axios.get(`${BASE_URL}/recommend/job/top5`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(' [AiRecsPreviewCard] 직무 추천 top5 응답:', top5Response.data);
        
        // API 응답에서 top_jobs 배열 추출
        const topJobs = top5Response.data.top_jobs || [];
        
        // 직무 추천 데이터를 처리 (추천 이유는 별도로 가져옴)
        const jobsData = topJobs.map((job) => ({
            id: job.job_id,
            job_name: job.job_name,
            score: job.score
        }));
        
        // 모든 점수가 0점인지 확인
        const allZeroScores = jobsData.every(job => job.score === 0);
        if (allZeroScores && jobsData.length > 0) {
            console.warn('⚠️ [AiRecsPreviewCard] 모든 직무 추천 점수가 0점입니다. 백엔드 추천 알고리즘을 확인해주세요.');
        }
        
        setJobRecommendations(jobsData);
        console.log('✅ [AiRecsPreviewCard] 직무 추천 데이터 로딩 완료:', jobsData);
        
    } catch (error) {
        console.error('❌ [AiRecsPreviewCard] 직무 추천 데이터 로딩 실패:', error);
        setJobRecommendations([]);
    } finally {
        setJobRecommendationLoading(false);
    }
};

// 추천 이유 가져오기 함수
const fetchJobReason = async (jobName) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    
    setReasonModalLoading(true);
    setSelectedJobReason('');
    setIsReasonModalOpen(true);
    
    try {
        const reasonResponse = await axios.post(`${BASE_URL}/recommend/job/explanation`, 
            [jobName], // 직무명을 배열로 전송
            {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log(` [AiRecsPreviewCard] ${jobName} 추천 이유:`, reasonResponse.data);
        
        // API 응답에서 추천 이유 텍스트 추출
        let reasonText = '추천 이유를 불러오지 못했습니다.';
        if (reasonResponse.data) {
            if (typeof reasonResponse.data === 'string') {
                reasonText = reasonResponse.data;
            } else if (reasonResponse.data.explanations) {
                reasonText = reasonResponse.data.explanations;
            } else if (reasonResponse.data.explanation) {
                reasonText = reasonResponse.data.explanation;
            } else if (reasonResponse.data.message) {
                reasonText = reasonResponse.data.message;
            } else if (reasonResponse.data.reason) {
                reasonText = reasonResponse.data.reason;
            } else {
                // 객체를 JSON 문자열로 변환하여 표시
                reasonText = JSON.stringify(reasonResponse.data, null, 2);
            }
        }
        
        setSelectedJobReason(reasonText);
        
    } catch (error) {
        console.error(` [AiRecsPreviewCard] ${jobName} 추천 이유 가져오기 실패:`, error);
        setSelectedJobReason('추천 이유를 불러오지 못했습니다.');
    } finally {
        setReasonModalLoading(false);
    }
};

// 카테고리 변경 핸들러 - 수정
const handleCategoryChange = (newCategory) => {
    if (category === newCategory) {
        console.log(` [AiRecsPreviewCard] 같은 카테고리 클릭 - 무시: ${newCategory}`);
        return;
    }
    
    console.log(` [AiRecsPreviewCard] 카테고리 변경: ${category} → ${newCategory}`);
    setCategory(newCategory);
    
    if (newCategory === 'ai') {
        // AI 추천으로 변경 - Context에서 처리됨
        if (!contextRecommendations.length && !contextLoading) {
            fetchFirstPageRecommendations();
        }
    } else if (newCategory === 'similarity') {
        // 적합도순으로 변경 - 항상 1페이지부터 시작
        console.log(' [AiRecsPreviewCard] 적합도순으로 변경 - 1페이지부터 시작');
        setCurrentPage(1);
        // 캐시가 있으면 사용, 없으면 API 호출
        if (similarityDataCache[1]) {
            console.log(' [AiRecsPreviewCard] 적합도순 1페이지 캐시 사용');
            setSimilarityRecommendations(similarityDataCache[1]);
            setIsAiRecommendation(false);
        } else {
            fetchSimilarityRecommendations(1, false);
        }
    } else if (newCategory === 'job_recommendation') {
        // 직무 추천으로 변경 - 빈 데이터로 설정
        console.log(' [AiRecsPreviewCard] 직무 추천으로 변경');
        setSimilarityRecommendations([]);
        setIsAiRecommendation(false);
        fetchJobRecommendations(); // 직무 추천 데이터 로딩
    }
};

// 페이지 변경 핸들러 - 수정
const handlePageChange = (newPage) => {
    if (category === 'ai' || category === 'job_recommendation') return; // AI 추천과 직무 추천은 페이징 없음
    
    console.log(` [AiRecsPreviewCard] 페이지 변경 요청: ${currentPage} → ${newPage}, 총 페이지: ${totalPages}`);
    
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
        console.log(` [AiRecsPreviewCard] 페이지 변경 실행: ${newPage}`);
        fetchSimilarityRecommendations(newPage, false);
    } else {
        console.warn(`⚠️ [AiRecsPreviewCard] 페이지 범위 초과 또는 같은 페이지: ${newPage} (1-${totalPages})`);
    }
};

// 초기 로딩 (한 번만) - 수정
useEffect(() => {
    if (hasInitializedRef.current) {
        console.log(' [AiRecsPreviewCard] 이미 초기화됨 - 중복 실행 방지');
        return;
    }
    
    console.log(' [AiRecsPreviewCard] 컴포넌트 마운트 - 초기화');
    // AI 추천 공고는 Context에서 자동으로 처리됨
    setCurrentPage(1);
    setTotalPages(1);
    setCategory('ai'); // 기본값을 AI 추천으로 설정
    hasInitializedRef.current = true;
}, []); // 빈 의존성 배열로 변경하여 컴포넌트 마운트 시 한 번만 실행

  const handleTitleClick = (jobId) => { 
      if (onJobDetail) onJobDetail(jobId); 
  };

// 현재 표시할 데이터 결정
const recommendations = category === 'ai' ? contextRecommendations : category === 'job_recommendation' ? jobRecommendations : similarityRecommendations;
const isLoading = category === 'ai' ? contextLoading : category === 'job_recommendation' ? jobRecommendationLoading : similarityLoading;

// 디버깅용 로그
console.log(' [AiRecsPreviewCard] 상태 확인:', {
    category,
    contextRecommendations: contextRecommendations.length,
    contextLoading,
    similarityRecommendations: similarityRecommendations.length,
    similarityLoading,
    recommendations: recommendations.length,
    isLoading,
    currentPage,
    totalPages,
    cacheKeys: Object.keys(similarityDataCache)
});

    // --- JSX 반환 (렌더링) ---
    return (
        <HoverCard $darkMode={darkMode}>
            <CardIconBg><FaBriefcase /></CardIconBg>
            <HeaderSection>
                <TitleSection>
                    <SectionTitle>
                        <HighlightBar />
                        <span>AI 추천</span>
                    </SectionTitle>
                </TitleSection>
                <CategoryTabs $darkMode={darkMode}>
                    <CategoryTab 무
                        $active={category === 'ai'} 
                        $darkMode={darkMode}
                        onClick={() => handleCategoryChange('ai')}
                    >
                        추천 공고
                    </CategoryTab>
                    <CategoryTab 
                        $active={category === 'similarity'} 
                        $darkMode={darkMode}
                        onClick={() => handleCategoryChange('similarity')}
                    >
                        적합도순
                    </CategoryTab>
                    <CategoryTab 
                        $active={category === 'job_recommendation'} 
                        $darkMode={darkMode}
                        onClick={() => handleCategoryChange('job_recommendation')}
                    >
                        직무 추천
                    </CategoryTab>
                </CategoryTabs>
            </HeaderSection>
            <ContentWrapper>
                <ColumnHeader>
                    {category === 'job_recommendation' ? (
                        <>
                            <ColumnTitle style={{ flex: 4, textAlign: "left", paddingLeft: "0.5rem" }}>직무명</ColumnTitle>
                            <ColumnTitle style={{ flex: 4, textAlign: "center" }}>점수</ColumnTitle>
                            <ColumnTitle style={{ flex: 4, textAlign: "center", paddingRight: "0.9rem" }}>추천 이유</ColumnTitle>
                        </>
                    ) : (
                        <>
                    <ColumnTitle style={{ flex: 4, textAlign: "left", paddingLeft: "0.5rem" }}>공고명</ColumnTitle>
                    <ColumnTitle style={{ flex: 3, textAlign: "left", paddingLeft: "3.0rem" }}>회사명</ColumnTitle>
                    <ColumnTitle style={{ flex: 2, textAlign: "center", paddingRight: "2.5rem" }}>적합도</ColumnTitle>
                    <ColumnTitle style={{ flex: 2, textAlign: "center", paddingRight: "0.9rem" }}>추천 이유</ColumnTitle>
                        </>
                    )}
                </ColumnHeader>
                <PreviewList $enableScroll={category !== 'ai'}>
                    {(() => {
                        if (isLoading) {
                            return (
                                <LoadingContainer>
                                    <LoadingSpinner $darkMode={darkMode}>
                                        <LoadingDot $delay="0s" $darkMode={darkMode} />
                                        <LoadingDot $delay="0.2s" $darkMode={darkMode} />
                                        <LoadingDot $delay="0.4s" $darkMode={darkMode} />
                                    </LoadingSpinner>
                                    <LoadingText $darkMode={darkMode}>
                                        {category === 'ai' ? 'AI가 최적의 공고를 분석 중입니다...' : 
                                         category === 'similarity' ? '적합도순 공고를 불러오는 중...' :
                                         '직무 추천을 분석 중입니다...'}
                                    </LoadingText>
                                </LoadingContainer>
                            );
                        } else if (recommendations.length > 0) {
                            return recommendations.map((job, idx) => (
                                <PreviewItem key={job.id || idx} $darkMode={darkMode}>
                                    {category === 'job_recommendation' ? (
                                        <>
                                            <JobTitlePreview
                                                $darkMode={darkMode}
                                                title={job.job_name || ''}
                                                style={{ flex: 4, paddingLeft: "0.5rem" }}
                                            >
                                                <strong>{job.job_name || '직무명 없음'}</strong>
                                            </JobTitlePreview>
                                            <div style={{ flex: 4, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <MatchPercent $match={job.score || 0}>
                                                    {job.score ? Math.round(job.score).toLocaleString() + '점' : '0점'}
                                                </MatchPercent>
                                            </div>
                                            <ReasonButtonWrapper style={{ flex: 4, textAlign: "center" }}>
                                                <ReasonButton onClick={() => fetchJobReason(job.job_name)} $darkMode={darkMode}>알아보기</ReasonButton>
                                            </ReasonButtonWrapper>
                                        </>
                                    ) : (
                                        <>
                                    <JobTitlePreview
                                        $darkMode={darkMode}
                                        title={job.title || job.job_title || ''}
                                        onClick={() => handleTitleClick(job.id)}
                                    >
                                        <strong>{job.title || job.job_title || '제목 없음'}</strong>
                                        {(category === 'ai') || (category === 'similarity' && job.isAiRecommended) ? (
                                            <SimpleAiTag>AI</SimpleAiTag>
                                        ) : null}
                                    </JobTitlePreview>
                                    <CompanyNameDisplay company={job.company || job.company_name} darkMode={darkMode} />
                                    <MatchPercent $match={(job.similarity || job.match_score || 0) * 100}>
                                        {job.similarity || job.match_score ? ((job.similarity || job.match_score) * 100).toFixed(1) + '%' : ''}
                                    </MatchPercent>
                                    <ReasonButtonWrapper>
                                        {onShowReason && (
                                            <ReasonButton onClick={() => onShowReason(job)} $darkMode={darkMode}>알아보기</ReasonButton>
                                        )}
                                    </ReasonButtonWrapper>
                                        </>
                                    )}
                                </PreviewItem>
                            ));
                        } else if (category === 'job_recommendation') {
                            return <LoadingMessage>직무 추천 데이터가 없습니다.</LoadingMessage>;
                        } else {
                            return <LoadingMessage>추천 공고를 불러오지 못했습니다.</LoadingMessage>;
                        }
                    })()}
                </PreviewList>
                {category === 'similarity' && (
                <PaginationWrapper $darkMode={darkMode}>
                    <PageButton 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        $darkMode={darkMode}
                    >
                        <FaChevronLeft />
                    </PageButton>
                    <PageInfo $darkMode={darkMode}>
                        {currentPage} / {totalPages}
                    </PageInfo>
                    <PageButton 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        $darkMode={darkMode}
                    >
                        <FaChevronRight />
                    </PageButton>
                </PaginationWrapper>
            )}
            </ContentWrapper>
            
            {/* 추천 이유 팝업 모달 */}
            {isReasonModalOpen && (
                <ReasonModal $darkMode={darkMode} onClick={() => setIsReasonModalOpen(false)}>
                    <ReasonModalContent $darkMode={darkMode} onClick={(e) => e.stopPropagation()}>
                        <ReasonModalHeader $darkMode={darkMode}>
                            <ReasonModalTitle>직무 추천 이유</ReasonModalTitle>
                            <CloseButton onClick={() => setIsReasonModalOpen(false)} $darkMode={darkMode}>×</CloseButton>
                        </ReasonModalHeader>
                        <ReasonModalBody $darkMode={darkMode}>
                            {reasonModalLoading ? (
                                <ReasonLoadingContainer>
                                    <ReasonLoadingSpinner $darkMode={darkMode} />
                                    <ReasonLoadingText $darkMode={darkMode}>추천 이유를 분석 중입니다...</ReasonLoadingText>
                                </ReasonLoadingContainer>
                            ) : (
                                <ReasonText $darkMode={darkMode}>{selectedJobReason}</ReasonText>
                            )}
                        </ReasonModalBody>
                        <ReasonModalFooter>
                            <ConfirmButton onClick={() => setIsReasonModalOpen(false)} $darkMode={darkMode}>확인</ConfirmButton>
                        </ReasonModalFooter>
                    </ReasonModalContent>
                </ReasonModal>
            )}
            
        </HoverCard>
    );
}
// --- 스타일 정의 ---
const HoverCard = styled.div`
  position: relative;
  background: ${({ $darkMode }) => $darkMode ? '#2a2a2a' : '#f0f0f0'};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#444' : '#e0e0e0')};
  border-radius: 2rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: visible;
  cursor: pointer;
  transition: background 0.2s ease;
  height: 490px; /* 높이 증가 */
  
  /* 호버 시 배경색 수정 - 커리어 로드맵과 동일한 호버 배경색 */
  &:hover {
    background: ${({ $darkMode }) => $darkMode ? '#3a3a3a' : '#f8f9fa'};
  }
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.8rem;
  width: 100%;
`;

const TitleSection = styled.div` 
  flex: 1; 
`;

const SectionTitle = styled.div`
  display: flex; 
  align-items: center; 
  gap: 0.6rem; 
  font-size: 1.7rem; 
  font-weight: 800; 
  margin-bottom: 0.5rem;
`;

const HighlightBar = styled.div`
  width: 8px; 
  height: 1.6rem; 
  background: #ffc400; 
  border-radius: 4px;
`;

// 카테고리 탭 스타일
const CategoryTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const CategoryTab = styled.button`
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: 1px solid ${({ $active, $darkMode }) => 
    $active ? '#ffc400' : ($darkMode ? '#555' : '#ddd')};
  background: ${({ $active, $darkMode }) => 
    $active ? '#ffc400' : ($darkMode ? '#333' : '#fff')};
  color: ${({ $active, $darkMode }) => 
    $active ? '#333' : ($darkMode ? '#ccc' : '#666')};
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $active, $darkMode }) => 
      $active ? '#ffb300' : ($darkMode ? '#444' : '#f5f5f5')};
  }
`;

// 간결한 AI 태그 스타일
const SimpleAiTag = styled.span`
  color: #ff6b6b;
  font-size: 0.7rem;
  font-weight: 600;
  margin-left: 0.3rem;
`;

const CardIconBg = styled.div`
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  font-size: 6.5rem;
  color: rgb(214, 214, 213);
  opacity: 0.5;
  z-index: -1;
  pointer-events: none;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  flex: 1;
  height:400px; /* 페이징 공간 확보 */
`;

const ColumnHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid ${({ $darkMode }) => ($darkMode ? '#444' : '#e0e0e0')};
  font-weight: 600;
  font-size: 0.8rem;
  color: ${({ $darkMode }) => ($darkMode ? '#ccc' : '#666')};
`;

const ColumnTitle = styled.div`
  flex: ${({ flex }) => flex || 1};
  text-align: ${({ textAlign }) => textAlign || 'left'};
`;

const PreviewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  height: 270px; /* 페이징 공간 확보 */
  overflow-y: ${({ $enableScroll }) => $enableScroll ? 'auto' : 'hidden'}; /* 추천 공고 탭에서는 스크롤 비활성화 */
`;

const PreviewItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.8rem;
  border-radius: 0.8rem;
  background: ${({ $darkMode }) => ($darkMode ? '#333' : '#fff')};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#444' : '#e0e0e0')};
  transition: all 0.2s ease;
  ${({ $animate }) => $animate && css`
    animation: ${fadeIn} 0.3s ease-out;
  `}
`;

const JobTitlePreview = styled.div`
  flex: 4;
  font-size: 0.85rem;
  color: ${({ $darkMode }) => ($darkMode ? '#eee' : '#333')};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    color: #ffc400;
  }
  
  strong {
    font-weight: 600;
  }
`;

const MatchPercent = styled.div`
  flex: 2;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ $match }) => {
    if ($match >= 80) return '#28a745';
    if ($match >= 60) return '#ffc107';
    if ($match >= 40) return '#fd7e14';
    return '#dc3545';
  }};
  padding-right: 1.6rem;
`;

const ReasonButtonWrapper = styled.div`
  flex: 2;
  display: flex;
  justify-content: center;
`;

const ReasonButton = styled.button`
  background: ${({ $darkMode }) => ($darkMode ? '#444' : '#f8f9fa')};
  color: ${({ $darkMode }) => ($darkMode ? '#ccc' : '#666')};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#555' : '#dee2e6')};
  padding: 0.3rem 0.6rem;
  border-radius: 0.4rem;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #ffc400;
    color: #333;
    border-color: #ffc400;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ $darkMode }) => ($darkMode ? '#ccc' : '#666')};
  font-size: 0.9rem;
`;

// 페이지네이션 스타일
const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-top: -3rem;

`;

const PageButton = styled.button`
  background: ${({ $darkMode }) => ($darkMode ? '#444' : '#fff')};
  color: ${({ $darkMode }) => ($darkMode ? '#ccc' : '#666')};
  border: 1px solid ${({ $darkMode }) => ($darkMode ? '#555' : '#ddd')};
  padding: 0.5rem 0.8rem;
  border-radius: 0.4rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: #ffc400;
    color: #333;
    border-color: #ffc400;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  font-size: 0.8rem;
  color: ${({ $darkMode }) => ($darkMode ? '#ccc' : '#666')};
  font-weight: 600;
`;

// 추천 이유 팝업 모달 스타일 추가
const ReasonModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ReasonModalContent = styled.div`
  background: ${({ $darkMode }) => $darkMode ? '#2a2a2a' : '#fff'};
  border-radius: 1rem;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
`;

const ReasonModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid ${({ $darkMode }) => $darkMode ? '#444' : '#e0e0e0'};
`;

const ReasonModalTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#666'};
  padding: 0.2rem;
  
  &:hover {
    color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
  }
`;

const ReasonModalBody = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  min-height: 200px;
`;

const ReasonLoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
`;

const ReasonLoadingSpinner = styled.div`
  width: 30px;
  height: 30px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-left-color: #ffc107;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ReasonLoadingText = styled.div`
  font-size: 0.9rem;
  color: ${({ $darkMode }) => $darkMode ? '#ccc' : '#666'};
  text-align: center;
`;

const ReasonText = styled.div`
  line-height: 1.6;
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
  white-space: pre-wrap;
  word-break: break-word;
`;

const ReasonModalFooter = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid ${({ $darkMode }) => $darkMode ? '#444' : '#e0e0e0'};
  display: flex;
  justify-content: flex-end;
`;

const ConfirmButton = styled.button`
  background: #ffc107;
  color: #333;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #ffb300;
  }
`;