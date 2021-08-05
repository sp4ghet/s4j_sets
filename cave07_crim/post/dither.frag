#version 440
out vec4 out_color;

uniform vec4 resolution;
uniform float sliders[32];
uniform vec4 buttons[32];
uniform float time;
uniform float beat;

uniform sampler2D render;

#include "lib/util.glsl"
#include "lib/rng.glsl"

// dithering matrix (16 levels)
const float M[16] = float[16](  0.,  8.,  2., 10.,
                            12.,  4., 14.,  6.,
                            3., 11.,  1.,  9.,
                            15.,  7., 13.,  5.  );

vec3 dither16( vec2 pos, vec3 clr ){

    // Get position in the matrix and threshold
    int   x     = int(pos.x) % 4;
    int   y     = int(pos.y) % 4;
    float thres = M[x+4*y] / 16.;

    // Saturate input and Init output var
    clr = min(vec3(1.0),max(vec3(0.0),clr));
    vec3 result = vec3( clr.x<0.5, clr.y<0.5, clr.z<0.5 );

    // check if the current pixel exceed the threshold
    vec3  dist  = abs(result - clr);
    if (dist.r < thres){
        result.r = 1.0 - result.r;
    }
    if (dist.g < thres){
        result.g = 1.0 - result.g;
    }
    if (dist.b < thres){
        result.b = 1.0 - result.b;
    }

    // return result
    return 1.0 - result;
}



void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec3 c = texture(render, uv).rgb;
    if(toggle(buttons[30])){
        c = dither16(gl_FragCoord.xy, c);
    }

    out_color = vec4(c, 1.);
}
