#version 440

out vec4 out_color;

uniform vec4 resolution;
uniform float time;
uniform float sliders[32];
uniform vec4 buttons[32];

#include "lib/util.glsl"

uniform sampler2D ndi;

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);

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

    vec3 c = texture(ndi, uv).rgb;
    c = pow(c, vec3(2.2));
    // c = vec3(1) * gray(c);

    out_color = vec4(c, 1);
}
