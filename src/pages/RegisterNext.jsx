import styled from "styled-components";
import React, { useState } from "react";
import axios from "axios";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";

// --- 상수 (그대로) ---
const DEGREE_OPTIONS = [
  { value: "", label: "선택" },
  { value: "고등학교", label: "고등학교" },
  { value: "대학교2", label: "대학교(2년제)" },
  { value: "대학교4", label: "대학교(4년제)" },
  { value: "대학원", label: "대학원" }
];

const DEGREE_MAP = { "고등학교": "고졸", "대학교2": "학사", "대학교4": "학사", "대학원": "석사" };

const EDU_STATUS_OPTIONS = {
  고등학교: [{ value: "졸업", label: "졸업" }],
  대학교2: [
    { value: "재학", label: "재학" },
    { value: "휴학", label: "휴학" },
    { value: "졸업", label: "졸업" }
  ],
  대학교4: [
    { value: "재학", label: "재학" },
    { value: "휴학", label: "휴학" },
    { value: "졸업", label: "졸업" }
  ],
  대학원: [
    { value: "재학", label: "재학" },
    { value: "휴학", label: "휴학" },
    { value: "졸업", label: "졸업" }
  ]
};

const JOB_OPTIONS = [
  "프론트엔드 개발자", "백엔드 개발자", "데이터 분석가", "AI 엔지니어",
  "UX/UI 디자이너", "PM/PO", "모바일 앱 개발자", "DevOps 엔지니어",
  "게임 개발자", "보안 전문가"
];

const SKILL_CATEGORIES = [
  { title: "언어", key: "언어", options: ["C", "C++", "C#", "Java", "Python", "Ruby", "JavaScript"] },
  { title: "프레임워크", key: "프레임워크", options: ["ReactJS", "Node.js", "TypeScript", "Vue.js", "jQuery", "Flutter"] },
  { title: "협업툴", key: "협업툴", options: ["Git", "Slack", "Jira", "Notion", "Trello", "Figma"] }
];

export default function ResumeEdit() {
  // --- 상태 훅 (기존 그대로) ---
  const [resume, setResume] = useState({
    degree: "",
    university: "",
    major: "",
    gpa: "",
    education_status: "",
    career_type: "",     // 👈 추가
    career_years: "", 
    desired_job: "",
    language_score: "",
    skills: [],
    certificate_ids: []
  });
  const [codingTest, setCodingTest] = useState({ platform: "", score: "" });
  const isHighSchoolGraduate = resume.degree === "고등학교" && resume.education_status === "졸업";
  const [certificates, setCertificates] = useState([{ type: "", value: "" }]);
  const [jobOpen, setJobOpen] = useState(true);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [skills, setSkills] = useState({ 언어: [], 프레임워크: [], 협업툴: [] });
  const [skillLevels, setSkillLevels] = useState({ 언어: {}, 프레임워크: {}, 협업툴: {} });
  const [isFolded, setIsFolded] = useState({ 언어: false, 프레임워크: false, 협업툴: false });

  // 학력 select
  const handleDegreeChange = e => {
    setResume(prev => ({
      ...prev,
      degree: e.target.value,
      education_status: ""
    }));
  };
  const handleEduStatusChange = e => {
    setResume(prev => ({
      ...prev,
      education_status: e.target.value
    }));
  };

  // 나머지 인풋
  const handleChange = e => {
    const { name, value } = e.target;
    setResume(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 자격증/수상/어학
  const handleCertType = (idx, v) => {
    const arr = [...certificates];
    arr[idx].type = v; arr[idx].value = "";
    setCertificates(arr);
  };
  const handleCertValue = (idx, v) => {
    const arr = [...certificates];
    arr[idx].value = v;
    setCertificates(arr);
  };
  const addCert = () => setCertificates([...certificates, { type: "", value: "" }]);
  const removeCert = idx => setCertificates(certificates.filter((_, i) => i !== idx));

  // 관심직무
  const toggleJob = job =>
    setSelectedJobs(prev =>
      prev.includes(job) ? prev.filter(j => j !== job) : [...prev, job]
    );

  // 기술스택
  const toggleSkill = (cat, skill) => {
    setSkills(prev => ({
      ...prev,
      [cat]: prev[cat].includes(skill)
        ? prev[cat].filter(s => s !== skill)
        : [...prev[cat], skill]
    }));
  };
  const setSkillLevel = (cat, skill, level) => {
    setSkillLevels(prev => ({
      ...prev,
      [cat]: { ...prev[cat], [skill]: level }
    }));
  };
  const foldSkill = cat => setIsFolded(prev => ({ ...prev, [cat]: true }));
  const unfoldSkill = cat => setIsFolded(prev => ({ ...prev, [cat]: false }));

  // --- 제출 ---
  const handleSubmit = async e => {
    e.preventDefault();

    // certificate_ids: 자격증/수상(type) 항목은 id 대신 입력값으로(임시, 실제 id는 백에서 매핑)
    const certificate_ids = certificates
      .filter(item => item.type === "자격증" || item.type === "수상")
      .map(item => item.value) // 여기서는 value(텍스트)로 보냄, 실제 id는 서버에서 매핑 필요
      .filter(Boolean);
    // 어학점수
    const language_score = certificates.find(item => item.type === "어학점수")?.value || "";

    // 기술스택
    const skillArray = [];
    Object.entries(skills).forEach(([cat, list]) => {
      list.forEach(skill => {
        skillArray.push({
          name: skill,
          category: cat,
          level: skillLevels[cat][skill] || ""
        });
      });
    });

    // 관심직무(첫 번째만)
    const desired_job = selectedJobs[0] || "";

    // degree(스키마 전송용)
    const degree = resume.degree ? DEGREE_MAP[resume.degree] : "";

    // 고졸일 경우 학교, 전공, 학점 null 처리
    const payload = {
      desired_job,
      university: isHighSchoolGraduate ? null : resume.university || null,
      major: isHighSchoolGraduate ? null : resume.major || null,
      gpa: isHighSchoolGraduate ? null : (resume.gpa ? Number(resume.gpa) : null),
      education_status: resume.education_status || null,
      degree: degree || null,
      language_score: language_score || null,
      skills: skillArray.length ? skillArray : null,
      certificate_ids: certificate_ids.length ? certificate_ids : null
    };

    

    const accessToken = localStorage.getItem("accessToken");

      try {
        const res = await axios.put("http://192.168.101.36:8000/resume/me", payload, {
          headers: {
            Authorization: `Bearer ${accessToken}`,         // ✅ 반드시 이 형식으로!
            "Content-Type": "application/json"
          }
        });
        alert("저장 성공: " + JSON.stringify(res.data));
      } catch (err) {
        alert("저장 실패: " + (err.response?.data?.detail || err.message));
      }

      try {
        const { data } = await axios.put(
          "http://192.168.101.36:8000/resume/me",
          payload,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
    
        // 1️⃣ localStorage 캐시
        localStorage.setItem("resumeData", JSON.stringify(data));
    
        // 2️⃣ 알림
        alert("✅ 저장 완료!");
    
        // 3️⃣ 프로필 페이지로 이동 (Single-Page 앱 구조에 맞춰 선택)
        //   a) 라우터 사용 시
        // navigate("/profile");
        //   b) MainContent 상태 사용 시
        // setSelectedPage("profile");
        //   c) 간단히 전체 새로고침
        // window.location.href = "/profile";
      } catch (err) {
        alert("저장 실패: " + (err.response?.data?.detail || err.message));
      }
    };


  // placeholder
  const getCertPlaceholder = type => {
    switch (type) {
      case "자격증": return "ex) 정보처리기사 1급";
      case "수상": return "ex) 공모전 금상";
      case "어학점수": return "ex) 토익 900";
      default: return "유형 먼저 선택";
    }
  };

  // ------ UI ------
  return (
    <Bg>
      <MainBox>
        <Header>
          <h1>내 프로필</h1>
        </Header>
        <Divider />
        <FormContainer onSubmit={handleSubmit} autoComplete="off">
          {/* --- 최종 학력 --- */}
          <Section>
            <SectionTitle>최종 학력</SectionTitle>
            <FlexRow>
              <Label>학력</Label>
              <Select value={resume.degree} onChange={handleDegreeChange} required>
                {DEGREE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
              <Select
                name="education_status"
                value={resume.education_status}
                onChange={handleEduStatusChange}
                required
                style={{ width: "45%", marginLeft: "1rem" }}
                disabled={!resume.degree}
              >
                <option value="">학적 상태</option>
                {(EDU_STATUS_OPTIONS[resume.degree] || []).map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            </FlexRow>

            {/* ---- 경력 / 신입 선택 ---- */}
            {["대학교2", "대학교4", "대학원"].includes(resume.degree) &&
  resume.education_status === "졸업" && (
    <FlexRow>
      <Label>구분</Label>

      <Select
        name="career_type"
        value={resume.career_type}
        onChange={handleChange}
        required
        style={{ width: "140px" }}
      >
        <option value="">선택</option>
        <option value="신입">신입</option>
        <option value="경력">경력</option>
      </Select>

      {resume.career_type === "경력" && (
        <>
          
          <Select
            name="career_years"
            value={resume.career_years}
            onChange={handleChange}
            required
            style={{ width: "45%" }}
          >
            <option value="">년차 선택</option>
            {Array.from({ length: 30 }, (_, i) => i + 1).map((y) => (
              <option key={y} value={y}>{y}년차</option>
            ))}
          </Select>
        </>
      )}
    </FlexRow>
)}
            <FlexRow>
              <Label>학교명</Label>
              <Input
                name="university"
                value={resume.university}
                onChange={handleChange}
                required={!isHighSchoolGraduate}
                disabled={isHighSchoolGraduate}
              />
            </FlexRow>
            <FlexRow>
              <Label>전공</Label>
              <Input
                name="major"
                value={resume.major}
                onChange={handleChange}
                required={!isHighSchoolGraduate}
                disabled={isHighSchoolGraduate}
              />
            </FlexRow>
            <FlexRow>
              <Label>학점</Label>
              <Input
                name="gpa"
                value={resume.gpa}
                onChange={handleChange}
                required={false}
                disabled={isHighSchoolGraduate}
                inputMode="decimal"
                placeholder="3.5"
              />
            </FlexRow>

  

          </Section>

          {/* --- 수상/자격증/어학 --- */}
          <Section>
            <SectionTitle>수상/자격증/어학</SectionTitle>
            {certificates.map((item, idx) => (
              <ExpRow key={idx}>
                <Select
                  value={item.type}
                  onChange={e => handleCertType(idx, e.target.value)}
                  /* required 삭제 */
                  style={{ width: "35%" }}
                >
                  <option value="">유형</option>
                  <option value="자격증">자격증</option>
                  <option value="수상">수상</option>
                  <option value="어학점수">어학점수</option>
                </Select>
                <Input
                  placeholder={getCertPlaceholder(item.type)}
                  value={item.value}
                  onChange={e => handleCertValue(idx, e.target.value)}
                  /* required 삭제 */
                  disabled={!item.type}
                />
                <RemoveBtn type="button" onClick={() => removeCert(idx)}>
                  삭제
                </RemoveBtn>
              </ExpRow>
            ))}
            <AddBtn type="button" onClick={addCert}>+ 항목 추가</AddBtn>
          </Section>


          {/* --- 관심 직무 --- */}
          <Section>
            <SectionTitle>관심 직무</SectionTitle>
            <DropdownCard>
              <DropdownHeader onClick={() => setJobOpen(o => !o)}>
                <span>
                  {selectedJobs.length > 0 ? `${selectedJobs.length}개 선택됨` : "관심 직무 선택"}
                </span>
                <DropdownIcon open={jobOpen}>▼</DropdownIcon>
              </DropdownHeader>
              {jobOpen &&
                <DropdownBody>
                  {JOB_OPTIONS.map(job => (
                    <DropdownItem key={job} selected={selectedJobs.includes(job)} onClick={() => toggleJob(job)}>
                      <input type="checkbox" checked={selectedJobs.includes(job)} readOnly />
                      <span>{job}</span>
                    </DropdownItem>
                  ))}
                </DropdownBody>
              }
              {/* 선택된 태그 */}
              {selectedJobs.length > 0 &&
                <TagWrap>
                  {selectedJobs.map(job => (
                    <Tag key={job} onClick={() => toggleJob(job)}>{job} ×</Tag>
                  ))}
                </TagWrap>
              }
            </DropdownCard>
          </Section>

          <Section>
  <SectionTitle>기술 스택</SectionTitle>
  <SkillCardWrap>
    {SKILL_CATEGORIES.map(cat => (
      <SkillCard key={cat.title}>
        {/* ── 헤더: 제목 + 토글 버튼 ── */}
        <SkillHeader onClick={() =>
          isFolded[cat.title]
            ? unfoldSkill(cat.title)
            : foldSkill(cat.title)
        }>
          <SkillCatTitle>{cat.title}</SkillCatTitle>
          <ToggleIcon>{isFolded[cat.title] ? <FaChevronRight/> : <FaChevronDown />}</ToggleIcon>
        </SkillHeader>

        {/* ── 접힌 상태가 아니라면 내용 보여줌 ── */}
        <Collapsible open={!isFolded[cat.title]}>
          {/* ── 기술 태그 선택 ── */}
          <SkillGrid>
            {cat.options.map(skill => (
              <SkillTag
                key={skill}
                selected={skills[cat.title]?.includes(skill)}
                onClick={() => toggleSkill(cat.title, skill)}
              >
                {skill}
              </SkillTag>
            ))}
          </SkillGrid>

          {/* ── 숙련도 입력 ── */}
          {(skills[cat.title] || []).length > 0 && (
            <SkillLevelWrap>
              {(skills[cat.title] || []).map(skill => (
                <SkillWithLevel key={skill}>
                  <LangTag>{skill}</LangTag>
                  <select
                    value={skillLevels[cat.title]?.[skill] || ""}
                    onChange={(e) =>
                      setSkillLevel(cat.title, skill, e.target.value)
                    }
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                      background: "#333",
                      color: "#fff",
                      border: "1px solid #555",
                      width: "60%"
                    }}
                  >
                    <option value="">숙련도 선택</option>
                    
                    <option value="입문자">📘 입문자 - 튜토리얼 수준</option>
                    <option value="기초 사용자">🛠️ 기초 사용자 - 기능 구현 가능</option>
                    <option value="중급 사용자">🚀 중급 사용자 - 프로젝트에 사용</option>
                    <option value="고급 사용자">💼 고급 사용자 - 실무 수준 응용 가능</option>

                  </select>
                </SkillWithLevel>
              ))}
            </SkillLevelWrap>
          )}

          {/* 완료 버튼 */}
          <SkillDoneBtn
            type="button"
            disabled={!skills[cat.title] || skills[cat.title].length === 0}
            onClick={() => foldSkill(cat.title)}
          
          >
            선택 완료
          </SkillDoneBtn>
        </Collapsible>
      </SkillCard>
    ))}
  </SkillCardWrap>
</Section>




          <SubmitBtn type="submit">저장</SubmitBtn>
        </FormContainer>
      </MainBox>
    </Bg>
  );
}




const Bg = styled.div`
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 2rem;
`;

const MainBox = styled.div`
  background: #ffffff;
  border-radius: 2rem;
  box-shadow: 0 3px 18px 0 rgba(0,0,0,0.1);
  width: 35rem;
  max-width: 97vw;
  margin-bottom: 3rem;
  padding-bottom: 2.2rem;
  color: #333;
  position: relative;
`;

const Header = styled.div`
  padding: 1.7rem 2.5rem 0.6rem 2.5rem;
  text-align: center;
  h1 {
    color: #ffa500;
    font-size: 2.2rem;
    font-weight: bold;
    margin-bottom: 0.4rem;
    letter-spacing: 0.03em;
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 2px solid #e0e0e0;
  margin: 1.2rem auto 2.2rem auto;
  width: 87%;
`;

const SectionTitle = styled.h3`
  font-size: 1.09rem;
  margin-bottom: 1.35rem;
  font-weight: 700;
  color: #ffa500;
`;

const Label = styled.label`
  min-width: 6rem;
  font-size: 1.01rem;
  font-weight: 500;
  color: #555;
`;

const Select = styled.select`
  min-width: 160px;
  padding: 0.85rem;
  border-radius: 0.6rem;
  border: 1px solid #ccc;
  background: #fff;
  color: #333;
  font-size: 1.13rem;
  height: 48px;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.85rem 1.1rem;
  border-radius: 0.6rem;
  border: 1px solid #ccc;
  background: #fff;
  color: #333;
  font-size: 1.13rem;
  height: 48px;
  &::placeholder { color: #aaa; }
`;

const DropdownCard = styled.div`
  background: #ffffff;
  border-radius: 1.1rem;
  padding: 1rem 1.6rem 1.4rem 1.6rem;
  box-shadow: 0 2px 8px #0000000d;
  position: relative;
`;

const DropdownHeader = styled.div`
  font-size: 1.05rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #ffa500;
  cursor: pointer;
  padding-bottom: 0.4rem;
`;

const DropdownItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: ${({ selected }) => (selected ? "#ffa50022" : "transparent")};
  border-radius: 0.55rem;
  font-weight: 500;
  color: ${({ selected }) => (selected ? "#ffa500" : "#444")};
  cursor: pointer;
  padding: 0.4rem 1.2rem 0.4rem 0.5rem;
  border: 1.5px solid ${({ selected }) => (selected ? "#ffa500" : "#dcdcdc")};
  input { accent-color: #ffa500; }
`;

const Tag = styled.div`
  background: #ffa500;
  color: #fff;
  border-radius: 1.2rem;
  padding: 0.32rem 0.95rem;
  font-size: 1rem;
  cursor: pointer;
`;

const FormContainer = styled.form`
  padding: 0 2.5rem;
`;

const Section = styled.section`
  margin-bottom: 2.1rem;
`;

const FlexRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.1rem;
  gap: 1.5rem;
`;

const ExpRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 1.1rem;
  width: 97%;
`;

const RemoveBtn = styled.button`
  margin-left: 0.6rem;
  background: #eee;
  color: #e53935;
  border: none;
  border-radius: 0.7rem;
  padding: 0.8rem 1.5rem;
  font-weight: bold;
  font-size: 1.09rem;
  cursor: pointer;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  transition: background 0.18s, color 0.13s;
  &:hover, &:focus {
    background: #e53935;
    color: #fff;
  }
`;

const AddBtn = styled.button`
  margin-bottom: 0.5rem;
  background: #f5f5f5;
  color: #ffa500;
  border: none;
  border-radius: 0.5rem;
  padding: 0.8rem 1.5rem;
  font-weight: bold;
  cursor: pointer;
  font-size: 1rem;
  &:hover, &:focus {
    background: #ffa500;
    color: #fff;
  }
`;

const DropdownIcon = styled.span`
  font-size: 1.15rem;
  margin-left: 0.6rem;
  transition: 0.2s;
  transform: ${({ open }) => (open ? "rotate(-180deg)" : "none")};
`;

const DropdownBody = styled.div`
  margin: 0.5rem 0 0.7rem 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 0.45rem;
`;

const TagWrap = styled.div`
  margin-top: 0.8rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
`;

const SkillCardWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const SkillCard = styled.div`
  background: #f9f9f9;
  border-radius: 1rem;
  padding: 1.05rem 1.2rem 0.9rem 1.2rem;
  margin-bottom: 0.3rem;
  box-shadow: 0 2px 9px 0 #ddd;
`;

const SkillHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  margin-bottom: 0.8rem;
`;

const SkillCatTitle = styled.div`
  color: #ffa500;
  font-size: 1.08rem;
  font-weight: bold;
`;

const ToggleIcon = styled.span`
  font-size: 1.4rem;
  color: #ffa500;
`;

const Collapsible = styled.div`
  max-height: ${({ open }) => (open ? "1000px" : "0")};
  overflow: hidden;
  transition: max-height 0.4s ease;
`;

const SkillGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.44rem;
  margin-bottom: 0.8rem;
`;

const SkillTag = styled.div`
  padding: 0.62rem 1.06rem;
  border-radius: 1.5rem;
  background: ${({ selected }) => (selected ? "#ffa500" : "#ccc")};
  color: ${({ selected }) => (selected ? "#fff" : "#333")};
  font-weight: 500;
  cursor: pointer;
  user-select: none;
  font-size: 1.01rem;
`;

const SkillLevelWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  width: 100%;
  align-items: center;
  margin-bottom: 2.2rem;
`;

const SkillWithLevel = styled.div`
  display: flex;
  align-items: center;
  width: 80%;
  justify-content: flex-start;
`;

const LangTag = styled.div`
  min-width: 85px;
  text-align: center;
  font-size: 1.00rem;
  font-weight: bold;
  color: #ffa500;
  border-radius: 1.7rem;
  padding: 0.65rem 0;
  margin-right: 1.2rem;
`;

const SkillDoneBtn = styled.button`
  display: block;
  margin: 2rem auto 0;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  background: #ffa500;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  &:hover {
    background: #e69500;
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 1.1rem;
  background: #ffc107;
  color: #000;
  border: none;
  border-radius: 0.7rem;
  font-size: 1.08rem;
  font-weight: bold;
  margin-top: 2rem;
  cursor: pointer;
  &:hover {
    background: #ffca28;
  }
`;