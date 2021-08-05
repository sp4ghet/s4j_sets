#ifndef SDF
#define SDF
#include "./lib/constants.glsl"

float box(vec3 p, vec3 b){
  p = abs(p) - b;
  return min(0.,max(p.x, max(p.y, p.z))) + length(max(p, 0.));
}

float ibox(vec3 p, vec3 b){
  p = abs(p) - b;
  float d = min(0., max(p.x, max(p.y,p.z))) + length(max(p, 0.));
  return -d;
}

float poly(vec3 p, int n, vec2 rh){
  mat2 rot = r2d(0.);
  float d = -1e5;
  for(int i=0; i<n; i++){
    rot *= r2d(TAU/float(n));
    d = max(d, dot(p.xz, rot*vec2(0., 1.)) - rh.x);
  }
  d = max(abs(p.y) - rh.y, d);
  return d;
}

float poly2D(vec2 xy, int n, float r){
  mat2 rot = r2d(0.);
  float d = -1e5;
  for(int i=0; i<n; i++){
    rot *= r2d(TAU/float(n));
    d = max(d, dot(xy, rot*vec2(0., 1.)) - r);
  }
  return d;
}

float sphere( vec3 p, float r ) {
  return length( p ) - r;
}

float torus( vec3 p, float radius, float thickness ) {
  vec2 q = vec2( length( p.xz ) - radius, p.y );
  return length( q ) - thickness;
}

float pillar( vec3 p, float r, float t ) {
  return max( abs( p.y ) - t, length( p.xz ) - r );
}

vec3 circleRep( vec3 p, float r, float c ) {
  float intrv = TAU / c;
  p.zx = r2d( floor( atan( p.z, p.x ) / intrv ) * intrv ) * p.zx;
  p.zx = r2d( intrv / 2.0 ) * p.zx;
  p.x -= r;
  return p;
}

float octahedron(vec3 p, float s)
{
    p = abs(p);
    float m = p.x + p.y + p.z - s;
    vec3 r = 3.0*p - m;
    // my original version
  	vec3 q;
    if( r.x < 0.0 ) {q = p.xyz;}
    else if( r.y < 0.0 ){ q = p.yzx;}
    else if( r.z < 0.0 ){ q = p.zxy;}
    else {return m*0.57735027;}
    float k = clamp(0.5*(q.z-q.y+s),0.0,s);
    return length(vec3(q.x,q.y-s+k,q.z-k));
}

#endif
