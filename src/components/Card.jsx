import styled from "styled-components";

export const Card = styled.div`
  background: var(--color-bg);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  padding: var(--card-padding);
  border: 1px solid var(--color-border);
  transition: var(--transition-all);
  
  &:hover {
    box-shadow: var(--shadow-xl);
    transform: translateY(-2px);
  }
`;
