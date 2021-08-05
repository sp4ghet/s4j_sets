#version 440
out vec4 v_color;

uniform vec4 resolution;
uniform int vertexCount;
uniform float time;
uniform vec3 volume;

uniform sampler1D spectrum;
uniform sampler1D samples;
uniform float sliders[32];

uniform sampler2D jsp;
uniform vec4 jsp_res;

#include "lib/util.glsl"

vec4 quad(int idx){
    if(idx == 1){
        return vec4(-1,0,1,1);
    }
    if(idx == 2){
        return vec4(1,0,1,1);
    }
    if(idx == 4){
        return vec4(1,0,1,1);
    }
    if(idx == 5){
        return vec4(1,0,-1,1);
    }
    return vec4(-1,0,-1,1);
}

void main(){
    int vid = gl_VertexID;
    int quad_id = vid / 6;
    int quad_in = vid % 6;
    vec4 p = quad(quad_in);

    int n = int(sqrt(vertexCount/6));
    int x = quad_id % n;
    int y = quad_id / n;


    vec2 uv = vec2(x,y) / n;
    uv = uv*2 - 1.;

    p.xyz /= n;
    p.xz += uv;
    uv = p.xz/2 + .5;
    uv = fract(uv + vec2(1,0).yx * sliders[9] * time);
    float height = texture(jsp, uv).r;
    height = pow(height, 2.2);
    p.y +=  .05 * height;
    // p.y += .1 * sin(time + 3*TAU*length(p.xz));
    p.yz *= r2d(PI / 7);
    p.xyz *= 3;


    mat4 view = mat4(vec4(1,0,0,0),
                     vec4(0,1,0,0),
                     vec4(0,0,1,0),
                     vec4(0,0,0,1));
    vec3 ro = vec3(0, 0, -5);
    mat3 camera = getOrthogonalBasis(normalize(ro), vec3(0,1,0));
    view[0].xyz = camera[0];
    view[1].xyz = camera[1];
    view[2].xyz = camera[2];
    view[3].xyz = ro;

    const float far = 100;
    const float near = 0.001;
    mat4 proj = mat4(vec4(resolution.w, 0, 0, 0),
                     vec4(0, 1, 0, 0),
                     vec4(0, 0, - 2 / (far - near), 0),
                     vec4(0, 0, - (far+near) / (far-near), 1));
    mat4 vp = proj * view;
    p = vp * p;


    gl_Position = p;
    vec3 c = vec3(height);
    c *= step(.1, abs(fract(20*uv.x - time + .1 * texture(samples, uv.y).r)));
    v_color = vec4(c, 1);
}
