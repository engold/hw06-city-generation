#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;

in vec4 vs_Pos;
out vec2 fs_Pos;

vec2 smoothF(vec2 uv) {
    return uv * uv * (3.0 - 2.0 * uv);
}

float noise(vec2 uv) {
    const float k = 250.0;
    vec4 l  = vec4(floor(uv), fract(uv));
    float u = l.x + l.y * k;
    vec4 v = vec4(u, u + 1.0, u + k, u + k + 1.0);
    v = fract(fract(1.23456789 * v) * v / 0.987654321);
    l.zw = smoothF(l.zw);
    l.x = mix(v.x, v.y, l.z);
    l.y = mix(v.z, v.w, l.z);
    return mix(l.x, l.y, l.w);
}

// based on lecture slides and Book of Shaders
float fbm (in vec2 st) {
    // Initial values
    float total = 0.0;
    float frequency = 5.0;
    float amp = 0.5;
    int octaves = 8;
    
    // Loop for number of octaves
    for (int i = 0; i < octaves; i++) {
          total +=  noise(vec2(st.x * frequency, st.y * frequency)) * amp;  
          frequency *= 2.0;
          amp = amp/2.0;     
    }
    return total;
}

float inWater(vec2 uv) {
  vec2 offset = vec2(-1.1, -0.4);	
  vec2 pos = uv + offset;
	float fbm = fbm(pos / 2.0);
  fbm -= (0.4 - 0.022);
  fbm /= .622;
  fbm = clamp(fbm, 0.0, 1.0);	
  if(fbm == 0.0){
    return 0.0;
  }
  else{
    return 1.0;
  }	
}

void main() {
  fs_Pos = vs_Pos.xz;
  vec3 pos = vec3(vs_Pos.x * 25.0, 0, vs_Pos.z * 25.0);
  float xPos = (fs_Pos.x + 1.0) / 2.0;
	float yPos = (fs_Pos.y + 1.0) / 2.0;
  float remapX = mix(-0.15, 0.35, xPos);
	float remapY = mix(0.057, 0.557, yPos);
  float x = inWater(vec2(remapX, remapY));
  if(x == 0.0){
    pos.y -= 0.5;
  }
  gl_Position = u_ViewProj * vec4(pos.x, pos.y, pos.z, 1.0);
}