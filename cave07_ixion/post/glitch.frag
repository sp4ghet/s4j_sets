#version 440
out vec4 out_color;

uniform vec4 resolution;
uniform float sliders[32];
uniform vec4 buttons[32];
uniform float time;
uniform float beat;

uniform sampler2D render;
uniform sampler2D code;

#include "lib/util.glsl"
#include "lib/rng.glsl"

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

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);

    vec3 c = glitch(uv, buttons[0].x * .5 * sliders[0], 1., render);


    out_color = vec4(c, 1.);
}
