import React from 'react';
import styled from 'styled-components';
import {PageContainer} from 'components/Containers';
import PageTransition from 'components/PageTransition';

export default function EditDungeon() {
  return (
    <PageTransition>
      <PageContainer>
        <Holder>Edit dungeon</Holder>
      </PageContainer>
    </PageTransition>
  );
}

const Holder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 4em;
`;
