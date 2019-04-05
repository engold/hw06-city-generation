#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time; 
uniform float u_Slider;

in vec2 fs_Pos;
out vec4 out_Col;

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
    return 1.0;
  }
  else{
    return 0.0;
  }	
}

vec3 elevationMap(vec2 uv) {
  vec2 offset = vec2(-1.1, -0.4);
	float water = inWater(uv);
	vec2 pos = uv + offset;
	float noiseTerm = fbm(pos / 2.0);
	noiseTerm = clamp((noiseTerm - 0.2), 0.0, 1.0);
  if(water == 1.0){
    // water
    return vec3(0.0863, 0.2902, 0.9608);
  }
  else{
    // land
    return  vec3(0.3765, 0.7725, 0.1804) * vec3(0.0, (noiseTerm * 1.5), 0.0);
  }		
}


vec3 getColor(float x, float y) {
  float remapX = mix(-0.15, 0.35, x);
	float remapY = mix(0.057, 0.557, y);
	vec2 temp = vec2(remapX, remapY);
  vec3 colorElevation = elevationMap(temp);
  vec3 color = vec3(colorElevation);
  return color;
}


void main() {
  // display final coloring	
  float x = (fs_Pos.x + 1.0) / 2.0;
	float y = (fs_Pos.y + 1.0) / 2.0;
	out_Col = vec4(getColor(x, y), 1.0);
}