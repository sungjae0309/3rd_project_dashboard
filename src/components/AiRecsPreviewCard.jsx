// src/components/AiRecsPreviewCard.jsx (페이징 기능 추가)

import React from 'react';
import styled, { css } from 'styled-components';
import { FaBullseye, FaChevronLeft, FaChevronRight, FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useRecommendations } from './RecommendationContext';

// ... (TechStackDisplay 및 관련 스타일은 기존과 동일)
// --- 기술 스택 표시 헬퍼 컴포넌트 (기존과 동일) ---
const TechStackTag = styled.span`
  background-color: ${({ $darkMode }) => ($darkMode ? '#555' : '#e0e0e0')};
  color: ${({ $darkMode }) => ($darkMode ? '#fff' : '#333')};
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
`;
const TechStackContainer = styled.div`
  flex: 3;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: ${({ $darkMode }) => ($darkMode ? '#bbb' : '#555')};
`;
function TechStackDisplay({ stack, darkMode, maxVisible = 2 }) {
    if (!stack) return <div style={{ flex: 3 }}>-</div>;

    const skills = stack.split(',').map(s => s.trim()).filter(Boolean);
    const visibleSkills = skills.slice(0, maxVisible);
    const hiddenSkillsCount = skills.length - maxVisible;
    const fullListTooltip = skills.join(', ');

    return (
        <TechStackContainer $darkMode={darkMode} title={hiddenSkillsCount > 0 ? fullListTooltip : ''}>
            {visibleSkills.map((skill, index) => <TechStackTag key={index} $darkMode={darkMode}>{skill}</TechStackTag>)}
            {hiddenSkillsCount > 0 && (
                <TechStackTag $darkMode={darkMode}>+{hiddenSkillsCount}</TechStackTag>
            )}
        </TechStackContainer>
    );
}

// --- 메인 컴포넌트 ---
export default function AiRecsPreviewCard({ darkMode, onJobDetail, onShowReason }) {
    // Context에서 페이징 정보도 가져오기
    const { recommendations, isLoading, currentPage, totalPages, totalJobs, changePage, isFirstPage } = useRecommendations();
    const navigate = useNavigate();

    const handleTitleClick = (jobId) => {
        if (onJobDetail) {
            onJobDetail(jobId);
        }
    };

    const handlePageChange = (newPage) => {
        changePage(newPage);
    };

    return (
        <HoverCard $darkMode={darkMode}>
            <CardIconBg><FaBullseye /></CardIconBg>
            
            {/* 헤더 영역 - 제목과 페이징 컨트롤 */}
            <HeaderSection>
                <TitleSection>
                    <SectionTitle>
                        <HighlightBar />
                        <span>AI 추천 공고</span>
                        {isFirstPage && (
                            <FirstPageBadge $darkMode={darkMode}>
                                <FaStar />
                                <span>최고추천</span>
                            </FirstPageBadge>
                        )}
                    </SectionTitle>
                    <IntroText>
                        {isFirstPage 
                            ? "가장 적합한 채용 공고를 추천해드려요!"
                            : "딱 맞는 채용 공고를 추천해드려요!"
                        }
                    </IntroText>
                </TitleSection>
                
                {/* 페이징 컨트롤을 우측 상단에 배치 - 항상 표시 */}
                <PaginationWrapper>
                {totalPages > 1 && (
                        <PaginationControls>
                            <PageButton 
                                $darkMode={darkMode} 
                                $disabled={currentPage === 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <FaChevronLeft />
                            </PageButton>
                            
                            <PageNumbers>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    
                                    return (
                                        <PageNumber
                                            key={pageNum}
                                            $darkMode={darkMode}
                                            $active={pageNum === currentPage}
                                            onClick={() => handlePageChange(pageNum)}
                                        >
                                            {pageNum}
                                        </PageNumber>
                                    );
                                })}
                            </PageNumbers>
                            
                            <PageButton 
                                $darkMode={darkMode} 
                                $disabled={currentPage === totalPages}
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                <FaChevronRight />
                            </PageButton>
                        </PaginationControls>
                    )}
                    </PaginationWrapper>
            </HeaderSection>

            <ContentWrapper>
                <ColumnHeader>
                    <ColumnTitle style={{ flex: 4, textAlign: "left" }}>공고명</ColumnTitle>
                    <ColumnTitle style={{ flex: 3, textAlign: "left" }}>기술 스택</ColumnTitle>
                    <ColumnTitle style={{ flex: 2, textAlign: "center" }}>적합도</ColumnTitle>
                    <ColumnTitle style={{ flex: 2, textAlign: "center" }}>추천 이유</ColumnTitle>
                </ColumnHeader>
                <PreviewList>
                    {isLoading ? (
                        <LoadingMessage>AI 추천을 불러오는 중...</LoadingMessage>
                    ) : recommendations.length > 0 ? (
                        (() => {
                            // jobs 배열 길이 콘솔 출력
                            console.log('현재 페이지 jobs 개수:', recommendations.length);
                            // 5개 미만이면 빈 row로 채움
                            const filled = [...recommendations];
                            while (filled.length < 5) {
                                filled.push({ id: `empty-${filled.length}`, title: '', tech_stack: '', similarity: '', isEmpty: true });
                            }
                            return filled.map((job, idx) => (
                                <PreviewItem key={job.id || idx} $darkMode={darkMode} style={job.isEmpty ? { opacity: 0.3, pointerEvents: 'none' } : {}}>
                                    <JobTitlePreview
                                        $darkMode={darkMode}
                                        title={job.title || ''}
                                        onClick={() => job.isEmpty ? undefined : handleTitleClick(job.id)}
                                    >
                                        <strong>{job.title}</strong>
                                    </JobTitlePreview>
                                    <TechStackDisplay stack={job.tech_stack} darkMode={darkMode} />
                                    <MatchPercent $match={job.similarity * 100}>
                                        {job.similarity ? (job.similarity * 100).toFixed(1) + '%' : ''}
                                    </MatchPercent>
                                    <ReasonButtonWrapper>
                                        {!job.isEmpty && onShowReason && (
                                            <ReasonButton onClick={() => onShowReason(job)} $darkMode={darkMode}>알아보기</ReasonButton>
                                        )}
                                    </ReasonButtonWrapper>
                                </PreviewItem>
                            ));
                        })()
                    ) : (
                        <LoadingMessage>추천 공고를 불러오지 못했습니다.</LoadingMessage>
                    )}
                </PreviewList>
            </ContentWrapper>
        </HoverCard>
    );
}

// --- 스타일 정의 (페이징 UI 스타일 추가) ---

// 헤더 섹션 스타일 추가
const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  width: 100%;
`;

const TitleSection = styled.div`
  flex: 1;
`;

// 1페이지 배지 스타일 수정 - 줄바꿈 방지
const FirstPageBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: linear-gradient(135deg, #ff6b6b, #ff8e53);
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 1rem;
  font-size: 0.7rem;
  font-weight: 600;
  margin-left: 0.8rem;
  box-shadow: 0 2px 4px rgba(255, 107, 107, 0.3);
  white-space: nowrap; // 줄바꿈 방지
  ${({ $darkMode }) => $darkMode && css`
    background: linear-gradient(135deg, #ff8e53, #ff6b6b);
  `}
`;

// 문제 2 해결을 위한 Wrapper
const ContentWrapper = styled.div`
  min-height: 280px; // 로딩 중에도 이 높이를 유지하여 크기 변경 방지
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden; // 가로 스크롤 방지
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 200px;
  color: ${({ $darkMode }) => $darkMode ? '#888' : '#666'};
`;
// ... (이하 다른 모든 스타일은 이전 답변과 동일하게 유지)
const HoverCard = styled.div`
  position: relative;
  background: #edece9;
  border-radius: 2rem;
  padding: 2rem;
  transition: transform 0.2s ease;
  width: 100%; // 110%에서 100%로 변경하여 겹침 방지
  overflow: hidden; // 가로 스크롤 방지
  ${({ $darkMode }) => $darkMode && css`background: #2b2b2b; color: #fff;`}
`;
const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.7rem;
  font-weight: 800;
  margin-bottom: 0rem;
  flex-wrap: nowrap; // 줄바꿈 방지
`;
const HighlightBar = styled.div`
  width: 8px;
  height: 1.6rem;
  background: #ffc400;
  border-radius: 4px;
`;
const IntroText = styled.p`
  font-size: 0.95rem;
  line-height: 1.6;
  color: #6c5f3f;
  margin-bottom: 0rem;
  margin-top: 0.5rem;
  white-space: nowrap; // 줄바꿈 방지
  ${({ $darkMode }) => $darkMode && css`color: #ccc;`}
`;
const CardIconBg = styled.div`
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  font-size: 6.5rem;
  color: rgb(214, 214, 213);
  opacity: 0.5;
  z-index: 0;
  pointer-events: none;
  ${({ $darkMode }) => $darkMode && css`color: #444;`}
`;
const ColumnHeader = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 1.05rem;
  font-weight: 600;
  padding: 0 0.2rem;
  color: #7e6a39;
  margin-bottom: 0.6rem;
  min-width: 0; // flex 아이템이 축소될 수 있도록 설정
  ${({ $darkMode }) => $darkMode && css`color: #aaa;`}
`;
const ColumnTitle = styled.span`
  font-size: 1.05rem;
  font-weight: 600;
  color: #7e6a39;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const PreviewList = styled.ul`
  flex-grow: 1; /* Wrapper 내에서 남은 공간을 채우도록 함 */
  width: 100%;
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  min-width: 0; // flex 아이템이 축소될 수 있도록 설정
`;
const PreviewItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  width: 100%;
  font-size: 1rem;
  padding: 0.8rem 0.4rem;
  border-radius: 8px;
  transition: background-color 0.2s;
  min-width: 0; // flex 아이템이 축소될 수 있도록 설정
`;
const JobTitlePreview = styled.span`
  font-weight: 600;
  flex: 4;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ $darkMode }) => ($darkMode ? '#eee' : '#333')};
  cursor: pointer;
  min-width: 0; // flex 아이템이 축소될 수 있도록 설정
  &:hover {
    text-decoration: underline;
  }
`;
const MatchPercent = styled.span`
  font-size: 1.1rem;
  font-weight: 700;
  flex: 2;
  text-align: center;
  color: ${({ $match }) =>
    $match >= 90 ? "#00796B" : $match >= 80 ? "#F57C00" : "#D32F2F"};
  min-width: 0; // flex 아이템이 축소될 수 있도록 설정
`;
const ReasonButtonWrapper = styled.div`
  flex: 2;
  text-align: center;
  min-width: 0; // flex 아이템이 축소될 수 있도록 설정
`;
const ReasonButton = styled.button`
  background: ${({ $darkMode }) => $darkMode ? '#444' : '#e0e0e0'};
  color: ${({ $darkMode }) => $darkMode ? '#fff' : '#333'};
  border: 1px solid ${({ $darkMode }) => $darkMode ? '#555' : '#ccc'};
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s;
  white-space: nowrap; // 버튼 텍스트 줄바꿈 방지

  &:hover {
    background: ${({ $darkMode }) => $darkMode ? '#555' : '#d0d0d0'};
  }
`;

// 페이징 관련 스타일 수정
const PaginationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  min-width: 200px;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const PageButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.8rem;
  height: 1.8rem;
  border: 1px solid ${({ $darkMode, $disabled }) => 
    $disabled 
      ? ($darkMode ? '#555' : '#ccc') 
      : ($darkMode ? '#666' : '#ddd')};
  background: ${({ $darkMode, $disabled }) => 
    $disabled 
      ? ($darkMode ? '#333' : '#f5f5f5') 
      : ($darkMode ? '#444' : '#fff')};
  color: ${({ $darkMode, $disabled }) => 
    $disabled 
      ? ($darkMode ? '#666' : '#999') 
      : ($darkMode ? '#ccc' : '#333')};
  border-radius: 0.3rem;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  font-size: 0.7rem;

  &:hover:not(:disabled) {
    background: ${({ $darkMode }) => $darkMode ? '#555' : '#f0f0f0'};
  }
`;

const PageNumbers = styled.div`
  display: flex;
  gap: 0.2rem;
`;

const PageNumber = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.8rem;
  height: 1.8rem;
  border: 1px solid ${({ $darkMode, $active }) => 
    $active 
      ? ($darkMode ? '#ffc107' : '#ffc107') 
      : ($darkMode ? '#666' : '#ddd')};
  background: ${({ $darkMode, $active }) => 
    $active 
      ? ($darkMode ? '#ffc107' : '#ffc107') 
      : ($darkMode ? '#444' : '#fff')};
  color: ${({ $darkMode, $active }) => 
    $active 
      ? ($darkMode ? '#000' : '#000') 
      : ($darkMode ? '#ccc' : '#333')};
  border-radius: 0.3rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.8rem;
  font-weight: ${({ $active }) => $active ? '600' : '400'};

  &:hover {
    background: ${({ $darkMode, $active }) => 
      $active 
        ? ($darkMode ? '#ffb300' : '#ffb300') 
        : ($darkMode ? '#555' : '#f0f0f0')};
  }
`;