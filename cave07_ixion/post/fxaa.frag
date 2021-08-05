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

#define FXAA_REDUCE_MIN		(1.0 / 128.0)
#define FXAA_REDUCE_MUL		(1.0 / 8.0)
#define FXAA_SPAN_MAX		8.0

vec4 applyFXAA(vec2 fragCoord)
{
	vec4 color;
	vec2 inverseVP = 1. / resolution.xy;
	vec3 rgbNW = texture(render, (fragCoord + vec2(-1.0, -1.0)) * inverseVP).xyz;
	vec3 rgbNE = texture(render, (fragCoord + vec2(1.0, -1.0)) * inverseVP).xyz;
	vec3 rgbSW = texture(render, (fragCoord + vec2(-1.0, 1.0)) * inverseVP).xyz;
	vec3 rgbSE = texture(render, (fragCoord + vec2(1.0, 1.0)) * inverseVP).xyz;
    vec4 tex = texture(render, fragCoord  * inverseVP);
	vec3 rgbM  = tex.rgb;
	vec3 luma = vec3(0.299, 0.587, 0.114);
	float lumaNW = dot(rgbNW, luma);
	float lumaNE = dot(rgbNE, luma);
	float lumaSW = dot(rgbSW, luma);
	float lumaSE = dot(rgbSE, luma);
	float lumaM  = dot(rgbM,  luma);
	float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
	float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));

	vec2 dir;
	dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
	dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));

	float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) *
						(0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);

	float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
	dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),
			max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),
			dir * rcpDirMin)) * inverseVP;

	vec3 rgbA = 0.5 * (
		texture(render, fragCoord * inverseVP + dir * (1.0 / 3.0 - 0.5)).xyz +
		texture(render, fragCoord * inverseVP + dir * (2.0 / 3.0 - 0.5)).xyz);
	vec3 rgbB = rgbA * 0.5 + 0.25 * (
		texture(render, fragCoord * inverseVP + dir * -0.5).xyz +
		texture(render, fragCoord * inverseVP + dir * 0.5).xyz);

	float lumaB = dot(rgbB, luma);
	if ((lumaB < lumaMin) || (lumaB > lumaMax))
		color = vec4(rgbA, tex.a);
	else
		color = vec4(rgbB, tex.a);
	return color;
}


void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 c = applyFXAA(gl_FragCoord.xy);

    out_color = c;
}
