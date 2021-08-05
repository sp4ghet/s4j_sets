#version 440
out vec4 out_color;

uniform vec4 resolution;
uniform float sliders[32];
uniform vec4 buttons[32];
uniform float time;
uniform float beat;

uniform sampler2D render;
uniform sampler2D code;

#include "lib/util.glsl"
#include "lib/rng.glsl"

vec2 jitterY(in vec2 uv, float amount, float subdiv){
  float y = lofi(uv.y, subdiv) + fract(26*time);
  uv.x += amount*random(int(y*subdiv));
  return uv;
}

vec2 scrollY(in vec2 uv, float mult, float speed){
  uv.y = fract(mult*uv.y + fract(mult*time*speed));
  return uv;
}

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);

    float hitJitter = 1. - 0.5 - 0.5 * cos(PI*exp(-5 * saturate(buttons[2].z)));
    hitJitter = max(buttons[2].x, hitJitter);
    uv = jitterY(uv, hitJitter*sliders[4]*.05, 720.);

    // float hitShake = 1. - 0.5 - 0.5 * cos(PI*exp(-8 * saturate(buttons[3].z)));
    // hitShake = max(step(0.1, buttons[3].x), hitShake);
    // uv += hitShake*sliders[5]*.1*vec2(random(int(2000*time)), random(int(3000*time)*2));

    vec3 c = texture(render, uv).rgb;


    out_color = vec4(c, 1.);
}
