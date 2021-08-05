#version 440

out vec4 out_color;

uniform vec4 resolution;

uniform sampler2D render;
uniform sampler2D dof_1;

#include "lib/constants.glsl"
#include "lib/dof_lib.glsl"


void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    float coc = (texture(render, uv).a);
    vec4 c = vec4(0.);

    float ur = -PI/6.;
    c += BlurTexture(render, uv, coc * invRes * vec2(cos(ur), sin(ur)));
    c *= coc;
    c += texture(dof_1, uv);

    c.a = coc;

    out_color = c;
}
