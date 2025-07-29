/* ────────────── src/pages/MyProfile.jsx ────────────── */
import React, { useState, useEffect, useRef } from "react";
import styled, { css } from "styled-components";
import axios from "axios";
import { FaEdit, FaSave, FaTrash, FaPlus, FaChevronDown } from "react-icons/fa";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://192.168.101.51:8000";
const trimLines = (str = "") => str.split(/\n|\r/).map((l) => l.trim()).filter(Boolean);

// RegisterNext.jsx에서 가져온 상수들
const EXP_MAIN = ["인턴","부트캠프","프로젝트","대외활동"];
const EXP_SUB_ACTIVITY = ["동아리","학회","공모전"];
const SKILL_LEVELS = ["초급","중급","고급"];

// 어학 점수 문자열 <-> 객체 변환 헬퍼
const parseLanguageScoresToObject = (scores_str) => {
  if (!scores_str || typeof scores_str !== 'string') return null;
  try {
    return scores_str.split(',').reduce((acc, part) => {
      const [key, value] = part.split(':').map(s => s.trim());
      if (key && value) acc[key] = value;
      return acc;
    }, {});
  } catch { return null; }
};

const formatLanguageScoresToString = (scores_obj) => {
  if (!scores_obj || typeof scores_obj !== 'object') return "";
  return Object.entries(scores_obj).map(([k, v]) => `${k}: ${v}`).join(", ");
};

export default function MyProfile() {
  const defaultProfile = {
    email: "", nickname: "", name: "", phone_number: "", degree: "",
    education_status: "", career_type: "신입", career_years: "", university: "",
    major: "", gpa: "", certificateText: "", experienceText: "",
    desired_job: "", skillsText: "", language_score: "",
  };

  const [profile, setProfile] = useState(defaultProfile);
  const [edit, setEdit] = useState({});
  const [activeTab, setActiveTab] = useState("basic");
  const textRefs = useRef({});

  // RegisterNext.jsx에서 가져온 상태들
  const [experiences, setExperiences] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [jobNamesAll, setJobNamesAll] = useState([]);
  const [certListAll, setCertListAll] = useState([]);
  const [skillsAll, setSkillsAll] = useState([]);
  
  // 팝업 상태들
  const [jobOpen, setJobOpen] = useState(false);
  const [skillSearchOpen, setSkillSearchOpen] = useState(false);
  const [certSearchOpen, setCertSearchOpen] = useState(false);
  const [skillSearchTerm, setSkillSearchTerm] = useState("");
  const [certSearchTerm, setCertSearchTerm] = useState("");
  const [currentCertIndex, setCurrentCertIndex] = useState(0);
  const [activeSearchCategory, setActiveSearchCategory] = useState("전체");
  const [modalFilterCategory, setModalFilterCategory] = useState("전체");

  const toggleEdit = (field) => {
    setEdit((p) => {
      const newEdit = { ...p, [field]: !p[field] };
      
      // 편집 모드 시작 시 빈 배열에 기본 항목 추가
      if (newEdit[field]) {
        if (field === "certificateText" && certificates.length === 0) {
          setCertificates([{ type: "", value: "", date: "" }]);
        }
        if (field === "experienceText" && experiences.length === 0) {
          setExperiences([{ type: "", subType: "", name: "", period: "", description: "", award: "" }]);
        }
      }
      
      return newEdit;
    });
  };

  // RegisterNext.jsx에서 가져온 핸들러 함수들
  const handleExpChange = (i,k,v) => setExperiences(p=>p.map((e,idx)=>idx===i?{...e,[k]:v}:e));
  const addExperience = (e) => {
    e.preventDefault();
    setExperiences(p=>[...p,{ type:"",subType:"",name:"",period:"",description:"",award:"" }]);
  };
  const removeExperience = (i, e) => {
    e.preventDefault();
    setExperiences(p=>p.filter((_,idx)=>idx!==i));
  };
  
  const handleCertType = (i,v)=>setCertificates(p=>p.map((c,idx)=>idx===i?{...c,type:v,value:""}:c));
  const handleCertValue = (i,v)=>setCertificates(p=>p.map((c,idx)=>idx===i?{...c,value:v}:c));
  const handleCertDate = (i,v)=>setCertificates(p=>p.map((c,idx)=>idx===i?{...c,date:v}:c));
  const addCert = (e) => {
    e.preventDefault();
    setCertificates(p=>[...p,{type:"",value:"",date:""}]);
  };
  const removeCert = (i, e) => {
    e.preventDefault();
    setCertificates(p=>p.filter((_,idx)=>idx!==i));
  };
  
  const toggleJob = name => setSelectedJobs(p=>p.includes(name)?p.filter(j=>j!==name):[...p,name]);
  const removeSkill = name => setSelectedSkills(p=>p.filter(s=>s.name!==name));
  const setSkillLevel = (name,lvl)=>setSelectedSkills(p=>p.map(s=>s.name===name?{...s,level:lvl}:s));
  
  const handleSkillSelect = (skill) => {
    if (selectedSkills.some(s => s.name === skill.name)) {
      removeSkill(skill.name);
    } else {
      setSelectedSkills(prev => [...prev, { name: skill.name, level: "" }]);
    }
  };

  // 데이터 로딩
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("accessToken") || "";
      const headers = token ? { Authorization:`Bearer ${token}` } : {};
      try {
        const [jobs, certs, skills] = await Promise.all([
          axios.get(`${BASE_URL}/job-role/job-names`, { headers }),
          axios.get(`${BASE_URL}/certificates/`, { headers }),
          axios.get(`${BASE_URL}/skills/`, { headers }),
        ]);
        setJobNamesAll((jobs.data || []).map(v=>v.name ?? v).filter(Boolean));
        setCertListAll((certs.data || []).map(v=>v.name ?? v).filter(Boolean));
        setSkillsAll(skills.data || []);
      } catch (err) { 
        console.error("목록 로딩 실패:", err.response?.status, err.response?.data); 
      }
    })();
  }, []);

  useEffect(() => {
    const fetchResume = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setProfile(defaultProfile);
        return;
      }

      try {
        const { data } = await axios.get(`${BASE_URL}/users/me/resume`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("✅ [MyProfile] 서버에서 받은 데이터:", data);

        const certificateText = (data.certificates || []).map(c => `${c.certificate_name || ''} (${c.acquired_date || ''})`).join("\n");
        const skillsText = (data.skills || []).map(s => `${s.skill_name || ''} – ${s.proficiency || ''}`).join(", ");
        const experienceText = (data.experience || []).map(e => {
            const [main, sub] = (e.type || "").split("-");
            const title = sub ? `[${main}-${sub}]` : `[${main}]`;
            return `${title} ${e.name || ''} | ${e.period || ''}\n${e.description || ''}`;
        }).join("\n\n");
        
        const workingYear = data.working_year;
        const careerType = (workingYear === '신입' || !workingYear || workingYear === 0 || workingYear === '0') ? "신입" : "경력";

        setProfile({
          email: data.email || "",
          nickname: data.nickname || "",
          name: data.name || "",
          phone_number: data.phone_number || "",
          degree: data.degree || "",
          education_status: data.education_status || "",
          career_type: careerType,
          career_years: careerType === "경력" ? String(workingYear) : "",
          university: data.university || "",
          major: data.major || "",
          gpa: data.gpa || "",
          desired_job: Array.isArray(data.desired_job) ? data.desired_job.join(", ") : (data.desired_job || ""),
          language_score: formatLanguageScoresToString(data.language_score),
          certificateText,
          experienceText,
          skillsText,
        });

        // 복잡한 데이터들을 상태로 변환
        const serverCertificates = data.certificates || [];
        const serverExperiences = data.experience || [];
        const serverSkills = data.skills || [];
        
        setCertificates(serverCertificates.length > 0 ? serverCertificates.map(c => ({
          type: "자격증",
          value: c.certificate_name || "",
          date: c.acquired_date || ""
        })) : []);
        
        setExperiences(serverExperiences.length > 0 ? serverExperiences.map(e => {
          const [main, sub] = (e.type || "").split("-");
          return {
            type: main || "",
            subType: sub || "",
            name: e.name || "",
            period: e.period || "",
            description: e.description || "",
            award: ""
          };
        }) : []);
        
        setSelectedJobs(Array.isArray(data.desired_job) ? data.desired_job : []);
        setSelectedSkills(serverSkills.length > 0 ? serverSkills.map(s => ({
          name: s.skill_name || "",
          level: s.proficiency || ""
        })) : []);

      } catch (err) {
        console.error("❌ [MyProfile] 프로필 정보 불러오기 실패:", err);
        setProfile(defaultProfile);
      }
    };

    fetchResume();
  }, []);

  const autoResize = (field) => {
    const el = textRefs.current[field];
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  };

  const onChange = (k, v) => {
    setProfile(p => ({ ...p, [k]: v }));
  };

  const triggerSimilarityCalculation = async (token) => {
    try {
      await axios.post(`${BASE_URL}/similarity/compute`, {}, { headers: { Authorization: `Bearer ${token}` } });
      console.log("✅ 유사도 계산 요청 성공.");
    } catch (err) {
      console.error("❌ 유사도 계산 요청 실패:", err);
    }
  };

  const saveAll = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return alert("다시 로그인해주세요.");

    // 편집 모드인 특별한 필드들의 데이터를 profile에 업데이트
    const updatedProfile = { ...profile };
    
    if (edit.certificateText) {
      updatedProfile.certificateText = certificates.map(c => 
        c.value && c.date ? `${c.value} (${c.date})` : c.value
      ).filter(Boolean).join("\n");
    }
    
    if (edit.experienceText) {
      updatedProfile.experienceText = experiences.map(e => {
        if (!e.type || !e.name) return "";
        const title = e.subType ? `[${e.type}-${e.subType}]` : `[${e.type}]`;
        return `${title} ${e.name} | ${e.period}\n${e.description}`;
      }).filter(Boolean).join("\n\n");
    }
    
    if (edit.desired_job) {
      updatedProfile.desired_job = selectedJobs.join(", ");
    }
    
    if (edit.skillsText) {
      updatedProfile.skillsText = selectedSkills.map(s => 
        `${s.name} – ${s.level || '초급'}`
      ).join(", ");
    }

    const certificateArr = trimLines(updatedProfile.certificateText).map(line => {
      const match = line.match(/^(.*)\s+\((\d{4}[-\.].*)\)$/);
      return match ? { certificate_name: match[1].trim(), acquired_date: match[2].trim() } : { certificate_name: line.trim(), acquired_date: null };
    });

    const expArr = updatedProfile.experienceText.split(/\n\n+/).map(block => {
      const [head, ...body] = block.split("\n");
      if (!head) return null;
      const [title, rest] = head.split("|");
      const type = title.match(/\[(.*)\]/)?.[1] || "";
      return { type: type || "기타", name: rest ? rest.trim() : title.replace(/\[.*\]/, "").trim(), period: body[0] || "", description: body.slice(1).join("\n") || "" };
    }).filter(Boolean);

    const payload = {
      university: updatedProfile.university || null,
      major: updatedProfile.major || null,
      gpa: updatedProfile.gpa ? Number(updatedProfile.gpa) : null,
      education_status: updatedProfile.education_status || null,
      degree: updatedProfile.degree || null,
      desired_job: edit.desired_job ? selectedJobs : updatedProfile.desired_job.split(',').map(s => s.trim()).filter(Boolean),
      working_year: updatedProfile.career_type === "경력" ? String(updatedProfile.career_years || "") : "신입",
      language_score: parseLanguageScoresToObject(updatedProfile.language_score),
      skills: edit.skillsText ? selectedSkills.map(s => ({
        skill_name: s.name,
        proficiency: s.level || "초급"
      })) : [],
      certificates: edit.certificateText ? certificates.filter(c => c.value && c.date).map(c => ({
        certificate_name: c.value,
        acquired_date: c.date
      })) : certificateArr,
      experience: edit.experienceText ? experiences.filter(e => e.type && e.name).map(({ type, subType, name, period, description, award }) => ({
        type: subType ? `${type}-${subType}` : type, 
        name, 
        period,
        description: subType === "공모전" && award ? `${description}\n수상: ${award}` : description
      })) : expArr,
    };

    try {
      await axios.put(`${BASE_URL}/users/me/resume`, payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      alert("✅ 저장되었습니다!");
      
      // 프로필 텍스트 업데이트
      setProfile(updatedProfile);
      
      // 편집 모드 해제
      setEdit({});
      
      await triggerSimilarityCalculation(token);
    } catch (err) {
      console.error("❌ 저장 실패:", err);
      alert("저장 실패: " + (err.response?.data?.detail || err.message));
    }
  };

  // 내 이력서용 2개씩 배치 필드 컴포넌트
  const ResumeField = ({ label, keyName, type = "text", placeholder = "" }) => {
    return (
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Label>{label}</Label>
          <FieldContent>
            {edit[keyName] ? (
              <Input as={type === "textarea" ? "textarea" : "input"} ref={el => (textRefs.current[keyName] = el)}
                    value={profile[keyName] || ''} placeholder={placeholder} rows={type === "textarea" ? 2 : undefined}
                onInput={() => autoResize(keyName)} onChange={e => onChange(keyName, e.target.value)} autoFocus
              />
            ) : (
                  <Value>{profile[keyName] || ''}</Value>
            )}
            <IconBtn onClick={() => toggleEdit(keyName)}>{edit[keyName] ? <FaSave /> : <FaEdit />}</IconBtn>
          </FieldContent>
        </div>
      </div>
    );
  };

  const Field = ({ label, keyName, type = "text", placeholder = "" }) => {
    // 특별한 필드들에 대한 처리
    if (edit[keyName]) {
      if (keyName === "certificateText") {
        return <CertificateSection />;
      }
      if (keyName === "experienceText") {
        return <ExperienceSection />;
      }
      if (keyName === "desired_job") {
        return <JobSection />;
      }
      if (keyName === "skillsText") {
        return <SkillSection />;
      }
    }

    return (
    <FieldRow>
      <Label>{label}</Label>
        <FieldContent>
      {edit[keyName] ? (
        <Input as={type === "textarea" ? "textarea" : "input"} ref={el => (textRefs.current[keyName] = el)}
              value={profile[keyName] || ''} placeholder={placeholder} rows={type === "textarea" ? 2 : undefined}
          onInput={() => autoResize(keyName)} onChange={e => onChange(keyName, e.target.value)} autoFocus
        />
      ) : (
            <Value>{profile[keyName] || ''}</Value>
      )}
      <IconBtn onClick={() => toggleEdit(keyName)}>{edit[keyName] ? <FaSave /> : <FaEdit />}</IconBtn>
        </FieldContent>
      </FieldRow>
    );
  };

  // 자격증 섹션 컴포넌트
  const CertificateSection = () => (
    <FieldRow>
      <Label>자격증</Label>
      <FieldContent style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        {certificates.length === 0 ? (
          <TechGuideContainer>
            <TechGuideText>자격증을 추가하려면 아래 버튼을 클릭하세요</TechGuideText>
          </TechGuideContainer>
        ) : (
          certificates.map((c,idx)=>(
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
          ))
        )}
        <CertificateAddBtn type="button" onClick={addCert}>
          <span>+ 자격증/어학 추가</span>
        </CertificateAddBtn>
        <IconBtn onClick={() => toggleEdit("certificateText")} style={{ alignSelf: 'flex-end', marginTop: '1rem' }}>
          <FaSave />
        </IconBtn>
      </FieldContent>
    </FieldRow>
  );

  // 경험 섹션 컴포넌트
  const ExperienceSection = () => (
    <FieldRow>
      <Label>경험</Label>
      <FieldContent style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        {experiences.length === 0 ? (
          <TechGuideContainer>
            <TechGuideText>경험을 추가하려면 아래 버튼을 클릭하세요</TechGuideText>
          </TechGuideContainer>
        ) : (
          experiences.map((exp,idx)=>(
            <ExpCard key={idx}>
              <Select value={exp.type} onChange={e=>handleExpChange(idx,"type",e.target.value)}>
                <option value="">경험 종류 선택</option>
                {EXP_MAIN.map(t=><option key={t} value={t}>{t}</option>)}
              </Select>
              {exp.type==="대외활동" && (
                <Select value={exp.subType} onChange={e=>handleExpChange(idx,"subType",e.target.value)} style={{marginTop:"0.5rem"}}>
                  <option value="">세부 유형 선택</option>
                  {EXP_SUB_ACTIVITY.map(s=><option key={s} value={s}>{s}</option>)}
                </Select>
              )}
              <StyledInput placeholder={exp.type==="인턴"?"기업명":exp.type==="부트캠프"?"과정명":exp.type==="프로젝트"?"프로젝트명":exp.subType==="동아리"?"동아리명":exp.subType==="학회"?"학회명":exp.subType==="공모전"?"공모전명":"이름"} 
                value={exp.name} onChange={e=>handleExpChange(idx,"name",e.target.value)} style={{marginTop:"0.5rem"}}/>
              <StyledInput placeholder="기간: 2023-01 ~ 2023-06" value={exp.period} onChange={e=>handleExpChange(idx,"period",e.target.value)} style={{marginTop:"0.5rem"}}/>
              <TextArea placeholder={exp.type==="인턴"?"주요 업무":exp.type==="부트캠프"?"과정 내용":exp.type==="프로젝트"?"프로젝트 설명":exp.subType==="동아리"||exp.subType==="학회"?"활동 내용":exp.subType==="공모전"?"담당 업무":"설명"} 
                value={exp.description} onChange={e=>handleExpChange(idx,"description",e.target.value)} style={{marginTop:"0.5rem"}}/>
              {exp.subType==="공모전" && (
                <StyledInput placeholder="수상 이력 (예: 최우수상)" value={exp.award} onChange={e=>handleExpChange(idx,"award",e.target.value)} style={{marginTop:"0.5rem"}}/>
              )}
              {experiences.length>1 && <RemoveBtn type="button" onClick={(e)=>removeExperience(idx, e)}>경험 삭제</RemoveBtn>}
            </ExpCard>
          ))
        )}
        <ExperienceAddBtn type="button" onClick={addExperience}>
          <span>+ 경험 추가</span>
        </ExperienceAddBtn>
        <IconBtn onClick={() => toggleEdit("experienceText")} style={{ alignSelf: 'flex-end', marginTop: '1rem' }}>
          <FaSave />
        </IconBtn>
      </FieldContent>
    </FieldRow>
  );

  // 관심 직무 섹션 컴포넌트  
  const JobSection = () => (
    <FieldRow>
      <Label>관심 직무</Label>
      <FieldContent style={{ flexDirection: 'column', alignItems: 'stretch' }}>
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
        <IconBtn onClick={() => toggleEdit("desired_job")} style={{ alignSelf: 'flex-end', marginTop: '1rem' }}>
          <FaSave />
        </IconBtn>
      </FieldContent>
    </FieldRow>
  );

  // 기술 스택 섹션 컴포넌트
  const SkillSection = () => (
    <FieldRow>
      <Label>기술 스택</Label>
      <FieldContent style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <TechStackCard>
          {selectedSkills.length === 0 && (
            <TechGuideContainer>
              <TechGuideText>기술 스택을 추가하려면 아래 버튼을 클릭하세요</TechGuideText>
            </TechGuideContainer>
          )}

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
          
          <TechSearchButton type="button" onClick={() => setSkillSearchOpen(true)}>
            기술 스택 추가
          </TechSearchButton>
        </TechStackCard>
        <IconBtn onClick={() => toggleEdit("skillsText")} style={{ alignSelf: 'flex-end', marginTop: '1rem' }}>
          <FaSave />
        </IconBtn>
      </FieldContent>
    </FieldRow>
  );

  return (
    <Wrapper>
      <Card>
        {/* 탭 버튼 */}
        <TabContainer>
          <TabButton 
            $active={activeTab === "basic"} 
            onClick={() => setActiveTab("basic")}
          >
            기본 정보
          </TabButton>
          <TabButton 
            $active={activeTab === "resume"} 
            onClick={() => setActiveTab("resume")}
          >
            내 이력서
          </TabButton>
        </TabContainer>

        {/* 탭 컨텐츠 */}
        {activeTab === "basic" && (
        <FormArea>
          <SectionTitle>👤 기본 정보</SectionTitle>
          <SectionContainer>
            <Field label="이메일" keyName="email" />
            <Field label="닉네임" keyName="nickname" />
            <Field label="이름" keyName="name" />
            <Field label="전화번호" keyName="phone_number" />
          </SectionContainer>
        </FormArea>
        )}

        {activeTab === "resume" && (
          <FormArea>
            {/* 학력 정보 섹션 */}
            <SectionTitle>🎓 학력 정보</SectionTitle>
            <SectionContainer>
              <FieldRow className="two-column">
                <ResumeField label="최종 학력" keyName="degree" />
                <ResumeField label="학적 상태" keyName="education_status" />
              </FieldRow>
              <FieldRow className="two-column">
                <ResumeField label="구분" keyName="career_type" />
                {profile.career_type === "경력" ? (
                  <ResumeField label="경력 년차" keyName="career_years" />
                ) : (
                  <div style={{ flex: 1 }}></div>
                )}
              </FieldRow>
              <FieldRow className="two-column">
                <ResumeField label="학교명" keyName="university" />
                <ResumeField label="전공" keyName="major" />
              </FieldRow>
              <FieldRow className="two-column">
                <ResumeField label="학점" keyName="gpa" placeholder="4.5 만점 기준" />
                <div style={{ flex: 1 }}></div>
              </FieldRow>
            </SectionContainer>

            {/* 자격증 섹션 */}
            <SectionTitle>📜 자격증</SectionTitle>
            <SectionContainer>
              <Field label="자격증" keyName="certificateText" type="textarea" placeholder="자격증명 (취득일자) 형식으로 입력하세요." />
            </SectionContainer>

            {/* 경험 섹션 */}
            <SectionTitle>💼 경험</SectionTitle>
            <SectionContainer>
              <Field label="경험" keyName="experienceText" type="textarea" placeholder="[경험 종류] 경험명 | 기간&#10;주요 내용 순으로 입력하세요." />
            </SectionContainer>

            {/* 관심 직무 섹션 */}
            <SectionTitle>🎯 관심 직무</SectionTitle>
            <SectionContainer>
              <Field label="관심 직무" keyName="desired_job" type="textarea" placeholder="콤마(,)로 구분하여 여러 개 입력 가능합니다." />
            </SectionContainer>

            {/* 기술 스택 섹션 */}
            <SectionTitle>⚡ 기술 스택</SectionTitle>
            <SectionContainer>
              <Field label="기술 스택" keyName="skillsText" type="textarea" placeholder="보유 기술 스택을 입력하세요." />
            </SectionContainer>

            {/* 어학 점수 섹션 */}
            <SectionTitle>🌍 어학 점수</SectionTitle>
            <SectionContainer>
              <Field label="어학 점수" keyName="language_score" type="textarea" placeholder="시험명:점수 형식으로 입력하세요. (예: TOEIC:950)" />
            </SectionContainer>
          </FormArea>
        )}

        <SaveAllBtn onClick={saveAll}>전체 저장</SaveAllBtn>

        {/* 기술 스택 검색 모달 */}
        {skillSearchOpen && (
          <TechSearchModal>
            <TechModalContent>
              <TechModalHeader>
                <TechModalTitle>기술 스택 선택</TechModalTitle>
                <TechModalHeaderRight>
                  <TechModalSearchInput
                    type="text"
                    placeholder="기술명으로 검색..."
                    value={skillSearchTerm}
                    onChange={(e) => setSkillSearchTerm(e.target.value)}
                  />
                  <TechModalClose onClick={() => setSkillSearchOpen(false)}>×</TechModalClose>
                </TechModalHeaderRight>
              </TechModalHeader>
              
              <TechModalBody>
                <TechResultsGrid>
                  {skillsAll
                    .filter(skill => skill.name.toLowerCase().includes(skillSearchTerm.toLowerCase()))
                    .map(skill => (
                      <TechCategoryItem
                        key={skill.id}
                        onClick={() => handleSkillSelect(skill)}
                        selected={selectedSkills.some(s => s.name === skill.name)}
                      >
                        <TechResultName>{skill.name}</TechResultName>
                        <TechResultCategory>{skill.category}</TechResultCategory>
                        {selectedSkills.some(s => s.name === skill.name) && (
                          <TechResultSelected>✓ 선택됨</TechResultSelected>
                        )}
                      </TechCategoryItem>
                    ))}
                </TechResultsGrid>
              </TechModalBody>
            </TechModalContent>
          </TechSearchModal>
        )}
      </Card>
    </Wrapper>
  );
}

/* 💅 styled-components (RegisterNext.jsx 스타일 적용) */
const Wrapper = styled.div`
  display: flex; 
  justify-content: center; 
  align-items: flex-start;
  padding: 1rem 2rem;
  min-height: 100vh;
`;

const Card = styled.div`
  width: 100%; 
  max-width: 1400px;
  background: #ffffff;
  color: #333333;
  border-radius: 1.8rem; 
  padding: 2rem;
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.06);
  min-height: 95vh;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.09);
  }
`;

const FormArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffa500;
  margin: 0 0 0.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
`;

const SectionContainer = styled.div`
  background: #fafafa;
  border-radius: 0.8rem;
  padding: 1.2rem;
  border: 1px solid #e8e8e8;
`;

const FieldRow = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;
  gap: 2rem;
  
  &:last-child {
    border-bottom: none;
  }
  
  /* 2개씩 배치할 때 사용할 스타일 */
  &.two-column {
    display: flex;
    gap: 2rem;
    
    > div {
      flex: 1;
    }
  }
  
  /* 섹션 컨테이너 내부에서 사용할 때 */
  ${SectionContainer} & {
    border-bottom: 1px solid #e8e8e8;
    padding: 0.8rem 0;
    
    &:last-child {
      border-bottom: none;
    }
  }
`;

const Label = styled.div`
  width: 120px;
  font-weight: 600; 
  color: #ffa500;
  font-size: 0.95rem;
  flex-shrink: 0;
`;

const FieldContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Value = styled.div`
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 0.65rem;
  min-height: 20px;
  line-height: 1.4;
  transition: border-color 0.25s;
  
  &:empty::before {
    content: "—";
    color: #aaaaaa;
  }
`;

const Input = styled.textarea.attrs(({ as }) => ({ as }))`
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  background: #ffffff;
  border: 2px solid #ffa500;
  border-radius: 0.65rem;
  min-height: 20px;
  line-height: 1.4;
  font-family: inherit;
  transition: border-color 0.25s;
  
  ${({ as }) => as === "textarea" && css`
    resize: vertical;
    min-height: 60px;
  `}

  &:focus {
    outline: none;
    border-color: #ffb13d;
  }

  &::placeholder {
    color: #aaaaaa;
    font-style: italic;
  }
`;

const IconBtn = styled.button`
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: #ffffff;
  border-radius: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ffa500;
  font-size: 0.8rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #ffa500;
    color: #ffffff;
    border-color: #ffa500;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 165, 0, 0.3);
  }
`;

const SaveAllBtn = styled.button`
  margin-top: 0.8rem;
  padding: 0.95rem 2.6rem;
  background: #ffa500;
  color: #ffffff;
  border: none;
  border-radius: 0.8rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  align-self: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: #ffb13d;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 165, 0, 0.3);
  }
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
`;

const TabButton = styled.button`
  padding: 0.875rem 0;
  margin-right: 2rem;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ $active }) => ($active ? "#ffa500" : "#aaaaaa")};
  background: transparent;
  border: none;
  border-bottom: ${({ $active }) => ($active ? "2px solid #ffa500" : "2px solid transparent")};
  cursor: pointer;
  transition: all 0.25s ease;
  
  &:hover {
    color: #ffa500;
  }
  
  &:focus {
    outline: none;
  }
`;

// RegisterNext.jsx에서 가져온 스타일드 컴포넌트들
const Select = styled.select`
  width: 100%;
  padding: 0.72rem 0.85rem;
  border: 1px solid #ccc;
  border-radius: 0.65rem;
  font-size: 0.9rem;
  background: #ffffff;
  transition: border-color 0.25s;
  
  &:focus {
    border-color: #ffa500;
    outline: none;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.72rem 0.85rem;
  border: 1px solid #ccc;
  border-radius: 0.65rem;
  font-size: 0.9rem;
  background: #ffffff;
  resize: vertical;
  min-height: 70px;
  transition: border-color 0.25s;
  
  &:focus {
    border-color: #ffa500;
    outline: none;
  }
`;

const CertificateCard = styled.div`
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 1rem;
  padding: 1rem 1.3rem;
  margin-bottom: 0.8rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.25s;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
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
  padding: 0.72rem 0.85rem;
  border: 1px solid #ccc;
  border-radius: 0.65rem;
  font-size: 0.9rem;
  background: #fff;
  transition: border-color 0.25s;
  
  &:focus {
    border-color: #ffa500;
    outline: none;
  }
`;

const CertificateRemoveBtn = styled.button`
  background: #fcecec;
  color: #e53935;
  border: none;
  border-radius: 0.65rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e53935;
    color: #fff;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(229, 57, 53, 0.3);
  }
`;

const CertificateInputRow = styled.div`
  display: flex;
  gap: 0.8rem;
  align-items: flex-end;
`;

const CertificateInputWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const CertificateInputLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: #555;
`;

const CertificateInput = styled.input`
  width: 100%;
  padding: 0.72rem 0.85rem;
  border: 1px solid #ccc;
  border-radius: 0.65rem;
  font-size: 0.9rem;
  background: #fff;
  transition: border-color 0.25s;
  
  &:focus {
    border-color: #ffa500;
    outline: none;
  }
`;

const DateInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 120px;
`;

const DateInputLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: #555;
`;

const CertificateDateInput = styled.input`
  padding: 0.72rem 0.85rem;
  border: 1px solid #ccc;
  border-radius: 0.65rem;
  font-size: 0.9rem;
  background: #fff;
  transition: border-color 0.25s;
  
  &:focus {
    border-color: #ffa500;
    outline: none;
  }
`;

const CertificateAddBtn = styled.button`
  width: 100%;
  padding: 0.6rem 1.25rem;
  background: #fff7ed;
  color: #ffa500;
  border: none;
  border-radius: 0.65rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #ffa500;
    color: #fff;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 165, 0, 0.3);
  }
`;

const ExpCard = styled.div`
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 1rem;
  padding: 1rem 1.3rem;
  margin-bottom: 1.3rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.25s;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
`;

const RemoveBtn = styled.button`
  background: #fcecec;
  color: #e53935;
  border: none;
  border-radius: 0.65rem;
  padding: 0.5rem 1rem;
  margin-top: 0.6rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e53935;
    color: #fff;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(229, 57, 53, 0.3);
  }
`;

const ExperienceAddBtn = styled.button`
  width: 100%;
  padding: 0.6rem 1.25rem;
  background: #fff7ed;
  color: #ffa500;
  border: none;
  border-radius: 0.65rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #ffa500;
    color: #fff;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 165, 0, 0.3);
  }
`;

const JobCard = styled.div`
  background: #fff;
  border-radius: 1.1rem;
  padding: 1rem 1.6rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.3s;
  
  &:hover {
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06);
  }
`;

const JobDropdownHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #ffa500;
  cursor: pointer;
  padding: 0.5rem 0;
`;

const JobHeaderText = styled.span`
  font-size: 0.9rem;
  color: #ffa500;
  font-weight: 600;
`;

const JobDropdownIcon = styled.div`
  transition: transform 0.3s ease;
  transform: ${({open}) => open ? "rotate(180deg)" : "rotate(0deg)"};
  color: #ffa500;
`;

const JobDropdownBody = styled.div`
  margin-top: 0.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 0.45rem;
  max-height: ${({open}) => open ? "400px" : "0px"};
  opacity: ${({open}) => open ? 1 : 0};
  overflow: hidden;
  transition: all 0.3s ease;
`;

const JobGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.6rem;
  max-height: 300px;
  overflow-y: auto;
`;

const JobItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.55rem;
  border-radius: 0.55rem;
  border: 1.5px solid ${({selected}) => selected ? "#ffa500" : "#dcdcdc"};
  background: ${({selected}) => selected ? "#ffa50022" : "transparent"};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    background: ${({selected}) => selected ? "#ffa50033" : "#f5f5f5"};
  }
`;

const JobCheckbox = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 2px solid ${({checked}) => checked ? "#ffa500" : "#ccc"};
  background-color: ${({checked}) => checked ? "#ffa500" : "transparent"};
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
  color: #333;
`;

const SelectedJobsContainer = styled.div`
  margin-top: 0.8rem;
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
  gap: 0.55rem;
`;

const JobTag = styled.div`
  background: #ffa500;
  color: #fff;
  border-radius: 1.2rem;
  padding: 0.34rem 1rem;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.18s ease;
  
  &:hover {
    background: #ffb13d;
    transform: scale(0.95);
  }
`;

const TechStackCard = styled.div`
  background: #fff;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const TechGuideContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: #f8f9fa;
  border: 1px dashed #d0d0d0;
  border-radius: 0.6rem;
  margin-bottom: 1rem;
`;

const TechGuideText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
`;

const SelectedTechContainer = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 0.8rem;
  border: 1px solid #eee;
`;

const SelectedTechHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
`;

const SelectedTechTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 0.8rem;
  border-left: 3px solid #ffa500;
  padding-left: 0.8rem;
  margin: 0;
`;

const SelectedTechCount = styled.span`
  background: #ffa500;
  color: #fff;
  padding: 0.2rem 0.6rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
`;

const TechSkillsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  align-items: center;
`;

const TechSkillItem = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  padding: 0.8rem;
  width: 80%;
`;

const TechSkillInfo = styled.div`
  display: flex;
  align-items: center;
  width: 80%;
`;

const TechSkillNameContainer = styled.div`
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0.8rem;
  
  &:hover {
    background-color: #ffa500;
    color: #fff;
  }
`;

const TechSkillNameText = styled.span`
  flex: 1;
  text-align: center;
`;

const TechSkillRemove = styled.button`
  background: none;
  border: none;
  color: inherit;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  border-radius: 50%;
  margin-left: 0.5rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const TechSkillLevel = styled.select`
  flex: 1;
  padding: 0.6rem 1rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  background: #fff;
  color: #333;
  border: 1px solid #ccc;
  
  &:focus {
    border-color: #ffa500;
    outline: none;
  }
`;

const TechSearchButton = styled.button`
  width: 100%;
  padding: 0.6rem 1.25rem;
  background: #fff7ed;
  color: #ffa500;
  border: none;
  border-radius: 0.65rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #ffa500;
    color: #fff;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 165, 0, 0.3);
  }
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.72rem 0.85rem;
  border: 1px solid #ccc;
  border-radius: 0.65rem;
  font-size: 0.9rem;
  background: #ffffff;
  transition: border-color 0.25s;
  
  &:focus {
    border-color: #ffa500;
    outline: none;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const TechSearchModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const TechModalContent = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TechModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #ffa500;
  color: #fff;
  border-bottom: 1px solid #e0e0e0;
`;

const TechModalTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: #fff;
  font-weight: 600;
`;

const TechModalHeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const TechModalSearchInput = styled.input`
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 0.65rem;
  font-size: 0.9rem;
  width: 200px;
  transition: box-shadow 0.25s;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
  }
`;

const TechModalClose = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #fff;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.7;
  }
`;

const TechModalBody = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
`;

const TechResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 0.8rem;
`;

const TechCategoryItem = styled.div`
  background: ${({ selected }) => selected ? "#fff7ed" : "#fff"};
  border: 1px solid ${({ selected }) => selected ? "#ffa500" : "#e0e0e0"};
  border-radius: 0.65rem;
  padding: 0.8rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  transition: all 0.2s ease;

  &:hover {
    background: #fff7ed;
    border-color: #ffa500;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 165, 0, 0.15);
  }
`;

const TechResultName = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
`;

const TechResultCategory = styled.span`
  font-size: 0.75rem;
  color: #666;
  background: #f0f0f0;
  padding: 0.2rem 0.5rem;
  border-radius: 0.3rem;
`;

const TechResultSelected = styled.span`
  font-size: 0.75rem;
  color: #ffa500;
  font-weight: 600;
`;