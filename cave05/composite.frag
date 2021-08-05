#version 440
out vec4 out_color;

uniform vec4 resolution;
uniform float time;

uniform vec4 buttons[32];
uniform float sliders[32];
uniform vec3 volume;
uniform float beat;

uniform sampler2D fft;
uniform sampler2D osci;
uniform sampler2D scene;
uniform sampler2D compy;
uniform sampler2D foreground;
uniform sampler2D particles;
uniform sampler2D composite;

uniform sampler2D cave_logo;
const vec4 cave_logo_res = vec4(1707., 1707., 1., 1.);
uniform sampler2D meme;
const vec4 meme_res = vec4(3300., 1932., 3300./1932., 1932. / 3300.);

uniform sampler2D tyler;
const vec4 tyler_res = vec4(357, 395, 357./395., 395./357.);

#pragma include "./lib/util.glsl"
#pragma include "./lib/uv_disp.glsl"


void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    int kaleidoCount = isPress(buttons[12]) ? 3 : 0;
    kaleidoCount += isPress(buttons[13]) ? 7 : 0;
    kaleidoCount += isPress(buttons[14]) ? 5 : 0;
    kaleidoCount += isPress(buttons[15]) ? 4 : 0;
    uv = kaleido(uv, kaleidoCount);

    vec2 pt = uv2pt(uv);

    vec4 c = vec4(0.);

    if(toggle(buttons[28])){
        uv += .001 * noise(vec3(uv * 5 + time, 1));
        c = vec4(texture(composite, uv).rgb, 1);
    }


    if(toggle(buttons[21])){
        vec4 computed = texture(compy, uv);
        computed = (.5+volume.x)*vec4(smoothstep(0.1, .2, computed.b));
        c = mix(computed, c, c.a);
    }

    if(toggle(buttons[24])){
        vec4 particle = texture(particles, uv);
        c = mix(c, particle, particle.a);
    }
    if(toggle(buttons[20])){
        vec4 sceneVal = texture(scene,uv);
        c = mix(c, sceneVal, sceneVal.a);
    }




    // for(int i=0; i<3; i++){
    //     pt = abs(pt) - .25;
    //     float hit = floor(beat) + 0.5 + 0.5 * cos(exp(-4*fract(beat)));
    //     pt *= r2d(PI*.25*hit);
    // }

    // uv = pt2uv(pt);

    vec2 tylerUV = pt2uv(pt * vec2(tyler_res.w * resolution.z, 1.));
    vec4 tyler_val = texture(tyler, tylerUV);
    if(saturate(tylerUV) == tylerUV){
        // c = tyler_val;
    }

    uv = gl_FragCoord.xy / resolution.xy;
    pt = uv2pt(uv);

    vec4 fore = texture(foreground, uv);
    c = mix(c, fore, fore.a);

    float two_d = texture(fft, uv).r;
    two_d += texture(osci, uv - vec2(0, .0)).r;
    c = mix(c, vec4(1), two_d);




    out_color = c;
}
