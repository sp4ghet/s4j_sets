#version 440

out vec4 out_color;

uniform vec4 resolution;
uniform float time;
uniform float beat;
uniform vec4 buttons[32];
uniform float sliders[32];

uniform vec3 volume;
uniform vec3 volume_integrated;
uniform vec3 bass;
uniform vec3 bass_smooth;
uniform vec3 bass_integrated;
uniform vec3 high;
uniform vec3 high_smooth;
uniform vec3 high_integrated;
uniform vec3 mid;
uniform vec3 mid_smooth;
uniform vec3 mid_integrated;

uniform sampler1D spectrum;

#include "lib/util.glsl"
#include "lib/sdf.glsl"
#include "lib/rng.glsl"

uniform sampler2D render;

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);

    vec3 c = vec3(0);
    int n = int(100 * bass_smooth.x) + 1;
    // pt -= .1 * noise(vec3(pt*.1, time));
    // vec2 offset = 0.25 *
    pt /= pow(.99, n/2);
    for(int i=0; i<n; i++){
        pt *= .99;
        pt -= .003 * bass_smooth.x * normalize(vec2(bass_smooth.x - .5))*r2d(PI * (mid_smooth.x + high_smooth.x));
        vec2 tuv = pt2uv(pt);
        c += texture(render, tuv).rgb;
    }
    c /= n;

    out_color = vec4(c, 1);
}
