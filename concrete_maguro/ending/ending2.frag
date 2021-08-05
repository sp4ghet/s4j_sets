#version 440

out vec4 out_color;

uniform vec4 resolution;
uniform float time;
uniform float sliders[32];

uniform sampler2D lyrics;

uniform sampler2D itecurereba_0;
uniform sampler2D iidace_0;
uniform sampler2D itecurereba_1;
uniform sampler2D iidace_1;
uniform sampler2D itecurereba_2;
uniform sampler2D iidace_2;
uniform sampler2D itecurereba_3;
uniform sampler2D iidace_3;
uniform sampler2D itecurereba_4;
uniform sampler2D iidace_4;
uniform sampler2D itecurereba_5;
uniform sampler2D iidace_5;
uniform sampler2D itecurereba_6;
uniform sampler2D iidace_6;
uniform sampler2D itecurereba_7;
uniform sampler2D iidace_7;
uniform sampler2D itecurereba_8;
uniform sampler2D iidace_8;
uniform sampler2D itecurereba_9;
uniform sampler2D iidace_9;
uniform sampler2D itecurereba_10;
uniform sampler2D iidace_10;
uniform sampler2D itecurereba_11;
uniform sampler2D iidace_11;

uniform vec4 itecurereba_0_res;
uniform vec4 iidace_0_res;
uniform vec4 itecurereba_1_res;
uniform vec4 iidace_1_res;
uniform vec4 itecurereba_2_res;
uniform vec4 iidace_2_res;
uniform vec4 itecurereba_3_res;
uniform vec4 iidace_3_res;
uniform vec4 itecurereba_4_res;
uniform vec4 iidace_4_res;
uniform vec4 itecurereba_5_res;
uniform vec4 iidace_5_res;
uniform vec4 itecurereba_6_res;
uniform vec4 iidace_6_res;
uniform vec4 itecurereba_7_res;
uniform vec4 iidace_7_res;
uniform vec4 itecurereba_8_res;
uniform vec4 iidace_8_res;
uniform vec4 itecurereba_9_res;
uniform vec4 iidace_9_res;
uniform vec4 itecurereba_10_res;
uniform vec4 iidace_10_res;
uniform vec4 itecurereba_11_res;
uniform vec4 iidace_11_res;

uniform sampler2D ocaeri;
uniform sampler2D cocothume;
uniform sampler2D sosite;
uniform sampler2D arigato;
uniform sampler2D su;
uniform sampler2D shi;

uniform vec4 ocaeri_res;
uniform vec4 cocothume_res;
uniform vec4 sosite_res;
uniform vec4 arigato_res;
uniform vec4 su_res;
uniform vec4 shi_res;

uniform sampler2D yurayura;
uniform vec4 yurayura_res;

#include "lib/util.glsl"
#include "lib/ghost.glsl"

vec4 img(sampler2D img, vec4 img_res, vec2 uv, float scale, vec2 translate, float rot){
    vec2 img_uv = pt2uv(r2d(PI * rot) * crt_uv2pt(uv) * vec2(resolution.xy / img_res.xy) * scale - scale*translate);
    if(saturate(img_uv) == img_uv){
        return texture(img, img_uv);
    }
    return vec4(0);
}

void do_lyric(float fr, float to, float t, float val, inout vec4 c){
    if(t > fr){
        if(t < to){
            c = mix(c, vec4(val,0,0,0), val);
        }else{
            c = max(c, .3 * val);
        }

    }
}

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 c = texture(lyrics, uv);
    uv = uv2crt(uv);

    float t = time + (sliders[9] - .5) * 4;
    float tmp = 0;

        tmp = img(itecurereba_0, itecurereba_0_res, uv, 1., vec2(0, .5), .1).a;
    do_lyric(70.49, 72.73, t, tmp, c);
    tmp = img(iidace_0, iidace_0_res, uv, 1., vec2(0, -1), .1).a;
    do_lyric(71.49, 72.73, t, tmp, c);

    tmp = img(itecurereba_1, itecurereba_1_res, uv, 1.2, vec2(0, 1.), -0.05).a;
    do_lyric(73.05, 75.41, t, tmp, c);
    tmp = img(iidace_1, iidace_1_res, uv, 1., vec2(0, -1), 0.).a;
    do_lyric(74.20, 75.41, t, tmp, c);

    tmp = img(itecurereba_2, itecurereba_2_res, uv, 1.2, vec2(0, 1.), -0.).a;
    do_lyric(75.81, 78.04, t, tmp, c);
    tmp = img(iidace_2, iidace_2_res, uv, 1., vec2(0, -1.), 0.).a;
    do_lyric(76.95, 78.04, t, tmp, c);

        tmp = img(itecurereba_3, itecurereba_3_res, uv, 1.2, vec2(0, 1.), 0.).a;
    do_lyric(78.53, 80.87, t, tmp, c);
    tmp = img(iidace_3, iidace_3_res, uv, 1., vec2(0, -.5), 0.).a;
    do_lyric(79.57, 80.87, t, tmp, c);

    tmp = img(itecurereba_4, itecurereba_4_res, uv, 1.1, vec2(0, 1.), 0.).a;
    do_lyric(81.18, 83.39, t, tmp, c);
    tmp = img(iidace_4, iidace_4_res, uv, 1., vec2(0), 0.).a;
    do_lyric(82.28, 83.39, t, tmp, c);

    tmp = img(itecurereba_5, itecurereba_5_res, uv, 1.2, vec2(0, 1.), 0.).a;
    do_lyric(83.71, 86.11, t, tmp, c);
    tmp = img(iidace_5, iidace_5_res, uv, 1., vec2(0, -1.), 0.).a;
    do_lyric(84.90, 86.11, t, tmp, c);

        tmp = img(itecurereba_6, itecurereba_6_res, uv, 1.2, vec2(0), 0.).a;
    do_lyric(86.44, 87.53, t, tmp, c);
    tmp = img(iidace_6, iidace_6_res, uv, 1., vec2(0), 0.).a;
    do_lyric(87.72, 88.84, t, tmp, c);

    tmp = img(itecurereba_7, itecurereba_7_res, uv, 1.2, vec2(0), -0.02).a;
    do_lyric(89.14, 91.58, t, tmp, c);
    tmp = img(iidace_7, iidace_7_res, uv, 1., vec2(0, -1.), 0.).a;
    do_lyric(90.40, 91.58, t, tmp, c);

    tmp = img(itecurereba_8, itecurereba_8_res, uv, 1.1, vec2(0), 0.).a;
    do_lyric(91.82, 94.31, t, tmp, c);
    tmp = img(iidace_8, iidace_8_res, uv, 1., vec2(0, -1.), 0.).a;
    do_lyric(93.14, 94.31, t, tmp, c);

        tmp = img(itecurereba_9, itecurereba_9_res, uv, 1.1, vec2(0), 0.).a;
    do_lyric(94.55, 96.90, t, tmp, c);
    tmp = img(iidace_9, iidace_9_res, uv, 1., vec2(0, -1.), 0.).a;
    do_lyric(95.78, 96.90, t, tmp, c);

    // vocal only
    tmp = img(itecurereba_10, itecurereba_10_res, uv, 1.1, vec2(0), 0.).a;
    do_lyric(97.36, 98.34, t, tmp, c);
    tmp = img(iidace_10, iidace_10_res, uv, 1., vec2(0), 0.).a;
    do_lyric(98.46, 99.70, t, tmp, c);

    tmp = img(itecurereba_11, itecurereba_11_res, uv, 1.1, vec2(0), 0.).a;
    do_lyric(100.00, 101.02, t, tmp, c);
    tmp = img(iidace_11, iidace_11_res, uv, 1., vec2(0), 0.).a;
    do_lyric(101.19, 102.25, t, tmp, c);

        tmp = img(itecurereba_0, itecurereba_0_res, uv, 1.1, vec2(0), 0.).a;
    do_lyric(102.63, 103.68, t, tmp, c);
    tmp = img(iidace_0, iidace_0_res, uv, 1., vec2(0), 0.).a;
    do_lyric(103.87, 105.00, t, tmp, c);

    tmp = img(itecurereba_1, itecurereba_1_res, uv, 1.2, vec2(0), 0.).a;
    do_lyric(105.29, 106.44, t, tmp, c);
    tmp = img(iidace_1, iidace_1_res, uv, 1., vec2(0), 0.).a;
    do_lyric(106.59, 107.71, t, tmp, c);

    tmp = img(itecurereba_2, itecurereba_2_res, uv, 1.2, vec2(0), 0.).a;
    do_lyric(108.06, 109.15, t, tmp, c);
    tmp = img(iidace_2, iidace_2_res, uv, 1., vec2(0), 0.).a;
    do_lyric(109.30, 110.47, t, tmp, c);

        tmp = img(itecurereba_7, itecurereba_7_res, uv, 1.2, vec2(0), 0.).a;
    do_lyric(110.71, 111.83, t, tmp, c);
    tmp = img(iidace_7, iidace_7_res, uv, 1., vec2(0), 0.).a;
    do_lyric(111.97, 113.08, t, tmp, c);

    tmp = img(itecurereba_6, itecurereba_6_res, uv, 1.2, vec2(0), 0.).a;
    do_lyric(113.30, 114.52, t, tmp, c);
    tmp = img(iidace_6, iidace_6_res, uv, 1., vec2(0), 0.).a;
    do_lyric(114.69, 115.80, t, tmp, c);

    tmp = img(itecurereba_5, itecurereba_5_res, uv, 1.2, vec2(0), 0.).a;
    do_lyric(116.14, 117.15, t, tmp, c);
    tmp = img(iidace_5, iidace_5_res, uv, 1., vec2(0), 0.).a;
    do_lyric(117.30, 123, t, tmp, c);

    if(t > 122){
        c.rgb = vec3(0);
    }

    if(t > 124 && t < 125){
        c = img(ocaeri, ocaeri_res, uv, .6, vec2(0), 0.).aaaa;
    }
    if(t > 126 && t < 127){
        c = img(cocothume, cocothume_res, uv, .6, vec2(0), 0.).aaaa;
    }
    if(t > 128 && t < 129){
        c = img(sosite, sosite_res, uv, .6, vec2(0), 0.).aaaa;
    }
    if(t > 130 && t < 131){
        c = img(arigato, arigato_res, uv, 1.2, vec2(0), 0.).aaaa;
    }
    if(t > 132){
        c = img(su, su_res, uv, 2.3, vec2(1.85, -1.075), 0.).aaaa;
        c += img(shi, shi_res, uv, 2.3, vec2(2.9, -1.075), 0.).aaaa;
        c += img(yurayura, yurayura_res, uv, .5, vec2(-4.75, 0.), 0.).aaaa;
    }

    if(t > 150){
        c = vec4(0);
    }

    c.a = 1;
    out_color = c;
}
