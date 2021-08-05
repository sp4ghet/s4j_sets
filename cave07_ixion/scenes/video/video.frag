#version 440

out vec4 out_color;

uniform vec4 resolution;
uniform float time;
uniform float sliders[32];
uniform vec4 buttons[32];

#include "lib/util.glsl"

uniform sampler2D code;

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv) * (1 + sliders[10] * .2);
    uv = pt2uv(pt);

    int kaleidoCount = isPress(buttons[12]) ? 1 : 0;
    kaleidoCount += isPress(buttons[13]) ? 3 : 0;
    kaleidoCount += isPress(buttons[14]) ? 5 : 0;
    kaleidoCount += isPress(buttons[15]) ? 7 : 0;
    // kaleidoCount += 1;

    for(int i=0; i<kaleidoCount; i++){
        pt = abs(pt);
        pt *= r2d(sliders[7] * PI);
        pt -= time * .1;
        pt = uv2pt(fract(pt2uv(pt)));
    }


    vec4 c = vec4(0);
    if(max(uv.x,uv.y) > 1 || min(uv.x, uv.y) < 0){
        c.rgb = vec3(.62, .6, .02);
    }else{
        uv = pt2uv(pt);
        c = texture(code, uv);

        c = pow(c, vec4(2.2,2.2,2.2,1));
        if(toggle(buttons[31])){
            c.rgb = vec3(1) * gray(c.rgb);
        }
    }


    out_color = c;;
}
