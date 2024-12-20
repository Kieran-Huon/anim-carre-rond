import SceneGravityCubes from "./js/scenarios/GravityCubes/SceneGravityCubes";
import SceneBouncingBubbles from "./js/scenarios/SceneBouncingBubbles";
import GlobalContext from "./js/template/GlobalContext";
import { askMotionAccess } from "./js/Utils/DeviceAccess";

/** motion sensors authorization */
const btn = document.getElementById("btn-access");
btn.addEventListener("click", function () {
    askMotionAccess();
}, false);

/** scenes */
const scene1 = new SceneBouncingBubbles("canvas-scene-1");
const scene2 = new SceneGravityCubes("canvas-scene-2");
const scene3 = new SceneBouncingBubbles("canvas-scene-3");
const globalContext = new GlobalContext();
globalContext.addScene(scene1);
globalContext.addScene(scene2);
globalContext.addScene(scene3);

const params = {
    test: 0,
};
if (!!globalContext.debug.ui) {
    globalContext.debug.ui.add(params, "test", 0, 10);
}
const time = globalContext.time;

// Cooldown management
let cooldown = {
    scene1ToScene2: 0,
    scene2ToScene3: 0,
    scene3ToScene2: 0,
    scene2ToScene1: 0,
    scene1ToScene3: 0,
    scene3ToScene1: 0,
};

scene1.params.radius = 10; 
scene1.params.threshold = 100; 
scene1.params.nBubbles = 10;
scene1.generateBubbles(); 


const COOLDOWN_LIMIT = 500;
const SPEED_FACTOR = 0.08; 
const update = () => {
    const elapsed = time.elapsed;

    /** Scene 1 -> Scene 2 (bubbles to cubes) */
    if (elapsed - cooldown.scene1ToScene2 > COOLDOWN_LIMIT) {
        const outScene1_down = scene1.bubbles.filter(b => b.y > scene1.height);
        outScene1_down.forEach(bubble => {
            scene1.removeBubble(bubble);
            const newCube = scene2.addCube(bubble.x - scene2.width / 2, scene2.height / 2, "yellow");
            if (newCube && newCube.body) {
                newCube.body.velocity.y = Math.abs(bubble.vy) / 100;
            }
        });
        cooldown.scene1ToScene2 = elapsed;
    }

    /** Scene 2 -> Scene 3 (cubes to bubbles) */
    if (elapsed - cooldown.scene2ToScene3 > COOLDOWN_LIMIT) {
        const outScene2_down = scene2.cubes.filter(c => c.position.y < -scene2.height / 2);
        outScene2_down.forEach(cube => {
            scene2.removeCube(cube);
            const newBubble = scene3.addBubble(cube.position.x + scene3.width / 2, 0);
            
            if (newBubble) {
                newBubble.vy = Math.abs(cube.body.velocity.y * SPEED_FACTOR) * 100;
            }
            
        });
        cooldown.scene2ToScene3 = elapsed;
    }

    /** Scene 3 -> Scene 2 (bubbles to cubes) */
    if (elapsed - cooldown.scene3ToScene2 > COOLDOWN_LIMIT) {
        const outScene3_up = scene3.bubbles.filter(b => b.y < 0);
        outScene3_up.forEach(bubble => {
            scene3.removeBubble(bubble);
            const newCube = scene2.addCube(bubble.x - scene2.width / 2, -scene2.height / 2, "blue");
            if (newCube && newCube.body) {
                newCube.body.velocity.y = Math.abs(bubble.vy) / 100;
            }
            
        });
        cooldown.scene3ToScene2 = elapsed;
    }

    /** Scene 2 -> Scene 1 (cubes to bubbles) */
    if (elapsed - cooldown.scene2ToScene1 > COOLDOWN_LIMIT) {
        const outScene2_up = scene2.cubes.filter(c => c.position.y > scene2.height / 2);
        outScene2_up.forEach(cube => {
            scene2.removeCube(cube);
            const newBubble = scene1.addBubble(cube.position.x + scene1.width / 2, scene1.height);
            if (newBubble) {
                newBubble.vy = -Math.abs(cube.body.velocity.y * SPEED_FACTOR) * 100;
            }
            
        });
        cooldown.scene2ToScene1 = elapsed;
    }

    /** Scene 1 -> Scene 3 (bubbles to bubbles) */
    if (elapsed - cooldown.scene1ToScene3 > COOLDOWN_LIMIT) {
        const outScene1_up = scene1.bubbles.filter(b => b.y < 0);
        outScene1_up.forEach(bubble => {
            scene1.removeBubble(bubble);
            const newBubble = scene3.addBubble(bubble.x, scene3.height - 20); 
            if (newBubble) {
                newBubble.vy = -Math.abs(bubble.vy * SPEED_FACTOR);
            }
            
        });
        cooldown.scene1ToScene3 = elapsed;
    }

    /** Scene 3 -> Scene 1 (bubbles to bubbles) */
    if (elapsed - cooldown.scene3ToScene1 > COOLDOWN_LIMIT) {
        const outScene3_down = scene3.bubbles.filter(b => b.y > scene3.height);
        outScene3_down.forEach(bubble => {
            scene3.removeBubble(bubble);
            const newBubble = scene1.addBubble(bubble.x, 20); 
            if (newBubble) {
                newBubble.vy = Math.abs(bubble.vy * SPEED_FACTOR);
            }
            
        });
        cooldown.scene3ToScene1 = elapsed;
    }
};

/** Attach the update function to the time update event */
time.on("update", update);




// Variables globales
let baseSpeed = 0; // Vitesse initiale

// Éléments HTML
const addBubbleBtn = document.getElementById('addBubble');
const removeBubbleBtn = document.getElementById('removeBubble');
const speedControl = document.getElementById('speedControl');
const speedDisplay = document.getElementById('speedDisplay');

// Fonction pour appliquer la vitesse globale
function applyBaseSpeed() {
    scene1.bubbles.forEach(bubble => {
        bubble.vx = baseSpeed * Math.sign(bubble.vx || 1); // Applique la vitesse à x
        bubble.vy = baseSpeed * Math.sign(bubble.vy || 1); // Applique la vitesse à y
    });

    scene2.cubes.forEach(cube => {
        cube.body.velocity.x = baseSpeed * Math.sign(cube.body.velocity.x || 1);
        cube.body.velocity.y = baseSpeed * Math.sign(cube.body.velocity.y || 1);
    });
}

// Gestion des événements du panneau
addBubbleBtn.addEventListener('click', () => {
    scene1.addBubble(Math.random() * scene1.width, Math.random() * scene1.height);
});

removeBubbleBtn.addEventListener('click', () => {
    if (scene1.bubbles.length > 0) {
        const bubble = scene1.bubbles.pop(); // Supprime la dernière bulle
        console.log(`Bubble removed at (${bubble.x}, ${bubble.y})`);
    }
});

speedControl.addEventListener('input', (event) => {
    baseSpeed = parseFloat(event.target.value);
    speedDisplay.textContent = baseSpeed.toFixed(2);
    applyBaseSpeed(); // Applique la nouvelle vitesse
});




  


/*
Hello, j'ai trouvé comment utiliser le motion capteur en mode dev sans déployer sur Vercel :

npm i -D @vitejs/plugin-basic-ssl

Puis modifier le vite.config.mjs :

import basicSsl from '@vitejs/plugin-basic-ssl';
export default {
    root: 'src',
    build: {
        outDir: '../dist'
    },
    plugins: [
        basicSsl()
    ]
};
*/
/** TODO */
/** TODO */
/*
    - SceneGravityCubes
        - Mur gauche (responsive)
        - Murs intermédiaires (responsive)
        - Fonction AddCube()
    - SceneBouncingBubbles
        - Fonction RemoveBubble()
        - Debug : paramètre speed (-1 <-> 1)
    - Main
        - Finir les correspondances
            scène 2 -> 3 (faite en cours)
            3 -> 2
            3 -> 1
            1 -> 3
            1 -> 2
            2 -> 1
*/
/** TODO */
/** TODO */