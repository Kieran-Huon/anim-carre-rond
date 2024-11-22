import * as THREE from 'three';
import Scene3D from "../../template/Scene3D";
import { Composite, Engine, Runner } from 'matter-js';
import { randomRange } from '../../Utils/MathUtils';
import GravityCube from './GravityCubes';
import Wall from './Wall';
import { clamp } from 'three/src/math/MathUtils.js';

const THICKNESS = 20;

export default class SceneGravityCubes extends Scene3D {
    constructor(id) {
        super(id);

        /** debug */
        this.params = {
            gScale: 1
        };
        if (!!this.debugFolder) {
            this.debugFolder.add(this.params, "gScale", 0.5, 10, 0.1).onChange(() => {
                if (!!this.engine) this.engine.gravity.scale *= this.params.gScale;
            });
        }

        /** orthographic camera */
        this.camera = new THREE.OrthographicCamera(
            -this.width / 2, this.width / 2, this.height / 2, -this.height / 2,
            0.1, 2000 //-> near / far default (optional)
        );
        this.camera.position.z = 1000;

        /** walls */
        this.wallRight = new Wall('blue');
        this.wallLeft = new Wall('green');
        this.wallMiddle = new Wall('purple'); // Mur horizontal intermédiaire

        this.add(this.wallRight);
        this.add(this.wallLeft);
        this.add(this.wallMiddle); // Ajouter le mur intermédiaire horizontal à la scène

        /** cubes */
        this.cubes = [];
        const colors = ['red', 'yellow', 'blue'];
        for (let i = 0; i < 10; i++) {
            const cube_ = new GravityCube(50, colors[i % colors.length]);
            const x_ = randomRange(-this.width / 2, this.width / 2);
            const y_ = randomRange(-this.height / 2, this.height / 2);
            cube_.setPosition(x_, y_);

            this.add(cube_);
            this.cubes.push(cube_);
        }

        /** matter js */
        this.engine = Engine.create({ render: { visible: false } });
        this.engine.gravity.scale *= this.params.gScale;
        this.bodies = [
            this.wallRight.body,
            this.wallLeft.body,
            this.wallMiddle.body, // Ajouter le corps du mur intermédiaire au moteur physique
            ...this.cubes.map(c => c.body)
        ];
        Composite.add(this.engine.world, this.bodies);
        this.runner = Runner.create();
        Runner.run(this.runner, this.engine);

        /** device orientation */
        this.globalContext.useDeviceOrientation = true;
        this.orientation = this.globalContext.orientation;

        /** resize */
        this.resize();
    }

    /** Ajouter un cube à la scène dynamiquement */
    addCube(x, y, color = 'green') {
        // Créer un nouveau cube
        const cube = new GravityCube(50, color); // Taille fixe de 50 pour le cube
        cube.setPosition(x, y);

        // Ajouter le cube à la scène Three.js
        this.add(cube);

        // Ajouter le cube à la liste des cubes
        this.cubes.push(cube);

        // Ajouter le cube au moteur physique Matter.js
        Composite.add(this.engine.world, cube.body);

        console.log(`Cube added at (${x}, ${y}) with color ${color}`);
        return cube;
    }

    /** Supprimer un cube de la scène */
    removeCube(cube) {
        /** dispose from memory */
        cube.geometry.dispose();
        cube.material.dispose();
        cube.removeFromParent();

        /** dispose from matter js */
        Composite.remove(this.engine.world, cube.body);

        /** dispose from scene */
        this.cubes = this.cubes.filter(c => c !== cube);
    }

    update() {
        this.cubes.forEach(c => {
            c.update();
        });
        super.update(); //-> rendu de la scène
    }

    resize() {
        super.resize();

        this.camera.left = -this.width / 2;
        this.camera.right = this.width / 2;
        this.camera.top = this.height / 2;
        this.camera.bottom = -this.height / 2;

        this.camera.updateProjectionMatrix();

        if (!!this.wallRight) {
            this.wallRight.setPosition(this.width / 2, 0);
            this.wallRight.setSize(THICKNESS, this.height);
        }

        if (!!this.wallLeft) {
            this.wallLeft.setPosition(-this.width / 2, 0);
            this.wallLeft.setSize(THICKNESS, this.height);
        }

        if (!!this.wallMiddle) {
            this.wallMiddle.setPosition(0, 0); // Positionner au centre verticalement
            this.wallMiddle.setSize(this.width / 2, THICKNESS); // Taille horizontale partielle
        }
    }

    onDeviceOrientation() {
        let gx_ = this.orientation.gamma / 90;
        let gy_ = this.orientation.beta / 90;
        gx_ = clamp(gx_, -1, 1);
        gy_ = clamp(gy_, -1, 1);

        /** debug */
        let coordinates_ = "";
        coordinates_ = coordinates_.concat(
            gx_.toFixed(2), ", ",
            gy_.toFixed(2)
        );
        this.debug.domDebug = coordinates_;

        /** update engine gravity */
        this.engine.gravity.x = gx_;
        this.engine.gravity.y = gy_;
    }
}
