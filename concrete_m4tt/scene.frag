#version 440
out vec4 out_color;
uniform vec4 resolution;
uniform float time;
uniform float beat;
uniform vec3 volume;
uniform vec4 buttons[32];

#include "lib/util.glsl"
#include "lib/rng.glsl"
#include "lib/ghost.glsl"
#include "lib/2d_sdf.glsl"

float id = 0;

vec3 pallette(float t){
    const vec4 phases = vec4(0.30, 0.11, 0.00, 0.);
    const vec4 amplitudes = vec4(0.37, 1.00, 1.00, 0.);
    const vec4 frequencies = vec4(0.92, 0.83, 0.87, 0.);
    const vec4 offsets = vec4(0.22, 0.00, 0.00, 0.);

  return cosine_gradient(t, phases, amplitudes, frequencies, offsets).rgb;
}


float scene(vec2 pt, float t){
    int poly = int(id*5)+3;
    pt *= r2d(PI*.5*t);
    float d = 0;
    d = crossSDF(pt, 1.) - .18*id;
    // d = circleSDF(pt) - .1 - .5*(id * (1.-t));
    // d = poly == 3 ? triSDF(pt*1.5) : polySDF(pt, poly) - .5;
    // d = starSDF(pt, 6, .1) - .3*id;
    // d = flowerSDF(pt, 3) - .5*id;
    d = rectSDF(pt, vec2(.1, .3)) - .1*id;
    return fill(d, 0.);
}

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    bool is_five = toggle(buttons[29]);
    uv = is_five ? five(uv, id) : uv2crt(uv);
    vec2 xy = vec2(int(id) % 5, int(id) / 5) / 4;
    float diag = .5 * (xy.x + xy.y);
    float vert = xy.y;
    float horz = xy.x;
    xy = xy*2-1;
    float l2_dist = length(xy);
    float l1_dist = abs(xy).x + abs(xy).y;

    if(is_five){
        if(id == 12){
            return;
        }
        id += 5.555555 * buttons[11].w;
        id = random(int(id * 2000.));
        id = abs(id);

        float pattern[6] = {id, diag, vert, horz, l2_dist, l1_dist};
        id = pattern[int(beat/64) % 6];
        id = fract(id + beat*.25);
    }else{
        id = saturate(buttons[13].y);
    }


    vec2 pt = crt_uv2pt(uv);
    vec3 t = vec3(0);
    t += buttons[12].y;
    float offset = .025;
    t.r -= offset;
    t.b += offset;
    t = 0.5 + 0.5 * cos(PI*exp(-6 * t));
    t = 1. - t;

    vec3 c = vec3(0);
    c.r = scene(pt, t.r);
    c.g = scene(pt, t.g);
    c.b = scene(pt, t.b);
    c *= mix(vec3(1), pallette(id), toggle(buttons[28]));

    if(toggle(buttons[26])){
        pt = uv2pt(gl_FragCoord.xy / resolution.xy);
        float hit = beat*.1 + buttons[8].w + 0.5 + 0.5 * cos(PI * exp(-8*saturate(buttons[8].y)));
        c += .1 * abs(noise(vec3(pt*5, hit)));
    }

    out_color = vec4(c, 1);
}
