// Planet properties with staggered speeds and distances
const planets = [
    { 
        radius: 1.3, 
        distance: 8, 
        speed: 0.2, 
        color: vec4(0.7, 0.7, 0.7, 1.0),  // Gray
        texIndex: 0  // Use first texture
    },
    { 
        radius: 1.5, 
        distance: 15, 
        speed: 0.15, 
        color: vec4(0.2, 0.6, 0.5, 1.0),  // Swampy green-blue
        texIndex: 1  // Use second texture
    },
    { 
        radius: 2.2, 
        distance: 25, 
        speed: 0.1, 
        color: vec4(0.8, 0.5, 0.2, 1.0),  // Muddy brown-orange
        texIndex: 3  // Use first texture
    },
    { 
        radius: 5, 
        distance: 35, 
        speed: 0.05, 
        color: vec4(0.4, 0.6, 0.9, 1.0),  // Soft light blue
        texIndex: 2  // Use second texture
    },

];



// Draw all planets 
function drawPlanets(TIME, spaceshipTransform) {
    planets.forEach((planet) => {

        // Calculate orbital position
        const orbitalAngle = TIME * planet.speed;
        const x = planet.distance * Math.cos(orbitalAngle);
        const z = planet.distance * Math.sin(orbitalAngle);

        gPush();
        {
            setColor(planet.color);

            let posX = x;
            let posZ = z;
            if (spaceshipTransform && spaceshipTransform.length >= 16) {
                posX += spaceshipTransform[12];
                posZ += spaceshipTransform[14];
            }
            gTranslate(posX, 0, posZ);

            gScale(planet.radius, planet.radius, planet.radius);

            // === BIND the planet's procedural texture
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, planetTextureArray[planet.texIndex].textureWebGL);
            gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
            gl.uniform1i(gl.getUniformLocation(program, "useTextures"), 1);

            // Draw the sphere with the planet’s texture
            drawSphere();

            // (Optional) unbind so it won't affect subsequent draws
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        gPop();
    });
}