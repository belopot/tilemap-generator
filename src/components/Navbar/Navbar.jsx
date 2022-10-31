import React, {useRef} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import {useMediaQuery} from 'react-responsive';
import styled from 'styled-components';
import {motion, AnimatePresence} from 'framer-motion';
import {Button} from 'primereact/button';

import {PrimaryRoutes} from 'dataset/routes';
import {device} from 'theme/device';
import {useStore} from 'state/store';
import NavMenuButton from 'components/NavMenuButton';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isPadScreen = useMediaQuery({query: device.pad});
  const menuVisible = useStore(state => state.menuVisible);
  const setMenuVisible = useStore(state => state.setMenuVisible);

  return (
    <Holder>
      <FlexHolder>
        {isPadScreen ? (
          <>
            <NavMenuButton />
            <AnimatePresence>
              {menuVisible && (
                <NavMobile
                  transition={{duration: 0.4}}
                  initial={{x: '-100%'}}
                  animate={{x: 0}}
                  exit={{x: '-100%'}}
                >
                  <CloseButton
                    icon="pi pi-times"
                    className="p-button-rounded p-button-text p-button-icon-only"
                    onClick={() => {
                      setMenuVisible(false);
                    }}
                  />
                  {PrimaryRoutes.map(route => {
                    return (
                      <NavItemMobile
                        key={`mobile-nav-item-${route.path}`}
                        selected={route.path === location.pathname}
                        onClick={() => {
                          navigate(route.path);
                          setMenuVisible(false);
                        }}
                      >
                        {route.title}
                      </NavItemMobile>
                    );
                  })}
                </NavMobile>
              )}
            </AnimatePresence>
          </>
        ) : (
          <Nav>
            {PrimaryRoutes.map(route => (
              <NavItemDesktop
                key={`desktop-nav-item-${route.path}`}
                path={route.path}
                title={route.title}
              />
            ))}
          </Nav>
        )}
      </FlexHolder>
    </Holder>
  );
}

const Holder = styled.header`
  width: inherit;
  background-color: #212121;
`;

const FlexHolder = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 1.5em 0;
  @media ${device.pad} {
    flex-direction: row-reverse;
    justify-content: flex-end;
    gap: 1em;
  }
`;

const CloseButton = styled(Button)`
  position: absolute;
  top: 1.3em;
  right: 1em;
  z-index: 1;
`;

const Nav = styled.ul`
  display: flex;
  align-items: center;
`;

const NavItem = styled.li`
  color: ${props => (props.active ? '#fff' : '#cccccc')};
  font-weight: 900;
  font-size: 1em;
  line-height: 1;
  position: relative;
  cursor: pointer;
  transition: all 0.5s ease;
  margin: 0 1.5em;
  list-style-type: none;
  display: flex;
  align-items: center;
  gap: 0.6em;
  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -0.7em;
    width: ${props => (props.active ? '2em' : '0')};
    height: 2px;
    background-color: ${props => props.theme.colors.primary};
    transition: width 0.5s ease;
  }
  &:hover::after {
    width: 3em;
  }
  @media ${device.laptop} {
    font-size: 1em;
  }
  > img {
    width: 0.8em;
  }
`;

const NavMobile = styled(motion.nav)`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 1.5em;
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  right: 30%;
  bottom: 0;
  padding: 2em 1em 2em 0;
  background-color: #132b44;
  box-shadow: 0px 0px 30px rgba(0, 0, 0, 0.75);
`;
const NavItemMobile = styled.div`
  color: ${({selected}) => (selected ? '#f2f2f2' : '#7B8694')};
  font-weight: ${({selected}) => (selected ? 700 : 100)};
  font-size: 1.5em;
  width: 100%;
  padding: 0.5em 1em;
  text-align: left;
  border-left: ${({selected}) =>
    selected ? '5px solid #f43f53' : '5px solid #ffffff00'};
  transition: all 300ms ease-out;
  cursor: pointer;
  @media ${device.mobileL} {
    font-size: 1em;
  }
`;

const NavItemDesktop = ({path, title}) => {
  const ref = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <NavItem
      active={location.pathname === path ? 1 : 0}
      onClick={e => {
        navigate(path);
        e.stopPropagation();
      }}
      onMouseEnter={e => {
        if (ref.current) {
          ref.current.show(e);
        }
      }}
      onMouseLeave={e => {
        if (ref.current) {
          ref.current.hide();
        }
      }}
    >
      <div>{title}</div>
    </NavItem>
  );
};
