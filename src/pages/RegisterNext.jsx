/* ────────────── src/pages/RegisterNext.jsx ────────────── */
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled, { css, keyframes } from "styled-components";
import axios from "axios";
import { FaChevronDown, FaSearch } from "react-icons/fa";

const DEGREE_OPTIONS = [ { value: "", label: "선택" }, { value: "고등학교", label: "고등학교" }, { value: "대학교2", label: "대학교(2년제)" }, { value: "대학교4", label: "대학교(4년제)" }, { value: "대학원", label: "대학원" }, ];
const DEGREE_MAP = { 고등학교:"고졸", 대학교2:"학사", 대학교4:"학사", 대학원:"석사" };
const EDU_STATUS_OPTIONS = { 고등학교: [{ value:"졸업", label:"졸업" }], 대학교2: ["재학","휴학","졸업"].map(v=>({value:v,label:v})), 대학교4: ["재학","휴학","졸업"].map(v=>({value:v,label:v})), 대학원:  ["재학","휴학","졸업"].map(v=>({value:v,label:v})), };
const EXP_MAIN = ["인턴","부트캠프","프로젝트","대외활동"];
const EXP_SUB_ACTIVITY = ["동아리","학회","공모전"];
const SKILL_LEVELS = ["입문자","기초","중급","고급","전문가"];
// Before
const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://192.168.101.51:8000";

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
  const [skillSearchCategory, setSkillSearchCategory] = useState("스킬");
  const [skillSearchResults, setSkillSearchResults] = useState([]);
  const [skillSearchOpen, setSkillSearchOpen] = useState(false);
  const [activeSearchCategory, setActiveSearchCategory] = useState("스킬");
  const [showAutoComplete, setShowAutoComplete] = useState(false);

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

  // 기술 스택 검색 필터링 (자동완성용)
  const autoCompleteSkills = useMemo(() => {
    if (!skillSearchTerm.trim()) return [];
    
    // 현재 활성화된 카테고리의 기술만 검색
    const skillsToSearch = skillsAll.filter(skill => skill.category === activeSearchCategory);
    
    // 검색어 필터링
    return skillsToSearch.filter(skill => 
      skill.name.toLowerCase().includes(skillSearchTerm.toLowerCase())
    ).slice(0, 5); // 자동완성은 최대 5개만 표시
  }, [skillsAll, skillSearchTerm, activeSearchCategory]);

  // 기술 스택 검색 필터링 (팝업용)
  const filteredSkills = useMemo(() => {
    if (!skillSearchTerm.trim()) return [];
    
    // 현재 활성화된 카테고리의 기술만 검색
    const skillsToSearch = skillsAll.filter(skill => skill.category === activeSearchCategory);
    
    // 검색어 필터링
    return skillsToSearch.filter(skill => 
      skill.name.toLowerCase().includes(skillSearchTerm.toLowerCase())
    );
  }, [skillsAll, skillSearchTerm, activeSearchCategory]);

  // 검색 결과 업데이트
  useEffect(() => {
    setSkillSearchResults(filteredSkills);
  }, [filteredSkills]);



  // 기술 스택 카테고리 변경 핸들러
  const handleSkillCategoryChange = (category, e) => {
    e.preventDefault(); // 폼 제출 방지
    setActiveSearchCategory(category);
    setSkillSearchTerm("");
    setSkillSearchOpen(false);
    setShowAutoComplete(false);
  };

  // 기술 스택 검색 핸들러
  const handleSkillSearch = (e) => {
    const value = e.target.value;
    setSkillSearchTerm(value);
    setShowAutoComplete(value.length > 0);
    setSkillSearchOpen(false);
  };

  // 엔터 키 핸들러
  const handleSkillSearchKeyPress = (e) => {
    if (e.key === 'Enter' && skillSearchTerm.trim()) {
      e.preventDefault();
      setSkillSearchOpen(true);
      setShowAutoComplete(false);
    }
  };

  // 기술 스택 선택 핸들러
  const handleSkillSelect = (skill) => {
    if (selectedSkills.some(s => s.name === skill.name)) {
      removeSkill(skill.name);
    } else {
      setSelectedSkills(prev => [...prev, { name: skill.name, level: "" }]);
    }
    setSkillSearchTerm("");
    setSkillSearchOpen(false);
  };

  const removeSkill = name => setSelectedSkills(p=>p.filter(s=>s.name!==name));
  const setSkillLevel = (name,lvl)=>setSelectedSkills(p=>p.map(s=>s.name===name?{...s,level:lvl}:s));

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
      skills: selectedSkills.map(s => ({ skill_name: s.name, proficiency: s.level || "입문자" })),
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
            <SectionTitle>최종 학력</SectionTitle>
            <FlexRow>
              <Label>학력</Label>
              <Select value={resume.degree} onChange={handleDegreeChange}>
                {DEGREE_OPTIONS.map(o=>(<option key={o.value} value={o.value}>{o.label}</option>))}
              </Select>
              <Select name="education_status" value={resume.education_status} onChange={handleChange} disabled={!resume.degree} style={{width:"45%",marginLeft:"1rem"}}>
                <option value="">학적 상태</option>
                {(EDU_STATUS_OPTIONS[resume.degree]||[]).map(o=>(<option key={o.value} value={o.value}>{o.label}</option>))}
              </Select>
            </FlexRow>
            <FlexRow>
              <Label>구분</Label>
              <Select name="career_type" value={resume.career_type} onChange={handleChange} style={{width:"140px"}}>
                <option value="신입">신입</option><option value="경력">경력</option>
              </Select>
              <Select name="career_years" value={resume.career_years} onChange={handleChange} disabled={resume.career_type!=="경력"} style={{width:"45%",marginLeft:"1rem"}}>
                <option value="">년차 선택</option>
                {Array.from({length:30},(_,i)=>i+1).map(y=>(<option key={y} value={y}>{y}년차</option>))}
              </Select>
            </FlexRow>
            <FlexRow><Label>학교명</Label><Input name="university" value={resume.university} onChange={handleChange} disabled={isHighSchoolGraduate}/></FlexRow>
            <FlexRow><Label>전공</Label><Input name="major" value={resume.major} onChange={handleChange} disabled={isHighSchoolGraduate}/></FlexRow>
            <FlexRow><Label>학점</Label><Input name="gpa" value={resume.gpa} onChange={handleChange} disabled={isHighSchoolGraduate} inputMode="decimal" placeholder="3.5"/></FlexRow>
          </Section>

          <Section>
            <SectionTitle>자격증 / 어학</SectionTitle>
            <datalist id="cert-datalist">{certListAll.map(n=><option key={n} value={n}/>)}</datalist>
            {certificates.map((c,idx)=>(
              <ExpRow key={idx}>
                <Select value={c.type} onChange={e=>handleCertType(idx,e.target.value)} style={{width:"30%"}}><option value="">유형</option><option value="자격증">자격증</option><option value="어학점수">어학점수</option></Select>
                <Input list="cert-datalist" placeholder={c.type==="어학점수"?"TOEIC 900":"정보처리기사 1급"} value={c.value} onChange={e=>handleCertValue(idx,e.target.value)}/>
                <Input type="date" value={c.date||""} onChange={e=>handleCertDate(idx,e.target.value)} style={{width:"35%"}}/>
                <RemoveBtn type="button" onClick={(e)=>removeCert(idx, e)}>삭제</RemoveBtn>
              </ExpRow>
            ))}
            <AddBtn type="button" onClick={addCert}>+ 항목 추가</AddBtn>
          </Section>

          <Section>
            <SectionTitle>경험</SectionTitle>
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
            <AddBtn type="button" onClick={addExperience}>+ 경험 추가</AddBtn>
          </Section>

          <Section>
            <SectionTitle>관심 직무</SectionTitle>
            <DropdownCard>
              <DropdownHeader onClick={()=>setJobOpen(o=>!o)}>
                <span>{selectedJobs.length ? `${selectedJobs.length}개 선택됨` : "관심 직무 선택"}</span>
                <DropdownIcon open={jobOpen}><FaChevronDown/></DropdownIcon>
              </DropdownHeader>
              {jobOpen && (<DropdownBody>{jobNamesAll.map(job=>(<DropdownItem key={job} selected={selectedJobs.includes(job)}><input type="checkbox" checked={selectedJobs.includes(job)} onChange={()=>toggleJob(job)}/><span>{job}</span></DropdownItem>))}</DropdownBody>)}
              {selectedJobs.length>0 && (<TagWrap>{selectedJobs.map(job=><Tag key={job} onClick={()=>toggleJob(job)}>{job} ×</Tag>)}</TagWrap>)}
            </DropdownCard>
          </Section>
          
          <Section>
            <SectionTitle>기술 스택</SectionTitle>
            <SkillCard>
              {/* 카테고리 탭 */}
              <SkillCategoryTabs>
                {Object.keys(groupedSkills).map(category => (
                  <SkillCategoryTab
                    key={category}
                    type="button"
                    active={activeSearchCategory === category}
                    onClick={(e) => handleSkillCategoryChange(category, e)}
                  >
                    {category}
                  </SkillCategoryTab>
                ))}
              </SkillCategoryTabs>

              {/* 검색 입력 영역 */}
              <SkillSearchContainer>
                <SkillSearchWrapper>
                  <SearchIcon>
                    <FaSearch />
                  </SearchIcon>
                  <SkillSearchInput
                    type="text"
                    placeholder={`${activeSearchCategory} 검색...`}
                    value={skillSearchTerm}
                    onChange={handleSkillSearch}
                    onKeyPress={handleSkillSearchKeyPress}
                    onFocus={() => setShowAutoComplete(skillSearchTerm.length > 0)}
                  />
                </SkillSearchWrapper>
                
                {/* 상세 보기 버튼 */}
                <DetailViewButton
                  type="button"
                  onClick={() => setSkillSearchOpen(true)}
                  disabled={!skillSearchTerm.trim()}
                >
                  상세 보기
                </DetailViewButton>
              </SkillSearchContainer>

              {/* 자동완성 드롭다운 */}
              {showAutoComplete && autoCompleteSkills.length > 0 && (
                <AutoCompleteDropdown>
                  {autoCompleteSkills.map(skill => (
                    <AutoCompleteItem
                      key={skill.id}
                      onClick={() => handleSkillSelect(skill)}
                      selected={selectedSkills.some(s => s.name === skill.name)}
                    >
                      <span>{skill.name}</span>
                      {selectedSkills.some(s => s.name === skill.name) && (
                        <span className="selected">✓</span>
                      )}
                    </AutoCompleteItem>
                  ))}
                </AutoCompleteDropdown>
              )}

              {/* 선택된 기술 스택 표시 */}
              {selectedSkills.length > 0 && (
                <SelectedSkillsContainer>
                  <SelectedSkillsTitle>선택된 기술 스택</SelectedSkillsTitle>
                  {selectedSkills.map(skill => (
                    <SkillWithLevel key={skill.name}>
                      <SkillTag onClick={() => removeSkill(skill.name)}>
                        {skill.name} ×
                      </SkillTag>
                      <SkillLevelSelect
                        value={skill.level}
                        onChange={(e) => setSkillLevel(skill.name, e.target.value)}
                      >
                        <option value="">숙련도 선택</option>
                        {SKILL_LEVELS.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </SkillLevelSelect>
                    </SkillWithLevel>
                  ))}
                </SelectedSkillsContainer>
              )}
            </SkillCard>

            {/* 검색 결과 팝업 */}
            {skillSearchOpen && (
              <SkillSearchPopup>
                <SkillSearchPopupContent>
                  <SkillSearchPopupHeader>
                    <h3>{activeSearchCategory} 검색 결과</h3>
                    <CloseButton onClick={() => setSkillSearchOpen(false)}>×</CloseButton>
                  </SkillSearchPopupHeader>
                  
                  {skillSearchResults.length > 0 ? (
                    <SkillSearchPopupBody>
                      {skillSearchResults.map(skill => (
                        <SkillSearchPopupItem
                          key={skill.id}
                          onClick={() => handleSkillSelect(skill)}
                          selected={selectedSkills.some(s => s.name === skill.name)}
                        >
                          <span className="skill-name">{skill.name}</span>
                          {selectedSkills.some(s => s.name === skill.name) && (
                            <span className="selected-indicator">✓ 선택됨</span>
                          )}
                        </SkillSearchPopupItem>
                      ))}
                    </SkillSearchPopupBody>
                  ) : skillSearchTerm.length > 0 ? (
                    <SkillSearchPopupBody>
                      <NoResultsMessage>
                        "{skillSearchTerm}"에 대한 검색 결과가 없습니다.
                      </NoResultsMessage>
                    </SkillSearchPopupBody>
                  ) : null}
                </SkillSearchPopupContent>
              </SkillSearchPopup>
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
export const SectionTitle = styled.h3`font-size:1.1rem;font-weight:700;color:#ffa500;margin-bottom:1.2rem;padding-left:1.2rem;`;
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