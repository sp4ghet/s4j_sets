#version 440
out vec4 out_color;

uniform vec4 resolution;
uniform float time;

uniform vec4 buttons[32];
uniform float sliders[32];
uniform vec3 volume;
uniform float beat;

uniform sampler2D fft;
uniform sampler2D osci;
uniform sampler2D render;
uniform sampler2D foreground;

#pragma include "./lib/util.glsl"

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);

    vec4 c = vec4(0.);

    if(toggle(buttons[20])){
        vec4 renderVal = texture(render,uv);
        c = mix(c, renderVal, renderVal.a);
    }

    vec4 fore = texture(foreground, uv);
    c = mix(c, fore, fore.a);

    float two_d = 0;
    if(toggle(buttons[18])){
        float fft = texture(fft, uv).r;
        two_d = mix(two_d, fft, fft);
    }
    if(toggle(buttons[17])){
        float osci = texture(osci, uv - vec2(0, .0)).r;
        two_d = mix(two_d, osci, osci);
    }
    c = mix(c, vec4(two_d), two_d);

    out_color = c;
}
