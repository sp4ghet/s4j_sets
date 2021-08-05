#version 410 core


out vec4 out_color; // out_color must be written in order to see anything

uniform vec4 resolution;
uniform float time;

uniform sampler1D fft;
uniform vec3 bass_integrated;

#include "lib/util.glsl"
#include "lib/rng.glsl"


const vec3 up = vec3(0.,1.,0.);


const mat3 rot(float x, float y, float z){
  float cx = cos(x), cy = cos(y), cz = cos(z), sx = sin(x), sy = sin(y), sz = sin(z);

  return mat3(cx*cy, cx*sy*sz - sx*cz, cx*sy*cz + sx*sz,
              sx*cy, sx*sy*sz + cx*cz, sx*sy*cz - cx*sz,
              -sy, cy*sz, cy*cz);
}

float sph(vec3 i, vec3 f, ivec3 c){
  float rad =  .5 * hoskins_hash(i+c);
  return length(f-vec3(c)) - rad;
}

float based(vec3 p){
    vec3 i = floor(p);
    vec3 f = fract(p);

    return min(min(min(sph(i,f,ivec3(0,0,0)),
                      sph(i,f,ivec3(0,0,1))),
                  min(sph(i,f,ivec3(0,1,0)),
                      sph(i,f,ivec3(0,1,1)))),
              min(min(sph(i,f,ivec3(1,0,0)),
                      sph(i,f,ivec3(1,0,1))),
                  min(sph(i,f,ivec3(1,1,0)),
                      sph(i,f,ivec3(1,1,1)))));
}

mat3 r = rot(PI*.23, PI*.76, PI*.37);

vec3 purp = vec3(.9, .05, .9);
vec3 orag = 1.2*vec3(.8, .35, .1);

vec4 map(vec3 q){
  vec3 p = q;
  vec4 d = vec4(1e5, 0,0,0);

  p = q - vec3(.7,0,.75);
  float bell0 = .3 * exp(-1.5*dot(p.xz, p.xz));
  p = q + vec3(1.,0,0);
  float bell1 = .75*exp(-2*dot(p.xz, p.xz));

  float pl = p.y - bell1 - bell0;
  float s = 1.;

  for(int i=0; i<5; i++){
    float n = based(p)*s;
    n = smax(n, pl-.1*s, .3*s);
    pl = smin(pl, n, .3*s);
    s *= .5;
    p = r*p/.5;
  }

  p = q*20;
  p.z -= bass_integrated.r * .1;
  float gr = min(fract(p.z), fract(p.x));
  gr = step(gr, 0.05) * step(-0.05, gr);

  vec3 pal = mix(vec3(.1, .05, .3), purp, gr);
  chmin(d, vec4(pl, pal));

  p = q - vec3(0,1.,-5);
  float sun = length(p) - 2.5;
  pal = mix(purp, orag, p.y);
  chmin(d, vec4(sun, pal));

  return d;
}

vec3 normal(vec3 p, vec2 e){
    return normalize( e.xyy*map( p + e.xyy).x +
                      e.yyx*map( p + e.yyx).x +
                      e.yxy*map( p + e.yxy).x +
                      e.xxx*map( p + e.xxx).x );
}

float chi(vec3 n, vec3 l){
    return max(dot(n,l), .1);
}

void main(void)
{
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);

    vec3 c = vec3(1);

    vec3 ro = vec3(0., .25, 3.);
    vec3 fo = vec3(0,0,0);
    vec3 rov = normalize(fo - ro);
    vec3 cu = normalize(cross(rov, up));
    vec3 cv = cross(cu, rov);
    vec3 rd = mat3(cu,cv,rov) * normalize(vec3(pt, 1.));

    float t = 0.01;
    float maxt = 25.;
    vec4 d;
    vec3 p = ro;
    float precis = 1e-6;

    for(int i=0; i<100; i++){
        p = ro + rd*t;
        d = map(p);
        t += d.x;
        precis = t * .001;
        if(abs(d.x) < precis || t > maxt){
            t = t >= maxt ? maxt : t;
            break;
        }
    }

    if(abs(d.x) < precis){
        vec3 n = normal(p, vec2(precis, -precis));
        vec3 albedo = d.yzw;
        c = albedo;
    }else{
        c = mix(orag, purp, uv.y);
    }

    c *= abs(sin(pt.y*400 + time));

    out_color = vec4(c,0);
}
