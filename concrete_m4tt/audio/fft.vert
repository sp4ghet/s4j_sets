#version 440

out vec4 v_color;

uniform sampler1D spectrum;
uniform vec4 resolution;
uniform int vertexCount;
uniform vec3 volume;
uniform vec4 buttons[32];

#pragma include "lib/util.glsl"

void main() {
    int vid = (gl_VertexID + 1) / 2;
    float x = float(vid) / vertexCount;
    x *= 4;
    x -= 1;

    vec2 samp = vec2(0);
    for(int i=0; i < 4; i++){
        samp += .1*(i+1)* textureLod(spectrum, abs(x), i).rg;
    }
    bool left = x > 0.;
    float fft = mix(samp.r, samp.g, left);
    x = abs(x)*2.1 - 1.1;
    float lr = left ? 1 : -1;

    vec3 c = vec3(1);
    fft = isnan(fft) ? 0. : fft;
    float v = volume.x * fft - 1.3;
    v *= lr;
    vec3 p = vec3(v, x, 0.);
    p.x *= resolution.w;

    gl_Position = vec4(p, 1);
    gl_PointSize = 0.0;

    v_color = vec4(c, 1.);
}
