#version 440

out vec4 out_color;

uniform vec4 resolution;
uniform float time;
uniform float beat;

uniform float sliders[32];
uniform vec3 volume;
uniform vec3 bass_smooth;
uniform int frame_count;

uniform sampler2D raycast;

uniform sampler2D albedo_tex;

#include "lib/util.glsl"
#include "lib/ghost.glsl"
#include "lib/sdf.glsl"
#include "lib/rng.glsl"

const vec3 up = vec3(0,1,0);


float fractal( in vec3 p, inout float mat )
{
    float scale = 1.0;

    float tt = 0.55;

	vec4 orb = vec4(1000.0);
    float s = 1.6;

	for( int i=0; i<6;i++ )
	{
		p = -1.0 + 2.0*fract(0.5*p+0.5);


		float r2 = dot(p,p);
        float bx = max(abs(p.x), max(abs(p.y), abs(p.z)));
        r2 = mix(r2, bx, tt);

        orb = min( orb, vec4(abs(p),r2) );

		float k = s/r2;
		p     *= k;
		scale *= k;
	}

    mat = orb.w;
	return 0.25*abs(p.y)/scale;
}


#define CONCRETE 1
#define LIGHT 2
vec4 map(in vec3 q){
    vec3 p = q;
    vec4 d = vec4(100000., 0,0,0);

    float mat = 0;
    float f = fractal(p, mat);
    chmin(d, vec4(f, CONCRETE, 0, mat));

    p -= vec3(1, 1.9, 1);
    float sp = dot(p, -up);
    chmin(d, vec4(sp, LIGHT, 3 + 2 * bass_smooth.x, 0));

    return d;
}

vec3 normal(vec3 p, vec2 e){

    return normalize( e.xyy*map( p + e.xyy).x +
					  e.yyx*map( p + e.yyx).x +
					  e.yxy*map( p + e.yxy).x +
                      e.xxx*map( p + e.xxx).x );
}

vec4 triplanar(sampler2D tex, vec3 p, vec3 n){
    vec3 m = n*n;
    p = fract(abs(p));
	vec4 x = texture( tex, p.yz );
	vec4 y = texture( tex, p.zx );
	vec4 z = texture( tex, p.xy );
	return (x*m.x + y*m.y + z*m.z) / (m.x+m.y+m.z);
}

vec4 my_grad(float t){
    const vec4 phases = vec4(0.00, 0.58, 0.80, 0.);
    const vec4 amplitudes = vec4(1.00, 1.00, 1.00, 0.);
    const vec4 frequencies = vec4(0.31, 0.31, 0.31, 0.);
    const vec4 offsets = vec4(0,0,0,0);
    return cosine_gradient(t, phases, amplitudes, frequencies, offsets);
}

struct hit{
    bool is_hit;
    float t;
    vec4 d;
    vec3 p;
    vec3 n;
};

hit trace(vec3 ro, vec3 rd, int cnt){
    vec3 p = ro;
    vec4 d;
    float t = 0;
    float precis = .01;
    for(int i=0; i < cnt; i++){
        p = ro + rd*t;
        d = map(p);
        t += d.x;
        precis = 0.001 * t;
        if(d.x < precis || t > 30.){
            break;
        }
    }

    hit h;
    if (d.x < precis){
        h.p = p;
        h.d = d;
        h.n = normal(p, vec2(precis, -precis));
        h.t = t;
        h.is_hit = true;
    }else{
        h.is_hit = false;
    }
    return h;
}

vec3 disp(float t){
    // t = floor(t) + 0.5 + 0.5*cos(PI*exp(-5*fract(t)));
    // t = t*PI*.5 + PI*.25;
    // return vec3(cos(t), .35, sin(t));
    return vec3(1, .5, t);
}

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 crt = uv2crt(uv);
    vec2 pt = crt_uv2pt(crt);

    vec2 seed = vec2(noise(vec3(uv*3, time)), noise(vec3(uv*3, -0.8 * time)));

    vec4 c = texture(raycast, uv);

    float ct = beat * .05;

    vec3 ro = vec3(0, 0, 0);
    ro += disp(ct);
    vec3 v = disp(ct + .0001) - disp(ct - .0001);
    v = length(v) == 0. ? vec3(0,0,1) : normalize(v);
    vec3 fo = vec3(0);
    // fo = ro + v - up * .5;

    vec3 rd = getOrthogonalBasis(normalize(fo-ro), up) * normalize(vec3(pt, 1));

    vec3 now = vec3(1);
    float t = 30;
    for(int bns=0; bns < 3; bns++){
        hit h = trace(ro, rd, 256);
        if(h.is_hit){
            vec3 albedo = vec3(1);
            if(h.d.y == CONCRETE){
                albedo = triplanar(albedo_tex, h.p*.5, h.n).rgb * .5;
                // albedo = bns == 0 ? h.n : vec3(.5);
            }
            if(h.d.y == LIGHT){
                albedo = vec3(1) * h.d.z;
            }

            now *= albedo;
            ro = h.p + h.n*.01;
            rd = reflect(rd, getSampleBiased(h.n, 5, seed));

            if(bns == 0){
                t = h.t;
            }
            if(h.d.z > 1){
                break;
            }
        }else{
            now *= 0;
            break;
        }
    }
    now = mix(vec3(.8), now, exp(-.05*t));

    c *= .9;
    if(any(isnan(c)) || frame_count % 10000 == 0){
        c = vec4(0);
    }

    c.rgb += now;
    c.a += 1;



    out_color = c;
}
