export const VERTEX = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = aPosition * .5 + .5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

/**
 * Original, illustrative bubble shader. Optical effects are view-angle approximations,
 * NOT a wavelength-integrated thin-film physics solver.
 * The base scene is sampled again with a perturbed UV behind each bubble, so the
 * refraction corresponds to the ACTIVE background texture (not fake CSS blur).
 * Shape channels: 0 soap, 1 heart, 2 flower, 3 star, 4 cloud.
 */
export const FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uImageA;
uniform sampler2D uImageB;
uniform vec2 uSizeA;
uniform vec2 uSizeB;
uniform vec2 uResolution;
uniform float uBlend;
uniform float uTime;
uniform int uBubbleCount;
uniform vec4 uBubbles[16]; // x, y, radius, type (physical pixels, bottom-left origin)
uniform vec4 uDeforms[16]; // squash, offsetX, offsetY, phase

vec2 coverUv(vec2 uv, vec2 size) {
  float frameAR = uResolution.x / max(uResolution.y, 1.0);
  float imageAR = size.x / max(size.y, 1.0);
  if (imageAR > frameAR) uv.x = (uv.x - .5) * frameAR / imageAR + .5;
  else uv.y = (uv.y - .5) * imageAR / frameAR + .5;
  return clamp(uv, .001, .999);
}
vec3 photo(vec2 uv) {
  vec3 a = texture(uImageA, coverUv(uv, uSizeA)).rgb;
  vec3 b = texture(uImageB, coverUv(uv, uSizeB)).rgb;
  return mix(a, b, smoothstep(0.0, 1.0, uBlend));
}
float shapeRadius(float a, float type) {
  if (type < .5) return 1.0;
  if (type < 1.5) { // intentionally stylized candy heart silhouette
    float t = mod(a + 6.283185, 6.283185);
    float lobes = 0.17 * cos(2.0 * (t - 1.570796));
    float notch = .22 * exp(-pow((t - 1.570796) * 5.5, 2.0));
    return .79 + lobes - notch;
  }
  if (type < 2.5) return .78 + .17 * cos(5.0 * a);
  if (type < 3.5) return .76 + .20 * pow(max(0.0, cos(5.0 * a)), 3.0);
  return .86 + .10 * cos(4.0 * a + .5);
}
vec3 candyColor(float type) {
  if (type < .5) return vec3(.82, .92, 1.0);
  if (type < 1.5) return vec3(1.0, .64, .84);
  if (type < 2.5) return vec3(.74, .78, 1.0);
  if (type < 3.5) return vec3(.65, .88, 1.0);
  return vec3(1.0, .90, .76);
}
void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / uResolution;
  vec3 col = photo(uv);
  // Very subtle image finish; keep photo readable.
  col = mix(col, vec3(.96, .93, 1.0), .018);
  for (int i = 0; i < 16; ++i) {
    if (i >= uBubbleCount) break;
    vec4 b = uBubbles[i];
    vec4 k = uDeforms[i];
    vec2 p = (frag - b.xy) / b.z;
    float wobble = sin(uTime * .87 + k.w + p.y * 3.4) * .015
                 + cos(uTime * 1.22 + k.w * 1.7 + p.x * 4.2) * .010;
    p += vec2(k.y, k.z) / b.z * .18;
    p.x *= 1.0 + k.x * .7 + wobble;
    p.y *= 1.0 - k.x * .52 - wobble;
    float angle = atan(p.y, p.x);
    float radius = shapeRadius(angle, b.w);
    float breathing = 1.0 + sin(uTime * .48 + k.w) * .025;
    float dist = length(p) / max(.15, radius * breathing);
    if (dist > 1.10) continue;
    float inside = 1.0 - smoothstep(.974, 1.009, dist);
    float edge = smoothstep(.65, .997, dist) * inside;
    // Diffuse silhouette shadow / slight ambient occlusion only within a thin halo.
    float halo = (1.0 - smoothstep(.94, 1.11, dist)) * .15;
    col = mix(col, col * vec3(.91, .89, .96), halo * (1.0-inside));
    vec2 normal = p / max(length(p), .05);
    float dome = sqrt(max(0.0, 1.0 - min(dist * dist, 1.0)));
    // Sampling the actual displayed background texture is essential.
    vec2 offset = normal * (.0035 + .012 * dome) * (b.z / 50.0);
    offset += vec2(sin(uTime * .5 + p.y * 6.0),cos(uTime * .46+p.x * 5.0)) * .0009;
    vec3 bentScene = photo(uv + offset);
    float viewRim = pow(1.0 - dome, 2.0);
    vec3 tint = candyColor(b.w);
    float glossy = b.w < .5 ? .06 : .24;
    vec3 bubble = mix(bentScene, tint, glossy + viewRim * .14);
    // Artistic thin-film approximation: soft rainbow only toward grazing angles.
    float film = uTime * .13 + angle * .58 + dist * 7.0 + sin(p.y * 6.0 + uTime * .34) * .72 + k.w;
    vec3 interference = .5 + .5*cos(vec3(0.15, 2.2, 4.25) + film);
    bubble += interference * viewRim * (b.w < .5 ? .16 : .085);
    bubble = mix(bubble, tint, edge * (b.w < .5 ? .13 : .23));
    // White curved studio reflections, NOT a uniform pasted white cartoon arc.
    vec2 h = p - vec2(-.31, .42);
    float highlight = exp(-dot(h * vec2(2.4, 5.0), h * vec2(2.4, 5.0)) * 3.3);
    vec2 h2 = p - vec2(.31, -.42);
    float highlight2 = exp(-dot(h2 * vec2(6.2, 3.4), h2 * vec2(6.2, 3.4)) * 4.5);
    bubble = mix(bubble, vec3(1.0), clamp(highlight * .79 + highlight2 * .35 + edge * .20, 0.0, .90));
    col = mix(col, bubble, inside * (b.w < .5 ? .77 : .92));
  }
  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;
