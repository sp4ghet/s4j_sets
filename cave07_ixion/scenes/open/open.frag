#version 440

out vec4 out_color;

uniform vec4 resolution;
uniform float time;
uniform vec4 buttons[32];
uniform float sliders[32];


#include "lib/util.glsl"
#include "lib/rng.glsl"

uniform sampler2D feedback;

const vec3 up = vec3(0,1,0);

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);

    vec4 c = vec4(0);

    vec3 ro = vec3(.25, 1., .75);
    // ro = vec3(cos(time), 0, sin(time)) + 1.5*up;
    vec3 fo = vec3(0,0,0);
    vec3 rov = normalize(fo - ro);

    vec3 rd = getOrthogonalBasis(rov, up) * normalize(vec3(pt, 1));

    vec3 pn = up;
    float d = 0;
    float t = -(d + dot(pn,ro)) / dot(rd,pn);
    vec3 p = ro + rd*t;

    vec2 tuv = pt2uv(p.xz * .3);
    vec4 tex = texture(feedback, tuv);
    vec3 lp = vec3(-1.25, 1.5, -.25);
    vec3 l = normalize(lp - p);
    float lint = 3 / (.01 + dot(lp-p,lp-p));
    vec3 h = normalize(l - rd);

    float f0 = 1;
    float ndotl = chi(pn, l, 0);
    float ndoth = chi(pn, h, 0);
    float spec = pow(ndoth, 20);
    c = max(tex, .1) * lint * mix(spec, ndotl, f0);

    out_color = c;
}
