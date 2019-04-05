#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;

uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec3 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene
in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.

// unique to each instance - used for transform matrix
in vec4 vs_TransformCol1;
in vec4 vs_TransformCol2;
in vec4 vs_TransformCol3;
in vec4 vs_TransformCol4;

out vec4 fs_Col;
out vec4 fs_Pos;
out vec4 fs_Nor;
out float fs_Height;

void main() {
    fs_Pos = vs_Pos;
    fs_Nor = vs_Nor;
    fs_Col = vs_Col;
    fs_Height = vs_TransformCol2[1];    

    vec4 transformPos = mat4(vs_TransformCol1, vs_TransformCol2, vs_TransformCol3, vs_TransformCol4) * vs_Pos;
    vec3 newPos = transformPos.xyz / 1000.0 - 1.0;
    //                      render them within 25-25 screenquad size
    vec4 outPos = vec4(newPos.x * 25.0, transformPos.y + 0.1, newPos.z * 25.0, 1.0);
    gl_Position = u_ViewProj * outPos;   
}