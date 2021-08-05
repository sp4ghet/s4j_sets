#version 440

out vec4 out_color;

uniform vec4 resolution;
uniform float time;
uniform vec4 buttons[32];
uniform float sliders[32];

uniform vec3 bass_smooth;
uniform vec3 mid_smooth;
uniform vec3 high_smooth;
uniform vec3 bass;
uniform vec3 mid;
uniform vec3 high;

#include "lib/util.glsl"
#include "lib/rng.glsl"

uniform sampler2D feedback;

vec4 mygrad(float t){
    const vec4 phases = TAU * vec4(0.59, 0.00, 0.00, 0.);
    const vec4 amplitudes = vec4(0.99, 0.54, 1.00, 0.);
    const vec4 frequencies = vec4(1.00, 1.00, 0.16, 0.);
    const vec4 offsets = vec4(0.00, 0.10, 0.00, 0.);


    t *= TAU;

    return offsets + amplitudes * 0.5 * cos(t * frequencies + phases) + 0.5;
}

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);

    vec2 disp = .1 * vec2(noise(vec3(pt * 5.6 + 13., time)), noise(vec3(pt * 5.7 - 8.3, time + 3.5)));
    vec4 pre = texture(feedback, fract(uv + disp));

    int kaleidoCount = isPress(buttons[12]) ? 1 : 0;
    kaleidoCount += isPress(buttons[13]) ? 3 : 0;
    kaleidoCount += isPress(buttons[14]) ? 5 : 0;
    kaleidoCount += isPress(buttons[15]) ? 7 : 0;

    for(int i=0; i<kaleidoCount; i++){
        pt = abs(pt);
        pt *= r2d(sliders[7] * PI);
        pt -= time * .1;
        pt = uv2pt(fract(pt2uv(pt)));
    }
    uv = pt2uv(pt);

    pt = uv2pt(uv);

    vec4 c = vec4(0);

    // c.rg = lofi(uv, 5);
    // c.ba += .75;
    // c.a = abs(sin(30*uv.y * PI));
    float t = abs(noise(vec3(pt * 10, time)));
    c = mygrad(t);
    // c += step(max(abs(pt).y, abs(pt.x)), .3);

    float blend = 0.99 * buttons[4].x;
    c = mix(c, pre, blend);

    out_color = c;
}
