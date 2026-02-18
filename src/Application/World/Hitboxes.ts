import * as THREE from 'three';
import Application from '../Application';
import Camera from '../Camera/Camera';
import Mouse from '../Utils/Mouse';

const RENDER_WIREFRAME = true;

export default class Decor {
    application: Application;
    scene: THREE.Scene;
    hitboxes: {
        [key: string]: {
            action: () => void;
        };
    };
    camera: Camera;
    mouse: Mouse;
    raycaster: THREE.Raycaster;

    constructor() {
        this.application = new Application();
        this.scene = this.application.scene;
        this.camera = this.application.camera;
        this.mouse = this.application.mouse;
        this.raycaster = new THREE.Raycaster();

        this.createRaycaster();
        this.createComputerHitbox();
    }

    createRaycaster() {
        window.addEventListener('mousedown', (event) => {
            event.preventDefault();

            const ray = new THREE.Raycaster();
            const ndc = new THREE.Vector2(
                (this.mouse.x / window.innerWidth) * 2 - 1,
                -(this.mouse.y / window.innerHeight) * 2 + 1
            );
            ray.setFromCamera(ndc, this.camera.instance);

            const intersects = ray.intersectObjects(this.scene.children);
            console.log(intersects);
        });
    }

    createComputerHitbox() {
        this.createHitbox(
            'computerHitbox',
            () => {
                // this.camera.focusOnMonitor();
            },
            new THREE.Vector3(0, 650, 0),
            new THREE.Vector3(2000, 2000, 2000)
        );
    }

    createHitbox(
        name: string,
        action: () => void,
        position: THREE.Vector3,
        size: THREE.Vector3
    ) {
        const wireframeOptions = RENDER_WIREFRAME
            ? {
                  opacity: 1,
              }
            : {};

        const hitboxMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            ...wireframeOptions,
        });

        const hitbox = new THREE.Mesh(
            new THREE.BoxGeometry(size.x, size.y, size.z),
            hitboxMaterial
        );

        hitbox.name = name;
        hitbox.position.copy(position);
        this.scene.add(hitbox);

        this.hitboxes = {
            ...this.hitboxes,
            [name]: {
                action,
            },
        };
    }
}
