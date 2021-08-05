#version 440
out vec4 out_color;

uniform sampler2D scene;
uniform sampler2D fft;
uniform sampler2D osci;
uniform vec4 resolution;
uniform float beat;

uniform vec4 buttons[32];


void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec3 c = vec3(0);


    out_color = vec4(c, 1);
}
