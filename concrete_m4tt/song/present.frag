#version 440
out vec4 out_color;

uniform vec4 resolution;
uniform sampler1D spectrum;

uniform sampler2D yura;

uniform sampler2D checker;

#include "lib/util.glsl"
#include "lib/ghost.glsl"


void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    float id;
    // vec2 crt_uv = five(uv, id);
    vec4 c = texture(yura, uv);
    c.rgb *= vec3(.1 , .8, .9);
    c.rgb += .1 * vec3(.1, .8, .9);

    out_color = c;
}
