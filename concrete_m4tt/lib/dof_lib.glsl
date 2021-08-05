#pragma once;
float scale = 1.;
vec2 invRes = vec2(scale) / resolution.xy;

vec4 BlurTexture(sampler2D tex, vec2 uv, vec2 direction)
{
    vec4 finalColor = vec4(0);
    float blurAmount = 0;

    // This offset is important. Will explain later. ;)
    uv += direction * 0.5;

    for (int i = 0; i < 40; ++i)
    {
        vec4 color = texture(tex, uv + direction * float(i));
        color *= color.a;
        blurAmount += color.a;
        finalColor += color;
    }

    return (finalColor / blurAmount);
}

// https://www.slideshare.net/DICEStudio/five-rendering-ideas-from-battlefield-3-need-for-speed-the-run
// slide 10 ->
// https://developer.nvidia.com/gpugems/gpugems/part-iv-image-processing/chapter-23-depth-field-survey-techniques
const float aperature = .002;
float CoCScale(float focal_length, float focal_depth, float far, float near){
    return (aperature * focal_length * focal_depth *  (far - near)) / ((focal_depth - focal_length) * near * far);
}

float CoCBias(float focal_length, float focal_depth, float far, float near){
    return (aperature * focal_length * (near - focal_depth)) / ((focal_depth * focal_length) * near);
}
// CoCScale = (aperture * focallength * planeinfocus * (zfar - znear)) / ((planeinfocus - focallength) * znear * zfar)
// CoCBias = (aperture * focallength * (znear - planeinfocus)) / ((planeinfocus * focallength) * znear)

float CoC(float z, float focal_length, float focal_depth, float far, float near){
    float depth = z;
    float scale = CoCScale(focal_length, focal_depth, far, near);
    float bias = CoCBias(focal_length, focal_depth, far, near);
    float coc = abs(depth*scale + bias);

    return abs(coc);
}
