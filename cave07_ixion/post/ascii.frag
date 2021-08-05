#version 440
out vec4 out_color;

uniform vec4 resolution;
uniform float sliders[32];
uniform vec4 buttons[32];

uniform sampler2D render;

#include "lib/util.glsl"

uniform sampler2D font_atlas;
uniform vec4 font_atlas_res;

vec3 ascii(vec2 uv, vec2 scale, sampler2D buf, vec2 res){
  vec2 st = floor(uv*res/scale) * scale / res;
  float val = gray(textureLod(buf, st, 4).rgb);
  val = fract(val);
  vec2 tuv = mod(uv*res, scale) / scale;
  tuv.x /= font_atlas_res.w;
  tuv.x += floor(val*font_atlas_res.w)/font_atlas_res.w;
  vec3 ret = 1. -  texture(font_atlas, tuv).rgb;
  return ret;
}

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);
    vec3 c = texture(render, uv).rgb;

    if(toggle(buttons[28])){
      c *= ascii(uv,  vec2(900) * sliders[3], render, resolution.xy);
    }


    out_color = vec4(c, 1.);
}
