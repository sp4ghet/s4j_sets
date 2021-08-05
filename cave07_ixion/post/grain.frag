#version 440

out vec4 out_color;

uniform vec4 resolution;
uniform float time;
uniform float sliders[32];
uniform vec4 buttons[32];

uniform sampler2D render;

#include "lib/util.glsl"
#include "lib/rng.glsl"

// noby https://www.shadertoy.com/view/3sGSWV
float grain_src(vec3 x, float pitch, float strength){
    float center = value_noise(x);
    float hp = center - value_noise(x +  vec3(1, 0, 0)/pitch) + .5;
    float hm = center - value_noise(x + vec3(-1, 0, 0)/pitch) + .5;
    float vp = center - value_noise(x + vec3(0, 1, 0)/pitch) + .5;
    float vm = center - value_noise(x + vec3(0, -1, 0)/pitch) + .5;

    float tot = (hp + hm + vp + vm) * .25;
    return mix(1, .5 + tot, strength);
}

vec3 grain(vec3 c, vec2 uv, float pitch, float strength){
    uv *= resolution.xy;
    float t = time * 60.;
    float r = grain_src(vec3(uv, t), pitch, strength);
    float g = grain_src(vec3(uv, t + 9), pitch, strength);
    float b = grain_src(vec3(uv, t - 9), pitch, strength);
    vec3 gr = vec3(r,g,b);

    return max(mix(c*gr, c+(gr-1.0), .5), 0.0);
}


void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 c = texture(render, uv);

    c.rgb = grain(c.rgb, uv, 1., sliders[2]);

    out_color = c;
}
