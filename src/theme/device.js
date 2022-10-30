export const size = {
  desktop: '2560px',
  laptop: '1440px',
  pad: '1024px',
  tablet: '768px',
  mobileL: '480px',
  mobileM: '375px',
  mobileS: '320px',
};

export const device = {
  mobileS: `(max-width: ${size.mobileS})`,
  mobileM: `(max-width: ${size.mobileM})`,
  mobileL: `(max-width: ${size.mobileL})`,
  tablet: `(max-width: ${size.tablet})`,
  pad: `(max-width: ${size.pad})`,
  laptop: `(max-width: ${size.laptop})`,
  desktop: `(max-width: ${size.desktop})`,
};
