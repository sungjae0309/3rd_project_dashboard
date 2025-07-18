// ───────── src/api/trendApi.js ─────────
import axios from 'axios';


const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://192.168.101.51:8000'; // FastAPI 서버 URL

// 직무명 리스트 조회
export const getJobNames = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/job-skills/job-names`);
    return response.data;
  } catch (error) {
    console.error('직무명 조회 실패:', error);
    throw error;
  }
};

// 주간 스킬 통계 조회
export const getWeeklySkillStats = async (jobName, week = null) => {
  try {
    const params = { job_name: jobName };
    if (week !== null) {
      params.week = week;
    }
    const response = await axios.get(`${BASE_URL}/stats/weekly/${jobName}`, { params });
    return response.data;
  } catch (error) {
    console.error('주간 스킬 통계 조회 실패:', error);
    throw error;
  }
};

// 필드 타입별 트렌드 데이터 조회
export const getFieldTypeTrend = async (jobName, fieldType, week = null) => {
  try {
    const params = { field_type: fieldType };
    if (week !== null) {
      params.week = week;
    }
    const response = await axios.get(`${BASE_URL}/stats/trend/${jobName}`, { params });
    return response.data;
  } catch (error) {
    console.error('필드 타입 트렌드 조회 실패:', error);
    throw error;
  }
};

// 주간 스킬 빈도 조회 (워드클라우드용)
export const getWeeklySkillFrequency = async (jobName, field = 'tech_stack') => {
  try {
    const response = await axios.get(`${BASE_URL}/visualization/weekly_skill_frequency`, {
      params: {
        job_name: jobName,
        field: field
      }
    });
    return response.data;
  } catch (error) {
    console.error('주간 스킬 빈도 조회 실패:', error);
    throw error;
  }
};

// 이력서 vs 직무 스킬 비교
export const getResumeVsJobSkillTrend = async (jobName, field = 'tech_stack') => {
  try {
    const response = await axios.get(`${BASE_URL}/visualization/resume_vs_job_skill_trend`, {
      params: {
        job_name: jobName,
        field: field
      }
    });
    return response.data;
  } catch (error) {
    console.error('이력서 vs 직무 스킬 비교 실패:', error);
    throw error;
  }
}; 