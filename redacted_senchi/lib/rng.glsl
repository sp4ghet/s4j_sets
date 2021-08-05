#ifndef RNG
#define RNG
#include "./lib/util.glsl"

// blackle hash
#define FK(k) floatBitsToInt(k*k/7.)^floatBitsToInt(k)
float hash(vec2 seed) {
  int x = FK(seed.x), y = FK(seed.y);
  return float((x*x-y)*(y*y+x)+x)/2.54e9;
}

float random(int n)
{
    n = (n << 13) ^ n;
    return 1.0 - float( (n * (n * n * 15731 + 789221) + \
             1376312589) & 0x7fffffff) / 1073741824.0;
}

float fractSin(vec2 p)
{
    float t = floor(fract(time) * 120.) / 10.;
    return fract(sin(dot(p, vec2(t * 12.9898, t * 78.233))) * 43758.5453);
}

int gseed = 26;
float random_LCG()
{
    const int m = 2147483647;
    const int a = 89798713;
    const int c = 2123789138;
    gseed = int(time*1000.);
    gseed = a*gseed + c;
    gseed = gseed - m * int(gseed/m);
    int n = gseed;
    n = (n << 13) ^ n;
    return 1.0 - float( (n * (n * n * 15731 + 789221) + \
             1376312589) & 0x7fffffff) / 1073741824.0;
}

vec3 random_sphere(vec2 seed){
  float t = TAU * abs(hash(seed));
  float p = PI * abs(1.2*hash(seed + .3));
  return vec3(cos(t)*sin(p), cos(p), sin(t)*sin(p));
}

vec3 getSampleBiased(vec3  dir, float power, vec2 seed) {
	float t = TAU * abs(hash(seed));
    float p = abs(hash(seed + .3));
	p = pow(p, 1.0/(power+1.0));
	float oneminus = sqrt(1.0-sq(p));
	return getOrthogonalBasis(dir) * vec3(cos(t)*oneminus, sin(t)*oneminus, p);
}

vec3 getSample(vec3 dir, vec2 seed) {
	return getSampleBiased(dir, 0.0, seed); // <- unbiased!
}

vec3 getCosineWeightedSample(vec3 dir, vec2 seed) {
	return getSampleBiased(dir, 1.0, seed);
}

vec3 getConeSample(vec3 dir, float extent, vec2 seed) {
  // Formula 34 in GI Compendium
  float t = TAU * hash(seed);
  float p = hash(seed + .3);
	p=1.0-p*extent;
	float oneminus = sqrt(1.0-sq(p));
	return getOrthogonalBasis(dir) * vec3(cos(t)*oneminus, sin(t)*oneminus, p);
}


float noise(vec3 p){
    float noise = 0.;

    vec3 seed = vec3(-4. ,-2.,0.5);

    float amp = 1.;
    float gain = 0.5;
    float lacunarity = 1.4;

    float warp = 1.3;
    float warpTrk = .7;
    float warpTrkGain = 1.5;

    mat3 rotMatrix = getOrthogonalBasis(seed);

    for(int i = 0; i < 5; i++){
        // Some domain warping. Similar to fbm.
        p += sin(p.zxy*warpTrk)*warp;
        // Calculate some noise value.
        noise += sin(dot(cos(p.yzx), sin(p.zxy)))*amp;

        p *= rotMatrix;
        p *= lacunarity;

        warpTrk *= warpTrkGain;
        amp *= gain;
    }

    return noise*.5;
}

float cyclic_noise(vec3 p, int n){
    float noise = 0.;

    vec3 seed = vec3(-4. ,-2.,0.5);

    float amp = 1.;
    float gain = 0.5;
    float lacunarity = 1.4;

    float warp = 1.3;
    float warpTrk = .7;
    float warpTrkGain = 1.5;

    mat3 rotMatrix = getOrthogonalBasis(seed);

    for(int i = 0; i < n; i++){
        // Some domain warping. Similar to fbm.
        p += sin(p.zxy*warpTrk)*warp;
        // Calculate some noise value.
        noise += sin(dot(cos(p.yzx), sin(p.zxy)))*amp;

        p *= rotMatrix;
        p *= lacunarity;

        warpTrk *= warpTrkGain;
        amp *= gain;
    }

    return noise*.5;
}

// From Dave Hoskins: https://www.shadertoy.com/view/4djSRW.
float hoskins_hash(vec3 p3){
    p3 = fract(p3 * 0.1031);
    p3 += dot(p3,p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

// https://www.shadertoy.com/view/4sfGzS
float value_noise(vec3 x){
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f*f*(3.0-2.0*f);
    return mix(mix(mix(hoskins_hash(i+vec3(0, 0, 0)),
                       hoskins_hash(i+vec3(1, 0, 0)),f.x),
                   mix(hoskins_hash(i+vec3(0, 1, 0)),
                       hoskins_hash(i+vec3(1, 1, 0)),f.x),f.y),
               mix(mix(hoskins_hash(i+vec3(0, 0, 1)),
                       hoskins_hash(i+vec3(1, 0, 1)),f.x),
                   mix(hoskins_hash(i+vec3(0, 1, 1)),
                       hoskins_hash(i+vec3(1, 1, 1)),f.x),f.y),f.z);
}
#endif
