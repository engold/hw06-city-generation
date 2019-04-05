#version 300 es
precision highp float;

uniform float u_Time;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec4 fs_Nor;
in float fs_Height;

out vec4 out_Col;

vec3 windows(vec2 uv, vec3 color) {
    float w = 15.85;
    float h = 15.2;
    float windowW = 7.1;
    float windowH = 3.4;
    float x = uv.x - w * floor(uv.x / w);
    float y = uv.y - h * floor(uv.y / h);
    float t = sin(u_Time * 0.0085);
    t = t + (fs_Height/ 4.0);
  
    // color the pixels within range for the window space
    if ((x > (w - windowW) * 0.5) && (x < (w + windowW) * 0.5) && (y > (h - windowH) * 0.5) && (y < (h + windowH) * 0.5)){
        return mix(vec3(0.851, 0.8667, 0.0), vec3(0.0) , 1.0- t);
    }
    else {
        return color;
    }
}

vec3 tallWindows(vec2 uv, vec3 color) {
    float w = 20.0;
    float h = 12.0;
    float windowW = 20.0;
    float windowH = 3.4;
    float x = uv.x - w * floor(uv.x / w);
    float y = uv.y - h * floor(uv.y / h);
    float t = sin(u_Time * 0.0085);
      t = t + (fs_Height/ 4.0);
    
    // color the pixels within range for the window space
    if ((x > (w - windowW) * 0.5) && (x < (w + windowW) * 0.5) && (y > (h - windowH) * 0.5) && (y < (h + windowH) * 0.5)){
        return mix(vec3(0.851, 0.8667, 0.0), vec3(0.8, 0.7294, 0.7294) , 1.0 - t*0.5);
   
      
    }
    else {
        return color;
    }
}


vec3 smallHomes(vec2 uv, vec3 color) {
    float w = 95.1;
    float h = 30.4;
    float windowW = 21.3;
    float windowH = 10.2;
    float x = uv.x - w * floor(uv.x / w);
    x /= 2.0;
    float y = uv.y - h * floor(uv.y / h);
    y /= 2.0;
    float t = sin(u_Time * 0.0085);
    t = t + (fs_Height/ 4.0);
  
    // color the pixels within range for the window space
    if ((x > (w - windowW) * 0.5) && (x < (w + windowW) * 0.5) && (y > (h - windowH) * 0.5) && (y < (h + windowH) * 0.5)){

        return mix(vec3(1.0, 0.9373, 0.3608), vec3(0.0) , 1.0- t);
    }
    else {
    vec3 c1 =  vec3(0.302, 0.1686, 0.0157);
    vec3 c2 =  vec3(0.5333, 0.2863, 0.0235);
    float t = fract(fs_Pos.y* 10.0) * 2.0;

   return mix(c1, c2, t);
    }
   






}


void main()
{
  float t = sin(u_Time * 0.00425);
 // lambertian shading
  vec3 buildingColAfternoon = mix(vec3(0.4784, 0.3294, 0.1922),vec3(0.2314, 0.0667, 0.4471), fs_Pos.y);     
  vec3 buildingColMorning =mix(vec3(0.6078, 0.3922, 0.2),vec3(0.9333, 0.5647, 0.2157), fs_Pos.y);
  vec3 buildingCol = mix(buildingColMorning, buildingColAfternoon, t);                             
  vec3 diffuse = vec3(1.56, 1.00, 1.0) * min(max(dot(fs_Nor, vec4(0.0, 1.0, 0.0, 1.0)), 0.0) + 0.2, 1.0);
  vec3 other = vec3(0.26, 0.50, 0.4) * min(max(fs_Nor.y, 0.0) + 0.2, 1.0);
  vec3 lightingColor = pow((diffuse + other) * buildingCol, vec3(1.0 / 2.2));

  vec3 temp;
 
  temp = windows(vec2(fs_Pos.x * 100.0, fs_Pos.y * 100.0), lightingColor);

  if(fs_Height > 3.0){
    temp = tallWindows(vec2(fs_Pos.x * 100.0, fs_Pos.y * 100.0), vec3(0.2392, 0.2235, 0.2235));
  }
   if(fs_Height < 0.50){
    temp = smallHomes(vec2(fs_Pos.x * 100.0, fs_Pos.y * 100.0),vec3(1.0));
  }

  temp = clamp(vec3(temp * lightingColor), 0.0, 1.0);
  out_Col = vec4(temp, 1.0);
}