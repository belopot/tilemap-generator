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
