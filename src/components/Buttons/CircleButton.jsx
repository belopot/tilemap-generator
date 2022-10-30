import React from 'react';
import styled from 'styled-components';

export default function CircleButton({background = 'white', icon, onClick}) {
  return (
    <Holder background={background} onClick={onClick}>
      <img src={icon} alt="" />
    </Holder>
  );
}

const Holder = styled.div`
  border-radius: 50%;
  width: 3em;
  height: 3em;
  background: ${props => props.background};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.5s ease-out;
  &:hover {
    opacity: 0.7;
  }
  > img {
    width: 1.5em;
    height: 1.5em;
  }
`;
