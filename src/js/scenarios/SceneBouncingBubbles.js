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
        this.vy = randomRange(-100, 100);

        /** gravity */
        this.gx = 0.2;
        this.gy = 0.2;
    }

    draw() {
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius, 0, degToRad(360));
        this.context.fill();
        this.context.stroke();
        this.context.closePath();
    }

    update(width, height, speed) {
        /** gravity bounce */
        this.gx = this.x > this.radius ? this.gx : 0;
        this.gx = this.x < width - this.radius ? this.gx : 0;

        // Appliquez le facteur de vitesse à la position
        this.x += (this.vx + this.gx) * speed * this.time.delta / 1000;
        this.y += (this.vy + this.gy) * speed * this.time.delta / 1000;

        /** bounce corrected */
        this.vx = this.x < this.radius ? Math.abs(this.vx) : this.vx;
        this.vx = this.x > width - this.radius ? -Math.abs(this.vx) : this.vx;
    }
}

export default class SceneBouncingBubbles extends Scene2D {
    constructor(id) {
        super(id);

        /** debug */
        this.params = {
            speed: 1, 
            threshold: 50,
            radius: 5,
            nBubbles: 3,
            gStrength: 300
        };

        if (!!this.debugFolder) {
            this.debugFolder.add(this.params, "threshold", 0, 200);
            this.debugFolder.add(this.params, "radius", 0, 30, 0.1).name("Rayon").onChange(() => {
                if (!!this.bubbles) {
                    this.bubbles.forEach(b => {
                        b.radius = this.params.radius;
                    });
                }
            });
            this.debugFolder.add(this.params, "nBubbles", 3, 50).onFinishChange(() => {
                this.generateBubbles();
            });
            this.debugFolder.add(this.params, "gStrength", 0, 400);
            this.debugFolder.add(this.params, "speed", -1, 1, 0.1).name("Vitesse").onChange(() => {
                console.log(`Speed updated: ${this.params.speed}`);
            });
        }

        /** device orientation */
        this.globalContext.useDeviceOrientation = true;
        this.orientation = this.globalContext.orientation;

        /** init */
        this.generateBubbles();
        this.draw();
    }

    generateBubbles() {
        /** generate bubbles */
        this.bubbles = [];
        for (let i = 0; i < this.params.nBubbles; i++) {
            const x_ = this.width * Math.random();
            const y_ = this.height * Math.random();
            const bubble_ = new Bubble(this.context, x_, y_, this.params.radius);
            this.bubbles.push(bubble_);
        }
    }

   
    addBubble(x, y) {
        const bubble = new Bubble(this.context, x, y, this.params.radius);
        this.bubbles.push(bubble);
        console.log(`Bubble added at (${x}, ${y})`);
        return bubble;
    }

   
      
    

   
    removeBubble(bubble) {
        const index = this.bubbles.indexOf(bubble);
        if (index !== -1) {
            this.bubbles.splice(index, 1);
            console.log(`Bubble removed at (${bubble.x}, ${bubble.y})`);
        } else {
            console.error("Bubble not found in removeBubble", bubble);
        }
    }
    
    

    draw() {
        /** style */
        this.context.strokeStyle = "white";
        this.context.fillStyle = "black";
        this.context.lineWidth = 2;
        this.context.lineCap = "round";

        /** draw */
        if (!!this.bubbles) {
            for (let i = 0; i < this.bubbles.length; i++) {
                const current_ = this.bubbles[i];
                for (let j = i; j < this.bubbles.length; j++) {
                    const next_ = this.bubbles[j];

                    if (distance2D(current_.x, current_.y, next_.x, next_.y) < this.params.threshold) {
                        this.context.beginPath();
                        this.context.moveTo(current_.x, current_.y);
                        this.context.lineTo(next_.x, next_.y);
                        this.context.stroke();
                        this.context.closePath();
                    }
                }
            }

            this.bubbles.forEach(b => {
                b.draw();
            });
        }
    }

    update() {
        if (!!this.bubbles) {
            this.bubbles.forEach(b => {
                b.update(this.width, this.height, this.params.speed);
            });
        }

        this.clear();
        this.draw();
    }

    resize() {
        super.resize();

        if (!!this.bubbles) {
            this.bubbles.forEach(b => {
                b.x = Math.max(0, Math.min(b.x, this.width));
                b.y = Math.max(0, Math.min(b.y, this.height));
            });
        }

        this.draw();
    }

    onDeviceOrientation() {
        let gx_ = this.orientation.gamma / 90;
        let gy_ = this.orientation.beta / 90;
        gx_ = clamp(gx_, -1, 1);
        gy_ = clamp(gy_, -1, 1);

        /** Réduction de la gravité */
        const gravityReductionFactor = 0.5; 


        /** update bubbles */
        if (!!this.bubbles) {
            
            this.bubbles.forEach(b => {
                b.gx = gx_ * this.params.gStrength * gravityReductionFactor;
                b.gy = gy_ * this.params.gStrength * gravityReductionFactor;
            });
        }
    }
}
