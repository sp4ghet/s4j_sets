#version 440
out vec4 out_color;

uniform vec4 resolution;
uniform float time;
uniform float beat;
uniform vec4 buttons[32];
uniform float sliders[32];

uniform sampler2D dots;
uniform sampler2D logo;
uniform vec4 logo_res;
uniform sampler2D cave_logo;
uniform vec4 cave_logo_res;

uniform vec3 bass_smooth;

#include "lib/util.glsl"
#include "lib/rng.glsl"
#include "lib/2d_sdf.glsl"

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);

    vec4 c = vec4(0);

    vec2 st = pt;
    if(toggle(buttons[16])){
        st = pt * 3.5 * resolution.xy / logo_res.xy;
        // st *= 1. - .2*bass_smooth.x;
        // st *= r2d(sin(PI*beat) * .25);
        c += texture(logo, pt2uv(st)).aaaa;
        // c.a *= -1;
    }

    if(toggle(buttons[24])){
        st = pt * 3.75 * resolution.xy / cave_logo_res.xy;
        st *= 1. - .2*bass_smooth.x;
        c += texture(cave_logo, pt2uv(st)).aaaa;
    }

    if(toggle(buttons[25])){
        st = pt;
        st *= r2d(PI*.25);
        st.y += floor(2*beat) * .125;
        vec2 x = abs(fract(st*10*(1 + buttons[9].x*0.5 * cos(40*time))) - .5);
        c += max(smoothstep(0.01, 0., x.x), smoothstep(0.01, 0., x.y));
    }

    if(toggle(buttons[26])){
        st = pt;
        float hit = beat*.1 + buttons[8].w + 0.5 + 0.5 * cos(PI * exp(-8*saturate(buttons[8].y)));
        float ns = 5*noise(vec3(st*5, hit));
        c += graph(fract(ns) - .5, 0., 0.05);
    }

    if(toggle(buttons[27])){
        st = .3*pt;
        vec2 greebleUV = pt2uv((1 + mod(beat*.2, 2)) * st * vec2(resolution.z, 1));
        vec2 greebleUV2 = pt2uv((1 + mod(beat*.2 + 1, 2)) * st * vec2(resolution.z, 1));
        c.rgb += texture(dots, greebleUV).rgb;
        c.rgb += texture(dots, greebleUV2).rgb;
        c.a += c.r;
    }
    // c.rgb = 1. - step(.1, c.rgb);

    float anim = 0.5 + 0.5 * cos(PI * exp(-3 * buttons[5].y));
    float sp = stroke(length(pt), 1.3 * anim, .05);
    c += sp;

    // anim = 0.5 + 0.5 * cos(PI * exp(-5 * buttons[6].y));
    // ivec2 id = ivec2(floor(uv * 10));
    // uv = fract(uv * 10);
    // float t = beat;
    // int i = int(t);
    // t = 0.5 + 0.5 * cos(PI * exp(-5 * fract(t)));
    // if(i % 4 == 0){
    //     uv.x += id.y % 2 == 0 ? fract(t) : -fract(t);
    // }else if(i % 4 == 1){
    //     uv.y += id.x % 2 == 0 ? fract(t) : -fract(t);
    // }else if(i % 4 == 2){
    //     uv.x -= id.y % 2 == 0 ? fract(t) : -fract(t);
    // }else if(i % 4 == 3){
    //     uv.y -= id.x % 2 == 0 ? fract(t) : -fract(t);
    // }
    // uv = fract(uv);

    // pt = uv2pt(uv);
    // float x = fill(crossSDF(pt * r2d(PI * anim), 1.5), .1);
    // c += x;

    uv = gl_FragCoord.xy / resolution.xy;
    pt = uv2pt(uv);
    pt *= .5;
    anim = 0.5 + 0.5 * cos(PI * exp(-3 * buttons[7].y));
    anim = int(buttons[7].w) % 2 == 0 ? anim : 1-anim;
    pt *= r2d(.1 * time);
    for(int i=1; i<=15; i++){
        pt *= r2d(PI * (anim * i * .01));
        pt *= 1.2;
        float star = triSDF(pt);
        // c += stroke(star, 0., .01 * sqrt(i));
    }

    out_color = c;
}
