#version 440
out vec4 out_color;

uniform vec4 resolution;
uniform float time;
uniform float beat;
uniform vec4 buttons[32];
uniform float sliders[32];
uniform vec3 bass_smooth;
uniform vec3 mid_smooth;
uniform vec3 high_smooth;
uniform vec3 bass;
uniform vec3 mid;
uniform vec3 high;

uniform vec3 bass_integrated;

uniform vec3 volume;

uniform sampler2D dots;

#include "lib/util.glsl"
#include "lib/rng.glsl"
#include "lib/ghost.glsl"

uniform sampler2D focus_0;
uniform sampler2D focus_1;
uniform sampler2D focus_2;
uniform sampler2D focus_3;
uniform sampler2D focus_4;
uniform sampler2D focus_5;
uniform sampler2D focus_6;
uniform sampler2D logo_0;
uniform sampler2D logo_1;

uniform vec4 focus_0_res;
uniform vec4 focus_1_res;
uniform vec4 focus_2_res;
uniform vec4 focus_3_res;
uniform vec4 focus_4_res;
uniform vec4 focus_5_res;
uniform vec4 focus_6_res;
uniform vec4 logo_0_res;
uniform vec4 logo_1_res;

vec4 img(sampler2D samp, vec4 res, vec2 uv, vec2 translate, float scale, float rotate){
    vec2 pt = uv2pt(uv);
    pt -= translate;
    pt *= r2d(rotate);
    pt *= scale *  crt_res.xy / res.xy;
    vec2 samp_uv = pt2uv(pt);
    if(saturate(samp_uv) == samp_uv){
        return texture(samp, samp_uv);
    }
    return vec4(0);
}

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
        c += graph(fract(ns) - .5, 0., 0.05);
    }

    if(toggle(buttons[27])){
        st = pt*.4;
        vec2 greebleUV = pt2uv((1 + mod(beat*.2, 2)) * st * vec2(resolution.z, 1));
        vec2 greebleUV2 = pt2uv((1 + mod(beat*.2 + 1, 2)) * st * vec2(resolution.z, 1));
        c.rgb += texture(dots, greebleUV).rgb;
        c.rgb += texture(dots, greebleUV2).rgb;
        c.a += c.r;
    }

    vec2 crt = uv2crt(uv);
    float id;
    vec2 grid = five(uv, id);

    if(toggle(buttons[28]) && id != 12){
        int cycle = int(buttons[6].w + id + beat) % 9;
        if(cycle == 0){
            c += img(focus_0, focus_0_res, grid, vec2(0), 7., 0.);
        }
        if(cycle == 1){
            c += img(focus_1, focus_1_res, grid, vec2(0), 7., 0.);
        }
        if(cycle == 2){
            c += img(focus_2, focus_2_res, grid, vec2(0), 7., 0.);
        }
        if(cycle == 3){
            c += img(focus_3, focus_3_res, grid, vec2(0), 7., 0.);
        }
        if(cycle == 4){
            c += img(focus_4, focus_4_res, grid, vec2(0), 7., 0.);
        }
        if(cycle == 5){
            c += img(focus_5, focus_5_res, grid, vec2(0), 7., 0.);
        }
        if(cycle == 6){
            c += img(focus_6, focus_6_res, grid, vec2(0), 7., 0.);
        }
        if(cycle == 7){
            c += img(logo_0, logo_0_res, grid, vec2(0), 7., 0.);
        }
        if(cycle == 8){
            c += img(logo_1, logo_1_res, grid, vec2(0), 7., 0.);
        }
    }





    out_color = c;
}
