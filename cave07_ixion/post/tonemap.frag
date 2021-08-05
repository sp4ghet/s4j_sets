#version 440

out vec4 out_color;

uniform vec4 resolution;

uniform sampler2D render;

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

    vec4 c = texture(render, uv);

    c.rgb = ACESFilm(c.rgb);
    c = pow(c, vec4(.4545));

    c = smoothstep(.01, 1.5, c);
    float lum = dot(c.rgb, vec3(.2126, .7152, .0722));
    float shad = smoothstep(.4, .01, lum);
    float high = smoothstep(.3, 1., lum);
    c.rgb = c.rgb*shad*vec3(.4, 1.2, 1.2) + c.rgb*(1-shad*high) + c.rgb*high*vec3(.99, .8,.8);

    out_color = c;
}
