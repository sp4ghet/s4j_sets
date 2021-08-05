#version 440
out vec4 v_color;

uniform int vertexCount;
uniform vec4 resolution;
layout(rgba32f) uniform image3D particle_pos;

void main() {
    int vid = (gl_VertexID + 1) / 2;
    int n = 200;
    if( (gl_VertexID + 2) % (2*n) == 0){
        vid += 1;
    }
    int z = vid % n;
    int particle_id = vid / n;


    vec3 c = vec3(1, 0, 0);
    ivec3 uv = ivec3(particle_id, z, 0);

    vec3 p = imageLoad(particle_pos, uv).xyz;
    p.x *= resolution.w;

    gl_Position = vec4(p * .1, 1);

    v_color = vec4(c / abs(p.z + 1), 1);
}
