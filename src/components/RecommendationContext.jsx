// src/components/RecommendationContext.jsx (페이징 기능 추가)

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const RecommendationContext = createContext();

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
    const [isFirstPage, setIsFirstPage] = useState(true); // 1페이지 여부
    
    // 1페이지 데이터 캐싱
    const [firstPageData, setFirstPageData] = useState(null);
    const [firstPageLoaded, setFirstPageLoaded] = useState(false);
    
    const token = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");

    // 페이지당 표시할 항목 수
    const ITEMS_PER_PAGE = 9;

    const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://192.168.101.51:8000";

    // 1페이지용 API 호출 함수 (가장 적합한 공고)
    const fetchFirstPageRecommendations = async () => {
        if (!token || !userId) {
            setIsLoading(false);
            return;
        }

        // 이미 1페이지 데이터가 캐싱되어 있으면 재사용
        if (firstPageLoaded && firstPageData) {
            setRecommendations(firstPageData);
            setCurrentPage(1);
            setIsFirstPage(true);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
            try {
                const { data } = await axios.get(`${BASE_URL}/recommend/jobs/ids`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
            // 1페이지는 항상 5개만 표시
            const firstPageData = data.recommended_jobs?.slice(0, 5) || [];
            setRecommendations(firstPageData);
            setCurrentPage(1);
            setIsFirstPage(true);
            
            // 1페이지 데이터 캐싱
            setFirstPageData(firstPageData);
            setFirstPageLoaded(true);
            
            // 1페이지 이후의 전체 페이지 수를 계산하기 위해 paginated API 호출
            await fetchTotalPages();

        } catch (error) {
            console.error("1페이지 추천 공고 로딩 실패:", error);
            setRecommendations([]);
            setCurrentPage(1);
            setTotalPages(1);
            setTotalJobs(0);
        } finally {
            setIsLoading(false);
        }
    };

    // 전체 페이지 수를 가져오는 함수
    const fetchTotalPages = async () => {
        try {
            const { data } = await axios.get(`${BASE_URL}/recommend/jobs/paginated`, {
                headers: { Authorization: `Bearer ${token}` },
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
        if (!token || !userId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            // page-1로 넘겨야 실제로 2페이지부터 6~10, 3페이지면 page=2로 요청
            const apiPage = page - 1;
            const { data } = await axios.get(`${BASE_URL}/recommend/jobs/paginated`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: apiPage,
                    jobs_per_page: ITEMS_PER_PAGE
                }
            });
            
            setRecommendations(data.jobs || []);
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
    }, [token, userId]);

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
    };

    return (
        <RecommendationContext.Provider value={value}>
            {children}
        </RecommendationContext.Provider>
    );
};