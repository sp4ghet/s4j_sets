#version 440

out vec4 out_color;

uniform vec4 resolution;

uniform sampler2D dof_1;
uniform sampler2D dof_2;
uniform sampler2D render;


#include "lib/constants.glsl"
#include "lib/dof_lib.glsl"

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 c = vec4(0);

    float cocV = texture(dof_1, uv).a;
    float cocD = texture(dof_2, uv).a;
    float dr = -PI/6.;
    float dl = -PI * 5./6.;
    c += BlurTexture(dof_1, uv, cocV * invRes * vec2(cos(dr), sin(dr))) * cocV;
    c += BlurTexture(dof_2, uv, cocD * invRes * vec2(cos(dl), sin(dl))) * cocD;
    c /= 3.;
    c.a = 1;

    c = c / (c + 1);
    c = pow(c, vec4(.4545));



    out_color = c;
}
