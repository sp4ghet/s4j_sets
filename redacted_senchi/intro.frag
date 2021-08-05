#version 440

out vec4 out_color;

uniform vec4 resolution;
uniform float time;
uniform float beat;
uniform vec4 buttons[32];
uniform float sliders[32];

uniform vec3 volume;
uniform vec3 volume_integrated;
uniform vec3 bass;
uniform vec3 bass_smooth;
uniform vec3 bass_integrated;
uniform vec3 high;
uniform vec3 high_smooth;
uniform vec3 high_integrated;
uniform vec3 mid;
uniform vec3 mid_smooth;
uniform vec3 mid_integrated;

uniform sampler1D spectrum;

#include "lib/util.glsl"
#include "lib/sdf.glsl"
#include "lib/rng.glsl"
#include "lib/2d_sdf.glsl"

vec4 grad(float t){
    const vec4 phases = vec4(0.50, 0.50, 0.61, 0.);
    const vec4 amplitudes = vec4(1.34, 0.50, 1.00, 0.);
    const vec4 frequencies = vec4(0.55, 2.04, 1.11, 0.);
    const vec4 offsets = vec4(0.01, -.25, 0.00, 0.);

    return cosine_gradient(t, phases, amplitudes, frequencies, offsets);
}

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);

    vec3 c = vec3(0);
    float r = length(pt);
    vec2 samp = texture(spectrum, r).rg;
    c = vec3(1) * smoothstep(-.2, .8, samp.r);
    c = grad(samp.r).rgb;
    // c *= smoothstep(.2, 1., 2*uv.y);

    c *= .5 + .5 * abs(noise(vec3(pt*10, time)));

    // c += grad(abs(noise(vec3(.25*bass_integrated.x, pt*5)))).rgb;

    out_color = vec4(c, 1);
}
