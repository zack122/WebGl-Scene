// textures.js
// Contains procedural texture creation for four planet textures

// We'll store the procedural planet textures in this array
var planetTextureArray = [];

/**
 * Call this function once in main.js (e.g. in window.onload) 
 * to create and load the procedural textures for your planets.
 */
function initPlanetTextures() {
    const size = 64; // 64x64 or any size you want

    // 1) Sun: radial gradient (yellow->red)
    let sunData = createRadialGradient(size, [255, 255, 0], [255, 0, 0]);
    planetTextureArray.push({});
    loadProceduralTexture(planetTextureArray[0], sunData, size);

    // 2) Striped planet
    let stripeData = createStripedTexture(size, [100, 180, 100], [10, 60, 10]);
    planetTextureArray.push({});
    loadProceduralTexture(planetTextureArray[1], stripeData, size);

    // 3) Noise planet
    let noiseData = createNoiseTexture(size);
    planetTextureArray.push({});
    loadProceduralTexture(planetTextureArray[2], noiseData, size);

    // 4) Checker planet
    let checkerData = createCheckerTexture(size, [200, 80, 200], [20, 0, 20]);
    planetTextureArray.push({});
    loadProceduralTexture(planetTextureArray[3], checkerData, size);
}

/**
 * Creates a radial gradient: centerRGB at center -> edgeRGB at edges
 */
function createRadialGradient(size, centerRGB, edgeRGB) {
    const data = new Uint8Array(size * size * 4);
    const half = size / 2;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            let dx = x - half;
            let dy = y - half;
            let dist = Math.sqrt(dx*dx + dy*dy) / half;
            dist = Math.min(dist, 1.0);

            let r = centerRGB[0]*(1-dist) + edgeRGB[0]*dist;
            let g = centerRGB[1]*(1-dist) + edgeRGB[1]*dist;
            let b = centerRGB[2]*(1-dist) + edgeRGB[2]*dist;

            let idx = 4 * (y*size + x);
            data[idx+0] = r;
            data[idx+1] = g;
            data[idx+2] = b;
            data[idx+3] = 255;
        }
    }
    return data;
}

/**
 * Creates horizontal stripes: colorA / colorB repeating
 */
function createStripedTexture(size, colorA, colorB) {
    const data = new Uint8Array(size * size * 4);
    const stripeHeight = 8; 
    for (let y = 0; y < size; y++) {
        let isStripeA = Math.floor(y / stripeHeight) % 2 === 0;
        let c = isStripeA ? colorA : colorB;
        for (let x = 0; x < size; x++) {
            let idx = 4*(y*size + x);
            data[idx+0] = c[0];
            data[idx+1] = c[1];
            data[idx+2] = c[2];
            data[idx+3] = 255;
        }
    }
    return data;
}

/**
 * Creates a random noise texture
 */
function createNoiseTexture(size) {
    const data = new Uint8Array(size * size * 4);
    for (let i = 0; i < size*size; i++) {
        data[4*i+0] = Math.random() * 255;
        data[4*i+1] = Math.random() * 255;
        data[4*i+2] = Math.random() * 255;
        data[4*i+3] = 255;
    }
    return data;
}

/**
 * Creates a checkerboard pattern with colorA/colorB blocks
 */
function createCheckerTexture(size, colorA, colorB) {
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            let isEven = ((x >> 3) + (y >> 3)) % 2;
            let c = (isEven === 0) ? colorA : colorB;
            let idx = 4*(y*size + x);
            data[idx+0] = c[0];
            data[idx+1] = c[1];
            data[idx+2] = c[2];
            data[idx+3] = 255;
        }
    }
    return data;
}

/**
 * Loads raw RGBA data into a WebGL texture
 */
function loadProceduralTexture(texObj, data, size) {
    texObj.textureWebGL = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texObj.textureWebGL);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

    // Create the texture from raw RGBA data
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0,
                  gl.RGBA, gl.UNSIGNED_BYTE, data);

    // Generate mipmaps & set parameters
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.bindTexture(gl.TEXTURE_2D, null);
    texObj.isTextureReady = true;
}

// Add this to textures.js after your existing planet texture code
function initSpaceshipTexture() {
    // Create a metallic texture for the spaceship
    const size = 64; 
    const data = new Uint8Array(size * size * 4);
    const baseColor = [180, 180, 200]; // Metallic blue-gray
    
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            // Create panel pattern
            const panelSize = 8;
            const isEdge = (x % panelSize <= 1) || (y % panelSize <= 1);
            
            // Add some noise for metallic look
            const noise = (Math.random() * 0.2 + 0.9);
            
            // Darken edges of panels
            const edgeFactor = isEdge ? 0.7 : 1.0;
            
            const idx = 4 * (y * size + x);
            data[idx + 0] = baseColor[0] * noise * edgeFactor;
            data[idx + 1] = baseColor[1] * noise * edgeFactor;
            data[idx + 2] = baseColor[2] * noise * edgeFactor;
            data[idx + 3] = 255;
        }
    }
    
    // Create a new texture object (don't modify planetTextureArray)
    let spaceshipTextureObj = {};
    spaceshipTextureObj.textureWebGL = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, spaceshipTextureObj.textureWebGL);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    
    // Load the texture data
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0,
                  gl.RGBA, gl.UNSIGNED_BYTE, data);
    
    // Generate mipmaps & set parameters
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    
    gl.bindTexture(gl.TEXTURE_2D, null);
    spaceshipTextureObj.isTextureReady = true;
    
    return spaceshipTextureObj;
}
