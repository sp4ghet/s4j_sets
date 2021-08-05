#pragma once

#include "lib/util.glsl"

float blockNoise(vec2 uv, float blockiness)
{
    vec2 lv = fract(uv);
    vec2 id = floor(uv);
    id = floor(id);

    float n1 = fractSin(id);
    float n2 = fractSin(id+vec2(1,0));
    float n3 = fractSin(id+vec2(0,1));
    float n4 = fractSin(id+vec2(1,1));

    vec2 u = smoothstep(0.0, 1.0 + blockiness, lv);

    return mix(mix(n1, n2, u.x), mix(n3, n4, u.x), u.y);
}

float fbm(vec2 uv, int count, float blockiness, float complexity)
{
    float val = 0.0;
    float amp = 0.5;

    for(int i=0; i<count; i++)
    {
    	val += amp * blockNoise(uv, blockiness);
      amp *= 0.5;
      uv *= complexity;
    }

    return val;
}

vec2 glitchShift(vec2 uv, float amp, float mini){
  vec2 a = vec2(uv.x * (resolution.x/resolution.y), uv.y);
  vec2 uv2 = vec2(a.x / resolution.x, exp(a.y));
  vec2 id = floor(uv * (7. + 1. + fractSin(vec2(fract(time)))));
  vec2 id2 = floor(uv * 3. + 1.);
  int loops = int(fractSin(id) * fractSin(id2) * 4. + 1.);

  const float glitchNarrowness = 30.0;
  const float glitchBlockiness = 2.0;

  float shift = amp * pow(fbm(uv2, loops, glitchBlockiness, glitchNarrowness), mini);
  shift = smoothstep(0.00001, 1., shift);
  vec2 uvShift = vec2(shift, 0.);
  return uvShift;
}

vec3 glitch(vec2 uv, float amp, float mini, sampler2D buf){
  vec2 uvShift = glitchShift(uv, amp, mini);
  vec3 c = vec3(0);
  c = texture(buf, fract(uv + uvShift)).rgb;

  c.r = texture(buf, fract(uv + uvShift)).r;
  c.g = texture(buf, fract(uv - uvShift)).g;
  c.b = texture(buf, fract(uv - uvShift)).b;

  return c;
}


uniform sampler2D font_atlas;
uniform vec4 font_atlas_res;

vec3 ascii(vec2 uv, vec2 scale, sampler2D buf, vec2 res){
  vec2 st = floor(uv*res/scale) * scale / res;
  float val = gray(textureLod(buf, st, 4).rgb);
  val = val*1.5 + time;
  val = fract(val) - 1e-5;
  vec2 tuv = mod(uv*res, scale) / scale;
  tuv.x /= font_atlas_res.w;
  tuv.x += floor(val*font_atlas_res.w)/font_atlas_res.w;
  vec3 ret = 1. - texture(font_atlas, tuv).rgb;
  return ret;
}

const float vk[9] = float[](1.,0.,-1.,2.,0.,-2.,1.,0.,-1.);
const float hk[9] = float[](1.,2.,1.,0.,0.,0.,-1.,-2.,-1.);
float sobel(vec2 uv, float width, sampler2D buf){
  vec2 xy = uv*resolution.xy;

  float vert = 0.,
        horz = 0.;

  for(int y = -1; y<=1; y++){
     for(int x=-1; x<=1; x++){
      if(x==0 && y==0){
        continue;
      }
      vec3 samp = texture(buf, (xy + vec2(x,y)*width) / resolution.xy).rgb;
      float s = gray(samp);
      int yy = y + 1, xx = x+1;
      vert += vk[yy*3 + xx] * s;
      horz += hk[yy*3 + xx] * s;
    }
  }
  return length(vec2(vert,horz));
}

// https://www.shadertoy.com/view/wsVSDd
vec3 ACESFilm(vec3 x)
{
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    return (x*(a*x+b))/(x*(c*x+d)+e);
}


vec4 grad(float t){
    const vec4 phases = vec4(0.00, 0.58, 0.80, 0.);
    const vec4 amplitudes = vec4(1.00, 1.00, 1.00, 0.);
    const vec4 frequencies = vec4(1.00, 1.00, 1.00, 0.);
    const vec4 offsets = vec4(0.00, 0.00, 0.00, 0.);
    return cosine_gradient(t, phases, amplitudes, frequencies, offsets);
}

vec4 chromab(sampler2D tex, vec2 uv, float strength){
    vec2 pt = uv2pt(uv);
    vec2 offset = 0.05 * pt * dot(pt,pt) * strength;
    vec4 c = vec4(0);
    for(int i=0; i < 20; i++){
        float t = i / 19.;
        c += grad(t) * texture(tex, uv + offset * i);
    }
    c /= 20;
    return c;
}

// noby https://www.shadertoy.com/view/3sGSWV
float grain_src(vec3 x, float pitch, float strength){
    float center = value_noise(x);
    float hp = center - value_noise(x +  vec3(1, 0, 0)/pitch) + .5;
    float hm = center - value_noise(x + vec3(-1, 0, 0)/pitch) + .5;
    float vp = center - value_noise(x + vec3(0, 1, 0)/pitch) + .5;
    float vm = center - value_noise(x + vec3(0, -1, 0)/pitch) + .5;

    float tot = (hp + hm + vp + vm) * .25;
    return mix(1, .5 + tot, strength);
}

vec3 grain(vec3 c, vec2 uv, float pitch, float strength){
    uv *= resolution.xy;
    float t = time * 60.;
    float r = grain_src(vec3(uv, t), pitch, strength);
    float g = grain_src(vec3(uv, t + 9), pitch, strength);
    float b = grain_src(vec3(uv, t - 9), pitch, strength);
    vec3 gr = vec3(r,g,b);

    return max(mix(c*gr, c+(gr-1.0), .5), 0.0);
}
