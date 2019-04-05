#version 300 es
precision highp float;

in vec4 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_Col;

uniform float u_Time;

out vec4 out_Col;

void main() {
    //out_Col = fs_Col;
   // float t = sin(u_Time * 0.01);
    vec3 road = vec3(0.9294, 0.9412, 0.1961);
    vec3 c1 = vec3(0.9922, 0.0, 0.0);
    vec3 c2 = vec3(0.0, 0.349, 0.9922);
    vec3 color = mix(c1, c2, fract(fs_Pos.x));
   //float temp = fs_Pos.z;
   //temp += floor((t + 1.0));
    //color = mix(color, vec3(0.0) , fract(temp / 2.0) );

    out_Col = vec4(color, 1.0);
}