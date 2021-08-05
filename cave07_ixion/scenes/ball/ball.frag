#version 410 core


out vec4 out_color; // out_color must be written in order to see anything

uniform vec4 resolution;
uniform float time;

uniform sampler1D fft;
uniform vec3 bass_integrated;
uniform vec3 bass;
uniform vec3 bass_smooth;
uniform vec3 volume;

#include "lib/util.glsl"
#include "lib/rng.glsl"

const vec3 up = vec3(0.,1.,0.);

struct hit{
    float t;
    vec3 n;
    int id;
    bool inv;
};

void chmin(inout hit a, in hit b){
    if(abs(a.t) > abs(b.t)){
        a = b;
    }
}

void sphere(vec3 ro, vec3 rd, vec3 cnt, float r, int id, inout hit h){

    float r2 = sq(r);
    vec3 oc = ro - cnt;
    float b = dot(oc, rd);
    float c = dot(oc,oc) - r2;
    float d = sq(b) - c;
    if(d < 0){ return; }

    d = sqrt(d);
    float t1 = -b - d;
    float t2 = -b + d;
    float t = t1 < .01 ? t2 : t1;
    if(t < 0) { return; }

    vec3 p = ro+rd*t;
    vec3 n = normalize(p - cnt);
    bool inv = dot(rd, n) > 0;
    n = inv ? -n : n;
    hit ret = hit(t, n, id, inv);
    chmin(h, ret);
}

void plane(vec3 ro, vec3 rd, inout hit h){
    vec3 n = up;
    float d = 0.01;

    float den = dot(rd,n);
    if(den > 0 || abs(den) < .001){ return; }

    float t = -(d + dot(n,ro)) / den;
    hit ret = hit(t, n, 1, false);
    chmin(h, ret);
}

hit intersect(vec3 ro, vec3 rd){
    hit h;
    h.t = 50;
    h.id = -1;

    sphere(ro, rd, vec3(0,1.2,0), 1, 0, h);
    sphere(ro, rd, vec3(2.5, 3.5,0), 1, 2, h);
    plane(ro, rd, h);

    return h;
}

vec2 seed = vec2(0.76, 1.3);
int sd = 13;
float water_level = 1.2;

float map(vec3 p){
    float pl = p.y - water_level + .05 * noise(vec3(p.xz * 5, .1 * bass_integrated.x));
    float sp = length(p - up*water_level) - 1;
    return max(pl, sp);
}

vec3 normal(vec3 p, vec2 e){
    return normalize( e.xyy*map(p + e.xyy) +
                      e.yyx*map(p + e.yyx) +
                      e.yxy*map(p + e.yxy) +
                      e.xxx*map(p + e.xxx) );
}

vec3 glass(inout vec3 ro, inout vec3 rd, in hit h){
    ro += rd * h.t;

    float nv = dot(h.n, -rd);
    float sn = sqrt(1 - sq(nv));
    float eta = 1.1;
    if(!h.inv){ eta = 1. / eta; }
    float r0 = (1 - eta) / (1 + eta);
    r0 *= r0;;
    float sch = r0 + (1-r0) * pow(1-nv, 5);
    float rnd = 2.18 * hash(resolution.xy + seed);
    seed += vec2(1.13756, 1.37683);

    bool refl = rnd < sch ||  sn * eta > 1;
    refl = false;
    if(refl){
        rd = reflect(rd, h.n);
    }else{
        rd = refract(rd, h.n, eta);
    }
    ro += rd * 0.01;
    if(refl){ return vec3(1); }


    vec3 p = ro;
    float acc;
    float t = 0.01, d = 0, precis = 1e-6;
    for(int i=0; i<12; i++){
        d = map(p);
        t += d;
        p = ro + rd * t;
        precis = t * .02;
        if(abs(d) < precis){
            break;
        }
    }

    if(abs(d) < precis){
        ro += t * rd;
        vec3 n = normal(p, precis*vec2(1, -1));
        rd = refract(rd, n, 1.2 / 1.3333);
        return vec3(0.3, 0.5, .9);
    }

    if(ro.y < water_level){
        return vec3(0.3, 0.5, .9);
    }

    return vec3(1);
}

vec3 diffuse(inout vec3 ro, inout vec3 rd, in hit h){
    ro += rd * h.t;
    rd = getSampleBiased(reflect(rd,h.n), 1, seed);
    // rd = reflect(rd, h.n);
    seed += vec2(1.13756, 1.37683);

    return vec3(.3, .7, .9);
}

vec3 trace(vec3 ro, vec3 rd, int n, inout hit ht){
    ht = intersect(ro, rd);

    vec3 ret = vec3(0);
    vec3 oro = ro, ord = rd;
    for(int i=0; i<n; i++){
        vec3 c = vec3(1);
        ro = oro; rd = ord;
        vec3 p = ro;
        for(int j=0; j < 4; j++){
            hit h = intersect(ro, rd);
            if(h.id == -1){
                // vec3 l = vec3(1.5, 2.5, 0) - p;

                // c *= 50 * vec3(.3, .7, .9) * chi(rd, normalize(l), .1) / dot(l,l);
                c *= 4 * mix(vec3(.3, .7, .9), vec3(.8, .3, .8), saturate(rd.y));
                break;
            }
            if(h.id == 2){
                c *= 40;
                break;
            }

            p = ro + rd * h.t;
            if(h.id == 0){
                c *= glass(ro, rd, h);
            }else if(h.id == 1){
                c *= diffuse(ro, rd, h);
                c /= PI;
            }
        }
        ret += c;
    }

    return ret;
}

void main(void)
{
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);
    seed = vec2(noise(vec3(pt*50, time)));
    seed = abs(seed);
    sd = int(noise(vec3(pt*50, time)));

    vec3 c = vec3(0);

    vec3 ro = vec3(0., 2.5, 3.5);
    ro.xz *= r2d(time);
    vec3 fo = vec3(0, 1.2, 0);
    vec3 rov = normalize(fo - ro);
    vec3 rd = getOrthogonalBasis(rov, vec3(0,1,0)) * normalize(vec3(pt, 1.));

    hit h;
    const int n = 15;
    c = trace(ro, rd, n, h) / float(n);

    // c = mix(vec3(1), c, exp(-.025 * h.t));


    out_color = vec4(c, 1);
}
