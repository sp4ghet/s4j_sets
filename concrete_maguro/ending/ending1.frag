#version 440

out vec4 out_color;

uniform vec4 resolution;
uniform float time;
uniform float beat;
uniform float sliders[32];

uniform sampler2D ciniiruto;
uniform sampler2D shibotta;
uniform sampler2D tabenocosu;
uniform sampler2D mou_owari;
uniform sampler2D sacebi;
uniform sampler2D tsubureru;
uniform sampler2D gouonde;
uniform sampler2D utau_saru;
uniform sampler2D itecurereba_0;
uniform sampler2D iidace_0;
uniform sampler2D cireina;
uniform sampler2D agetacunaru;
uniform sampler2D carerumade;
uniform sampler2D hanatu;
uniform sampler2D naniiro;
uniform sampler2D mieru;
uniform sampler2D darouca;
uniform sampler2D ugocanai;
uniform sampler2D curuumade;
uniform sampler2D hazucasisa;
uniform sampler2D nacunaru;


uniform vec4 ciniiruto_res;
uniform vec4 shibotta_res;
uniform vec4 tabenocosu_res;
uniform vec4 mou_owari_res;
uniform vec4 sacebi_res;
uniform vec4 tsubureru_res;
uniform vec4 gouonde_res;
uniform vec4 utau_saru_res;
uniform vec4 itecurereba_0_res;
uniform vec4 iidace_0_res;
uniform vec4 cireina_res;
uniform vec4 agetacunaru_res;
uniform vec4 carerumade_res;
uniform vec4 hanatu_res;
uniform vec4 naniiro_res;
uniform vec4 mieru_res;
uniform vec4 darouca_res;
uniform vec4 ugocanai_res;
uniform vec4 curuumade_res;
uniform vec4 hazucasisa_res;
uniform vec4 nacunaru_res;

#include "lib/util.glsl"
#include "lib/ghost.glsl"

vec4 my_grad(float t){
    const vec4 phases = vec4(0.33, 0.66, 0.00, 0.);
    const vec4 amplitudes = vec4(1.00, 1.00, 1.00, 0.);
    const vec4 frequencies = vec4(1.00, 1.00, 1.00, 0.);
    const vec4 offsets = vec4(0.00, 0.00, 0.00, 0.);

    return cosine_gradient(t, phases, amplitudes, frequencies, offsets);
}

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
    uv = uv2crt(uv);
    vec4 c = vec4(0);

    float t = time + (sliders[9] - .5) * 4;
    float tmp = 0;
    tmp = img(ciniiruto, ciniiruto_res, uv, 1.2, vec2(0, 1.5), 0.).a;
    do_lyric(0.8, 3.1, t, tmp, c);

    tmp = img(shibotta, shibotta_res, uv, 1.1, vec2(0, .5), 0.).a;
    do_lyric(3.65, 10.44, t, tmp, c);

    tmp = img(tabenocosu, tabenocosu_res, uv, 1.1, vec2(0), 0.).a;
    do_lyric(11.5, 14.22, t, tmp, c);

    tmp = img(mou_owari, mou_owari_res, uv, 1., vec2(0, -1.0), 0.).a;
    do_lyric(14.65, 21.06, t, tmp, c);

    tmp = img(sacebi, sacebi_res, uv, 1.3, vec2(0), 0.).a;
    do_lyric(21.79, 23.46, t, tmp, c);

    tmp = img(tsubureru, tsubureru_res, uv, 1., vec2(0, 1.), 0.).a;
    do_lyric(24.21, 26.37, t, tmp, c);

    tmp = img(gouonde, gouonde_res, uv, 1., vec2(0, -.5), 0.).a;
    do_lyric(25.1, 26.37, t, tmp, c);

    tmp = img(utau_saru, utau_saru_res, uv, 1.05, vec2(0), 0.15).a;
    do_lyric(26.98, 29.63, t, tmp, c);



    tmp = img(itecurereba_0, itecurereba_0_res, uv, 1., vec2(0, 1.), 0.).a;
    do_lyric(54.32, 55.27, t, tmp, c);

    tmp = img(iidace_0, iidace_0_res, uv, 1., vec2(0, -1.5), 0.).a;
    do_lyric(55.45, 56.37, t, tmp, c);

    tmp = img(cireina, cireina_res, uv, 1., vec2(0), 0.).a;
    do_lyric(56.94, 57.68, t, tmp, c);

    tmp = img(agetacunaru, agetacunaru_res, uv, 1., vec2(0), 0.).a;
    do_lyric(57.96, 59.39, t, tmp, c);

    tmp = img(carerumade, carerumade_res, uv, 1., vec2(0), 0.).a;
    do_lyric(59.66, 60.57, t, tmp, c);

    tmp = img(hanatu, hanatu_res, uv, 1., vec2(0), 0.).a;
    do_lyric(60.73, 61.37, t, tmp, c);

    if(t > 62.22 && t < 64.42){
        // c *= my_grad(uv.x + uv.y + beat*2);
    }

    tmp = img(naniiro, naniiro_res, uv, 1.2, vec2(0, 1.25), 0.).a;
    do_lyric(62.22, 64.42, t, tmp, c);

    tmp = img(mieru, mieru_res, uv, 1., vec2(0), 0.).a;
    do_lyric(63.09, 64.42, t, tmp, c);

    tmp = img(darouca, darouca_res, uv, 1.2, vec2(0, -1.1), 0.).a;
    do_lyric(63.09, 64.42, t, tmp, c);

    tmp = img(ugocanai, ugocanai_res, uv, 1., vec2(0), 0.).a;
    do_lyric(65.01, 65.64, t, tmp, c);

    tmp = img(curuumade, curuumade_res, uv, 1., vec2(0), 0.).a;
    do_lyric(65.7, 67.17, t, tmp, c);

    tmp = img(hazucasisa, hazucasisa_res, uv, 1.1, vec2(0), 0.).a;
    do_lyric(67.69, 69.33, t, tmp, c);

    tmp = img(nacunaru, nacunaru_res, uv, 1., vec2(0), 0.).a;
    do_lyric(69.60, 70.19, t, tmp, c);


    out_color = c;
}
