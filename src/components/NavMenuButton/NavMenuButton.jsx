import React from 'react';
import styled from 'styled-components';
import {useStore} from 'state/store';

export default function NavMenuButton() {
  const menuVisible = useStore(state => state.menuVisible);
  const setMenuVisible = useStore(state => state.setMenuVisible);

  const handleOnClick = () => {
    setMenuVisible(!menuVisible);
  };
  return (
    <NavMenuButtonHolder onClick={handleOnClick}>
      <Bars>
        <Bar open={menuVisible} />
        <Bar open={menuVisible} />
        <Bar open={menuVisible} />
        <Bar open={menuVisible} />
      </Bars>
    </NavMenuButtonHolder>
  );
}

const NavMenuButtonHolder = styled.div`
  width: 3em;
  height: 3em;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease-out;
  &:hover {
    opacity: 0.7;
  }
`;

const Bars = styled.div`
  font-size: 0.5em;
  width: 3.75em;
  height: 2.8125em;
  position: relative;
  transform: rotate(0deg);
  transition: 0.5s ease-in-out;
`;
const Bar = styled.span`
  display: block;
  position: absolute;
  height: 0.5625em;
  width: 100%;
  background: #f43f53;
  border-radius: 0.5625em;
  opacity: 1;
  left: 0;
  transform: rotate(0deg);
  transition: 0.25s ease-in-out;
  &:nth-child(1) {
    top: ${({open}) => (open ? '1.125em' : '0')};
    width: ${({open}) => (open ? '0%' : '100%')};
    left: ${({open}) => (open ? '50%' : '0')};
  }
  &:nth-child(2) {
    top: 1.125em;
    transform: ${({open}) => (open ? 'rotate(45deg)' : 'rotate(0deg)')};
  }
  &:nth-child(3) {
    top: 1.125em;
    transform: ${({open}) => (open ? 'rotate(-45deg)' : 'rotate(0deg)')};
  }
  &:nth-child(4) {
    top: ${({open}) => (open ? '1.125em' : '2.25em')};
    width: ${({open}) => (open ? '0%' : '100%')};
    left: ${({open}) => (open ? '50%' : '0')};
  }
`;
