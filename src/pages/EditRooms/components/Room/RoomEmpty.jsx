import React from 'react';
import styled from 'styled-components';

export function RoomEmpty() {
  return <Holder>Select an existing room or create a new one.</Holder>;
}

const Holder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;
