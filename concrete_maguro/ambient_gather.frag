#version 440

out vec4 out_color;

uniform vec4 resolution;
uniform sampler2D raycast;

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 c = texture(raycast, uv);

    out_color = vec4(c.rgb / c.a, 1);
}
