#version 440

out vec4 out_color;

uniform sampler1D samples;
uniform vec4 resolution;
uniform float time;
uniform float sliders[8];

uniform sampler2D render;

#include "lib/util.glsl"
#include "lib/rng.glsl"


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


void main(){
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 rendered = texture(render, uv);
  vec3 c = rendered.rgb;
  c = mix(c, vec3(sobel(uv, 2., render)), sliders[1]);

  c = ACESFilm(c);

  out_color = vec4(c,rendered.a);
}
