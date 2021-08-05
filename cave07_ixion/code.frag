#version 440
out vec4 out_color;

uniform vec4 resolution;
uniform float time;

#include "lib/util.glsl"
#include "lib/color.glsl"

uniform sampler2D render;
uniform sampler2D code;

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);

    vec3 c = texture(render, uv).rgb;

    vec3 code = texture(code, uv).rgb;

    vec3 bg = vec3(0., 0.1686, 0.211);
    vec2 ck = rgb_to_ycbcr(bg).gb;
    vec2 cp = rgb_to_ycbcr(code).gb;
    float t = smoothstep(0.0, 0.12, length(ck - cp));
    c = mix(c, code, t);

    out_color = vec4(c, 1.);
}
