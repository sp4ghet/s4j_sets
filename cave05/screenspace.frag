#version 440
out vec4 out_color;

uniform vec4 resolution;
uniform float sliders[32];
uniform vec4 buttons[32];
uniform float time;
uniform float beat;

uniform sampler2D composite;

#include "./lib/util.glsl"
#include "./lib/uv_disp.glsl"
#include "./lib/rng.glsl"

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
const vec4 font_atlas_res = vec4(1024., 128., 1024./128., 128./1024.);

vec3 ascii(vec2 uv, float scale, sampler2D buf){
  vec2 st = floor(uv*resolution.xy/scale) * scale / resolution.xy;
  float val = gray(textureLod(buf, st, 4 * saturate(scale / 64.)).rgb);
  val = clamp(val, 0., 1.) - 1e-5;
  vec2 tuv = mod(uv*resolution.xy, scale) / scale;
  tuv.x /= font_atlas_res.z;
  tuv.x += floor(val*font_atlas_res.z)/font_atlas_res.z;
  vec3 res = 1. - texture(font_atlas, tuv).rgb;
  return res;
}


uniform sampler2D cave_logo;
const vec4 cave_logo_res = vec4(1707., 1707., 1., 1.);
uniform sampler2D meme;
const vec4 meme_res = vec4(3300., 1932., 3300./1932., 1932. / 3300.);


void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);

    float hitJitter = 1. - 0.5 - 0.5 * cos(PI*exp(-12 * saturate(buttons[2].z)));
    hitJitter = max(buttons[2].x, hitJitter);
    uv = jitterY(uv, hitJitter*sliders[4]*.01, 720.);

    float hitShake = 1. - 0.5 - 0.5 * cos(PI*exp(-8 * saturate(buttons[3].z)));
    hitShake = max(step(0.1, buttons[3].x), hitShake);
    uv += hitShake*.01*vec2(random(int(2000*time)), random(int(3000*time)*2));

    vec3 c = glitch(uv, buttons[0].x * .5 * sliders[0], 1., composite);
    if(buttons[1].x > .1){
      c *= ascii(uv, 128*sliders[3], composite);
    }
    c = pow(c, vec3(.4545));

    float two_d = 0;
    if(toggle(buttons[16])){
        vec2 logoUV = pt2uv(pt * vec2(resolution.z, 1.) * cave_logo_res.z * 1.5);
        logoUV = saturate(logoUV);
        two_d += texture(cave_logo, logoUV).a;
    }
    if(toggle(buttons[19])){
        vec2 memeUV = pt2uv(pt * vec2(resolution.z, 1.) * meme_res.z);
        float meme_value = texture(meme, memeUV).r;
        if(saturate(memeUV) == memeUV){
            two_d += 1. - meme_value;
        }
    }
    two_d = saturate(two_d);

    c = mix(c, vec3(1.,0,0), two_d);



    out_color = vec4(c, 1.);
}
