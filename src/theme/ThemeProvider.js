import styled, {
  ThemeProvider as StyledComponentsThemeProvider,
  createGlobalStyle,
} from 'styled-components';
import Div100vh from 'react-div-100vh';
import {isMobile} from 'react-device-detect';
import {normalize} from 'polished';

import PrimeReact from 'primereact/api';
import theme from './theme';
import {device} from './device';

// Toastify
import 'react-toastify/dist/ReactToastify.css';

// Load primereact styles
import './md-light-deeppurple/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

PrimeReact.ripple = true;
PrimeReact.inputStyle = 'filled';
PrimeReact.zIndex = {
  modal: 10000, // dialog, sidebar
  overlay: 10000, // dropdown, overlaypanel
  menu: 1000, // overlay menus
  tooltip: 1100, // tooltip
  toast: 1200, // toast
};

const GlobalStyle = createGlobalStyle`
  ${normalize()}

  body {
    color: 212121;
    font-Size: 16px;
    font-family: "Trebuchet MS", Helvetica, sans-serif;
    padding: 0;
    margin: 0;
    overflow-x: hidden;
    touch-action: pan-x pan-y;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  * {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }

  *::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }

  *::-webkit-scrollbar-track {
    background-color: #f1f1f1;
  }

  *::-webkit-scrollbar-thumb {
    background-color: #212121;
    border-radius: 10px;
    border: 2px solid #f1f1f1;
  }

  a {
    text-decoration: none;
  }
`;

const MobileContainer = styled(Div100vh)`
  width: 100vw;
  font-size: 0.9em;
  display: flex;
  flex-direction: column;
`;

const DesktopContainer = styled.div`
  width: 100vw;
  height: 100vh;
  font-size: 1em;
  display: flex;
  flex-direction: column;
  @media ${device.laptop} {
    font-size: 1.2vw;
  }
  @media ${device.pad} {
    font-size: 0.9em;
  }
`;

export default function ThemeProvider({children}) {
  return (
    <StyledComponentsThemeProvider theme={theme}>
      <GlobalStyle />
      {isMobile ? (
        <MobileContainer> {children} </MobileContainer>
      ) : (
        <DesktopContainer> {children} </DesktopContainer>
      )}
    </StyledComponentsThemeProvider>
  );
}
