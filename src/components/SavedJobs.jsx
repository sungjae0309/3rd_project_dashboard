import styled, { css } from "styled-components";

export default function SavedJobs({ savedJobs, darkMode }) {
  return (
    <SavedWrapper $darkMode={darkMode}>
      <h2>찜한 공고({savedJobs.length})</h2>

      {savedJobs.length === 0 ? (
        <EmptyMsg>아직 저장한 공고가 없습니다.</EmptyMsg>
      ) : (
        savedJobs.map((job) => (
          <SavedCard key={job.id} $darkMode={darkMode}>
            <strong>{job.company}</strong> – {job.position} ({job.location})
          </SavedCard>
        ))
      )}
    </SavedWrapper>
  );
}

/* styled-components */
const SavedWrapper = styled.section`
  padding: 2rem;
`;

const EmptyMsg = styled.p`
  opacity: 0.6;
  margin-top: 1rem;
`;

const SavedCard = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 0.8rem;
  ${({ $darkMode }) =>
    $darkMode
      ? css`background:#2a2a2a; color:#fff;`
      : css`background:#f7f7f7; color:#333;`}
`;
