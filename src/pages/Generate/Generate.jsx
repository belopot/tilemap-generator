import React from 'react';
import styled from 'styled-components';
import PageTransition from 'components/PageTransition';

export default function Generate() {
  return (
    <PageTransition>
      <Holder>Generate Page</Holder>
    </PageTransition>
  );
}

const Holder = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: black;
`;
