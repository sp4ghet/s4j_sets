#version 440

out vec4 out_color;

uniform vec4 resolution;

uniform sampler2D render;

#include "lib/constants.glsl"
#include "lib/dof_lib.glsl"

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    float coc = (texture(render, uv).a);
    vec4 c = vec4(0.);

    float up = PI/2.;
    c += BlurTexture(render, uv, coc * invRes * vec2(cos(up), sin(up)));
    c *= coc;
    c.a = coc;

    out_color = c;
}
