export function getMakingOfGeometry(width, height, mobileView = 'sphere') {
  const isNarrow = width < 700 || (width < 1000 && height < 600);
  const isCompactDesktop = width >= 700 && width < 1300;
  const isMobileJournal = isNarrow && mobileView === 'journal';
  const radius = Math.min(
    width * (isMobileJournal ? 0.18 : isNarrow ? 0.33 : isCompactDesktop ? 0.26 : 0.31),
    height * (isMobileJournal ? 0.1 : isNarrow ? 0.26 : isCompactDesktop ? 0.32 : 0.37),
    isMobileJournal ? 110 : 360,
  );

  return {
    width,
    height,
    radius,
    centerX: width * (isNarrow ? (isMobileJournal ? 0.73 : 0.5) : isCompactDesktop ? 0.59 : 0.58),
    centerY: height * (isNarrow ? (isMobileJournal ? 0.17 : 0.59) : 0.51),
    distance: radius * 4.5,
  };
}
