#version 440
out vec4 out_color;

uniform vec4 resolution;
uniform float sliders[32];
uniform vec4 buttons[32];
uniform float time;
uniform float beat;

uniform vec3 bass_smooth;

uniform sampler1D spectrum;
uniform sampler2D render;

#include "lib/util.glsl"
#include "lib/rng.glsl"

float remap(float l, float r, float x){
    return (x - l) / (r - l);
}

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);

    // float dx = textureLod(spectrum, uv.x, 4).r;
    // dx = smoothstep(.1, .45, dx);
    // uv.x *= dx + .5;

    if(isPress(buttons[3])){
        pt *= .98;
        pt += .02 * sin(pt*25*sliders[1]+ time * 50 * sliders[9]);
        uv = pt2uv(pt);
    }

    vec3 c = texture(render, uv).rgb;


    out_color = vec4(c, 1.);
}
