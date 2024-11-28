import GlobalContext from "../template/GlobalContext";
import Scene2D from "../template/Scene2D";
import { clamp, degToRad, distance2D, randomRange } from "../Utils/MathUtils";

class Triangle {
    constructor(context, x, y, size) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.size = size;

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
        this.context.moveTo(this.x, this.y - this.size); // Top point
        this.context.lineTo(this.x - this.size, this.y + this.size); // Bottom left
        this.context.lineTo(this.x + this.size, this.y + this.size); // Bottom right
        this.context.closePath();
        this.context.fill();
        this.context.stroke();
    }

    update(width, height, speed) {
        this.x += (this.vx + this.gx) * speed * this.time.delta / 1000;
        this.y += (this.vy + this.gy) * speed * this.time.delta / 1000;

        this.vx = this.x < this.size ? Math.abs(this.vx) : this.vx;
        this.vx = this.x > width - this.size ? -Math.abs(this.vx) : this.vx;
    }
}

export default class SceneBouncingTriangles extends Scene2D {
    constructor(id) {
        super(id);

        /** debug */
        this.params = {
            speed: 1,
            threshold: 50,
            size: 10, // Taille des triangles
            nTriangles: 3,
            gStrength: 300,
        };

        if (!!this.debugFolder) {
            this.debugFolder.add(this.params, "size", 5, 50, 1).onChange(() => {
                this.triangles.forEach(t => {
                    t.size = this.params.size;
                });
            });
            this.debugFolder.add(this.params, "nTriangles", 3, 50).onFinishChange(() => {
                this.generateTriangles();
            });
        }

        /** device orientation */
        this.globalContext.useDeviceOrientation = true;
        this.orientation = this.globalContext.orientation;

        /** init */
        this.generateTriangles();
        this.draw();
    }

    generateTriangles() {
        this.triangles = [];
        for (let i = 0; i < this.params.nTriangles; i++) {
            const x_ = this.width * Math.random();
            const y_ = this.height * Math.random();
            const triangle_ = new Triangle(this.context, x_, y_, this.params.size);
            this.triangles.push(triangle_);
        }
    }

    addTriangle(x, y) {
        const triangle = new Triangle(this.context, x, y, this.params.size);
        this.triangles.push(triangle);
        return triangle;
    }

    removeTriangle(triangle) {
        this.triangles = this.triangles.filter(t => t !== triangle);
    }

    draw() {
        this.context.strokeStyle = "white";
        this.context.fillStyle = "black";
        this.context.lineWidth = 2;

        this.triangles.forEach(t => t.draw());
    }

    update() {
        this.triangles.forEach(t => t.update(this.width, this.height, this.params.speed));
        this.clear();
        this.draw();
    }
}

