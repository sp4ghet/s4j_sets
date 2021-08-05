#pragma once

#include "lib/util.glsl"

float rectSDF(vec2 st, vec2 size){
  return max(abs(st).x * size.x, abs(st).y * size.y);
}

float crossSDF(vec2 st, float s){
  vec2 size = vec2(.25, s);
  return min(rectSDF(st, size.xy),
    rectSDF(st, size.yx));
}

float circleSDF(vec2 uv){
  return length(uv);
}

float vesicaSDF(vec2 uv, float w){
  vec2 offset = vec2(w*.5, 0.);
  return max(circleSDF(uv+offset),
            circleSDF(uv-offset));
}

float raySDF(vec2 uv, int count){
  return fract(atan(uv.x, uv.y)/TAU*float(count));
}

float polySDF(vec2 uv, int vertices){
  float a = atan(uv.x, uv.y)+PI;
  float r = length(uv);
  float v = TAU / float(vertices);
  return cos(floor(.5+a/v)*v-a)*r;
}

float sdTriangle( in vec2 p, in vec2 p0, in vec2 p1, in vec2 p2 )
{
	vec2 e0 = p1 - p0;
	vec2 e1 = p2 - p1;
	vec2 e2 = p0 - p2;

	vec2 v0 = p - p0;
	vec2 v1 = p - p1;
	vec2 v2 = p - p2;

	vec2 pq0 = v0 - e0*clamp( dot(v0,e0)/dot(e0,e0), 0.0, 1.0 );
	vec2 pq1 = v1 - e1*clamp( dot(v1,e1)/dot(e1,e1), 0.0, 1.0 );
	vec2 pq2 = v2 - e2*clamp( dot(v2,e2)/dot(e2,e2), 0.0, 1.0 );

    float s = e0.x*e2.y - e0.y*e2.x;
    vec2 d = min( min( vec2( dot( pq0, pq0 ), s*(v0.x*e0.y-v0.y*e0.x) ),
                       vec2( dot( pq1, pq1 ), s*(v1.x*e1.y-v1.y*e1.x) )),
                       vec2( dot( pq2, pq2 ), s*(v2.x*e2.y-v2.y*e2.x) ));

	return -sqrt(d.x)*sign(d.y);
}

float triSDF(vec2 uv){
  return sdTriangle(uv, vec2(0,1), vec2(sqrt(3)/2, -0.5), vec2(-sqrt(3)/2, -0.5));
}

float rhombSDF(vec2 uv){
  vec2 offset = vec2(0., .1);
  return max(triSDF(uv-offset),
    triSDF(vec2(uv.x, -uv.y)+offset));
}

float starSDF(vec2 uv, int V, float s){
  float a = atan(uv.y, uv.x)/TAU;
  float seg = a * float(V);
  a = ((floor(seg) + .5)/float(V) +
    mix(s, -s, step(.5, fract(seg)))) * TAU;
  return abs(dot(vec2(cos(a), sin(a)),uv));
}

float heartSDF(vec2 uv){
  uv -= vec2(0, .3);
  float r = length(uv)*5.;
  uv = normalize(uv);
  return r - ((uv.y*pow(abs(uv.x), 0.67))/
    (uv.y+1.5)-(2.)*uv.y+1.26);
}

float flowerSDF(vec2 uv, int N){
  float r = length(uv)*2.;
  float a = atan(uv.y, uv.x);
  float v = float(N)*.5;

  return 1.-(abs(cos(a*v))*.5 + .5)/r;
}

float spiralSDF(vec2 uv, float t){
  float r = length(uv);
  float a = atan(uv.y, uv.x);

  return abs(sin(fract(log(r)*t + a*.159)));
}

// steppers

float fill(float x, float size){
  return 1.-step(size, x);
}

float stroke(float x, float s, float w){
  float d = step(s, x+w*.5) -
            step(s, x-w*.5);
  return clamp(d, 0., 1.);
}

float flip(float v, float pct){
  return mix(v, 1.-v, pct);
}

vec2 rotate(vec2 uv, float angle){
  return mat2(cos(angle), -sin(angle),
       sin(angle), cos(angle)) * uv;
}

float bridge(float c, float d, float s, float w){
  c *= 1. - stroke(d,s,w*2.);
  return c + stroke(d,s,w);
}

float smoothline(float x, float size, float thickness){
  float d = smoothstep(0., abs(x - size), thickness);
  return d;
}

float smoothBridge(float c, float d, float s, float w){
  c *= 1. - smoothline(d, s, w*2.);
  return c + smoothline(d, s, w);
}

// macros
float funky(vec2 p, float rad, float thickness){
  float angle = -PI/4.;
  float inv = step(0., p.y);
  p *= r2d(angle);
  p = mix(+p, -p, step(.5, inv));
  p -= .4;

  float d = 0.;

  vec2 scale = vec2(1.);
  for(int i = 0; i < 5; i++){
      float rect = rectSDF(p, scale);
      float size = rad;
      size -= abs(.1 * float(i) - .2);
      d = smoothBridge(d, rect, size, thickness);
      p += .2;
  }
  return d;
}
