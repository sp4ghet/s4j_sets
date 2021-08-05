#version 440
out vec4 v_color;

uniform vec4 resolution;
uniform int vertex_count;
uniform float time;
uniform vec3 volume;
uniform vec4 buttons[32];
uniform float beat;

uniform sampler2D waterfall;

uniform sampler2D focus_0;
uniform sampler2D focus_1;
uniform sampler2D focus_2;
uniform sampler2D focus_3;
uniform sampler2D focus_4;
uniform sampler2D focus_5;
uniform sampler2D focus_6;
uniform sampler2D logo_0;
uniform sampler2D logo_1;

uniform vec4 focus_0_res;
uniform vec4 focus_1_res;
uniform vec4 focus_2_res;
uniform vec4 focus_3_res;
uniform vec4 focus_4_res;
uniform vec4 focus_5_res;
uniform vec4 focus_6_res;
uniform vec4 logo_0_res;
uniform vec4 logo_1_res;

#include "lib/util.glsl"
#include "lib/ghost.glsl"

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

vec4 img(sampler2D samp, vec4 res, vec2 uv, vec2 translate, float scale, float rotate){
    vec2 pt = uv2pt(uv);
    pt -= translate;
    pt *= r2d(rotate);
    pt *= scale *  crt_res.xy / res.xy;
    vec2 samp_uv = pt2uv(pt);
    if(saturate(samp_uv) == samp_uv){
        return texture(samp, samp_uv);
    }
    return vec4(0);
}

float getHeight(vec2 uv){
    vec4 c = vec4(0);
    int cycle = int(buttons[6].w + beat) % 9;
        if(cycle == 0){
            c += img(focus_0, focus_0_res, uv, vec2(0), 7., 0.);
        }
        if(cycle == 1){
            c += img(focus_1, focus_1_res, uv, vec2(0), 7., 0.);
        }
        if(cycle == 2){
            c += img(focus_2, focus_2_res, uv, vec2(0), 7., 0.);
        }
        if(cycle == 3){
            c += img(focus_3, focus_3_res, uv, vec2(0), 7., 0.);
        }
        if(cycle == 4){
            c += img(focus_4, focus_4_res, uv, vec2(0), 7., 0.);
        }
        if(cycle == 5){
            c += img(focus_5, focus_5_res, uv, vec2(0), 7., 0.);
        }
        if(cycle == 6){
            c += img(focus_6, focus_6_res, uv, vec2(0), 7., 0.);
        }
        if(cycle == 7){
            c += img(logo_0, logo_0_res, uv, vec2(0), 7., 0.);
        }
        if(cycle == 8){
            c += img(logo_1, logo_1_res, uv, vec2(0), 7., 0.);
        }

    return c.a;
}

void main(){
    int vid = gl_VertexID;
    int quad_id = vid / 6;
    int quad_in = vid % 6;
    vec4 p = quad(quad_in);

    int n = int(sqrt(vertex_count/6));
    int x = quad_id % n;
    int y = quad_id / n;


    vec2 uv = vec2(x,y) / n;
    uv = uv*2 - 1.;

    p.xyz /= n;
    p.xz += uv;
    uv = p.xz * .5 + .5;
    uv.y = 1. - uv.y;
    float height = 0;
    height += getHeight(uv2crt(uv)) * .25;
    height += texture(waterfall, uv).r;
    // height = pow(height, 2.2);
    // height = 2. * log(1. + height);
    p.y += height;
    p.z += .1;
    p.xz *= 1.2;
    p.yz *= r2d(-PI * .3);

    mat4 view = mat4(vec4(1,0,0,0),
                     vec4(0,1,0,0),
                     vec4(0,0,1,0),
                     vec4(0,0,0,1));
    vec3 ro = vec3(0, 0, -3);
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
    vec3 c = vec3(pow(height, 1.2));
    v_color = vec4(c, 1);
}
