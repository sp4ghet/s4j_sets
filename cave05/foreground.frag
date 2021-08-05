#version 440
out vec4 out_color;

uniform vec4 resolution;
uniform float time;
uniform float beat;
uniform vec4 buttons[32];
uniform float sliders[32];

uniform sampler2D dots;


#include "lib/util.glsl"
#include "lib/rng.glsl"

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);

    vec4 c = vec4(0);

    vec2 st = pt;
    if(toggle(buttons[25])){
        st *= r2d(PI*.25);
        st.y += floor(2*beat) * .125;
        vec2 x = abs(fract(st*10*(1 + buttons[9].x*0.5 * cos(40*time))) - .5);
        c += max(smoothstep(0.01, 0., x.x), smoothstep(0.01, 0., x.y));
    }

    if(toggle(buttons[26])){
        st = pt;
        float hit = beat*.1 + buttons[8].w + 0.5 + 0.5 * cos(PI * exp(-8*saturate(buttons[8].y)));
        float ns = 5*noise(vec3(st*5, hit));
        c += graph(fract(ns) - .5, 0., 0.02);
    }

    if(toggle(buttons[27])){
        st = pt;
        vec2 greebleUV = pt2uv((1 + mod(beat*.2, 2)) * st * vec2(resolution.z, 1));
        vec2 greebleUV2 = pt2uv((1 + mod(beat*.2 + 1, 2)) * st * vec2(resolution.z, 1));
        c.rgb += texture(dots, greebleUV).rgb;
        c.rgb += texture(dots, greebleUV2).rgb;
        c.a += c.r;
    }



    out_color = c;
}
