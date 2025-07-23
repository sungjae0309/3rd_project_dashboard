// src/components/RecommendationContext.jsx (페이징 기능 추가)

import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; // AuthContext 사용

const RecommendationContext = createContext();

// 페이지당 아이템 수 상수
const ITEMS_PER_PAGE = 5;

export const useRecommendations = () => {
    return useContext(RecommendationContext);
};

export const RecommendationProvider = ({ children }) => {
    // 페이징 관련 상태
    const [recommendations, setRecommendations] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalJobs, setTotalJobs] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isFirstPage, setIsFirstPage] = useState(true);
    
    // 1페이지 데이터 캐싱
    const [firstPageData, setFirstPageData] = useState(null);
    const [firstPageLoaded, setFirstPageLoaded] = useState(false);
    
    // 중복 호출 방지를 위한 ref 사용
    const isFetchingRef = useRef(false);
    const hasInitializedRef = useRef(false);
    
    // AuthContext에서 로그인 상태 가져오기
    const { isLoggedIn, user, isInitialized: authInitialized } = useAuth();

    const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://192.168.101.51:8000";

    // 로그인 상태가 변경될 때 AI 추천 공고 로드
    useEffect(() => {
        // AuthContext가 초기화된 후에만 실행
        if (!authInitialized) {
            console.log('⏳ [RecommendationContext] AuthContext 초기화 대기 중...');
            return;
        }

        if (isLoggedIn && user && !hasInitializedRef.current) {
            console.log('🔄 [RecommendationContext] 로그인 감지 - AI 추천 공고 로드');
            hasInitializedRef.current = true;
            fetchFirstPageRecommendations();
        } else if (!isLoggedIn) {
            // 로그아웃 시 상태 초기화
            console.log('🔄 [RecommendationContext] 로그아웃 감지 - 상태 초기화');
            setRecommendations([]);
            setFirstPageData(null);
            setFirstPageLoaded(false);
            setIsLoading(false);
            isFetchingRef.current = false;
            hasInitializedRef.current = false;
        }
    }, [isLoggedIn, user, authInitialized]); // authInitialized 추가

    // 1페이지용 API 호출 함수 (가장 적합한 공고)
    const fetchFirstPageRecommendations = async () => {
        if (!isLoggedIn || !user) {
            setIsLoading(false);
            return;
        }

        // 중복 호출 방지 (ref 사용)
        if (isFetchingRef.current) {
            console.log('🚫 [RecommendationContext] 이미 API 호출 중 - 중복 방지');
            return;
        }

        // 이미 1페이지 데이터가 캐싱되어 있으면 재사용
        if (firstPageLoaded && firstPageData) {
            console.log('💾 [RecommendationContext] 캐시된 데이터 사용');
            setRecommendations(firstPageData);
            setCurrentPage(1);
            setIsFirstPage(true);
            setIsLoading(false);
            return;
        }

        console.log('🚀 [RecommendationContext] AI 추천 공고 로딩 시작');
        isFetchingRef.current = true;
        setIsLoading(true);
        try {
            const params = {
                force_refresh: false // 캐시 사용 (1시간 캐싱)
            };

            const { data } = await axios.get(`${BASE_URL}/recommend/jobs/ids`, {
                params,
                headers: { Authorization: `Bearer ${user.token}` },
            });
            
            console.log('🔍 [RecommendationContext] API 응답 데이터:', data);
            console.log('🔍 [RecommendationContext] 응답 타입:', typeof data);
            console.log('🔍 [RecommendationContext] recommended_jobs 존재 여부:', !!data.recommended_jobs);
            console.log('🔍 [RecommendationContext] recommended_jobs 타입:', typeof data.recommended_jobs);
            console.log('🔍 [RecommendationContext] recommended_jobs 첫 번째 항목:', data.recommended_jobs?.[0]);
            console.log('🔍 [RecommendationContext] recommended_jobs 첫 번째 항목 타입:', typeof data.recommended_jobs?.[0]);
            
            // API 응답 구조에 따른 데이터 처리
            let firstPageData = [];
            
            if (data.recommended_jobs && Array.isArray(data.recommended_jobs)) {
                // 기존 구조: data.recommended_jobs 배열
                const rawJobs = data.recommended_jobs.slice(0, 5);
                
                // 각 항목이 문자열인지 객체인지 확인하고 처리
                firstPageData = rawJobs.map((job, index) => {
                    if (typeof job === 'string') {
                        // 문자열을 파싱하여 객체로 변환
                        console.log(`🔍 [RecommendationContext] 문자열 파싱 - 항목 ${index}:`, job);
                        
                        // 문자열에서 key=value 형태로 파싱
                        const jobObj = {};
                        
                        // 정규식을 사용하여 더 정확한 파싱
                        // title='...' 패턴을 먼저 찾기
                        const titleMatch = job.match(/title='([^']+)'/);
                        if (titleMatch) {
                            jobObj.title = titleMatch[1];
                        }
                        
                        // company_name='...' 패턴 찾기
                        const companyMatch = job.match(/company_name='([^']+)'/);
                        if (companyMatch) {
                            jobObj.company_name = companyMatch[1];
                        }
                        
                        // tech_stack='...' 패턴 찾기
                        const techStackMatch = job.match(/tech_stack='([^']+)'/);
                        if (techStackMatch) {
                            jobObj.tech_stack = techStackMatch[1];
                        }
                        
                        // id=숫자 패턴 찾기
                        const idMatch = job.match(/id=(\d+)/);
                        if (idMatch) {
                            jobObj.id = parseInt(idMatch[1]);
                        }
                        
                        // similarity=숫자 패턴 찾기
                        const similarityMatch = job.match(/similarity=([\d.]+)/);
                        if (similarityMatch) {
                            jobObj.similarity = parseFloat(similarityMatch[1]);
                        }
                        
                        console.log(`🔍 [RecommendationContext] 파싱된 객체 - 항목 ${index}:`, jobObj);
                        return jobObj;
                    } else {
                        // 이미 객체인 경우 그대로 사용
                        return job;
                    }
                });
            } else if (data.jobs && Array.isArray(data.jobs)) {
                // paginated API 구조: data.jobs 배열
                firstPageData = data.jobs.slice(0, 5);
            } else if (Array.isArray(data)) {
                // 직접 배열로 응답
                firstPageData = data.slice(0, 5);
            } else {
                console.error('❌ [RecommendationContext] 예상하지 못한 API 응답 구조:', data);
                firstPageData = [];
            }
            
            setRecommendations(firstPageData);
            setCurrentPage(1);
            setIsFirstPage(true);
            
            // 1페이지 데이터 캐싱
            setFirstPageData(firstPageData);
            setFirstPageLoaded(true);
            
            console.log('✅ [RecommendationContext] AI 추천 공고 로딩 완료');
            
            // 전체 페이지 수는 필요할 때만 계산 (중복 호출 방지)
            setTotalPages(1); // 기본값 설정
            setTotalJobs(firstPageData.length);

        } catch (error) {
            console.error("❌ [RecommendationContext] 1페이지 추천 공고 로딩 실패:", error);
            setRecommendations([]);
            setCurrentPage(1);
            setTotalPages(1);
            setTotalJobs(0);
        } finally {
            setIsLoading(false);
            isFetchingRef.current = false; // 중복 호출 방지 플래그 해제
        }
    };

    // 전체 페이지 수를 가져오는 함수
    const fetchTotalPages = async () => {
        try {
            const { data } = await axios.get(`${BASE_URL}/recommend/jobs/paginated`, {
                headers: { Authorization: `Bearer ${user.token}` },
                params: {
                    page: 1,
                    jobs_per_page: 1 // 최소한의 데이터만 가져와서 전체 개수 확인
                }
            });
            
            setTotalJobs(data.pagination?.total_jobs || 0);
            // 1페이지는 이미 5개를 사용하므로, 나머지 페이지 수 계산
            const remainingJobs = Math.max(0, (data.pagination?.total_jobs || 0) - 5);
            const remainingPages = Math.ceil(remainingJobs / ITEMS_PER_PAGE);
            setTotalPages(1 + remainingPages); // 1페이지 + 나머지 페이지들
        } catch (error) {
            console.error("전체 페이지 수 로딩 실패:", error);
            setTotalPages(1);
            setTotalJobs(5);
        }
    };

    // 2페이지부터의 API 호출 함수
    const fetchPaginatedRecommendations = async (page) => {
        if (!isLoggedIn || !user) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            // page-1로 넘겨야 실제로 2페이지부터 6~10, 3페이지면 page=2로 요청
            const apiPage = page - 1;
            const { data } = await axios.get(`${BASE_URL}/recommend/jobs/paginated`, {
                headers: { Authorization: `Bearer ${user.token}` },
                params: {
                    page: apiPage,
                    jobs_per_page: ITEMS_PER_PAGE // 5개씩만 가져오기
                }
            });
            
            // 5개만 표시하도록 제한
            const limitedJobs = (data.jobs || []).slice(0, 5);
            setRecommendations(limitedJobs);
            setCurrentPage(page);
            setIsFirstPage(false);

            } catch (error) {
            console.error("페이징 추천 공고 로딩 실패:", error);
                setRecommendations([]);
            } finally {
                setIsLoading(false);
            }
        };

    // 초기 로딩 (1페이지)
    useEffect(() => {
        fetchFirstPageRecommendations();
    }, [isLoggedIn, user, firstPageLoaded]); // 의존성 배열에 추가

    // 페이지 변경 함수
    const changePage = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        
        if (newPage === 1) {
            fetchFirstPageRecommendations();
        } else {
            fetchPaginatedRecommendations(newPage);
            }
    };

    const value = {
        recommendations,
        isLoading,
        currentPage,
        totalPages,
        totalJobs,
        changePage,
        isFirstPage,
        fetchFirstPageRecommendations, // 추가
    };

    return (
        <RecommendationContext.Provider value={value}>
            {children}
        </RecommendationContext.Provider>
    );
};