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
#include "lib/uv_disp.glsl"



vec4 screen_grad(float t){
    const vec4 phases = vec4(0.00, 0.58, 0.80, 0.);
    const vec4 amplitudes = vec4(1.00, 1.00, 1.00, 0.);
    const vec4 frequencies = vec4(0.31, 0.31, 0.31, 0.);
    const vec4 offsets = vec4(0,0,0,0);
    return cosine_gradient(t, phases, amplitudes, frequencies, offsets);
}


void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    int kaleidoCount = isPress(buttons[12]) ? 1 : 0;
    kaleidoCount += isPress(buttons[13]) ? 3 : 0;
    kaleidoCount += isPress(buttons[14]) ? 5 : 0;
    kaleidoCount += isPress(buttons[15]) ? 7 : 0;
    uv = kaleido(uv, kaleidoCount);

    float chromab_t = saturate(buttons[1].z);
    chromab_t = 0.5 + 0.5 * cos(PI * exp(-8. * chromab_t));
    chromab_t = isPress(buttons[1]) ? 1 : 1. - chromab_t;
    vec4 c = chromab(render, uv, chromab_t);

    c.rgb = grain(c.rgb, uv, 1., sliders[2]);


    // c = c / (1. + c);
    c.rgb = ACESFilm(c.rgb);
    c = pow(c, vec4(.4545));

    c = smoothstep(.01, 1.5, c);
    float lum = dot(c.rgb, vec3(.2126, .7152, .0722));
    float shad = smoothstep(.4, .01, lum);
    float high = smoothstep(.3, 1., lum);
    c.rgb = c.rgb*shad*vec3(.4, 1.2, 1.2) + c.rgb*(1-shad*high) + c.rgb*high*vec3(.99, .8,.8);


    out_color = c;
}
