#version 440

out vec4 out_color;

uniform vec4 resolution;
uniform float time;
uniform vec4 buttons[32];

uniform sampler2D render;

#include "lib/util.glsl"

vec4 grad(float t){
    const vec4 phases = vec4(0.00, 0.58, 0.80, 0.);
    const vec4 amplitudes = vec4(1.00, 1.00, 1.00, 0.);
    const vec4 frequencies = vec4(1.00, 1.00, 1.00, 0.);
    const vec4 offsets = vec4(0.00, 0.00, 0.00, 0.);
    return cosine_gradient(t, phases, amplitudes, frequencies, offsets);
}

vec4 chromab(sampler2D tex, vec2 uv, float strength){
    vec2 pt = uv2pt(uv);
    vec2 offset = 0.05 * pt * dot(pt,pt) * strength;
    vec4 c = vec4(0);
    const int n = 20;
    for(int i=0; i < n; i++){
        float t = float(i) / float(n-1);
        vec4 ctrl = mix(vec4(1), grad(t), strength);
        c +=  ctrl * texture(tex, uv + offset * i);
    }
    c /= n;
    return c;
}

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    float chromab_t = saturate(buttons[1].z);
    chromab_t = 0.5 + 0.5 * cos(PI * exp(-8. * chromab_t));
    chromab_t = isPress(buttons[1]) ? 1 : 1. - chromab_t;
    vec4 c = chromab(render, uv, chromab_t);

    out_color = c;
}
