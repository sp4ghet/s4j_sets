#version 440

out vec4 out_color;

uniform vec4 resolution;
uniform sampler2D lines;
uniform sampler2D fft;
uniform vec3 volume;


void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec3 c = vec3(0.01);

    out_color = vec4(c, 1.);
}
