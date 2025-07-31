/* ────────────── src/pages/RegisterNext.jsx ────────────── */
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled, { css, keyframes } from "styled-components";
import axios from "axios";
import { FaChevronDown, FaSearch, FaCertificate, FaLanguage, FaTrash, FaCalendarAlt, FaPlus } from "react-icons/fa";

const DEGREE_OPTIONS = [ { value: "", label: "선택" }, { value: "고등학교", label: "고등학교" }, { value: "대학교2", label: "대학교(2년제)" }, { value: "대학교4", label: "대학교(4년제)" }, { value: "대학원", label: "대학원" }, ];
const DEGREE_MAP = { 고등학교:"고졸", 대학교2:"학사", 대학교4:"학사", 대학원:"석사" };
const EDU_STATUS_OPTIONS = { 고등학교: [{ value:"졸업", label:"졸업" }], 대학교2: ["재학","휴학","졸업"].map(v=>({value:v,label:v})), 대학교4: ["재학","휴학","졸업"].map(v=>({value:v,label:v})), 대학원:  ["재학","휴학","졸업"].map(v=>({value:v,label:v})), };
const EXP_MAIN = ["인턴","부트캠프","프로젝트","대외활동"];
const EXP_SUB_ACTIVITY = ["동아리","학회","공모전"];
const SKILL_LEVELS = ["초급","중급","고급"];
// Before
const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://192.168.101.7:8000";

const toIsoDate = d => (d ? new Date(d).toISOString().slice(0,10) : "");

export default function RegisterNext() {
  const navigate = useNavigate();
  const [resume, setResume] = useState({ degree:"", university:"", major:"", gpa:"", education_status:"", career_type:"신입", career_years:"", language_score:"" });
  const [experiences,  setExperiences]  = useState([{ type:"", subType:"", name:"", period:"", description:"", award:"" }]);
  const [certificates, setCertificates] = useState([{ type:"", value:"", date:"" }]);
  const [jobNamesAll, setJobNamesAll] = useState([]);
  const [certListAll, setCertListAll] = useState([]);
  const [skillsAll,   setSkillsAll]   = useState([]);
  const [selectedJobs,   setSelectedJobs]   = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [jobOpen,  setJobOpen]  = useState(true);
  
  // 기술 스택 검색 관련 상태
  const [skillSearchTerm, setSkillSearchTerm] = useState("");

  const [skillSearchResults, setSkillSearchResults] = useState([]);
  const [skillSearchOpen, setSkillSearchOpen] = useState(false);
  const [activeSearchCategory, setActiveSearchCategory] = useState("전체");

  const [modalFilterCategory, setModalFilterCategory] = useState("전체"); // 팝업 내 필터링 상태

  // 자격증 팝업 관련 상태
  const [certSearchOpen, setCertSearchOpen] = useState(false);
  const [certSearchTerm, setCertSearchTerm] = useState("");
  const [currentCertIndex, setCurrentCertIndex] = useState(0);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("accessToken") || "";
      const headers = token ? { Authorization:`Bearer ${token}` } : {};
      try {
        const [jobs, certs, skills] = await Promise.all([
          axios.get(`${BASE_URL}/job-role/job-names`, { headers }),
          axios.get(`${BASE_URL}/certificates/`,        { headers }),
          axios.get(`${BASE_URL}/skills/`,              { headers }),
        ]);
        setJobNamesAll((jobs.data   || []).map(v=>v.name ?? v).filter(Boolean));
        setCertListAll((certs.data  || []).map(v=>v.name ?? v).filter(Boolean));
        setSkillsAll(skills.data || []);
      } catch (err) { console.error("목록 로딩 실패:", err.response?.status, err.response?.data); }
    })();
  }, []);

  // 페이지 마운트 시 스크롤을 최상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = e => setResume(p=>({...p,[e.target.name]:e.target.value}));
  const handleDegreeChange = e => setResume(p=>({...p,degree:e.target.value,education_status:""}));
  const isHighSchoolGraduate = resume.degree==="고등학교" && resume.education_status==="졸업";
  const handleExpChange = (i,k,v) => setExperiences(p=>p.map((e,idx)=>idx===i?{...e,[k]:v}:e));
  const addExperience = (e) => {
    e.preventDefault(); // 폼 제출 방지
    setExperiences(p=>[...p,{ type:"",subType:"",name:"",period:"",description:"",award:"" }]);
  };
  const removeExperience = (i, e) => {
    e.preventDefault(); // 폼 제출 방지
    setExperiences(p=>p.filter((_,idx)=>idx!==i));
  };
  const handleCertType  = (i,v)=>setCertificates(p=>p.map((c,idx)=>idx===i?{...c,type:v,value:""}:c));
  const handleCertValue = (i,v)=>setCertificates(p=>p.map((c,idx)=>idx===i?{...c,value:v}:c));
  const handleCertDate  = (i,v)=>setCertificates(p=>p.map((c,idx)=>idx===i?{...c,date:toIsoDate(v)}:c));
  const addCert = (e) => {
    e.preventDefault(); // 폼 제출 방지
    setCertificates(p=>[...p,{type:"",value:"",date:""}]);
  };
  const removeCert = (i, e) => {
    e.preventDefault(); // 폼 제출 방지
    setCertificates(p=>p.filter((_,idx)=>idx!==i));
  };
  const toggleJob = name => setSelectedJobs(p=>p.includes(name)?p.filter(j=>j!==name):[...p,name]);

  const groupedSkills = useMemo(() => {
    return skillsAll.reduce((acc, skill) => {
      const { category } = skill;
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill);
      return acc;
    }, {});
  }, [skillsAll]);



  // 기술 스택 검색 필터링 (팝업용)
  const filteredSkills = useMemo(() => {
    // "전체" 카테고리일 때는 검색어가 없어도 모든 데이터 표시
    if (activeSearchCategory === "전체") {
      const allSkills = skillsAll;
      // 검색어가 있으면 필터링, 없으면 모든 데이터 반환
      return skillSearchTerm.trim() 
        ? allSkills.filter(skill => skill.name.toLowerCase().includes(skillSearchTerm.toLowerCase()))
        : allSkills;
    }
    
    // 개별 카테고리일 때도 검색어 없이 해당 카테고리 모든 기술 표시
    const skillsToSearch = skillsAll.filter(skill => skill.category === activeSearchCategory);
    
    // 검색어가 있으면 필터링, 없으면 해당 카테고리의 모든 기술 반환
    return skillSearchTerm.trim() 
      ? skillsToSearch.filter(skill => skill.name.toLowerCase().includes(skillSearchTerm.toLowerCase()))
      : skillsToSearch;
  }, [skillsAll, skillSearchTerm, activeSearchCategory]);

  // 검색 결과 업데이트
  useEffect(() => {
    setSkillSearchResults(filteredSkills);
  }, [filteredSkills]);

  // 팝업 내 필터링된 결과 계산
  const modalFilteredSkills = useMemo(() => {
    if (modalFilterCategory === "전체") {
      return skillSearchResults;
    }
    return skillSearchResults.filter(skill => skill.category === modalFilterCategory);
  }, [skillSearchResults, modalFilterCategory]);



  // 기술 스택 카테고리 변경 핸들러
  const handleSkillCategoryChange = (category, e) => {
    e.preventDefault(); // 폼 제출 방지
    setActiveSearchCategory(category);
    setSkillSearchTerm("");
    
    // 모든 카테고리에서 팝업 열기
    if (category === "전체") {
      setModalFilterCategory("전체"); // 팝업 필터 초기화
    } else {
      setModalFilterCategory(category); // 해당 카테고리로 필터 설정
    }
    setSkillSearchOpen(true);
  };

  // 기술 스택 검색 핸들러
  const handleSkillSearch = (e) => {
    const value = e.target.value;
    setSkillSearchTerm(value);
  };

  // 기술 스택 선택 핸들러
  const handleSkillSelect = (skill) => {
    if (selectedSkills.some(s => s.name === skill.name)) {
      removeSkill(skill.name);
    } else {
      setSelectedSkills(prev => [...prev, { name: skill.name, level: "" }]);
    }
    // 팝업창을 닫지 않고 여러 항목 선택 가능하도록 수정
  };

  const removeSkill = name => setSelectedSkills(p=>p.filter(s=>s.name!==name));
  const setSkillLevel = (name,lvl)=>setSelectedSkills(p=>p.map(s=>s.name===name?{...s,level:lvl}:s));

  // 자격증 팝업 관련 핸들러
  const handleCertSearchOpen = (index) => {
    setCurrentCertIndex(index);
    setCertSearchTerm("");
    setCertSearchOpen(true);
  };

  const handleCertSearch = (e) => {
    setCertSearchTerm(e.target.value);
  };

  const handleCertSelect = (certName) => {
    handleCertValue(currentCertIndex, certName);
    setCertSearchOpen(false);
    setCertSearchTerm("");
  };

  // 자격증 검색 결과 필터링
  const filteredCerts = certListAll.filter(cert => 
    cert.toLowerCase().includes(certSearchTerm.toLowerCase())
  );

  const triggerSimilarityCalculation = async (token) => {
    try {
      await axios.post(`${BASE_URL}/similarity/compute`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("✅ 유사도 계산이 성공적으로 요청되었습니다.");
    } catch (err) {
      console.error("❌ 유사도 계산 요청 실패:", err);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    if(!token) return alert("❌ 토큰 없음: 로그인 필요");

    // 최종 학력 필수 입력 검증
    if (!resume.degree || !resume.education_status) {
      alert("목록에서 항목을 선택하세요");
      return;
    }

    if (!isHighSchoolGraduate && (!resume.university || !resume.major)) {
      alert("목록에서 항목을 선택하세요");
      return;
    }

    const parseLanguageScores = (scores_str) => {
      if (!scores_str) return null;
      try {
        return scores_str.split(',')
          .map(part => part.trim().split(':'))
          .reduce((acc, [key, value]) => {
            if (key && value) {
              acc[key.trim()] = value.trim();
            }
            return acc;
          }, {});
      } catch (e) {
        console.error("어학 점수 파싱 오류:", e);
        return null;
      }
    };

    // src/pages/RegisterNext.jsx 의 handleSubmit 함수 내부입니다.

    const payload = {
      university: isHighSchoolGraduate ? null : resume.university || null,
      major: isHighSchoolGraduate ? null : resume.major || null,
      gpa: isHighSchoolGraduate ? null : (resume.gpa ? Number(resume.gpa) : null),
      education_status: resume.education_status || null,
      degree: resume.degree ? DEGREE_MAP[resume.degree] : null,

      // ✨ 1. desired_job: .join(",")을 제거하여 배열 그대로 전송
      desired_job: selectedJobs,

      // ✨ 2. working_year: 숫자(Number)가 아닌 문자열(String)로 전송
      working_year: resume.career_type === "경력" ? String(resume.career_years || "") : "신입",
      
      language_score: parseLanguageScores(resume.language_score),
      skills: selectedSkills.map(s => ({ skill_name: s.name, proficiency: s.level || "초급" })),
      certificates: certificates.filter(c => c.type && c.value && c.date).map(c => ({ certificate_name: c.value, acquired_date: c.date })),
      experience: experiences.filter(e => e.type && e.name).map(({ type, subType, name, period, description, award }) => ({
        type: subType ? `${type}-${subType}` : type, name, period,
        description: subType === "공모전" && award ? `${description}\n수상: ${award}` : description
      }))
    };

    // src/pages/RegisterNext.jsx의 handleSubmit 함수 내부

    try {
      await axios.put(`${BASE_URL}/users/me/resume`, payload, {
        headers:{ Authorization:`Bearer ${token}` }
      });
      
      alert("✅ 프로필이 저장되었습니다!");
      
      await triggerSimilarityCalculation(token);
      
      // ✨ navigate("/aijob") 대신 아래 코드로 변경합니다.
      window.location.href = "/aijob";
      
    } catch(err){
      console.error(err);
      
      let errorMessage = "저장 실패";
      if (err.response?.data?.detail) {
        const details = err.response.data.detail;
        if (Array.isArray(details)) {
          const errorFields = details.map(d => `${d.loc[1]}: ${d.msg}`).join('\n');
          errorMessage += `\n\n[오류 원인]\n${errorFields}`;
        } else {
          errorMessage += `: ${details}`;
        }
      } else {
        errorMessage += `: ${err.message}`;
      }
      alert(errorMessage);
    }
  };

  return (
    <Bg>
      <MainBox>
        <Header><h1>내 프로필</h1></Header>
        <Divider/>
        <FormContainer onSubmit={handleSubmit} autoComplete="off">
          <Section>
            <SectionTitle>
              최종 학력
              <RequiredBadge>필수</RequiredBadge>
            </SectionTitle>
            <EducationCard>
              <EducationRow>
                <EducationFieldWrapper>
                  <EducationLabel>학력</EducationLabel>
                  <EducationSelect value={resume.degree} onChange={handleDegreeChange}>
                    {DEGREE_OPTIONS.map(o=>(<option key={o.value} value={o.value}>{o.label}</option>))}
                  </EducationSelect>
                </EducationFieldWrapper>
                <EducationFieldWrapper>
                  <EducationLabel>학적 상태</EducationLabel>
                  <EducationSelect name="education_status" value={resume.education_status} onChange={handleChange} disabled={!resume.degree}>
                    <option value="">학적 상태</option>
                    {(EDU_STATUS_OPTIONS[resume.degree]||[]).map(o=>(<option key={o.value} value={o.value}>{o.label}</option>))}
                  </EducationSelect>
                </EducationFieldWrapper>
              </EducationRow>
              
              <EducationRow>
                <EducationFieldWrapper>
                  <EducationLabel>구분</EducationLabel>
                  <EducationSelect name="career_type" value={resume.career_type} onChange={handleChange}>
                    <option value="신입">신입</option><option value="경력">경력</option>
                  </EducationSelect>
                </EducationFieldWrapper>
                <EducationFieldWrapper>
                  <EducationLabel>경력 년차</EducationLabel>
                  <EducationSelect name="career_years" value={resume.career_years} onChange={handleChange} disabled={resume.career_type!=="경력"}>
                    <option value="">년차 선택</option>
                    {Array.from({length:30},(_,i)=>i+1).map(y=>(<option key={y} value={y}>{y}년차</option>))}
                  </EducationSelect>
                </EducationFieldWrapper>
              </EducationRow>
              
              <EducationRow>
                <EducationFieldWrapper>
                  <EducationLabel>학교명</EducationLabel>
                  <EducationInput name="university" value={resume.university} onChange={handleChange} disabled={isHighSchoolGraduate} placeholder="학교를 입력하세요"/>
                </EducationFieldWrapper>
                <EducationFieldWrapper>
                  <EducationLabel>전공</EducationLabel>
                  <EducationInput name="major" value={resume.major} onChange={handleChange} disabled={isHighSchoolGraduate} placeholder="전공을 입력하세요"/>
                </EducationFieldWrapper>
              </EducationRow>
              
              <EducationRow>
                <EducationFieldWrapper style={{flex: 1}}>
                  <EducationLabel>학점</EducationLabel>
                  <EducationInput name="gpa" value={resume.gpa} onChange={handleChange} disabled={isHighSchoolGraduate} inputMode="decimal" placeholder="3.5"/>
                </EducationFieldWrapper>
                <div style={{flex: 1}}></div>
              </EducationRow>
            </EducationCard>
          </Section>

          <Section>
            <SectionTitle>
              자격증 / 어학
              <OptionalBadge>선택</OptionalBadge>
            </SectionTitle>

            {certificates.map((c,idx)=>(
              <CertificateCard key={idx}>
                <CertificateTopRow>
                  <CertificateSelect value={c.type} onChange={e=>handleCertType(idx,e.target.value)}>
                    <option value="">유형 선택</option>
                    <option value="자격증">자격증</option>
                    <option value="어학점수">어학점수</option>
                  </CertificateSelect>
                  <CertificateRemoveBtn type="button" onClick={(e)=>removeCert(idx, e)}>
                    <FaTrash />
                  </CertificateRemoveBtn>
                </CertificateTopRow>
                
                <CertificateInputRow>
                  <CertificateInputWrapper>
                    <CertificateInputLabel>
                      {c.type === "" ? "유형" : c.type === "어학점수" ? "어학 시험" : "자격증"}
                    </CertificateInputLabel>
                    <CertificateInputContainer>
                      <CertificateInput 
                        placeholder={
                          c.type === "" ? "유형을 선택하세요" :
                          c.type === "어학점수" ? "TOEIC 900" : 
                          "정보처리기사 1급"
                        } 
                        value={c.value} 
                        onChange={e=>handleCertValue(idx,e.target.value)}
                        disabled={c.type === ""}
                      />
                      {c.type !== "어학점수" && c.type !== "" && (
                        <CertificatePlusButton 
                          type="button"
                          onClick={() => handleCertSearchOpen(idx)}
                        >
                          <FaPlus />
                        </CertificatePlusButton>
                      )}
                    </CertificateInputContainer>
                  </CertificateInputWrapper>
                  
                  <DateInputWrapper>
                    <DateInputLabel>취득일</DateInputLabel>
                    <CertificateDateInput 
                      type="date" 
                      value={c.date||""} 
                      onChange={e=>handleCertDate(idx,e.target.value)}
                    />
                  </DateInputWrapper>
                </CertificateInputRow>
              </CertificateCard>
            ))}
            <CertificateAddBtn type="button" onClick={addCert}>
              <span>+ 자격증/어학 추가</span>
            </CertificateAddBtn>

            {/* 자격증 검색 팝업 */}
            {certSearchOpen && (
              <CertSearchModal>
                <CertModalContent>
                  <CertModalHeader>
                    <CertModalTitle>
                      자격증 선택
                    </CertModalTitle>
                    <CertModalHeaderRight>
                      <CertModalSearchInput
                        type="text"
                        placeholder="자격증으로 검색..."
                        value={certSearchTerm}
                        onChange={handleCertSearch}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <CertModalClose onClick={() => setCertSearchOpen(false)}>×</CertModalClose>
                    </CertModalHeaderRight>
                  </CertModalHeader>
                  
                  {filteredCerts.length > 0 ? (
                    <CertModalBody>
                      <CertResultsGrid>
                        {filteredCerts.map((cert, index) => (
                          <CertCategoryItem
                            key={index}
                            onClick={() => handleCertSelect(cert)}
                          >
                            <CertResultName>{cert}</CertResultName>
                          </CertCategoryItem>
                        ))}
                      </CertResultsGrid>
                    </CertModalBody>
                  ) : (
                    <CertModalBody>
                      <CertNoResults>
                        {certSearchTerm.trim() 
                          ? `"${certSearchTerm}"에 대한 검색 결과가 없습니다.`
                          : "표시할 자격증이 없습니다."
                        }
                      </CertNoResults>
                    </CertModalBody>
                  )}
                </CertModalContent>
              </CertSearchModal>
            )}
          </Section>

          <Section>
            <SectionTitle>
              경험
              <OptionalBadge>선택</OptionalBadge>
            </SectionTitle>
            {experiences.map((exp,idx)=>(
              <ExpCard key={idx}>
                <Select value={exp.type} onChange={e=>handleExpChange(idx,"type",e.target.value)}>
                  <option value="">경험 종류 선택</option>
                  {EXP_MAIN.map(t=><option key={t} value={t}>{t}</option>)}
                </Select>
                {exp.type==="대외활동" && (<Select value={exp.subType} onChange={e=>handleExpChange(idx,"subType",e.target.value)} style={{marginTop:"0.5rem"}}><option value="">세부 유형 선택</option>{EXP_SUB_ACTIVITY.map(s=><option key={s} value={s}>{s}</option>)}</Select>)}
                <Input placeholder={exp.type==="인턴"?"기업명":exp.type==="부트캠프"?"과정명":exp.type==="프로젝트"?"프로젝트명":exp.subType==="동아리"?"동아리명":exp.subType==="학회"?"학회명":exp.subType==="공모전"?"공모전명":"이름"} value={exp.name} onChange={e=>handleExpChange(idx,"name",e.target.value)} style={{marginTop:"0.5rem"}}/>
                <Input placeholder="기간: 2023-01 ~ 2023-06" value={exp.period} onChange={e=>handleExpChange(idx,"period",e.target.value)} style={{marginTop:"0.5rem"}}/>
                <TextArea placeholder={exp.type==="인턴"?"주요 업무":exp.type==="부트캠프"?"과정 내용":exp.type==="프로젝트"?"프로젝트 설명":exp.subType==="동아리"||exp.subType==="학회"?"활동 내용":exp.subType==="공모전"?"담당 업무":"설명"} value={exp.description} onChange={e=>handleExpChange(idx,"description",e.target.value)} style={{marginTop:"0.5rem"}}/>
                {exp.subType==="공모전" && (<Input placeholder="수상 이력 (예: 최우수상)" value={exp.award} onChange={e=>handleExpChange(idx,"award",e.target.value)} style={{marginTop:"0.5rem"}}/>)}
                {experiences.length>1 && <RemoveBtn type="button" onClick={()=>removeExperience(idx)}>경험 삭제</RemoveBtn>}
              </ExpCard>
            ))}
            <ExperienceAddBtn type="button" onClick={addExperience}>
              <span>+ 경험 추가</span>
            </ExperienceAddBtn>
          </Section>

          <Section>
            <SectionTitle>
              관심 직무
              <OptionalBadge>선택</OptionalBadge>
            </SectionTitle>
            <JobCard>
              <JobDropdownHeader onClick={()=>setJobOpen(o=>!o)}>
                <JobHeaderText>
                  {selectedJobs.length ? `${selectedJobs.length}개 직무 선택됨` : "관심 직무를 선택해주세요"}
                </JobHeaderText>
                <JobDropdownIcon open={jobOpen}>
                  <FaChevronDown/>
                </JobDropdownIcon>
              </JobDropdownHeader>
              
                             <JobDropdownBody open={jobOpen}>
                 <JobGridContainer open={jobOpen}>
                   {jobNamesAll.map((job, index)=>(
                     <JobItem 
                       key={job} 
                       selected={selectedJobs.includes(job)}
                       onClick={()=>toggleJob(job)}
                       animationDelay={index * 0.02}
                       open={jobOpen}
                     >
                       <JobCheckbox checked={selectedJobs.includes(job)} />
                       <JobItemText>{job}</JobItemText>
                     </JobItem>
                   ))}
                 </JobGridContainer>
               </JobDropdownBody>
              
              {selectedJobs.length>0 && (
                <SelectedJobsContainer>
                  <SelectedJobsTitle>선택된 직무</SelectedJobsTitle>
                  <JobTagContainer>
                    {selectedJobs.map(job=>(
                      <JobTag key={job} onClick={()=>toggleJob(job)}>
                        {job} ×
                      </JobTag>
                    ))}
                  </JobTagContainer>
                </SelectedJobsContainer>
              )}
            </JobCard>
          </Section>
          
          <Section>
            <SectionTitle>
              기술 스택
              <OptionalBadge>선택</OptionalBadge>
            </SectionTitle>
            <TechStackCard>
              {/* 카테고리 탭 */}
              <TechCategoryContainer>
                <TechCategoryTab
                  key="전체"
                  type="button"
                  active={activeSearchCategory === "전체"}
                  onClick={(e) => handleSkillCategoryChange("전체", e)}
                >
                  전체
                </TechCategoryTab>
                {Object.keys(groupedSkills).map(category => (
                  <TechCategoryTab
                    key={category}
                    type="button"
                    active={activeSearchCategory === category}
                    onClick={(e) => handleSkillCategoryChange(category, e)}
                  >
                    {category}
                  </TechCategoryTab>
                ))}
              </TechCategoryContainer>

              {/* 안내 메시지 - 선택된 기술이 없을 때만 표시 */}
              {selectedSkills.length === 0 && (
                <TechGuideContainer>
                  <TechGuideIcon>💡</TechGuideIcon>
                  <TechGuideText>
                    위 카테고리를 클릭하여 기술 스택을 선택하세요
                  </TechGuideText>
                </TechGuideContainer>
              )}



              {/* 선택된 기술 스택 표시 */}
              {selectedSkills.length > 0 && (
                <SelectedTechContainer>
                  <SelectedTechHeader>
                    <SelectedTechTitle>선택된 기술 스택</SelectedTechTitle>
                    <SelectedTechCount>{selectedSkills.length}개</SelectedTechCount>
                  </SelectedTechHeader>
                  <TechSkillsList>
                    {selectedSkills.map(skill => (
                      <TechSkillItem key={skill.name}>
                        <TechSkillInfo>
                          <TechSkillNameContainer>
                            <TechSkillNameText>{skill.name}</TechSkillNameText>
                            <TechSkillRemove onClick={() => removeSkill(skill.name)}>×</TechSkillRemove>
                          </TechSkillNameContainer>
                          <TechSkillLevel
                            value={skill.level}
                            onChange={(e) => setSkillLevel(skill.name, e.target.value)}
                          >
                            <option value="">숙련도</option>
                            {SKILL_LEVELS.map(level => (
                              <option key={level} value={level}>{level}</option>
                            ))}
                          </TechSkillLevel>
                        </TechSkillInfo>
                      </TechSkillItem>
                    ))}
                  </TechSkillsList>
                </SelectedTechContainer>
              )}
            </TechStackCard>

            {/* 검색 결과 팝업 */}
            {skillSearchOpen && (
              <TechSearchModal>
                <TechModalContent>
                  <TechModalHeader>
                    <TechModalTitle>
                      기술 스택
                    </TechModalTitle>
                    <TechModalHeaderRight>
                      <TechModalSearchInput
                        type="text"
                        placeholder="기술명으로 검색..."
                        value={skillSearchTerm}
                        onChange={handleSkillSearch}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <TechModalClose onClick={() => setSkillSearchOpen(false)}>×</TechModalClose>
                    </TechModalHeaderRight>
                  </TechModalHeader>

                  {/* 팝업 내 카테고리 필터 버튼들 */}
                  {activeSearchCategory === "전체" && (
                    <TechModalFilters>
                      <TechModalFilterButton
                        type="button"
                        active={modalFilterCategory === "전체"}
                        onClick={() => setModalFilterCategory("전체")}
                      >
                        전체
                      </TechModalFilterButton>
                      {Object.keys(groupedSkills).map(category => (
                        <TechModalFilterButton
                          key={category}
                          type="button"
                          active={modalFilterCategory === category}
                          onClick={() => setModalFilterCategory(category)}
                        >
                          {category}
                        </TechModalFilterButton>
                      ))}
                    </TechModalFilters>
                  )}
                  
                  {modalFilteredSkills.length > 0 ? (
                    <TechModalBody>
                      <TechResultsGrid>
                        {modalFilteredSkills.map(skill => (
                          <TechCategoryItem
                            key={skill.id}
                            onClick={() => handleSkillSelect(skill)}
                            selected={selectedSkills.some(s => s.name === skill.name)}
                          >
                            <TechResultName>{skill.name}</TechResultName>
                            {modalFilterCategory === "전체" && (
                              <TechResultCategory>{skill.category}</TechResultCategory>
                            )}
                            {selectedSkills.some(s => s.name === skill.name) && (
                              <TechResultSelected>✓ 선택됨</TechResultSelected>
                            )}
                          </TechCategoryItem>
                        ))}
                      </TechResultsGrid>
                    </TechModalBody>
                  ) : (
                    <TechModalBody>
                      <TechNoResults>
                        {skillSearchTerm.trim() 
                          ? `"${skillSearchTerm}"에 대한 검색 결과가 없습니다.`
                          : `${modalFilterCategory === "전체" ? "표시할" : modalFilterCategory} 기술이 없습니다.`
                        }
                      </TechNoResults>
                    </TechModalBody>
                  )}
                </TechModalContent>
              </TechSearchModal>
            )}
          </Section>
          <SubmitBtn type="submit">저장</SubmitBtn>
        </FormContainer>
      </MainBox>
    </Bg>
  );
}

const press = keyframes`0% { transform: scale(1); } 50% { transform: scale(0.95); } 100% { transform: scale(1); }`;
const baseBtn = css`border:none;border-radius:0.65rem;font-weight:600;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s,background 0.2s;&:hover{box-shadow:0 4px 12px rgba(0,0,0,0.08);transform:translateY(-1px);}&:active{animation:${press} 0.18s ease;}`;
export const Bg = styled.div`min-height:100vh;display:flex;justify-content:center;align-items:flex-start;padding-top:2rem;background:linear-gradient(135deg,#fdfcfb 0%,#e2d1c3 100%);`;
export const MainBox = styled.div`background:#fff;border-radius:1.8rem;padding-bottom:2.2rem;color:#333;width:36rem;max-width:96vw;margin-bottom:3.2rem;box-shadow:0 6px 22px rgba(0,0,0,0.06);transition:box-shadow 0.3s;&:hover{box-shadow:0 8px 28px rgba(0,0,0,0.09);}`;
export const Header = styled.div`padding:1.7rem 2.5rem 0.6rem;text-align:center;h1{color:#ffa500;font-size:2.2rem;font-weight:700;}`;
export const Divider = styled.hr`border:none;border-top:2px solid #e0e0e0;margin:1.2rem auto 2.2rem;width:87%;`;
export const Section = styled.section`margin-bottom:2rem;padding:0 1rem;`;
export const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size:1.1rem;
  font-weight:700;
  color:#ffa500;
  margin-bottom:1.2rem;
  padding-left:1.2rem;
`;

export const RequiredBadge = styled.span`
  padding: 0.2rem 0.5rem;
  background: #e74c3c;
  color: #fff;
  border-radius: 0.3rem;
  font-size: 0.7rem;
  font-weight: 600;
`;

export const OptionalBadge = styled.span`
  padding: 0.2rem 0.5rem;
  background: #95a5a6;
  color: #fff;
  border-radius: 0.3rem;
  font-size: 0.7rem;
  font-weight: 600;
`;
export const Label = styled.label`min-width:6rem;font-size:1rem;color:#555;`;
export const Select = styled.select`width:100%;padding:0.72rem 0.85rem;border:1px solid #ccc;border-radius:0.65rem;transition:border-color 0.25s;&:focus{border-color:#ffa500;outline:none;}`;
export const Input = styled.input`width:100%;padding:0.72rem 0.85rem;border:1px solid #ccc;border-radius:0.65rem;transition:border-color 0.25s;&:focus{border-color:#ffa500;outline:none;}`;
export const TextArea = styled.textarea`width:100%;padding:0.72rem 0.85rem;border:1px solid #ccc;border-radius:0.65rem;resize:vertical;min-height:70px;transition:border-color 0.25s;&:focus{border-color:#ffa500;outline:none;}`;
export const FormContainer = styled.form`padding:0 2.2rem;`;
export const FlexRow = styled.div`display:flex;align-items:center;gap:1.5rem;margin-bottom:1rem;flex-wrap:wrap;> *{flex:1;}`;
export const ExpCard = styled.div`margin-bottom:1.3rem;padding:1rem 1.3rem;border:1px solid #ddd;border-radius:1rem;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.04);transition:box-shadow 0.25s;&:hover{box-shadow:0 4px 16px rgba(0,0,0,0.08);}`;
export const ExpRow = styled.div`display:flex;gap:0.6rem;align-items:center;margin-bottom:0.8rem;> *{flex:1;}> input[type="date"]{max-width:35%;}`;
export const DropdownCard = styled.div`background:#fff;border-radius:1.1rem;padding:1rem 1.6rem;box-shadow:0 2px 8px rgba(0,0,0,0.04);transition:box-shadow 0.3s;&:hover{box-shadow:0 3px 10px rgba(0,0,0,0.06);}`;
export const DropdownHeader = styled.div`display:flex;justify-content:space-between;align-items:center;font-weight:600;color:#ffa500;cursor:pointer;`;
export const DropdownIcon = styled.span`transition:transform 0.3s;transform:${({open})=>open?"rotate(-180deg)":"none"};`;
export const DropdownBody = styled.div`margin-top:0.5rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(12rem,1fr));gap:0.45rem;`;
export const DropdownItem = styled.div`display:flex;align-items:center;gap:0.6rem;padding:0.45rem 0.55rem;border-radius:0.55rem;border:1.5px solid ${({selected})=>selected?"#ffa500":"#dcdcdc"};background:${({selected})=>selected?"#ffa50022":"transparent"};cursor:pointer;transition:background 0.2s,border 0.2s,transform 0.2s;&:hover{transform:translateY(-1px);background:${({selected})=>selected?"#ffa50033":"#f5f5f5"};}`;
export const TagWrap = styled.div`margin-top:0.8rem;display:flex;flex-wrap:wrap;gap:0.55rem;`;
export const Tag = styled.div`background:#ffa500;color:#fff;border-radius:1.2rem;padding:0.34rem 1rem;cursor:pointer;transition:transform 0.18s;&:active{animation:${press} 0.18s ease;}`;
export const SkillCard = styled.div`background:#fff; border-radius:1rem; padding:1.5rem;box-shadow:0 2px 8px rgba(0,0,0,0.05);`;
export const SkillCategory = styled.div`margin-bottom: 1.5rem;&:last-child { margin-bottom: 0; } > h4 {font-size: 1rem; font-weight: 600; color: #555; margin-bottom: 0.8rem; border-left: 3px solid #ffa500; padding-left: 0.8rem;}`;
export const SkillButtonContainer = styled.div`display: flex; flex-wrap: wrap; gap: 0.6rem;`;
export const SkillButton = styled.button`${baseBtn} padding: 0.5rem 1rem; font-size: 0.9rem;background: ${({selected}) => selected ? "#ffa500" : "#f0f0f0"};color: ${({selected}) => selected ? "#fff" : "#444"};border: 1px solid ${({selected}) => selected ? "#ffa500" : "#ddd"};&:hover {background: ${({selected}) => selected ? "#ffb13d" : "#e0e0e0"};transform: translateY(-1px);}`;
export const SkillLevelWrap = styled.div`display:flex;flex-direction:column;gap:1.2rem;align-items:center;`;
export const SkillWithLevel = styled.div`display:flex;align-items:center;width:80%;`;
export const LangTag = styled.div`min-width:85px;text-align:center;font-weight:700;color:#ffa500;border-radius:1.7rem;padding:0.65rem 0;margin-right:1.2rem;cursor:pointer;`;
export const RemoveBtn = styled.button`${baseBtn};background:#fcecec;color:#e53935;padding:0.5rem 1rem;margin-top:0.6rem;`;
export const AddBtn = styled.button`${baseBtn};background:#fff7ed;color:#ffa500;padding:0.6rem 1.25rem;margin-top:0.5rem;`;
export const SubmitBtn = styled.button`${baseBtn};width:100%;padding:1rem;background:#ffa500;color:#fff;margin-top:2rem;&:hover{background:#ffb13d;}`;

// 검색 입력 스타일
const SkillSearchContainer = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
`;

const SkillSearchWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 0.65rem;
  padding: 0.72rem 0.85rem;
  background-color: #f9f9f9;
  transition: border-color 0.25s;
  &:focus-within {
    border-color: #ffa500;
    outline: none;
  }
`;

const SearchIcon = styled.span`
  margin-right: 0.85rem;
  color: #555;
`;

const SkillSearchInput = styled.input`
  flex-grow: 1;
  border: none;
  background: none;
  font-size: 1rem;
  color: #333;
  &::placeholder {
    color: #999;
  }
`;

const DetailViewButton = styled.button`
  ${baseBtn}
  padding: 0.72rem 1rem;
  background: #ffa500;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 0.65rem;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    background: #ffb13d;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const AutoCompleteDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 0.65rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 10;
  margin-top: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
`;

const AutoCompleteItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: ${({ selected }) => selected ? "#fff7ed" : "transparent"};
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  .selected {
    color: #ffa500;
    font-weight: bold;
  }
`;

const SelectedSkillsContainer = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 0.8rem;
  border: 1px solid #eee;
`;

const SelectedSkillsTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 0.8rem;
  border-left: 3px solid #ffa500;
  padding-left: 0.8rem;
`;

const SkillLevelSelect = styled.select`
  padding: 0.6rem 1rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  background: #333;
  color: #fff;
  border: 1px solid #555;
  width: 60%;
  &:focus {
    border-color: #ffa500;
    outline: none;
  }
`;

const NoResultsMessage = styled.p`
  padding: 0.72rem 0.85rem;
  font-size: 0.9rem;
  color: #999;
  text-align: center;
`;

const SkillTag = styled.div`
  min-width: 85px;
  text-align: center;
  font-weight: 700;
  color: #ffa500;
  border-radius: 1.7rem;
  padding: 0.65rem 0;
  margin-right: 1.2rem;
  cursor: pointer;
  background-color: #fff7ed;
  border: 1px solid #ffa500;
  transition: all 0.2s;
  &:hover {
    background-color: #ffa500;
    color: #fff;
  }
`;

// 카테고리 탭 스타일
const SkillCategoryTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
`;

const SkillCategoryTab = styled.button`
  ${baseBtn}
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
  background: ${({ active }) => active ? "#ffa500" : "#f0f0f0"};
  color: ${({ active }) => active ? "#fff" : "#444"};
  border: 1px solid ${({ active }) => active ? "#ffa500" : "#ddd"};
  border-radius: 1.5rem;
  font-weight: 600;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ active }) => active ? "#ffb13d" : "#e0e0e0"};
    transform: translateY(-1px);
  }
`;

// 팝업 스타일
const SkillSearchPopup = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const SkillSearchPopupContent = styled.div`
  background: #fff;
  border-radius: 1rem;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const SkillSearchPopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #ffa500;
  color: #fff;
  
  h3 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const SkillSearchPopupBody = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding: 1rem;
`;

const SkillSearchPopupItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  border: 1px solid ${({ selected }) => selected ? "#ffa500" : "#eee"};
  background-color: ${({ selected }) => selected ? "#fff7ed" : "#fff"};
  margin-bottom: 0.5rem;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  .skill-name {
    font-weight: 600;
    color: #333;
  }
  
  .selected-indicator {
    font-size: 0.8rem;
    color: #ffa500;
    font-weight: 600;
  }
`;

// 자격증/어학 관련 스타일드 컴포넌트
const CertificateCard = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 0.8rem;
  padding: 1rem;
  margin-bottom: 0.8rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const CertificateTopRow = styled.div`
  display: flex;
  gap: 0.8rem;
  align-items: center;
  margin-bottom: 0.8rem;
`;

const CertificateSelect = styled.select`
  flex: 1;
  padding: 0.6rem 0.8rem;
  border: 1px solid #ddd;
  border-radius: 0.6rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
  background: #fff;
  transition: border-color 0.2s ease;
  
  &:focus {
    border-color: #ffa500;
    outline: none;
  }
`;

const CertificateRemoveBtn = styled.button`
  ${baseBtn}
  background: #f5f5f5;
  color: #999;
  padding: 0.5rem;
  border-radius: 0.4rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e53935;
    color: #fff;
  }
`;

const CertificateInputRow = styled.div`
  display: flex;
  gap: 0.8rem;
  align-items: flex-end;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.6rem;
  }
`;

const CertificateInputWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const CertificateInputLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 500;
  color: #666;
`;

const CertificateInput = styled.input`
  width: 100%;
  padding: 0.6rem 2.5rem 0.6rem 0.8rem;
  border: 1px solid #ddd;
  border-radius: 0.6rem;
  font-size: 0.9rem;
  background: #fff;
  transition: border-color 0.2s ease;
  
  &:focus {
    border-color: #ffa500;
    outline: none;
  }
  
  &::placeholder {
    color: #aaa;
  }
`;

const DateInputWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 120px;
`;

const DateInputLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 500;
  color: #666;
`;

const CertificateDateInput = styled.input`
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid #ddd;
  border-radius: 0.6rem;
  font-size: 0.9rem;
  background: #fff;
  transition: border-color 0.2s ease;
  
  &:focus {
    border-color: #ffa500;
    outline: none;
  }
`;

const CertificateAddBtn = styled.button`
  ${baseBtn}
  width: 100%;
  padding: 0.7rem 1rem;
  background: #f8f9fa;
  color: #ffa500;
  border: 1px dashed #ddd;
  border-radius: 0.6rem;
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: 0.3rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #ffa500;
    color: #fff;
    border-color: #ffa500;
  }
  
  span {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
  }
`;

// 자격증 입력 컨테이너와 플러스 버튼
const CertificateInputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const CertificatePlusButton = styled.button`
  ${baseBtn}
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: #ffa500;
  color: #fff;
  padding: 0.3rem;
  border-radius: 0.3rem;
  font-size: 0.7rem;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 2;
  
  &:hover {
    background: #e09400;
    transform: translateY(-50%) scale(1.05);
  }
`;

// 최종학력 관련 스타일드 컴포넌트
const EducationCard = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 0.8rem;
  padding: 1.2rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const EducationRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.6rem;
  }
`;

const EducationFieldWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const EducationLabel = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 0.2rem;
`;

const EducationSelect = styled.select`
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 1px solid #ddd;
  border-radius: 0.6rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
  background: #fff;
  transition: border-color 0.2s ease;
  
  &:focus {
    border-color: #ffa500;
    outline: none;
  }
  
  &:disabled {
    background: #f5f5f5;
    color: #999;
    cursor: not-allowed;
  }
`;

const EducationInput = styled.input`
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 1px solid #ddd;
  border-radius: 0.6rem;
  font-size: 0.9rem;
  background: #fff;
  transition: border-color 0.2s ease;
  
  &:focus {
    border-color: #ffa500;
    outline: none;
  }
  
  &:disabled {
    background: #f5f5f5;
    color: #999;
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: #aaa;
  }
`;

// 경험 추가 버튼 (자격증/어학 추가 버튼과 동일한 스타일)
const ExperienceAddBtn = styled.button`
  ${baseBtn}
  width: 100%;
  padding: 0.7rem 1rem;
  background: #f8f9fa;
  color: #ffa500;
  border: 1px dashed #ddd;
  border-radius: 0.6rem;
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: 0.3rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #ffa500;
    color: #fff;
    border-color: #ffa500;
  }
  
  span {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
  }
`;

// 관심 직무 애니메이션
const jobItemFadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// 관심 직무 관련 스타일드 컴포넌트
const JobCard = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 0.8rem;
  padding: 1.2rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const JobDropdownHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 0.6rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f0f0f0;
    border-color: #d0d0d0;
  }
`;

const JobHeaderText = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
`;

const JobDropdownIcon = styled.div`
  transition: transform 0.3s ease;
  transform: ${({open}) => open ? "rotate(180deg)" : "rotate(0deg)"};
  color: #666;
  font-size: 0.9rem;
`;

const JobDropdownBody = styled.div`
  margin-top: 0.8rem;
  padding: ${({open}) => open ? "0.8rem" : "0 0.8rem"};
  background: #f9f9f9;
  border-radius: 0.6rem;
  border: 1px solid #e8e8e8;
  max-height: ${({open}) => open ? "400px" : "0px"};
  opacity: ${({open}) => open ? 1 : 0};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  transform: ${({open}) => open ? "translateY(0)" : "translateY(-10px)"};
`;

const JobGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.6rem;
  max-height: 300px;
  overflow-y: auto;
  opacity: ${({open}) => open ? 1 : 0};
  transform: ${({open}) => open ? "translateY(0)" : "translateY(-5px)"};
  transition: all 0.4s ease-in-out;
  transition-delay: ${({open}) => open ? "0.1s" : "0s"};
`;

const JobItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.8rem;
  background: ${({selected}) => selected ? "#fff7ed" : "#fff"};
  border: 1px solid ${({selected}) => selected ? "#ffa500" : "#e0e0e0"};
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: ${({open}) => open ? 1 : 0};
  transform: ${({open}) => open ? "translateY(0)" : "translateY(10px)"};
  animation: ${({open}) => open ? jobItemFadeInUp : "none"} 0.4s ease-out forwards;
  animation-delay: ${({animationDelay, open}) => open ? `${animationDelay}s` : "0s"};
  
  &:hover {
    background: ${({selected}) => selected ? "#ffead4" : "#f5f5f5"};
    transform: ${({open}) => open ? "translateY(-1px)" : "translateY(10px)"};
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const JobCheckbox = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 2px solid ${({checked}) => checked ? "#ffa500" : "#ccc"};
  background-color: ${({checked}) => checked ? "#ffa500" : "transparent"};
  transition: all 0.2s ease;
  flex-shrink: 0;
  position: relative;
  
  ${({checked}) => checked && `
    &::after {
      content: '✓';
      position: absolute;
      top: -2px;
      left: 1px;
      color: white;
      font-size: 12px;
      font-weight: bold;
    }
  `}
`;

const JobItemText = styled.span`
  font-size: 0.85rem;
  font-weight: 500;
  color: #333;
`;

const SelectedJobsContainer = styled.div`
  margin-top: 1rem;
  padding: 0.8rem;
  background: #f8f9fa;
  border-radius: 0.6rem;
  border: 1px solid #e8e8e8;
`;

const SelectedJobsTitle = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 0.6rem;
`;

const JobTagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const JobTag = styled.div`
  background: #ffa500;
  color: #fff;
  padding: 0.4rem 0.8rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e09400;
    transform: scale(0.95);
  }
`;

// 기술 스택 관련 스타일드 컴포넌트
const TechStackCard = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 0.8rem;
  padding: 1.2rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const TechCategoryContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const TechGuideContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border: 1px dashed #d0d0d0;
  border-radius: 0.6rem;
  margin-bottom: 1.2rem;
`;

const TechGuideIcon = styled.span`
  font-size: 1rem;
`;

const TechGuideText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
`;

const TechCategoryTab = styled.button`
  ${baseBtn}
  padding: 0.6rem 1rem;
  font-size: 0.85rem;
  background: ${({ active }) => active ? "#ffb366" : "#f8f9fa"};
  color: ${({ active }) => active ? "#fff" : "#666"};
  border: 1px solid ${({ active }) => active ? "#ffb366" : "#e0e0e0"};
  border-radius: 1.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ active }) => active ? "#ff9e47" : "#f0f0f0"};
    border-color: ${({ active }) => active ? "#ff9e47" : "#d0d0d0"};
  }
`;

const TechSearchSection = styled.div`
  position: relative;
  margin-bottom: 1.2rem;
`;

const TechSearchInputContainer = styled.div`
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 0.6rem;
  padding: 0.3rem;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  &:focus-within {
    border-color: #ffa500;
    box-shadow: 0 0 0 3px rgba(255, 165, 0, 0.1);
  }
`;

const TechSearchIcon = styled.div`
  margin-left: 0.5rem;
  color: #999;
  font-size: 0.9rem;
`;

const TechSearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.6rem 0.5rem;
  font-size: 0.9rem;
  color: #333;
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: #aaa;
  }
`;

const TechSearchButton = styled.button`
  ${baseBtn}
  padding: 0.6rem 1rem;
  background: #ffa500;
  color: #fff;
  border-radius: 0.4rem;
  font-size: 0.85rem;
  font-weight: 500;
  
  &:hover:not(:disabled) {
    background: #e09400;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const TechAutoComplete = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 0.6rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  z-index: 10;
  margin-top: 0.3rem;
  max-height: 200px;
  overflow-y: auto;
`;

const TechAutoCompleteItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.7rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  background-color: ${({ selected }) => selected ? "#fff7ed" : "transparent"};
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const TechItemName = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
`;

const TechSelectedBadge = styled.span`
  background: #ffa500;
  color: #fff;
  padding: 0.2rem 0.4rem;
  border-radius: 0.3rem;
  font-size: 0.7rem;
  font-weight: 600;
`;

const SelectedTechContainer = styled.div`
  background: #f8f9fa;
  border: 1px solid #e8e8e8;
  border-radius: 0.6rem;
  padding: 1rem;
`;

const SelectedTechHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
`;

const SelectedTechTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const SelectedTechCount = styled.span`
  background: #ffb366;
  color: #fff;
  padding: 0.2rem 0.6rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
`;

const TechSkillsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const TechSkillItem = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  padding: 0.8rem;
`;

const TechSkillInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const TechSkillNameContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0.8rem;
  background: #ffb366;
  color: #fff;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: #ff9e47;
  }
`;

const TechSkillNameText = styled.span`
  flex: 1;
  text-align: center;
`;

const TechSkillRemove = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  margin-left: 0.5rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
`;

const TechSkillLevel = styled.select`
  flex: 1;
  padding: 0.5rem 0.7rem;
  border: 1px solid #ddd;
  border-radius: 0.4rem;
  font-size: 0.85rem;
  background: #fff;
  color: #333;
  
  &:focus {
    border-color: #ffb366;
    outline: none;
  }
`;

// 모달 관련 스타일
const TechSearchModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const TechModalContent = styled.div`
  background: #fff;
  border-radius: 0.8rem;
  width: 600px;
  height: 600px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const TechModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.5rem;
  background: #ffb366;
  color: #fff;
`;

const TechModalHeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const TechModalSearchInput = styled.input`
  padding: 0.5rem 0.8rem;
  border: none;
  border-radius: 0.4rem;
  font-size: 0.9rem;
  background: #fff;
  color: #333;
  min-width: 200px;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
  }
  
  &::placeholder {
    color: #999;
  }
`;

const TechModalTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
`;

const TechModalClose = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const TechModalBody = styled.div`
  padding: 1.2rem;
  height: 420px;
  overflow-y: auto;
`;

// 팝업 내 필터 버튼 관련 스타일
const TechModalFilters = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.2rem 0;
  border-bottom: 1px solid #f0f0f0;
  flex-wrap: wrap;
`;

const TechModalFilterButton = styled.button`
  ${baseBtn}
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  background: ${({ active }) => active ? '#ffb366' : '#f8f9fa'};
  color: ${({ active }) => active ? '#fff' : '#666'};
  border: 1px solid ${({ active }) => active ? '#ffb366' : '#e0e0e0'};
  border-radius: 1.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ active }) => active ? '#ffb366' : '#f0f0f0'};
    border-color: #ffb366;
    color: ${({ active }) => active ? '#fff' : '#333'};
  }
`;

const TechResultsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
`;

const TechResultItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.8rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${({ selected }) => selected ? "#ffa500" : "#e0e0e0"};
  background-color: ${({ selected }) => selected ? "#fff7ed" : "#fff"};
  
  &:hover {
    background-color: #f5f5f5;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const TechResultName = styled.span`
  font-size: 0.85rem;
  font-weight: 500;
  color: #333;
  text-align: center;
`;

const TechResultCategory = styled.span`
  font-size: 0.65rem;
  color: #666;
  background: #f0f0f0;
  padding: 0.1rem 0.4rem;
  border-radius: 0.25rem;
  font-weight: 400;
`;

const TechResultSelected = styled.span`
  font-size: 0.7rem;
  color: #ffb366;
  font-weight: 500;
`;

const TechNoResults = styled.div`
  text-align: center;
  padding: 2rem;
  color: #999;
  font-size: 0.9rem;
`;

// 색상 제거 - 모든 요소에 기본 색상 사용

// 전체 카테고리 구분 관련 스타일
const TechCategorySection = styled.div`
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const TechCategorySectionTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0.8rem 1rem;
  background: #f8f9fa;
  color: #333;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
`;

const TechCategoryCount = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 0.6rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 500;
`;

const TechCategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.6rem;
`;

const TechCategoryItem = styled.div`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.5rem 0.8rem;
  border-radius: 0.4rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${({ selected }) => selected ? '#ffb366' : '#e0e0e0'};
  background-color: ${({ selected }) => selected ? '#fff9f2' : '#fff'};
  white-space: nowrap;
  
  &:hover {
    background-color: ${({ selected }) => selected ? '#fff4e8' : '#f5f5f5'};
    border-color: #ffb366;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

// 자격증 모달 관련 스타일
const CertSearchModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const CertModalContent = styled.div`
  background: #fff;
  border-radius: 0.8rem;
  width: 600px;
  height: 600px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const CertModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.5rem;
  background: #ffb366;
  color: #fff;
`;

const CertModalHeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const CertModalSearchInput = styled.input`
  padding: 0.5rem 0.8rem;
  border: none;
  border-radius: 0.4rem;
  font-size: 0.9rem;
  background: #fff;
  color: #333;
  min-width: 200px;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
  }
  
  &::placeholder {
    color: #999;
  }
`;

const CertModalTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
`;

const CertModalClose = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const CertModalBody = styled.div`
  padding: 1.2rem;
  height: 520px;
  overflow-y: auto;
`;

const CertResultsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
`;

const CertCategoryItem = styled.div`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.5rem 0.8rem;
  border-radius: 0.4rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e0e0e0;
  background-color: #fff;
  white-space: nowrap;
  
  &:hover {
    background-color: #f5f5f5;
    border-color: #ffb366;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const CertResultName = styled.span`
  font-size: 0.85rem;
  font-weight: 500;
  color: #333;
  text-align: center;
`;

const CertNoResults = styled.div`
  text-align: center;
  padding: 2rem;
  color: #999;
  font-size: 0.9rem;
`;