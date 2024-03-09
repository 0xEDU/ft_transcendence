// colors.js

const styleGuide = {
  __HEAVY_GRAY: getComputedStyle(document.documentElement).getPropertyValue('--HEAVY_GRAY'),
  __LIGHT_GRAY: getComputedStyle(document.documentElement).getPropertyValue('--LIGHT_GRAY'),
  __OFF_WHITE: getComputedStyle(document.documentElement).getPropertyValue('--OFF_WHITE'),
  __WHITE: getComputedStyle(document.documentElement).getPropertyValue('--WHITE'),
  __GREEN: getComputedStyle(document.documentElement).getPropertyValue('--GREEN'),
  __RED: getComputedStyle(document.documentElement).getPropertyValue('--RED'),
  __ORANGE: getComputedStyle(document.documentElement).getPropertyValue('--ORANGE'),
  __YELLOW_30: getComputedStyle(document.documentElement).getPropertyValue('--YELLOW_30'),
  __YELLOW_60: getComputedStyle(document.documentElement).getPropertyValue('--YELLOW_60'),
  __YELLOW_100: getComputedStyle(document.documentElement).getPropertyValue('--YELLOW_100'),
};

export default styleGuide;