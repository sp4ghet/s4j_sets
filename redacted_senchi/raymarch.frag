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

#include "lib/util.glsl"
#include "lib/sdf.glsl"
#include "lib/rng.glsl"

const vec3 up = vec3(0,1,0);

float mapInner(vec3 p, float scale, int i, float t, float d){
    p.xy *= r2d(PI*(1-t));
    float ret = 1000.;
    ret = box(p, vec3(scale, 1, scale));
    ret = poly(p, i, vec2(scale, .3));
    d = max(d, -ret);
    p.xy *= r2d(TAU*t);
    ret = box(p, vec3(scale, .25, scale));
    ret = poly(p, i, vec2(scale, .25));
    d = min(d, ret);
    return d;
}

vec4 map(vec3 q){
    vec3 p = q;
    vec4 d = vec4(10000, 0,0,0);

    p = q;
    p.y += .25 * noise(q*.25 + .05*bass_integrated);
    int idx = int(.25 * beat) % 4 + 4;
    float t = 0.5 + 0.5 * cos(PI * exp(-6. * fract(.25 * beat)));

    float bx = 10000.;
    bx = box(p, vec3(100, .25, 100));
    bx = max(bx, -poly(p, idx, vec2(4, .3)));
    vec3 pol_p = p;
    pol_p.xy *= r2d(PI*(1.-t));
    bx = min(bx, poly(pol_p, idx, vec2(4, .25)));

    bx = mapInner(p, 2, idx, t, bx);
    bx = mapInner(p, 1, idx, 1-t, bx);
    chmin(d, vec4(bx, 0,0,0));

    p = q - up*4;
    float sc = 1.5;
    float fr = 10000.;
    for(int i=0; i<6; i++){
        p *= r3d(PI * (.15 + 5*(volume.x)), normalize(vec3(-1, 1, 0)));
        fr = min(fr, octahedron(p, sc));
        p = abs(p);
        sc *= .45;
        p -= sc*1.5;
    }
    chmin(d, vec4(fr, 0,0,0));

    return d;
}

vec3 normal(vec3 p, vec2 e){
    return normalize( e.xyy*map( p + e.xyy).x +
					  e.yyx*map( p + e.yyx).x +
					  e.yxy*map( p + e.yxy).x +
                      e.xxx*map( p + e.xxx).x );
}

float calcSoftshadow(vec3 ro, vec3 rd, float mint, float tmax)
{
  float res = 1.;
  float t = mint;
  float ph = 1e10; // big, such that y = 0 on the first iteration

  for( int i=0; i<32; i++ )
  {
    vec3 p = ro + rd*t;
    float h = map(p).x;
    // use this if you are getting artifact on the first iteration, or unroll the
    // first iteration out of the loop
    // float y = (i==0) ? 0.0 : h*h/(2.0*ph);
    float y = h*h/(2.0*ph);
    float d = sqrt(h*h-y*y);
    res = min( res, 10.0*d/max(0.0,t-y) );
    ph = h;

    t += h * .8;
    if( res < 0.1 || t>tmax ) break;
  }
  return saturate(res);
}


void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);

    vec2 seed = pt * time;

    float cam = 0.5 + 0.5 * cos(PI * exp(-5. * buttons[11].y));
    float pre = random(int(buttons[11].w));
    float now = random(int(buttons[11].w) + 1);
    cam = mix(pre, now, cam);

    vec3 c = vec3(0);
    vec3 ro = vec3(0);
    ro = vec3(0,7,5);
    ro.xz *= r2d(PI * cam);
    pt *= r2d(cam * .5);
    vec3 fo = vec3(0);
    fo = up*4;
    vec3 rd = getOrthogonalBasis(normalize(fo - ro), up) * normalize(vec3(pt, 1));

    vec3 p = ro;
    vec4 d;
    float t=0, precis = 0;
    for(int i=0; i<128; i++){
        p = ro + rd*t;
        d = map(p);
        t += d.x;
        precis = t * .001;
        if(d.x < precis){
            break;
        }
    }

    if(d.x < precis){
        vec3 l = normalize(vec3(-1, 1, .25));
        vec3 n = normal(p, vec2(precis, -precis));
        vec3 v = -rd;
        vec3 h = normalize(l+v);

        c = vec3(1) * chi(n, l, .1);

        float sh = calcSoftshadow(p, l, .05, 20);
        sh = dot(n,l) < 0.1 ? 0.1 : sh;
        c *= sh;
    }


    out_color = vec4(c, 1);
}
