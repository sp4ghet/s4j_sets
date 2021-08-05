#version 440

out vec4 out_color;

uniform vec4 resolution;

uniform sampler2D phys_trail;
uniform sampler2D phys_parti;

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 c = vec4(0);
    c = texture(phys_trail, uv);

    out_color = c;
}
