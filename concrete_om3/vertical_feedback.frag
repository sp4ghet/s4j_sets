#version 440

out vec4 out_color;

uniform vec4 resolution;
uniform float time;
uniform vec3 bass;
uniform vec3 bass_integrated;
uniform vec3 volume;
uniform vec3 volume_integrated;

uniform sampler2D render;
uniform sampler2D osci;

#include "lib/util.glsl"

vec4 my_grad(float t){
    const vec4 phases = vec4(0.00, 0.48, 0.48, 0.);
    const vec4 amplitudes = vec4(1.03, 1.00, 1.00, 0.);
    const vec4 frequencies = vec4(0.34, 0.30, 0.30, 0.);
    const vec4 offsets = vec4(0.00, 0.00, 0.00, 0.);

    return cosine_gradient(t, phases, amplitudes, frequencies, offsets);
}

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);

    vec4 c = texture(render, uv + vec2(0, .0075));
    vec4 scene = vec4(0);
    pt.y -= .3;
    float th = atan(pt.y, pt.x);
    float r = length(pt);
    scene += my_grad(.1*bass_integrated.y) * step(r, .01+bass.y) * graph(th, mod(.1*bass_integrated.y, TAU) - PI, .01 / r);
    scene += my_grad(.1*bass_integrated.z - .5) * step(r, .01+bass.z) * graph(th, mod(.1*bass_integrated.z, TAU) - PI, .01 / r);

    c = mix(c, 100*scene, .01);
    c = uv.y > .99 ? vec4(0) : c;
    c.a = 1;
    out_color = c;
}
