#pragma once

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
    for(int i=0; i < 20; i++){
        float t = i / 19.;
        c += grad(t) * texture(tex, uv + offset * i);
    }
    c /= 20;
    return c;
}
