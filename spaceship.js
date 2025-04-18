// spaceship.js
// Contains all functions for building and drawing the spaceship
// Holds our persistent thruster particles
var thrusterParticles = [];

// Draw the complete spaceship with hierarchical structure
function drawSpaceship(position, rotation) {
    gPush();
    {
        // Level 1: Spaceship Body (Root)
        // Apply overall translation and rotation of the spaceship
        gTranslate(position[0], position[1], position[2]);
        gRotate(rotation[0], 1, 0, 0);
        gRotate(rotation[1], 0, 1, 0);
        gRotate(rotation[2], 0, 0, 1);
        
        // Set a bright color for the material
        setColor(vec4(0.9, 0.9, 0.9, 1.0));
        
        // Bind the spaceship texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, spaceshipTexture.textureWebGL);
        gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
        gl.uniform1i(gl.getUniformLocation(program, "useTextures"), 1);
        
        // Main body: long, flattened cylinder
        gPush();
        {
            gScale(1.0, 1.0, 2.5);
            drawCylinder();
        }
        gPop();


        
        // Cockpit component
        gPush();
        {
            // Disable texturing for the cockpit
            gl.uniform1i(gl.getUniformLocation(program, "useTextures"), 0);
            setColor(vec4(0.3, 0.8, 1.0, 1.0));
            gTranslate(0, 0.3, 0.5);
            gScale(0.4, 0.4, 0.4);
            drawSphere();
            // Re-enable texturing for components that come after
            gl.uniform1i(gl.getUniformLocation(program, "useTextures"), 1);
        }
        gPop();
        
        // Level 2: Attached Components (Wings & Nose Cone)
        drawWings(wingAngle);
        
        // Front nose cone
        gPush();
        {
            setColor(vec4(0.6, 0.6, 0.8, 1.0));
            gTranslate(0, 0, 1.75);
            gRotate(0, 1, 0, 0);
            gScale(0.5, 0.5, 1.0);
            drawCone();
        }
        gPop();

        // rear thruster nose cone
        gPush();
        {
            
            setColor(vec4(0.6, 0.6, 0.8, 1.0));
            gTranslate(0, 0, -1.0);
            gRotate(0, 1, 0, 0);
            gScale(0.70, 0.70, 2.0);
            drawCone();
        }
        gPop();
        
        // Before drawing thruster particles, disable texturing
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.uniform1i(gl.getUniformLocation(program, "useTextures"), 0);
        
        // Draw the wavy flame behind the thruster
        drawThrusterParticles();
    }
    gPop();
}

function drawWings(angle) {
    // ----- Left Wing -----
    gPush();
    {
        setColor(vec4(0.5, 0.5, 0.7, 1.0));
        gTranslate(-0.5, 0, 0); // Position wing outward
        gRotate(angle, 0, 0, 0.5); // Apply wing angle
        gPush();
        {
            gRotate(0, 0, 0, 1); // Rotate to make the cone lie flat
            gScale(1.5, 0.2, 2); // Stretch to look like a triangle
            drawCone();

            // ***end cap at he end of the wings god this took so long to get right ***
            gPush();
            {
                setColor(vec4(0.5, 0.5, 0.7, 1.0));

                gTranslate(-0.1, 0, -0.5);

                // Rotate to match the cone’s orientation 
                gRotate(90, 1, 0, 0);

                // Scale into a flat oval: smaller in two axes, larger in the "cap" axis
                gScale(0.9, 0.1, 0.9);
                drawSphere();
            }
            gPop();
        }
        gPop();

        // Level 3: Thruster at the tip of the left wing
        drawThruster(-0.8, -0.2, -0.5, thrusterAngle);
    }
    gPop();

    // ----- Right Wing -----
    gPush();
    {
        setColor(vec4(0.5, 0.5, 0.7, 1.0));
        gTranslate(0.5, 0, 0); // Position wing outward
        gRotate(-angle, 0, 0, 1);
        gPush();
        {
            gRotate(0, 0, 0, 1); // Mirror rotation for the right wing
            gScale(1.5, 0.2, 2);
            drawCone();

            gPush();
            {
                setColor(vec4(0.5, 0.5, 0.7, 1.0));

                gTranslate(0.05, 0, -0.5);

                // Rotate to match the cone’s orientation 
                gRotate(90, 1, 0, 0);

                // Scale into a flat oval: smaller in two axes, larger in the "cap" axis
                gScale(0.9, 0.1, 0.9);
                drawSphere();
            }
            gPop();
        }
        gPop();

        // Level 3: Thruster at the tip of the right wing
        drawThruster(0.8, -0.2, -0.5, thrusterAngle);
    }
    gPop();
}


// Draw a thruster (engine) attached to a wing (Level 3)
function drawThruster(x, y, z, angle) {
    gPush();
    {
        // Position the thruster relative to the wing
        gTranslate(x, y, z);
        
        // Draw the thruster body
        setColor(vec4(0.3, 0.3, 0.4, 1.0));
        gPush();
        {
            gRotate(90, 1, 0, 0);
            gScale(0.2, 0.2, 0.4);
            drawCylinder();
        }
        gPop();
        
        // Draw the thruster nozzle
        gPush();
        {
            setColor(vec4(0.2, 0.2, 0.3, 1.0));
            gTranslate(0, 0, -0.3);
            gRotate(90, 1, 0, 0);
            gScale(0.25, 0.25, 0.1);
            drawCylinder();
        }
        gPop();
        
        // Level 3 (Continued): Exhaust/Flame Effect
        drawThrusterFlame(0, 0, -0.4, angle);
        
        // Thruster control fins that rotate (Level 3 detail)
        drawThrusterFins(angle);
    }
    gPop();
}

// Thruster flame effect representing exhaust (Level 3 detail)
function drawThrusterFlame(x, y, z, angle) {
    const pulseScale = 0.8 + 0.4 * Math.sin(enginePulse);
    gPush();
    {
        gTranslate(x, y, z);
        gl.uniform1i(gl.getUniformLocation(program, "useTextures"), 0);

        // Inner flame: brighter, smaller cone
        setColor(vec4(1.0, 0.8, 0.2, 1.0));
        gPush();
        {
            gRotate(-90, 1, 0, 0);
            gScale(0.1, 0.1, 0.7 * pulseScale);
            drawCone();
        }
        gPop();
        
        // Outer flame: larger, dimmer cone for glow effect
        setColor(vec4(1.0, 0.5, 0.0, 1.0));
        gPush();
        {
            gRotate(-90, 1, 0, 0);
            gScale(0.15, 0.15, 0.6 * pulseScale);
            drawCone();
        }
        gPop();
        gl.uniform1i(gl.getUniformLocation(program, "useTextures"), 1);

    }
    gPop();
}


// Thruster control fins (Level 3 detail)
function drawThrusterFins(angle) {

    
    // // Fin 1
    gPush();
    {
        setColor(vec4(0.4, 0.4, 0.5, 1.0));
        gRotate(angle + 120, 0, 0, 1);
        gTranslate(0, 0.2, -0.2);
        gScale(0.05, 0.2, 0.1);
        drawCube();
    }
    gPop();
    
    // Fin 2
    gPush();
    {
        setColor(vec4(0.4, 0.4, 0.5, 1.0));
        gRotate(angle + 240, 0, 0, 1);
        gTranslate(0, 0.2, -0.2);
        gScale(0.05, 0.2, 0.1);
        drawCube();
    }
    gPop();
}

function initThrusterParticles(numParticles) {
    for (let i = 0; i < numParticles; i++) {
        thrusterParticles.push(createParticle());
    }
}

// Helper function: returns a single new particle
function createParticle() {
    return {
        // Start just behind the thruster cone
        position: vec3(0, 0, -1.2),

        // Small random velocities so particles spread out
        velocity: vec3(
            (Math.random() - 0.5) * 0.3, // x
            (Math.random() - 0.5) * 0.3, // y
            -0.8 - Math.random() * 0.4   // z (always negative to move backward)
        ),

        // Initial scale (size)
        scale: 0.2 + Math.random() * 0.1,

        // Age and lifespan
        lifetime: 0,
        maxLifetime: 1.5 + Math.random() * 1.0
    };
}

function updateThrusterParticles(dt) {
    for (let i = 0; i < thrusterParticles.length; i++) {
        let p = thrusterParticles[i];

        // Increase lifetime
        p.lifetime += dt;

        // Move the particle
        p.position[0] += p.velocity[0] * dt;
        p.position[1] += p.velocity[1] * dt;
        p.position[2] += p.velocity[2] * dt;

        // Shrink over time or distance
        // For a simple approach, scale by a factor each frame
        p.scale *= (1 - 0.7 * dt); // e.g. shrinks 70% per second

        // If the particle's lifetime is up or too small, re-spawn it
        if (p.lifetime > p.maxLifetime || p.scale < 0.01) {
            thrusterParticles[i] = createParticle();
        }
    }
}


function drawThrusterParticles() {
    setColor(vec4(1.0, 0.5, 0.0, 1.0)); // flame color

    for (let i = 0; i < thrusterParticles.length; i++) {
        let p = thrusterParticles[i];

        gPush();
        {
            // Move to the particle's position
            gTranslate(p.position[0], p.position[1], p.position[2]);

            // Scale the sphere
            gScale(p.scale, p.scale, p.scale);

            // Draw the sphere
            drawSphere();
        }
        gPop();
    }
}
