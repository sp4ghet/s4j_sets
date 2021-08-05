#version 410 core


out vec4 out_color; // out_color must be written in order to see anything

uniform vec4 resolution;
uniform float time;

uniform sampler1D fft;
uniform vec3 bass_integrated;
uniform vec3 bass;
uniform vec3 volume;

#include "lib/util.glsl"
#include "lib/rng.glsl"
#include "lib/sdf.glsl"

const vec3 up = vec3(0.,1.,0.);

#define TRUNK 1
#define LEAF 2

const mat3 euler(float x, float y, float z){
  float cx = cos(x), cy = cos(y), cz = cos(z), sx = sin(x), sy = sin(y), sz = sin(z);

  return mat3(cx*cy, cx*sy*sz - sx*cz, cx*sy*cz + sx*sz,
              sx*cy, sx*sy*sz + cx*cz, sx*sy*cz - cx*sz,
              -sy, cy*sz, cy*cz);
}

float map_leaf(vec3 p){
    float d = ellipsoid(p, vec3(.2, .05, 1.));

    const float t = PI * .1;
    const vec2 nor = vec2(cos(t), sin(t));
    const float sp = 0.05;
    p.z = mod(p.z, sp)  - sp * .5;
    float cut = max(-abs(p.x) - .5, -p.z);

    d = max(d, -cut);
    return d;
}

float curve(float x){
    return x * x;
}

vec4 map_tree(vec3 q){
    q.x = -abs(q.x) + 3.;
    q.z = mod(q.z, 5) - 2.5;
    vec3 p = q;
    vec4 d = vec4(1e5, 0,0,0);

    p.x += .5*sin(p.y);
    vec3 base = vec3(0,0,0);
    vec3 top = vec3(0,3,0) * (1 + volume.x * bass.x);
    float trunk = capsule(p, base, top, .1);
    chmin(d, vec4(trunk, TRUNK,0,0));

    vec3 pp = p;
    float leaf = 1000;
    const int n = 12;
    for(int i=0; i<n; i++){
        p = q -  top - up*.35;
        p.yz *= r2d(.5 * random(i+13));
        p.xz = p.xz * r2d(i * TAU / n) - vec2(.45);
        p.xz *= r2d(-PI*.25);
        p.x = abs(p.x);
        p.xy *= r2d(-PI*.15);
        p.y += curve(p.z);
        leaf = min(leaf, map_leaf(p));
    }
    chmin(d, vec4(leaf * .5, LEAF,0,0));

    return d;
}

vec4 map(vec3 q){
    vec3 p = q;
    vec4 d = vec4(1e5, 0,0,0);

    chmin(d, map_tree(p));

    float pl = p.y + noise(p)*.1;
    chmin(d, vec4(pl, 0,0,0));

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

void main(void)
{
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);

    vec3 c = vec3(0);

    vec3 ro = vec3(0., 1.5, 4. + time);
    vec3 fo = ro + vec3(0,0,1);
    vec3 rov = normalize(fo - ro);
    vec3 cu = normalize(cross(rov, up));
    vec3 cv = cross(cu, rov);
    vec3 rd = mat3(cu,cv,rov) * normalize(vec3(pt, 1.));

    float t = 0.01;
    float maxt = 50.;
    vec4 d;
    vec3 p = ro;
    float precis = 0;

    for(int i=0; i<128; i++){
        p = ro + rd*t;
        d = map(p);
        if(abs(d.x) < precis || t > maxt){
            t = t >= maxt ? maxt : t;
            break;
        }
        t += d.x;
        precis = t * .001;
    }

    vec3 l = normalize(vec3(.9, 1., .2));
    if(abs(d.x) <= precis){
        vec3 n = normal(p, vec2(precis, -precis));
        vec3 albedo = vec3(1);
        if(d.y == TRUNK){
            albedo = vec3(.8, .45, .3);
        }
        if(d.y == LEAF){
            albedo = vec3(.2, .9, .2);
        }
        c += albedo * chi(n, l, .1);

        c *= dot(n,l) > 0 ? calcSoftshadow(p, l, .05, 15) : .1;
    }

    c = mix(vec3(.9, .2, .7), c, exp(-.01 * t));

    out_color = vec4(c, 1);
}
