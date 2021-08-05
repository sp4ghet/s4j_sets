#version 440

out vec4 out_color;
uniform vec4 resolution;

struct info{
    vec3 color;
    vec3 p;
};

in info v_out;

#include "lib/dof_lib.glsl"


const float far = 1000.;
const float near = .1;

float LinearizeDepth(float depth)
{
    float z = depth * 2.0 - 1.0; // back to NDC
    return (2.0 * near * far) / (far + near - z * (far - near));
}

void main(){
    float z = v_out.p.z;
    out_color = vec4(v_out.color, z);
}
