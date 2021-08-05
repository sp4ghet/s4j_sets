#version 440

out vec4 out_color;

uniform vec4 resolution;
uniform float time;
uniform float sliders[32];
uniform vec4 buttons[32];

uniform sampler2D yura;
uniform sampler2D fft;
uniform sampler2D osci;

uniform sampler2D yurayura;
uniform vec4 yurayura_res;


uniform sampler2D anataga;
uniform vec4 anataga_res;
uniform sampler2D anocono;
uniform vec4 anocono_res;
uniform sampler2D caeru;
uniform vec4 caeru_res;
uniform sampler2D cocohe;
uniform vec4 cocohe_res;
uniform sampler2D conobashowo;
uniform vec4 conobashowo_res;
uniform sampler2D hatenai;
uniform vec4 hatenai_res;
uniform sampler2D hutariha;
uniform vec4 hutariha_res;
uniform sampler2D itsu;
uniform vec4 itsu_res;
uniform sampler2D itsuca;
uniform vec4 itsuca_res;
uniform sampler2D nare;
uniform vec4 nare_res;
uniform sampler2D otozurerutoci;
uniform vec4 otozurerutoci_res;
uniform sampler2D secaiwo;
uniform vec4 secaiwo_res;
uniform sampler2D toocu;
uniform vec4 toocu_res;
uniform sampler2D umihe;
uniform vec4 umihe_res;
uniform sampler2D utaha;
uniform vec4 utaha_res;
uniform sampler2D yumeni;
uniform vec4 yumeni_res;


#include "lib/util.glsl"
#include "lib/ghost.glsl"
#include "lib/rng.glsl"

vec4 img(sampler2D img, vec4 img_res, vec2 uv, float scale, vec2 translate){
    vec2 img_uv = pt2uv(crt_uv2pt(uv) * vec2(1) * scale - scale*translate);
    if(saturate(img_uv) == img_uv){
        return texture(img, img_uv);
    }
    return vec4(0);
}
void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 c = vec4(0);
    vec2 pt = uv2pt(uv);
    float scale = 5;
    pt += .002 * vec2(noise(vec3(scale*pt, time)), noise(vec3(scale*pt, -time)));
    vec2 preUV = pt2uv(pt);
    pt = uv2pt(uv);
    c = texture(yura, preUV) * (.99);

    float t = time +  (sliders[11] - .5) * 4;
    float text_scale = 1.5;
    if(t > 3.0 && t < 3.2){
        c += img(itsuca, itsuca_res, uv, 2., vec2(-.5, .5)).aaaa;
    }
    if(t > 5.17 && t < 5.3){
        c += img(anataga, anataga_res, uv, 2., vec2(.5, .5)).aaaa;
    }
    if(t > 9. && t < 9.2){
        c += img(conobashowo, conobashowo_res, uv, 2., vec2(-.5, -.5)).aaaa;
    }
    if(t > 11 && t < 11.2){
        c += img(otozurerutoci, otozurerutoci_res, uv, 2., vec2(.5, -.5)).aaaa;
    }

    if(t > 62. && t < 62.2){
        c += img(itsu, itsu_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 64.8 && t < 65.){
        c += img(hutariha, hutariha_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 69 && t < 69.35){
        c += img(cocohe, cocohe_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 77.8 && t < 78){
        c += img(itsu, itsu_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 81 && t < 81.3){
        c += img(hatenai, hatenai_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 85 && t < 85.2){
        c += img(umihe, umihe_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 94.2 && t < 94.4){
        c += img(itsu, itsu_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 97.2 && t < 97.4){
        c += img(anocono, anocono_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 100.7 && t < 100.9){
        c += img(utaha, utaha_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 109.7 && t < 109.9){
        c += img(itsu, itsu_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 113 && t < 113.2){
        c += img(secaiwo, secaiwo_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 117 && t < 117.3){
        c += img(caeru, caeru_res, uv, text_scale, vec2(0)).aaaa;
    }

    if(t > 126.2 && t < 126.4){
        c += img(toocu, toocu_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 128 && t < 128.2){
        c += img(nare, nare_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 130.4 && t < 130.6){
        c += img(toocu, toocu_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 131.9 && t < 132.1){
        c += img(nare, nare_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 134.3 && t < 134.5){
        c += img(toocu, toocu_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 135.6 && t < 135.8){
        c += img(nare, nare_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 138.2 && t < 138.4){
        c += img(yumeni, yumeni_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 140 && t < 140.3){
        c += img(nare, nare_res, uv, text_scale, vec2(0)).aaaa;
    }

    if(t > 142.4 && t < 142.6){
        c += img(toocu, toocu_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 143.7 && t < 143.9){
        c += img(nare, nare_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 145.7 && t < 145.9){
        c += img(toocu, toocu_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 147.6 && t < 147.8){
        c += img(nare, nare_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 150.3 && t < 150.5){
        c += img(toocu, toocu_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 151.4 && t < 151.6){
        c += img(nare, nare_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 153.6 && t < 153.8){
        c += img(yumeni, yumeni_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 157.3 && t < 158.3){
        c += img(nare, nare_res, uv, text_scale, vec2(0)).aaaa;
    }

    if(t > 174 && t < 174.2){
        c += img(itsu, itsu_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 177.2 && t < 177.4){
        c += img(anocono, anocono_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 180.7 && t < 180.9){
        c += img(utaha, utaha_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 189.7 && t < 189.9){
        c += img(itsu, itsu_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 193.75 && t < 193.95){
        c += img(secaiwo, secaiwo_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 197.7 && t < 197.9){
        c += img(caeru, caeru_res, uv, text_scale, vec2(0)).aaaa;
    }

    if(t > 206.1 && t < 206.3){
        c += img(toocu, toocu_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 207.3 && t < 207.5){
        c += img(nare, nare_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 209.7 && t < 210.1){
        c += img(toocu, toocu_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 211.5 && t < 211.7){
        c += img(nare, nare_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 214.1 && t < 214.3){
        c += img(toocu, toocu_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 215.5 && t < 215.7){
        c += img(nare, nare_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 218.1 && t < 218.3){
        c += img(yumeni, yumeni_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 219.9 && t < 220.1){
        c += img(nare, nare_res, uv, text_scale, vec2(0)).aaaa;
    }

    if(t > 222.4 && t < 222.6){
        c += img(toocu, toocu_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 223.8 && t < 224.){
        c += img(nare, nare_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 226.1 && t < 226.3){
        c += img(toocu, toocu_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 227.6 && t < 227.8){
        c += img(nare, nare_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 230.3 && t < 230.5){
        c += img(toocu, toocu_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 231.6 && t < 231.8){
        c += img(nare, nare_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 233.9 && t < 234.1){
        c += img(yumeni, yumeni_res, uv, text_scale, vec2(0)).aaaa;
    }
    if(t > 238.1 && t < 239.1){
        c += img(nare, nare_res, uv, text_scale, vec2(0)).aaaa;
    }

    if(isPress(buttons[0])){
    vec2 yuraUV = pt2uv(pt * vec2(resolution.z / yurayura_res.w, 1.));
        if(yuraUV == saturate(yuraUV)){
            c += texture(yurayura, yuraUV).aaaa;
        }
    }
    if(toggle(buttons[17])){
        c += texture(osci, uv);
    }
    if(toggle(buttons[18])){
        c += texture(fft, uv);
    }

    out_color = c;
}
