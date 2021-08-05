#version 440

out vec4 out_color;

uniform vec4 resolution;
uniform float time;
uniform float sliders[32];
uniform vec4 buttons[32];

uniform sampler2D render;

#include "lib/util.glsl"
#include "lib/rng.glsl"
#include "lib/post.glsl"



vec4 screen_grad(float t){
    const vec4 phases = vec4(0.00, 0.58, 0.80, 0.);
    const vec4 amplitudes = vec4(1.00, 1.00, 1.00, 0.);
    const vec4 frequencies = vec4(0.31, 0.31, 0.31, 0.);
    const vec4 offsets = vec4(0,0,0,0);
    return cosine_gradient(t, phases, amplitudes, frequencies, offsets);
}


void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    float chromab_t = saturate(buttons[1].z);
    chromab_t = 0.5 + 0.5 * cos(PI * exp(-4. * chromab_t));
    chromab_t = isPress(buttons[1]) ? 1 : 1. - chromab_t;
    vec4 c = chromab(render, uv, chromab_t);

    c.rgb = grain(c.rgb, uv, 1., sliders[2]);
    c.rgb = ACESFilm(c.rgb);

    c *= mix(vec4(1), screen_grad(1. - (uv.x + uv.y) / sqrt(2)), sliders[1]);
    c = pow(c, vec4(.4545));


    out_color = c;
}
