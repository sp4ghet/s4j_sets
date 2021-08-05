#version 440
out vec4 out_color;

uniform vec4 resolution;
uniform float sliders[32];
uniform vec4 buttons[32];
uniform float time;
uniform float beat;

uniform sampler2D composite;

#include "lib/util.glsl"
#include "lib/uv_disp.glsl"
#include "lib/rng.glsl"
#include "lib/post.glsl"
#include "lib/ghost.glsl"

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);

    float hitJitter = 1. - 0.5 - 0.5 * cos(PI*exp(-12 * saturate(buttons[2].z)));
    hitJitter = max(buttons[2].x, hitJitter);
    uv = jitterY(uv, hitJitter*sliders[4]*.05, 720.);

    float hitShake = 1. - 0.5 - 0.5 * cos(PI*exp(-8 * saturate(buttons[3].z)));
    hitShake = max(step(0.1, buttons[3].x), hitShake);
    uv += hitShake*sliders[5]*.1*vec2(random(int(2000*time)), random(int(3000*time)*2));

    vec3 c = glitch(uv, buttons[0].x * .5 * sliders[0], 1., composite);
    if(isPress(buttons[10])){
      float id;
      vec2 crt_uv = five(uv, id);
      c *= ascii(crt_uv, vec2(900) * sliders[3], composite, crt_res.xy);
    }

    uv = gl_FragCoord.xy / resolution.xy;
    // c *= max(.25, mask(uv));

    out_color = vec4(c, 1.);
}
