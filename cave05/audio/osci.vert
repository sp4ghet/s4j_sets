#version 440

out vec4 v_color;

uniform sampler1D samples;
uniform vec4 resolution;
uniform int vertexCount;
uniform vec4 buttons[32];

uniform float sliders[32];

#pragma include "lib/util.glsl"

void main() {
    int vid = (gl_VertexID + 1) / 2;
    float x = float(vid) / vertexCount;
    x *= 2;
    vec2 samp = texture(samples, x).rg;

    vec3 c = vec3(x*x);

    vec3 p = vec3(samp.r, samp.g, 0.);
    p.xy *= 2*smoothstep(0.,1.,sliders[8]);
    p.xy *= r2d(PI * .25);
    p.x *= (resolution.w);

    gl_Position = vec4(p, 1);
    gl_PointSize = 0.0;

    if(!toggle(buttons[17])){
        c = vec3(0.);
    }
    v_color = vec4(c, 1.);
}
