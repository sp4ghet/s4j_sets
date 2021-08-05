#version 440

struct info{
    vec3 color;
    vec3 p;
};

out info v_out;

uniform vec4 resolution;
uniform int vertexCount;
uniform float time;
uniform vec4 buttons[32];

#pragma include "lib/util.glsl"
#pragma include "lib/rng.glsl"

const float far = 1000;
const float near = .1;

vec3 point(int vid, int t){
    float ph = TAU * random(vid * 3 + t);
    float r = .7 + abs(random(vid * 7 + t));
    float z = 10 * random(vid + t);

    return vec3(r * cos(ph), r * sin(ph), z);
}

void main() {
    // int vid = (gl_VertexID + 1) / 2;
    int vid = gl_VertexID;
    // vid *= int(time * 5);

    float anim = buttons[11].y;
    anim = 0.5 + 0.5 * cos(PI * exp(-4. * anim));
    int t = int(buttons[11].w);

    vec3 prev_p = point(vid, t);
    vec3 next_p = point(vid, t+1);
    vec3 now_p = mix(prev_p, next_p, anim);
    vec4 p = vec4(now_p, 1);
    p.z -= time;
    p.z = mod(p.z, 20);
    // vec4 p = vec4(random(vid), random(vid * 3), random(vid * 7), 1);
    // p.xy *= .5 * r;

    mat4 view = mat4(vec4(1,0,0,0),
                     vec4(0,1,0,0),
                     vec4(0,0,1,0),
                     vec4(0,0,0,1));
    vec3 ro = vec3(0, 0, -1.5);
    mat3 camera = getOrthogonalBasis(normalize(ro), vec3(0,1,0));
    view[0].xyz = camera[0];
    view[1].xyz = camera[1];
    view[2].xyz = camera[2];
    view[3].xyz = ro;


    float fov = PI / 3.;
    float s = 1. / tan(fov / 2);
    mat4 persp = mat4(vec4(s * resolution.w, 0, 0, 0),
                     vec4(0, s, 0, 0),
                     vec4(0, 0, - (far + near) / (far - near), -1),
                     vec4(0, 0, - (2 * far * near) / (far - near), 0));
    mat4 vp = persp * view;
    p = vp * p;

    gl_Position = p;
    gl_PointSize = 0.0;
    vec3 c = vec3(100);
    info vinfo = info(c, p.xyz / p.w);

    v_out = vinfo;
}
