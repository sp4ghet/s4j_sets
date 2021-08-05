#ifndef UTIL
#define UTIL

#include "lib/constants.glsl"

float graph(float y, float f, float t){
  return smoothstep(f-t, f, y) - smoothstep(f, f+t, y);
}

#define lofi(p,m) floor(p*m)/m
#define r2d(t) mat2(cos(t),sin(t),-sin(t),cos(t))
#define saturate(x) clamp(x, 0., 1.)

void chmin(inout vec4 a, vec4 b){
  a = a.x < b.x ? a : b;
}

void chmax(inout vec4 a, vec4 b){
  a = a.x > b.x ? a : b;
}

// http://iquilezles.org/www/articles/smin/smin.htm
float smin( float _a, float _b, float _k, out float h ) {
  h = clamp( 0.5 + 0.5 * ( _b - _a ) / _k, 0.0, 1.0 );
  return mix( _b, _a, h ) - _k * h * ( 1.0 - h );
}

float smin( float _a, float _b, float _k ) {
  float h;
  return smin( _a, _b, _k, h );
}

float sq(float x){
  return x*x;
}

vec3 rotate(vec3 p, float angle, vec3 axis)
{
    vec3 a = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float r = 1.0 - c;
    mat3 m = mat3(
        a.x * a.x * r + c,
        a.y * a.x * r + a.z * s,
        a.z * a.x * r - a.y * s,
        a.x * a.y * r - a.z * s,
        a.y * a.y * r + c,
        a.z * a.y * r + a.x * s,
        a.x * a.z * r + a.y * s,
        a.y * a.z * r - a.x * s,
        a.z * a.z * r + c
    );
    return m * p;
}

vec3 grad(vec3 off, vec3 amp, vec3 fre, vec3 pha, float t){
  return off*.5 + 0.5 * amp * cos(TAU*(fre*t + pha));
}


vec4 cosine_gradient(float x,  vec4 phase, vec4 amp, vec4 freq, vec4 offset){
  phase *= TAU;
  x *= TAU;

  return vec4(
    offset.r + amp.r * 0.5 * cos(x * freq.r + phase.r) + 0.5,
    offset.g + amp.g * 0.5 * cos(x * freq.g + phase.g) + 0.5,
    offset.b + amp.b * 0.5 * cos(x * freq.b + phase.b) + 0.5,
    offset.a + amp.a * 0.5 * cos(x * freq.a + phase.a) + 0.5
  );
}

vec2 uv2pt(vec2 uv){
  vec2 pt = (uv - .5) * 2.;
  pt.y *= resolution.w;
  return pt;
}

vec2 pt2uv(vec2 pt){
  pt.y *= resolution.z;
  pt += 1.;
  pt *= 0.5;
  return pt;
}


float gray(vec3 c){
  return c.x*0.299 + c.y*0.587 + c.z*0.114;
}

vec3 chooseUp(vec3 v) {
    //  See : http://lolengine.net/blog/2013/09/21/picking-orthogonal-vector-combing-coconuts
    return abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0)  : vec3(0.0, -v.z, v.y);
}

mat3 getOrthogonalBasis(vec3 lookAt, vec3 up){
  vec3 dir = normalize(lookAt);
    vec3 cu = normalize(cross(dir,up));
    vec3 cv = cross(cu, dir);
    return mat3(cu,cv,dir);
}

mat3 getOrthogonalBasis(vec3 lookAt){
    vec3 up = chooseUp(lookAt);
    return getOrthogonalBasis(lookAt, up);
}

float chi(vec3 a, vec3 b, float x){
  return max(x, dot(a,b));
}

bool toggle(vec4 button){
  return mod(button.w, 2) > 0.1;
}

bool isPress(vec4 button){
  return button.y < button.z;
}

#endif
