export function getMakingOfGeometry(width, height) {
  const isNarrow = width < 700;
  const radius = Math.min(
    width * (isNarrow ? 0.36 : 0.31),
    height * (isNarrow ? 0.29 : 0.37),
    360,
  );

  return {
    width,
    height,
    radius,
    centerX: width / 2,
    centerY: height * (isNarrow ? 0.53 : 0.51),
    distance: radius * 4.5,
  };
}
