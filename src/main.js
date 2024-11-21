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

const update = () => {
    /** exemple css */
    const scale_ = 1 + (Math.cos(5 * time.elapsed / 1000) / 2 + 0.5) / 20;
    btn.style.transform = `scale(${scale_}, ${1})`;

    /** Scene 1 -> Scene 2 (bulles qui montent) */
    const outScene1_up = scene1.bubbles.filter(b => b.y < 0);
    outScene1_up.forEach(bubble => {
        scene1.removeBubble(bubble);
        const newCube = scene2.addCube(bubble.x - scene2.width / 2, scene2.height / 2, "yellow");
        newCube.body.velocity.y = Math.abs(bubble.vy) / 100; // Transmission de vitesse
    });

    /** Scene 2 -> Scene 3 (cubes qui tombent) */
    const outScene2_down = scene2.cubes.filter(c => c.position.y < -scene2.height / 2);
    outScene2_down.forEach(cube => {
        scene2.removeCube(cube);
        const newBubble = scene3.addBubble(cube.position.x + scene3.width / 2, 0);
        newBubble.vy = Math.abs(newBubble.vy);
    });

    /** Scene 3 -> Scene 1 (bulles qui tombent) */
    const outScene3_down = scene3.bubbles.filter(b => b.y > scene3.height);
    outScene3_down.forEach(bubble => {
        scene3.removeBubble(bubble);
        const newBubble = scene1.addBubble(bubble.x, 0);
        newBubble.vy = -Math.abs(newBubble.vy);
    });

    /** Scene 3 -> Scene 2 (bulles qui montent) */
    const outScene3_up = scene3.bubbles.filter(b => b.y < 0);
    outScene3_up.forEach(bubble => {
        scene3.removeBubble(bubble);
        const newCube = scene2.addCube(bubble.x - scene2.width / 2, scene2.height / 2, "blue");
        newCube.body.velocity.y = Math.abs(bubble.vy) / 100;
    });

    /** Scene 2 -> Scene 1 (cubes qui montent) */
    const outScene2_up = scene2.cubes.filter(c => c.position.y > scene2.height / 2);
    outScene2_up.forEach(cube => {
        scene2.removeCube(cube);
        const newBubble = scene1.addBubble(cube.position.x + scene1.width / 2, scene1.height);
        newBubble.vy = -Math.abs(newBubble.vy);
    });

    /** Scene 1 -> Scene 3 (bulles qui tombent) */
    const outScene1_down = scene1.bubbles.filter(b => b.y > scene1.height);
    outScene1_down.forEach(bubble => {
        scene1.removeBubble(bubble);
        const newBubble = scene3.addBubble(bubble.x, 0);
        newBubble.vy = Math.abs(newBubble.vy);
    });
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