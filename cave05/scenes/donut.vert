#version 440
out vec4 v_color;

uniform int vertexCount;
uniform float time;
uniform float beat;
uniform vec3 R;
uniform sampler1D spectrum;

const float pi = acos(-1.0);
const float tau = 2 * pi;

mat2 r2d(float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, s, -s, c);
}

vec3 torus(int id, vec2 sz, out vec3 n) {
    int in_sub = 20;
    int count = 6 * in_sub;
    float outer = floor(id / count);

    int inner_id = int(mod(id, count));
    int quad = int(mod(inner_id, 6));
    float inner = floor(float(inner_id) / 6);
    inner += int(quad == 2) | int(quad == 3) | int(quad == 5);
    outer += int(quad == 1) | int(quad == 4) | int(quad == 5);

    float out_angle = tau * outer * count / vertexCount;
    float next_out_angle = tau * (outer + 1) * count / vertexCount;
    float in_angle = tau * inner / in_sub;

    float next_radius = sz.x;
    vec3 radial = sz.x * vec3(cos(out_angle), 0., sin(out_angle));
    vec3 next_radial = next_radius * vec3(cos(next_out_angle), 0., sin(next_out_angle));

    radial.y += sin(out_angle * 3 + time) * .15;
    next_radial.y += sin(next_out_angle * 3 + time) * .15;

    radial.y += sin(out_angle * 4 + time * 1.7) * .1;
    next_radial.y += sin(next_out_angle * 4 + time*1.7) * .1;

    vec3 up = vec3(0., 1., 0.);
    vec3 normal = cross(next_radial - radial, up);
    vec3 tube = sz.y * cos(in_angle) * normalize(normal) + vec3(0., sz.y * sin(in_angle), 0.);
    n = normalize(tube);

    return radial + tube;
}

void main() {
    int vid = gl_VertexID;

    vec3 n;
    vec3 p = torus(vid, vec2(1., .1), n);
    // p.xz *= r2d(time);
    // p.yz *= r2d(pi * .2);
    // n.xz *= r2d(time);
    // n.yz *= r2d(pi * .2);

    p.x *= R.y / R.x;
    p.z = (p.z + 1.) / 2.;
    p.z *= .5;
    gl_Position = vec4(p, 1);
    gl_PointSize = 1.0;

    vec3 c = vec3(1.);
    c *= vec3(.1, .9, .9);

    v_color = vec4(c / abs(p.z + 1.0), 1);
}
