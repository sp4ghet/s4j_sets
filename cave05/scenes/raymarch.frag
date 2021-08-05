#version 440

out vec4 out_color;

uniform sampler1D samples;
uniform vec4 resolution;
uniform float time;
uniform vec4 buttons[32];
uniform float sliders[32];
uniform vec3 volume;
uniform float beat;

#include "./lib/util.glsl"
#include "./lib/sdf.glsl"
#include "./lib/shading.glsl"
#include "./lib/rng.glsl"

vec2 seed;
vec3 up = vec3(0,1,0);

float shrt = 0.5 + 0.5 * cos(PI*exp(-4*buttons[11].y));

float metaballs(vec3 q){
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
    metaball = smin(metaball, sp, 1.);
  }

  return metaball;
}


vec4 map(vec3 q){
  vec3 p = q;
  vec4 d = vec4(1e7, 0., 0., 0.);

  if(toggle(buttons[22])){
    p=q;
    p.x = abs(p.x);
    p -= vec3(3,0,0);
    p.xy *= r2d(PI*.2);
    for(int i=0; i<10; i++){
      p.zy *= r2d(-PI*.35*(1.8-shrt));
      p.xy *= r2d(PI*.25*(-sq(shrt)));
      p.y -= .1;
      p = abs(p);
    }

    float bx = box(p, vec3(.1, .5, .1)) - .1;
    chmin(d, vec4(bx, 1,0,0));
  }

  if(toggle(buttons[23])){
    p=q;
    p -= noise(p * 5) * .01;
    // p -= vec3(0., -1., -.);
    p *= 5;
    float metaball = metaballs(p) / 5;
    chmin(d, vec4(metaball, 2, 0, 0));
  }

  return d;
}

vec3 calcNormal(vec3 p, vec2 d){
  vec4 n1 = vec4(0.0);
  for( int i=0; i<4; i++ )
  {
      vec4 s = vec4(p, 0.0);
      s[i] += d.y;
      n1[i] = map(s.xyz).x;
      if( n1.x+n1.y+n1.z+n1.w>100.0 ) break;
  }
  vec3 n = normalize(n1.xyz-n1.w);
  return n;
}

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);

    seed = vec2(1., .3) * noise(vec3(uv*10., time));
    vec3 c = vec3(0);

    vec3 ro = vec3(0);
    ro += vec3(0., 0, 3.);

    vec3 focus = vec3(0., 0., 0.);
    vec3 rov = normalize(focus - ro);

    vec3 rd = getOrthogonalBasis(rov, up) * normalize(vec3(pt, 1.));
    vec3 v = -rd;

    vec3 p = ro;
    float vt = 0.;
    vec4 d = vec4(0.);
    float alpha = 0;
    vec3 n;
    float t=0.;
    for(int i = 0; i < 128; i++){
        p = ro + rd*t;
        d = map(p);
        t += d.x*.5;
        if(d.x < 0.001 || t > 20.){
        break;
        }
    }

    vec3 l0 = vec3(0,1,3);
    vec3 lcol0 = vec3(1.5);

    if(d.x < 0.01){
        alpha = 1;
        n = calcNormal(p, vec2(0., .00768));
        float lint = 10 / max(dot(l0 - p, l0 - p) - 1, .1);
        vec3 l = normalize(l0 - p);
        float n_l = chi(n, l, 0.1);
        float v_n = chi(v, n, .0);
        vec3 albedo = vec3(1.);

        vec3 brdf = vec3(0);
        if(d.y == 2){
          // float ns = noise(p*5);
          // vec3 irides = grad(vec3(.5), vec3(.5), vec3(1.), vec3(0., .33, .66), mix(v_n, ns, .1));
          // albedo = mix(albedo, irides, .9);
          albedo = vec3(.01);
          brdf = BRDF(v, l, n, 0.99, 0.03, albedo);
        }
        if(d.y == 1){
          albedo = vec3(1, .01, .01);
          brdf = BRDF(v, l, n, 0.01, 0.01, albedo);
        }

        c = lint * lcol0 * (brdf + 0.1*albedo);
        // ro = p + n*.05;
        // rd = reflect(rd, n);

        float ao=0;
        for(int i=1; i<=10; i++){
          vec3 dir = 0.1*getCosineWeightedSample(n,seed);
          ao += saturate(map(p+dir).x / .1);
        }
        // c *= ao / 10;
    }



    out_color = vec4(c, alpha);
}
