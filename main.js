// main.js

var canvas;
var gl;
var program;

var near = 1;
var far = 100;

var left = -6.0;
var right = 6.0;
var ytop = 6.0;
var bottom = -6.0;

var lightPosition2 = vec4(100.0, 100.0, 100.0, 1.0);
var lightPosition = vec4(0.0, 0.0, 100.0, 1.0);

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(0.4, 0.4, 0.4, 1.0);
var materialShininess = 30.0;

var ambientColor, diffuseColor, specularColor;

var modelMatrix, viewMatrix, modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var RX = 0, RY = 0, RZ = 0;
var MS = []; // Modeling matrix stack

var TIME = 0.0; // Real time
var dt = 0.0;
var prevTime = 0.0;
var resetTimerFlag = true;

// Global animation and control variables
var cameraAngle = 0;
var cameraHeight = 0;
var enginePulse = 0;
var wingAngle = 0;
var thrusterAngle = 0;

// Spaceship state variables
var shipPosition = [0, 0, 0];
var shipRotation = [0, 0, 0];

// Texture array and related functions
var textureArray = [];
var spaceshipTexture;

function setColor(c) {
    ambientProduct = mult(lightAmbient, c);
    diffuseProduct = mult(lightDiffuse, c);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition2));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);
}

function isLoaded(im) {
    if (im.complete) {
        console.log("loaded");
        return true;
    } else {
        console.log("still not loaded!!!!");
        return false;
    }
}

function loadFileTexture(tex, filename) {
    tex.textureWebGL = gl.createTexture();
    tex.image = new Image();
    tex.image.src = filename;
    tex.isTextureReady = false;
    tex.image.onload = function() { handleTextureLoaded(tex); }
}

function handleTextureLoaded(textureObj) {
    gl.bindTexture(gl.TEXTURE_2D, textureObj.textureWebGL);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureObj.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    console.log(textureObj.image.src);
    textureObj.isTextureReady = true;
}

function waitForTextures(texs) {
    setTimeout(function() {
        var n = 0;
        for (var i = 0; i < texs.length; i++) {
            console.log(texs[i].image.src);
            n = n + texs[i].isTextureReady;
        }
        var wtime = (new Date()).getTime();
        if (n != texs.length) {
            console.log(wtime + " not ready yet");
            waitForTextures(texs);
        } else {
            console.log("ready to render");
            render(0);
        }
    }, 5);
}

function loadImageTexture(tex, image) {
    tex.textureWebGL = gl.createTexture();
    tex.image = new Image();
    gl.bindTexture(gl.TEXTURE_2D, tex.textureWebGL);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    tex.isTextureReady = true;
}

function initTexturesForExample() {
    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "stainless-steel.jpg");

}

function toggleTextures() {
    useTextures = (useTextures + 1) % 2;
    gl.uniform1i(gl.getUniformLocation(program, "useTextures"), useTextures);
}

// Global variables for drawing shapes
// (Cube, Sphere, Cylinder, Cone initialization assumed to be defined elsewhere)
function setMV() {
    modelViewMatrix = mult(viewMatrix, modelMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    normalMatrix = inverseTranspose(modelViewMatrix);
    gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix));
}

function setAllMatrices() {
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    setMV();
}

function drawCube() {
    setMV();
    Cube.draw();
}

function drawSphere() {
    setMV();
    Sphere.draw();
}

function drawCylinder() {
    setMV();
    Cylinder.draw();
}

function drawCone() {
    setMV();
    Cone.draw();
}

function gTranslate(x, y, z) {
    modelMatrix = mult(modelMatrix, translate([x, y, z]));
}

function gRotate(theta, x, y, z) {
    modelMatrix = mult(modelMatrix, rotate(theta, [x, y, z]));
}

function gScale(sx, sy, sz) {
    modelMatrix = mult(modelMatrix, scale(sx, sy, sz));
}

function gPush() {
    MS.push(modelMatrix);
}

function gPop() {
    modelMatrix = MS.pop();
}

function drawStarfield() {
    const numStars = 100;
    const range = 40;
    const minDist = 5.0; // , skip stars within radius 2 of spaceship
    setColor(vec4(1.0, 1.0, 1.0, 1.0));
    
    for (let i = 0; i < numStars; i++) {
        // Generate star coords
        const x = Math.sin(i * 127.1) * range;
        const y = Math.sin(i * 311.7) * range;
        const z = Math.sin(i * 191.3) * range;

        // Distance from spaceship
        let dx = x - shipPosition[0];
        let dy = y - shipPosition[1];
        let dz = z - shipPosition[2];
        let distSq = dx*dx + dy*dy + dz*dz;

        // Skip drawing if star is too close
        if (distSq < minDist*minDist) {
            continue;
        }

        gPush();
        {
            gTranslate(x, y, z);
            gScale(0.1, 0.1, 0.1);
            drawCube();
        }
        gPop();
    }
}



//
//
// RENDER CODE
//
//

function render(timestamp) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    dt = (timestamp - prevTime) / 1000.0;
    prevTime = timestamp;
    TIME += dt;
    
    enginePulse = (enginePulse + dt * 3) % (2 * Math.PI);
    wingAngle = 5 * Math.sin(timestamp / 1000);
    thrusterAngle = 15 * Math.sin(timestamp / 500);
    
    shipRotation[1] += 20 * dt;
    shipPosition[2] = 2 * Math.sin(timestamp / 2000);
    shipPosition[1] = 1 * Math.cos(timestamp / 3000);
    
    cameraAngle += 20 * dt;
    cameraHeight = 5 * Math.sin(timestamp / 4000);
    
    MS = [];
    modelMatrix = mat4();
    
    const radius = 15;
    const camX = radius * Math.cos(radians(cameraAngle));
    const camZ = radius * Math.sin(radians(cameraAngle));
    const camY = 5 + cameraHeight;
    
    eye = vec3(camX, camY, camZ);
    at = vec3(0, 0, 0);
    up = vec3(0, 1, 0);
    viewMatrix = lookAt(eye, at, up);

    var eyeLightPos = mult(viewMatrix, lightPosition);

    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(eyeLightPos));


    projectionMatrix = perspective(45, canvas.width / canvas.height, 0.1, 100);
    
    setAllMatrices();
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureArray[0].textureWebGL);
    gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "useTextures"), 1);
    
    drawStarfield();
    
    const spaceshipTransform = mult(
        translate(shipPosition[0], shipPosition[1], shipPosition[2]),
        rotate(shipRotation[1], 0, 1, 0)
    );
    drawPlanets(TIME, spaceshipTransform);
    updateThrusterParticles(dt);

    
    drawSpaceship(shipPosition, shipRotation);

    initThrusterParticles(1); // create particles
    
    window.requestAnimFrame(render);
}

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    // e.g., in main.js after initShaders(...)
    var vPositionLoc = gl.getAttribLocation(program, "vPosition");
    var vNormalLoc   = gl.getAttribLocation(program, "vNormal");
    var vTexCoordLoc = gl.getAttribLocation(program, "vTexCoord");

    gl.useProgram(program);
    
    setColor(materialDiffuse);
    
    Cube.init(program);
    Cylinder.init(20, program);
    Cone.init(20, program);
    Sphere.init(36, program);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);
    
    document.getElementById("textureToggleButton").onclick = function() {
        toggleTextures();
        window.requestAnimFrame(render);
    };
    
    initTexturesForExample();
    initPlanetTextures();  // from textures.js
    spaceshipTexture = initSpaceshipTexture();

    waitForTextures(textureArray);
}
