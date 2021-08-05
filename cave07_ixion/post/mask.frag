#version 440
out vec4 out_color;

uniform vec4 resolution;
uniform float time;
uniform float sliders[32];
uniform vec4 buttons[32];

uniform sampler2D render;
uniform sampler2D pure;

#include "lib/util.glsl"
#include "lib/rng.glsl"
#include "lib/2d_sdf.glsl"

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);

    int seed = int(buttons[4].w);
    float mask = 0;
    for(int i=0; i<5; i++){
        vec2 disp = .5 * vec2(random(seed), random(seed + 5));
        vec2 sz = vec2(random(seed - 13), random(seed * 4));
        sz = abs(sz) * vec2(3., 5.);
        seed += 17;
        float d = rectSDF(pt - disp, sz);
        mask += fill(d, .2);
    }
    mask = 1. - saturate(mask);
    mask = 1;

    vec4 no_post = texture(pure, uv);
    vec4 post = texture(render,uv);

    vec4 c = mix(no_post, post, mask);

    out_color = c;
}
