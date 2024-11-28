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

/** main */
const globalContext = new GlobalContext();
const params = {
    test: 0
};
if (!!globalContext.debug.ui) {
    globalContext.debug.ui.add(params, "test", 0, 10);
}
const time = globalContext.time;

// Ajout d'un cooldown pour limiter la création d'objets
let cooldown = {
    scene1ToScene2: 0,
    scene2ToScene3: 0,
    scene3ToScene2: 0,
    scene2ToScene1: 0,
};

const COOLDOWN_LIMIT = 500; // Temps en ms entre deux transitions pour un même objet

const update = () => {
    const elapsed = time.elapsed;

    /** Scene 1 -> Scene 2 (bulles qui tombent et deviennent cubes) */
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

    /** Scene 2 -> Scene 1 (bulles qui montent) */
    if (elapsed - cooldown.scene1ToScene2 > COOLDOWN_LIMIT) {
        const outScene1_up = scene1.bubbles.filter(b => b.y < 0);
        outScene1_up.forEach(bubble => {
            scene1.removeBubble(bubble);
            const newCube = scene2.addCube(bubble.x - scene2.width / 2, scene2.height / 2, "yellow");
            if (newCube && newCube.body) {
                newCube.body.velocity.y = Math.abs(bubble.vy) / 100;
            }
        });
        cooldown.scene1ToScene2 = elapsed;
    }

    /** Scene 2 -> Scene 3 (cubes qui tombent) */
    if (elapsed - cooldown.scene2ToScene3 > COOLDOWN_LIMIT) {
        const outScene2_down = scene2.cubes.filter(c => c.position.y < -scene2.height / 2);
        outScene2_down.forEach(cube => {
            scene2.removeCube(cube);
            const newBubble = scene3.addBubble(cube.position.x + scene3.width / 2, 0);
            if (newBubble) {
                newBubble.vy = Math.abs(cube.body.velocity.y) * 100;
            }
        });
        cooldown.scene2ToScene3 = elapsed;
    }

    // /** Scene 3 -> Scene 2 (bulles qui montent) */
    // if (elapsed - cooldown.scene3ToScene2 > COOLDOWN_LIMIT) {
    //     const outScene3_up = scene3.bubbles.filter(b => b.y < 0);
    //     outScene3_up.forEach(bubble => {
    //         scene3.removeBubble(bubble);
    //         const newCube = scene2.addCube(bubble.x - scene2.width / 2, scene2.height / 2, "blue");
    //         if (newCube && newCube.body) {
    //             newCube.body.velocity.y = Math.abs(bubble.vy) / 100;
    //         }
    //     });
    //     cooldown.scene3ToScene2 = elapsed;
    // }

    /** Scene 3 -> Scene 2 (bulles qui montent) */
if (elapsed - cooldown.scene3ToScene2 > COOLDOWN_LIMIT) {
    const outScene3_up = scene3.bubbles.filter(b => b.y < 0); // Bulles qui sortent par le haut
    outScene3_up.forEach(bubble => {
        scene3.removeBubble(bubble);

        // Ajoute le carré en bas de la scène 2
        const newCube = scene2.addCube(bubble.x - scene2.width / 2, -scene2.height / 2, "blue");
        if (newCube && newCube.body) {
            newCube.body.velocity.y = Math.abs(bubble.vy) / 100; // Transmission de la vitesse
        }
    });
    cooldown.scene3ToScene2 = elapsed;
}


    /** Scene 2 -> Scene 1 (cubes qui montent) */
    if (elapsed - cooldown.scene2ToScene1 > COOLDOWN_LIMIT) {
        const outScene2_up = scene2.cubes.filter(c => c.position.y > scene2.height / 2);
        outScene2_up.forEach(cube => {
            scene2.removeCube(cube);
            const newBubble = scene1.addBubble(cube.position.x + scene1.width / 2, scene1.height);
            if (newBubble) {
                newBubble.vy = -Math.abs(cube.body.velocity.y) * 100;
            }
        });
        cooldown.scene2ToScene1 = elapsed;
    }
};

/** Attachez la fonction de mise à jour au gestionnaire de temps */
time.on("update", update);


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