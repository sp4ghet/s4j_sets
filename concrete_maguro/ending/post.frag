#version 440

out vec4 out_color;

uniform vec4 resolution;
uniform float time;
uniform float sliders[32];
uniform vec4 buttons[32];

uniform vec3 high_smooth;

uniform sampler2D lyrics;

#include "lib/util.glsl"
#include "lib/rng.glsl"
#include "lib/post.glsl"
#include "lib/ghost.glsl"
#include "lib/uv_disp.glsl"

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    float hitJitter = 2*high_smooth.x;
    uv = jitterY(uv, hitJitter*sliders[4]*.05, 720.);

    vec4 c = texture(lyrics, uv);

    c.rgb = grain(c.rgb, uv, 1., sliders[2]);
    c.rgb = ACESFilm(c.rgb);
    c = pow(c, vec4(.4545));


    out_color = c;
}
