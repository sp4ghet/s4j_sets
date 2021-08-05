#version 440
out vec4 out_color;

uniform vec4 resolution;

uniform sampler2D pure;

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    out_color = texture(pure, uv);
}
