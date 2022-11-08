import styled from 'styled-components';
import {device} from 'theme/device';

export const MiddleContainer = styled.div`
  position: relative;
  min-width: 300px;
  max-width: 1300px;
  width: 80%;
  margin: 0 auto;
  @media ${device.pad} {
    width: 90%;
  }
`;

export const PageContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  color: black;
  padding-top: 4em;
  @media ${device.pad} {
    padding-top: 6em;
  }
`;

export const SidebarContainer = styled.div`
  min-width: 15em;
  width: 15em;
  overflow: hidden;
  overflow-y: auto;
  padding: 1em;
`;

export const ContentContainer = styled.div`
  position: relative;
  flex: 1;
  height: 100%;
  overflow: auto;
  display: flex;
  background-color: #808080;
`;
