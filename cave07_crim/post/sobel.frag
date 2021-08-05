#version 440
out vec4 out_color;

uniform vec4 resolution;
uniform float sliders[32];
uniform vec4 buttons[32];
uniform float time;
uniform float beat;

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


void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec3 c = texture(render, uv).rgb;
    if(toggle(buttons[29])){
        vec3 lines = vec3(1) * sobel(uv, .5, render);
        c = mix(c, lines, sliders[6]);
    }


    out_color = vec4(c, 1.);
}
