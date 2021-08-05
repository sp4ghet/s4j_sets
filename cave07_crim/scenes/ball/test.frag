#version 410 core


out vec4 out_color; // out_color must be written in order to see anything

uniform vec4 resolution;
uniform float time;

uniform sampler1D fft;
uniform vec3 bass_integrated;

#include "lib/util.glsl"
#include "lib/rng.glsl"


const vec3 up = vec3(0.,1.,0.);

vec4 map(vec3 ro, vec3 q){
  vec3 p = q;
  vec4 d = vec4(1e5, 0,0,0);

  float pl = ro.y > 0 ? p.y : -p.y;
  pl -= .1 * noise(vec3(p.xz, time));

  chmin(d, vec4(pl, 0,0,0));

  return d;
}

vec3 normal(vec3 p, vec2 e, vec3 ro){
    return normalize( e.xyy*map(ro, p + e.xyy).x +
                      e.yyx*map(ro, p + e.yyx).x +
                      e.yxy*map(ro, p + e.yxy).x +
                      e.xxx*map(ro, p + e.xxx).x );
}

void main(void)
{
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);

    vec3 c = vec3(1);

    vec3 ro = vec3(0., sin(time), 3.);
    vec3 fo = vec3(0,0,0);
    vec3 rov = normalize(fo - ro);
    vec3 rd = getOrthogonalBasis(rov, up) * normalize(vec3(pt, 1.));

    float t = 0.01;
    float maxt = 25.;
    vec4 d;
    vec3 p = ro;
    float precis = 1e-6;

    for(int i=0; i<100; i++){
        p = ro + rd*t;
        d = map(ro, p);
        t += d.x;
        precis = t * .001;
        if(abs(d.x) < precis || t > maxt){
            t = t >= maxt ? maxt : t;
            break;
        }
    }

    if(abs(d.x) < precis){
        vec3 n = normal(p, vec2(precis, -precis), ro);
        vec3 albedo = vec3(1);
        c = abs(n);
    }else{
        c = vec3(1,0.1,1);
    }

    out_color = vec4(c, 1);
}
