class TextureFuncs {
	data: Uint8Array;
	constructor(textureData: Uint8Array) {
		this.data = textureData;
	}

// Sample texture to find the water value at the given x,y coords
	sampleWaterFromTexture(xVal: number, yVal: number) {
		let x = Math.floor(xVal);
    let y = Math.floor(yVal);   
    let i = y * 2000.0 * 4.0 + x * 4.0;
    return this.data[i] / 255.0;
	}

	// Sample texture to find population density at the given x,y coords
	samplePopDensityFromTexture(xVal: number, yVal: number) {
		let x = Math.floor(xVal);
    let y = Math.floor(yVal);      
    let i = y * 2000.0 * 4.0 + x * 4.0 + 2.0; // add 2 to read from texture shader that returns (water, elevation, population) - want population
    return this.data[i] / 255.0;
	}

};
export default TextureFuncs;