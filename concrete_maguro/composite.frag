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
uniform sampler2D scene;
uniform sampler2D foreground;

#pragma include "./lib/util.glsl"

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);

    vec4 c = vec4(0.);
    c += texture(scene, uv);

    if(toggle(buttons[20])){
        vec4 sceneVal = texture(scene,uv);
        c = mix(c, sceneVal, sceneVal.a);
    }

    vec4 fore = texture(foreground, uv);
    c = mix(c, fore, fore.a);

    float two_d = 0;
    if(toggle(buttons[18])){
        two_d += texture(fft, uv).r;
    }
    if(toggle(buttons[17])){
        two_d += texture(osci, uv - vec2(0, .0)).r;
    }
    c = mix(c, vec4(1), two_d);

    out_color = c;
}
