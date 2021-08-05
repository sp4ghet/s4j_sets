#version 440

out vec4 out_color;

uniform vec4 resolution;
uniform float time;
uniform vec4 buttons[32];

uniform vec3 bass_smooth;
uniform vec3 bass;
uniform vec3 high_smooth;
uniform vec3 volume;

const vec3 up = vec3(0.,1.,0.);
float shrt;

#include "lib/util.glsl"

float noise(vec3 p, float t){
  float ns=0, amp=1, trk=1.5 + t;
  const vec3 seed = vec3(-4,-2,.5);
  mat3 rot = getOrthogonalBasis(seed, up);
  for(int i=0; i<4; i++){
    p += sin(p.zxy + trk)*1.6;
    ns += sin(dot(cos(p), sin(p.zxy)))*amp;
    p *= rot;
    p *= 2.3;
    trk *= 1.5;
    amp *= .5;
  }
  return ns*.5;
}

float fs(vec2 p){
  return fract(sin(dot(p, vec2(12.41245, 78.233))) * 421251.543123);
}

float random(float x){
  return fs(vec2(x, x*.3));
}

vec2 seed;
float rnd(){
  return fs(seed);
}

vec3 rndSphere(){
  float t = PI*rnd();
  float p = TAU*rnd();
  return vec3(cos(t)*cos(p), sin(t), cos(t)*sin(p));
}

vec3 rndHemi(vec3 n){
  vec3 v = rndSphere();
  return dot(n,v) > 0 ? v : -v;
}

float box(vec3 p, vec3 b){
  p = abs(p) - b;
  return min(0, max(p.x, max(p.y, p.z))) + length(max(p,0));
}

vec4 map(vec3 q){
  vec3 p = q;
  vec4 d = vec4(100000, 0,0,0);


  float bx = box(p, vec3(5, 3.25, 7));
  float bx2 = box(p, vec3(4, 3, 6));
  bx = max(bx, -bx2);
  bx2 = box(p - vec3(0,5,-1), vec3(1,2,1)) - .5;
  bx = max(bx, -bx2);
  bx -= .05*noise(p, buttons[5].y);
  chmin(d, vec4(bx, 0,0,0));

  p=q - vec3(-1, 0, -2);
  p.y -= shrt*2 - 1;
  p.xy *= r2d(PI*.2);
  for(int i=0; i<10; i++){
    p.zy *= r2d(-PI*.35*(.3 + shrt));
    p.xy *= r2d(-PI*.4*(1.3 - shrt*shrt));
    p.y -= .15;
    p = abs(p);
  }

  bx = box(p, vec3(.01, .2, .01));
  chmin(d, vec4(bx, 1,0,0));

  return d;
}

vec3 normal(vec3 p){
  vec2 e = vec2(0, 0.07678);
  return normalize(vec3(
    map(p + e.yxx).x - map(p - e.yxx).x,
    map(p + e.xyx).x - map(p - e.xyx).x,
    map(p + e.xxy).x - map(p - e.xxy).x
  ));
}


void main()
{
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);

    seed = vec2(noise(vec3(pt*37, time), 15.3), noise(vec3(pt*25, time), 1.2));


    shrt = 0.5 + 0.5 * cos(PI * exp(-8.0 * buttons[4].y));
    float pre = random(buttons[4].w);
    float now = random(buttons[4].w + 1);
    shrt = mix(pre, now, shrt);

    float lng = 0.5 + 0.5 * cos(PI * exp(-3.0 * buttons[5].y));
    pre = random(buttons[5].w);
    now = random(buttons[5].w + 1.);
    lng = mix(pre, now, lng);

    vec3 c = vec3(0.);

    float lngAngle = .4 * TAU * (lng - .5) + PI*.5;
    vec3 ro = vec3(0,0,3);

    vec3 fo = vec3(-1, 2*shrt - 1,-2);
    ro.xz *= r2d(lngAngle);


    vec3 rov = normalize(fo - ro);
    vec2 pt2 = pt * r2d((shrt - .5)*PI*.3);
    vec3 rd = getOrthogonalBasis(rov, up) * normalize(vec3(pt2, 1));

    float t=0;
    vec3 p=ro;
    vec4 d;
    for(int i=0; i<64; i++){
        p = ro + rd*t;
        d = map(p);
        if(abs(d.x) < 0.01){
        break;
        }
        t += d.x;
    }

    vec3 l = normalize(vec3(1,4,1));
    float lint = 1.5*bass_smooth.x;
    if(abs(d.x) < 0.01){
        vec3 n = normal(p);
        c += max(0, dot(n,l));
        float fre = pow(1 - abs(dot(n,rd)) , 5);
        c += fre;

        float ao=0,ss=0;
        vec3 h = normalize(l-rd);
        for(int i=1;i<=10;i++){
        float aot = 0.1*i + .05*rnd();
        float sst = 0.3*i + .5*rnd();
        vec3 nd = mix(n,rndHemi(n),.2);
        ao += map(p+nd*aot).x/aot;
        ss += map(p+h*sst).x/sst;
        }
        c += ss*.1;
        c *= ao*.1;

        if(d.y == 1){
            c *= vec3(25, 1, 1.5);
        }

        vec3 hitp = p;
        float sh=1, tt=.1;
        for(int i=0; i<24; i++){
            hitp = p + l*tt;
            float d = map(hitp).x;
            tt += d + .2*rnd();
            if(d < 0.001){
                sh = 0;
                break;
            }
            if(tt > 30){
                break;
            }
            sh = min(sh, 88*d/tt);
        }

        c *= saturate(.2+sh*lint);
    }


    float od=0;
    vec3 acc=vec3(0), fogC = 2*vec3(1, .8, .8);
    int n=16;
    float st=min(2, t/n), tt=0;
    for(int i=0; i<n; i++){
        p = ro + rd*tt;
        tt += st*(.95+.1*rnd());
        od += .2*(1 + abs(noise(p*3, time))) * st;

        vec3 pp=p; float t=0.1;
        float sh=2;
        for(int j=0; j<24; j++){
        pp = p + l*t;
        float d = map(pp).x;
        t += d;
        if(d < 0.01){
            sh=0;
            break;
        }
        }
        acc += exp(-od*fogC)*sh*st;
    }
    c *= exp(-0.25*od);
    c += 1*lint*acc;

    // c *= 1. - length(pt);

    out_color = vec4(c,1.);
}
