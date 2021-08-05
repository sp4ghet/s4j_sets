#version 440

out vec4 out_color;

uniform vec4 resolution;
uniform float time;
uniform float beat;
uniform vec4 buttons[32];
uniform vec4 sliders[32];

uniform vec3 volume;
uniform vec3 volume_integrated;
uniform vec3 bass;
uniform vec3 mid;
uniform vec3 high;
uniform vec3 bass_smooth;
uniform vec3 mid_smooth;
uniform vec3 high_smooth;
uniform vec3 bass_integrated;
uniform vec3 bass_smooth_integrated;
uniform vec3 mid_smooth_integrated;
uniform vec3 high_smooth_integrated;
uniform sampler1D spectrum;
uniform sampler1D spectrum_smooth;

uniform sampler2D albedo_tex;
uniform sampler2D normal_tex;

#include "lib/util.glsl"
#include "lib/ghost.glsl"
#include "lib/sdf.glsl"
#include "lib/rng.glsl"
#include "lib/uv_disp.glsl"



const vec3 up = vec3(0,1,0);



struct mat {
    float d;
    mat3 rot;
    vec3 p;
    int id;
};

void chmin(inout mat a, in mat b){
    if(a.d > b.d){
        a = b;
    }
}

const mat3 I = mat3(1,0,0,0,1,0,0,0,1);

float remap(float x, vec2 fr, vec2 to){
    float ctrl = clamp(x, fr.x, fr.y);
    ctrl = (ctrl - fr.x) / (fr.y - fr.x);
    return mix(to.x, to.y, ctrl);
}

float metaballs(inout vec3 q){
  float metaball = 10000.;
  vec3 p = q;

  const int n = 8;
  const vec2 seed = vec2(random(n), random(n*n));
  vec3 pos[n];

  for(int i=0; i < n; i++){
    pos[i] = random_sphere(float(i) + seed * 1.123241) * 5.;
    // pos[i] = floor(pos[i]);
  }


  for(int i=0; i < n; i++){
    float idx = float(i);
    float mt = buttons[11].w;
    float t = saturate(buttons[11].y);
    float noise = hash(vec2(idx + mt) + seed);
    float prenoise = hash(vec2(idx + mt - 1) + seed);
    float c = 0.5 + 0.5 * cos(PI * exp(-8 * t));

    float swz = floor(hash(idx + seed));
    vec3 to = vec3(0.);
    float toVal = noise * 8.;
    vec3 pre = vec3(0.);
    float preVal = prenoise * 8.;
    if(swz < 0){
      to.x = toVal;
      pre.x = preVal;
    }else{
      to.y = toVal;
      pre.y = preVal;
    }
    to = floor(to);
    pre = floor(pre);
    vec3 spp = pos[i];
    spp += mix(pre, to, c);

    float size = mix(prenoise * 2., noise * 2., c);
    size = abs(size) + .1;
    float sp = length(p - spp) - 1.5 - size;
    // float sp = box(p - spp, vec3(1.) + volume * 3. + noise);
    // q = metaball < sp ? q : p;
    metaball = smin(metaball, sp, 1.);
  }

  return metaball;
}

mat map(vec3 q){
    mat d;
    d.d = 10000.;
    vec3 p = q;

    // mat3 rsp = I;
    // p = q + vec3(2, 0, 0);
    // float sp0 = length(p) - .5 - 1*bass_smooth.r;
    // chmin(d, mat(sp0, I, p, 0));
    // p = q;
    // float sp1 = length(p) - .5 - 1*mid_smooth.r;
    // chmin(d, mat(sp1, I, p, 0));
    // p = q - vec3(2,0,0);
    // float sp2 = length(p) - .5 - 1*high_smooth.r;
    // chmin(d, mat(sp2, I, p, 0));

    // float stretch = 10* bass_smooth.x;
    // mat3 rbx = I;
    // p.x -= bass_smooth_integrated.x * .1;
    // p.x = mod(p.x, 5) - 2.5;
    // rbx *= r3d(time + stretch * p.y, up);
    // p *= rbx;
    // float bx = box(p, vec3(1,1 + stretch,1)) - .1;
    // bx *= .5;
    // mat bx_mat = mat(bx, rbx, p, 1);
    // chmin(d, bx_mat);

    p = q*3.;
    float mb = metaballs(p) / 3;
    chmin(d, mat(mb, I, p/3, 5));

    // p = q;
    // float offset = .15;
    // const int n = 16;
    // float t = 0.5 + 0.5 * cos(PI*exp(-1. * buttons[9].y));
    // // t = 1. - t;
    // for(int i=0; i<16; i++){
    //     p=q;
    //     p.y -= (-n/2 + i)*offset;
    //     float lvl = bass_smooth.x;
    //     float id = random(i + int(buttons[9].w));
    //     rbx = r3d(.1 * lvl * id, vec3(0,0,1));
    //     rbx *= r3d(TAU*lvl*id, up);
    //     p *= rbx;
    //     p.xz -= lvl * vec2(sin(TAU*(id + t)), cos(TAU*(id + t)));
    //     float bx1 = box(p, vec3(1., .05, 1.)) - .01;
    //     chmin(d, mat(bx1, rbx, p, 2));
    // }

    // q.z -= .25 * bass_smooth_integrated.x;
    // p = q;
    // p.xz = mod(p.xz, 6) - 3.;
    // p.z += .25;
    // mat3 rhex = r3d(PI*.5, vec3(1,0,0));
    // rhex *= r3d(.5 * high_smooth_integrated.x, up);
    // p *= rhex;
    // float hex = poly(p, 6, vec2(1., .25));
    // chmin(d, mat(hex, rhex, p, 3));

    // p = q;
    // p.xz = mod(p.xz, 6) - 3.;
    // p.z -= .25;
    // rhex = r3d(PI*.5, vec3(1,0,0));
    // rhex *= r3d(-.5 * high_smooth_integrated.x, up);
    // p *= rhex;
    // hex = poly(p, 6, vec2(1., .25));
    // chmin(d, mat(hex, rhex, p, 4));


    return d;
}

vec3 normal(vec3 p, vec2 e){
    return normalize( e.xyy*map( p + e.xyy).d +
					  e.yyx*map( p + e.yyx).d +
					  e.yxy*map( p + e.yxy).d +
                      e.xxx*map( p + e.xxx).d );
}

vec4 triplanar(sampler2D tex, vec3 p, vec3 n){
    vec3 m = n*n;
    p = fract(abs(p));
	vec4 x = texture( tex, p.yz );
	vec4 y = texture( tex, p.zx );
	vec4 z = texture( tex, p.xy );
	return (x*m.x + y*m.y + z*m.z) / (m.x+m.y+m.z);
}

vec3 normal_map(sampler2D nmap, vec3 p, vec3 n){
    mat3 basis = getOrthogonalBasis(n);
    vec3 nm = triplanar(nmap, p, n).xyz;
    nm = nm*2 - 1;
    return basis * nm;
}

vec4 my_grad(float t){
    const vec4 phases = vec4(0.33, 0.66, 0.00, 0.);
    const vec4 amplitudes = vec4(1.00, 1.00, 1.00, 0.);
    const vec4 frequencies = vec4(1.00, 1.00, 1.00, 0.);
    const vec4 offsets = vec4(0.00, 0.00, 0.00, 0.);

    return cosine_gradient(t, phases, amplitudes, frequencies, offsets);
}

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 crt = uv2crt(uv);
    vec2 pt = crt_uv2pt(crt);

    float bg = noise(vec3(pt*3, mid_smooth_integrated.x));
    bg = abs(bg);
    vec3 c = vec3(.5 * bg);

    vec3 ro = vec3(0);
    ro = vec3(0,1.5,4);
    vec3 fo = vec3(0);

    vec3 rd = getOrthogonalBasis(normalize(fo-ro), up) * normalize(vec3(pt, 1));

    mat d;
    float t = 0, precis = 0;
    vec3 p = ro;
    for(int i=0; i<100; i++){
        p = ro + rd*t;
        d = map(p);
        t += d.d;
        precis = 0.001 * t;

        if(d.d < precis || t > 30){
            break;
        }
    }

    if(d.d < precis){
        vec3 n = normal(p, vec2(precis, -precis));
        vec3 op = d.p;
        vec3 on = transpose(d.rot) * n;
        vec3 albedo = triplanar(albedo_tex, op, on).rgb;
        if(d.id == 4){
            albedo *= .2;
        }
        n = d.rot * normal_map(normal_tex, op*.2, on);

        c = albedo * chi(n, up, .1);
        // c = op;
        // c = n;
    }else{
        t = 40;
    }
    c = mix(vec3(.1), c, exp(-.05 * t));

    out_color = vec4(c, 1);
}
