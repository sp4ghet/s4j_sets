#ifndef UV_DISP
#define UV_DISP
#include "./lib/util.glsl"
#include "./lib/rng.glsl"

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
