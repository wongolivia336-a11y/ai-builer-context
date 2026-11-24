export function getMakingOfGeometry(width, height) {
  const isNarrow = width < 700;
  const isCompactDesktop = width >= 700 && width < 1300;
  const radius = Math.min(
    width * (isNarrow ? 0.33 : isCompactDesktop ? 0.26 : 0.31),
    height * (isNarrow ? 0.26 : isCompactDesktop ? 0.32 : 0.37),
    360,
  );

  return {
    width,
    height,
    radius,
    centerX: width * (isNarrow ? 0.5 : isCompactDesktop ? 0.59 : 0.58),
    centerY: height * (isNarrow ? 0.59 : 0.51),
    distance: radius * 4.5,
  };
}
