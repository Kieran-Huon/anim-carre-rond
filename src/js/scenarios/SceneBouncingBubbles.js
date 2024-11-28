import GlobalContext from "../template/GlobalContext";
import Scene2D from "../template/Scene2D";
import { clamp, degToRad, distance2D, randomRange } from "../Utils/MathUtils";

class Bubble {
    constructor(context, x, y, radius) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.radius = radius;

        this.time = new GlobalContext().time;

        /** speed */
        this.vx = randomRange(-200, 200);
        this.vy = randomRange(-200, 200);

        /** gravity */
        this.gx = 0;
        this.gy = 0;
    }

    draw() {
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius, 0, degToRad(360));
        this.context.fill();
        this.context.stroke();
        this.context.closePath();
    }

    update(width, height, speed) {
        /** Apply gravity */
        this.x += (this.vx + this.gx) * speed * this.time.delta / 1000;
        this.y += (this.vy + this.gy) * speed * this.time.delta / 1000;

        /** Bounce corrections */
        if (this.x < this.radius) {
            this.x = this.radius;
            this.vx = Math.abs(this.vx);
        } else if (this.x > width - this.radius) {
            this.x = width - this.radius;
            this.vx = -Math.abs(this.vx);
        }

        if (this.y < this.radius) {
            this.y = this.radius;
            this.vy = Math.abs(this.vy);
        } else if (this.y > height - this.radius) {
            this.y = height - this.radius;
            this.vy = -Math.abs(this.vy);
        }
    }
}

export default class SceneBouncingBubbles extends Scene2D {
    constructor(id) {
        super(id);

        /** Parameters */
        this.params = {
            speed: 1, // Control the speed of bubbles
            threshold: 50, // Distance for connecting lines
            radius: 5, // Radius of bubbles
            nBubbles: 10, // Number of bubbles
            gStrength: 300 // Gravity strength
        };

        /** Debug panel */
        if (!!this.debugFolder) {
            this.debugFolder.add(this.params, "speed", 0.1, 5, 0.1).name("Vitesse des Bulles");
            this.debugFolder.add(this.params, "threshold", 0, 200).name("Distance de Lien");
            this.debugFolder.add(this.params, "radius", 1, 30, 0.1).name("Rayon des Bulles").onChange(() => {
                this.bubbles.forEach(b => (b.radius = this.params.radius));
            });
            this.debugFolder.add(this.params, "nBubbles", 1, 50, 1).name("Nombre de Bulles").onFinishChange(() => {
                this.generateBubbles();
            });
            this.debugFolder.add({ addBubble: () => this.addRandomBubble() }, "addBubble").name("Ajouter une Bulle");
        }

        /** Device orientation */
        this.globalContext.useDeviceOrientation = true;
        this.orientation = this.globalContext.orientation;

        /** Initialization */
        this.generateBubbles();
        this.draw();
    }

    /** Generate bubbles */
    generateBubbles() {
        this.bubbles = [];
        for (let i = 0; i < this.params.nBubbles; i++) {
            const x = randomRange(this.params.radius, this.width - this.params.radius);
            const y = randomRange(this.params.radius, this.height - this.params.radius);
            this.bubbles.push(new Bubble(this.context, x, y, this.params.radius));
        }
    }

    /** Add a bubble at specific coordinates */
    addBubble(x, y) {
        const bubble = new Bubble(this.context, x, y, this.params.radius);
        this.bubbles.push(bubble);
        console.log(`Bulle ajoutée à (${x}, ${y}).`);
        return bubble;
    }

    /** Add a bubble at random position */
    addRandomBubble() {
        const x = randomRange(this.params.radius, this.width - this.params.radius);
        const y = randomRange(this.params.radius, this.height - this.params.radius);
        this.addBubble(x, y);
    }

    /** Remove a specific bubble */
    removeBubble(bubble) {
        if (!this.bubbles.includes(bubble)) {
            console.warn("Tentative de suppression d'une bulle inexistante !");
            return;
        }
        this.bubbles = this.bubbles.filter(b => b !== bubble);
        console.log(`Bubble removed at (${bubble.x}, ${bubble.y})`);
    }

    /** Draw the scene */
    draw() {
        this.context.strokeStyle = "white";
        this.context.fillStyle = "black";
        this.context.lineWidth = 2;

        /** Draw connections */
        this.bubbles.forEach((current, i) => {
            for (let j = i + 1; j < this.bubbles.length; j++) {
                const next = this.bubbles[j];
                if (distance2D(current.x, current.y, next.x, next.y) < this.params.threshold) {
                    this.context.beginPath();
                    this.context.moveTo(current.x, current.y);
                    this.context.lineTo(next.x, next.y);
                    this.context.stroke();
                }
            }
        });

        /** Draw bubbles */
        this.bubbles.forEach(b => b.draw());
    }

    /** Update the scene */
    update() {
        this.bubbles.forEach(b => b.update(this.width, this.height, this.params.speed));
        this.clear();
        this.draw();
    }

    /** Handle resizing */
    resize() {
        super.resize();
        this.bubbles.forEach(b => {
            b.x = Math.min(Math.max(b.x, b.radius), this.width - b.radius);
            b.y = Math.min(Math.max(b.y, b.radius), this.height - b.radius);
        });
        this.draw();
    }

    /** Update bubbles with device orientation */
    onDeviceOrientation() {
        const gx = clamp(this.orientation.gamma / 90, -1, 1);
        const gy = clamp(this.orientation.beta / 90, -1, 1);

        this.bubbles.forEach(b => {
            b.gx = gx * this.params.gStrength;
            b.gy = gy * this.params.gStrength;
        });
    }
}
