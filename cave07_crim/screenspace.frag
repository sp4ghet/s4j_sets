#version 440
out vec4 out_color;

uniform vec4 resolution;
uniform float sliders[32];
uniform vec4 buttons[32];
uniform float time;
uniform float beat;

uniform sampler2D scene;

#include "lib/util.glsl"
#include "lib/uv_disp.glsl"
#include "lib/rng.glsl"
#include "lib/post.glsl"

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);

    vec3 c = texture(scene, uv).rgb;


    out_color = vec4(c, 1.);
}
