#version 440

out vec4 out_color;

uniform vec4 resolution;
uniform vec3 volume;
uniform vec3 bass;
uniform vec3 bass_smooth;

uniform sampler2D particles;
uniform sampler3D particle_pos;

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 c = vec4(bass_smooth.x);
    vec4 part = texture(particles, uv);
    c = mix(c, part, part.a);
    out_color = c;
}
