#ifndef UV_DISP
#define UV_DISP
#include "./lib/util.glsl"
#include "./lib/rng.glsl"

vec2 jitterY(in vec2 uv, float amount, float subdiv){
  float y = lofi(uv.y, subdiv) + fract(time);
  uv.x += amount*random(int(y*subdiv));
  return uv;
}

vec2 scrollY(in vec2 uv, float mult, float speed){
  uv.y = fract(mult*uv.y + fract(mult*time*speed));
  return uv;
}

vec2 kaleido(vec2 uv, int n){
  vec2 pt = uv2pt(uv);
  for(int i=0; i<n; i++){
    pt = abs(pt);
    pt *= r2d(PI/float(n));
    pt -= 0.05;
  }
  return pt2uv(pt);
}

float HexDist(vec2 p) {
	p = abs(p);

    float c = dot(p, normalize(vec2(1,1.73)));
    c = max(c, p.x);

    return c;
}

vec4 HexCoords(vec2 uv) {
	vec2 r = vec2(1, 1.73);
    vec2 h = r*.5;

    vec2 a = mod(uv, r)-h;
    vec2 b = mod(uv-h, r)-h;

    vec2 gv = dot(a, a) < dot(b,b) ? a : b;

    float x = atan(gv.x, gv.y);
    float y = .5-HexDist(gv);
    vec2 id = uv-gv;
    return vec4(x, y, id.x,id.y);
}

#endif
