#pragma once
#include "lib/util.glsl"
uniform sampler2D overlay;
vec4 crt_res = vec4(resolution.x / 1.333, resolution.y, resolution.z / 1.333, resolution.w * 1.333);

vec2 uv2crt(vec2 uv){
    vec2 pt = uv2pt(uv);
    pt.x *= 1.333;
    return pt2uv(pt);
}

vec2 crt_uv2pt(vec2 crt_uv){
    vec2 pt = 2*(crt_uv - .5);
    pt.x *= crt_res.z;
    return pt;
}

vec2 five(vec2 uv, out float id){
    vec2 crtUV = uv2crt(uv);
    crtUV *= 5;

    id = floor(crtUV.x) + 5*floor(crtUV.y);
    return fract(crtUV);
}


float mask(vec2 uv){
    float mask = 1;
    vec2 crtUV = fract(uv2crt(uv)*5);
    mask *=  step(max(crtUV.x, 1. - crtUV.x), .99);
    mask *=  step(max(crtUV.y, 1. - crtUV.y), .99);
    mask *=  1. - texture(overlay, uv).a;
    return mask;
}
