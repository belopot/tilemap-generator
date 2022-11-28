import React from 'react';
import styled from 'styled-components';

export default function Caption() {
  return (
    <Holder>
      <h3>Character Controls</h3>
      <h3>Up : W</h3>
      <h3>Left : D</h3>
      <h3>Bottom : S</h3>
      <h3>Right : A</h3>
    </Holder>
  );
}

const Holder = styled.div`
  position: absolute;
  top: 2em;
  right: 1em;
  color: #878787;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5em;
  pointer-events: none;
`;
