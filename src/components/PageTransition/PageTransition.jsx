import React from 'react';
import {motion} from 'framer-motion';
import styled from 'styled-components';

export default function PageTransition(props) {
  const {children} = props;
  return <RouteContainer {...AnimationSettings}>{children}</RouteContainer>;
}

const RouteContainer = styled(motion.div)`
  flex: 1 0 auto;
`;

const AnimationSettings = {
  transition: {duration: 0.6},
  initial: {opacity: 0, y: -30},
  animate: {opacity: 1, y: 0},
  exit: {opacity: 0, y: -30},
};
