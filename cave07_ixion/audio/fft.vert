#version 440

out vec4 v_color;

uniform sampler1D spectrum_smooth;
uniform vec4 resolution;
uniform int vertex_count;
uniform vec3 volume;
uniform vec4 buttons[32];

#pragma include "lib/util.glsl"

void main() {
    int vid = (gl_VertexID + 1) / 2;
    float x = float(vid) / vertex_count;
    x *= 4;
    x -= 1;

    vec2 samp = vec2(0);
    for(int i=0; i < 4; i++){
        samp += textureLod(spectrum_smooth, abs(x), i).rg;
    }
    samp /= 5;
    samp *= volume.yz;

    vec3 c = vec3(1);
    float th = PI * x;
    float fft = mix(samp.r, samp.g, x > 0.);
    fft = isnan(fft) ? 0. : fft;
    float r = fft + .75;
    vec3 p = vec3(r * cos(th), r * sin(th), 0.);
    p.xy *= 1.;
    p.xy *= r2d(PI * .5);
    p.x *= resolution.w;

    gl_Position = vec4(p, 1);
    gl_PointSize = 0.0;

    bool enableAudio = mod(buttons[18].w, 2) > 0.3;
    if(!enableAudio){
        c = vec3(0.);
    }

    v_color = vec4(c, 1.);
}
