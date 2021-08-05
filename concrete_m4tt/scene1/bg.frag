#version 440

out vec4 out_color;

uniform vec4 resolution;
uniform float time;
uniform float beat;
uniform vec3 volume;
uniform float sliders[32];
uniform vec4 buttons[32];

uniform sampler2D points;

const float far = 1000.;
const float near = .1;

float LinearizeDepth(float depth)
{
    float z = depth * 2.0 - 1.0; // back to NDC
    return (2.0 * near * far) / (far + near - z * (far - near));
}

#include "lib/dof_lib.glsl"
#include "lib/util.glsl"
#include "lib/rng.glsl"
#include "lib/sdf.glsl"
#include "lib/shading.glsl"
#include "lib/uv_disp.glsl"
#include "lib/ghost.glsl"

const vec3 up = vec3(0, 1, 0);
float id = 0;

float mapTunnel(vec3 p){
    float d = 100000.;
    // p.yz *= r2d(PI*.5);
    p.z -= time;
    float ns =  noise(p) * .01;
    p.xy = abs(p.xy) - 2;
    d = min(0, max(p.x, p.y)) + length(max(p.xy, 0));
    d = 1-d;
    // d = 3. - length(p.xy);

    return  d + ns;
}

vec4 map(vec3 q){
    vec3 p = q;
    vec4 d = vec4(100000., 0,0,0);

    float tunnel = mapTunnel(p);
    chmin(d, vec4(tunnel, 0,0,0));

    // float motif = length(p - vec3(2,0,-12)) - .01;
    // chmin(d, vec4(motif, 1, 0, 0));

    float sp = length(p) - .2 * volume.x - .2;
    chmin(d, vec4(sp, 2, 0, 0));

    // float shrt = buttons[11].y;
    // shrt = 0.5 + 0.5 * cos(PI * exp(-4. * shrt));
    // // p.y += .15;
    // p.xy *= r2d(PI*.2);
    // for(int i=0; i<10; i++){
    //     p.zy *= r2d(-PI*id*(.3 + shrt));
    //     p.xy *= r2d(-PI*.4*(1.3 - shrt*shrt));
    //     p.y -= .025;
    //     p = abs(p);
    // }

    // float bx = box(p, vec3(.01, .2, .01));
    // // chmin(d, vec4(bx, 2, 0,0));

    return d;
}

vec3 normal(vec3 p, vec2 eps){
    return normalize(vec3(
        map(p + eps.xyy).x - map(p - eps.xyy).x,
        map(p + eps.yxy).x - map(p - eps.yxy).x,
        map(p + eps.yyx).x - map(p - eps.yyx).x
    ));
}

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    // uv = uv2crt(uv);
    // uv = five(uv, id);


    int kaleidoCount = isPress(buttons[12]) ? 3 : 0;
    kaleidoCount += isPress(buttons[13]) ? 7 : 0;
    kaleidoCount += isPress(buttons[14]) ? 5 : 0;
    kaleidoCount += isPress(buttons[15]) ? 4 : 0;
    uv = kaleido(uv, kaleidoCount);
    if(id == 12){
        return;
    }
    id += 5.555555 * floor(beat/8);
    id = random(int(id * 2000.));


    vec4 c = vec4(.1, .5, .5, 1.);
    vec4 scene =  texture(points, uv);
    c = mix(c, scene, step(0.1, scene.r));
    c.a = LinearizeDepth(c.a);
    c.a += .62;

    vec2 pt = uv2pt(uv);
    float t = 0.1;
    vec3 ro = vec3(0, 0, 1.5);
    vec3 fo = vec3(0);
    mat3 cam = getOrthogonalBasis(normalize(fo-ro), up);
    vec3 rd = cam * normalize(vec3(pt, 1.));

    vec3 p = ro;
    vec4 d;
    for(int i=0; i<300; i++){
        p = ro + rd*t;
        d = map(p);
        t += d.x * .25;
        if(d.x < 0.01 || t > 100.) {
            break;
        }
    }

    vec3 l = normalize(vec3(-0.2, 1, .2));
    vec3 l1 = normalize(vec3(.2, -.5, -.2));

    vec3 forward = cam * vec3(0,0,1);
    t *= dot(rd, forward);

    if(d.x < 0.01 && t < c.a){
        vec3 n = normal(p, vec2(.000768, 0));
        vec3 albedo = vec3(.1);
        float metallic = 0.99;
        float roughness = 0.01;
        if(d.y == 2){
            albedo = vec3(.5, .1, .3);
            metallic = .99;
            roughness = .3;
        }
        vec3 v = -rd;
        c.rgb *= 0;
        c.rgb += BRDF(v, l, n, metallic, roughness, albedo);
        c.rgb += BRDF(v, l1, n, metallic, roughness, albedo);

        if(d.y == 1){
            c.rgb += 100.;
        }
        c.a = t;
    }


    float focal_depth = 2.5;
    float focal_length = .5;
    c.a = CoC(c.a, focal_length, focal_depth, far, near);
    c.a = max(0.01, min(0.35, c.a));

    out_color = c;
}
