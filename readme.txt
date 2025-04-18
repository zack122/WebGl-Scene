README for Assignment

1) INTRODUCTION
   This project is built from the Lab 5  code, which handles basic WebGL 
   setup, object creation, and some lighting/texture pipeline code. I have 
   extended it to satisfy the requirements of the assignment:
   - Hierarchical transformations
   - Camera fly-around
   - Real-time performance
   - At lest two new textures
   - Fragment-based lighting with Blinn-Phong
   - A clearly visible novel shader effect
   - Additional complexity and creativity in the scene



2) WHAT I HAVE DONE
   a) **Hierarchical Spaceship**  
      - I created a multi-level spaceship object with a body, wings, thrusters, 
        and cockpit. The wings swing at an angle around their attachment points aswell as the thrusters 
        with their fin attachments.
      - The cockpit, nose cones, and other parts are child transforms in the 
        hierarchy, ensuring they rotate/translate correctly relative to the 
        main body.
        

   b) **360-Degree Camera Fly-Around**  
      - In `render()`, I move the camera in a circle around the scene center, 
        focusing on the spaceship. The camera’s position is updated each frame 
        based on `cameraAngle` and `cameraHeight`.

   c) **Real-Time**  
      - I use `dt = (timestamp - prevTime)/1000.0;` each frame to ensure 
        motions and animations progress in real-time.

   d) **Two New Procedural Textures**  
      - In `textures.js`, I generate 4 different procedural textures (sun, 
        striped, noise-static, checker, ). 
        mapped to the planets in a meaningful way (they orbit, so you can 
        clearly see the patterns).
      - For the spaceship, I also generate a separate procedural “metallic panel” texture, 
        giving it a more interesting look.

   e) **Fragment-Based Lighting with Blinn-Phong**  
      - I modified the assignment base code to move ADS lighting from the 
        vertex shader to the fragment shader. Now lighting is computed 
        per-fragment.
      - I also replaced Phong with Blinn-Phong by computing the halfway vector 
        `H = normalize(L + V)` and using `dot(N, H)` for the specular term.

   f) **Novel Shader Effect**  
      - I inserted a **cel-shading snippet** in the same 
        fragment shader. For cel-shading, I quantize the diffuse lighting 
        into discrete bands for a cartoonish look. 
        - Each line is commented to explain the effect and logic.
        - This is distinct from the base code or labs, creating a new style.

    4) COMPLEXITY & CREATIVITY & QUALITY
    - **Procedural Textures**: 
        - I spent extra effort designing each procedural pattern (radial gradient sun, striped, noise, checker). 
        These show up clearly on the planets/spaceship and contribute to a more dynamic, interesting look.
    - **Flame-Thrust Particle System**:
        - The spaceship’s thruster flame is composed of small spheres that spawn behind the thruster. 
        They shrink and fade over time, creating a realistic “engine flame” effect. 
        The code handles random velocity, lifetime, and pulsation for a lively, complex scene.
    -   The shapes (cone, cylinder, sphere, etc.) are used in a cohesive manner, and the transformations (scale, rotate, translate) are carefully tuned to achieve a coherent spaceship model.
        The starfield is rendered with a skip-distance check so that stars don’t appear inside the ship, avoiding immersion-breaking intersections.
    - The spaceship has multiple hierarchical components (body, cockpit, wings, thrusters) each with its own transformations. The wings pivot correctly around their attachment points,
     thrusters attach to wing tips, and nose cones are at the front/back. Planets orbit around the spaceship’s position, requiring the orbital code to add the spaceship’s transform to each planet’s
     local position. This demonstrates more complex referencing than a simple orbit around the origin.


4) WHAT I HAVE OMITTED
   - nothing that I know of

5) HOW TO RUN
   1. Use a local server (e.g., `python -m http.server 8080`) in this folder.
   2. Open a browser to `localhost:8080`.
   3. Click on `main.html`. The scene should load with the spaceship, planets, 
      starfield, etc.
   4. You can see the camera orbit, the hierarchical motions, procedural 
      textures, and the novel shader effect (cel-shading or swirl).

6) ORIGINAL WORK & POLICY
   - Collaboration: None.
   - I used only Lab 5 and the assignment template as my base. No other 
     external code or references from previous offerings or the internet 
     were used.
   - The procedural textures, cel-shading snippet, and hierarchical 
     spaceship code are my own creations.


Thank you for reviewing my submission TA, you are cool
