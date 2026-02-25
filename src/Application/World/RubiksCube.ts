import * as THREE from 'three';
import Application from '../Application';
import Resources from '../Utils/Resources';

export default class RubiksCube {
    application: Application;
    scene: THREE.Scene;
    resources: Resources;
    model: THREE.Group;

    constructor() {
        this.application = new Application();
        this.scene = this.application.scene;
        this.resources = this.application.resources;

        this.setModel();
    }

    setModel() {
        const rubiksCubeModel = this.resources.items.gltfModel.rubiksCubeModel;
        if (!rubiksCubeModel) return;

        this.model = rubiksCubeModel.scene;
        this.model.scale.setScalar(1750);
        this.model.rotation.set(0, -Math.PI * 0.16, 0);

        this.applyUnlitTextureMaterials();
        this.placeNextToKeyboard();

        this.scene.add(this.model);
    }

    applyUnlitTextureMaterials() {
        this.model.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;

            const toBasic = (material: THREE.Material) => {
                const source = material as THREE.MeshStandardMaterial;
                return new THREE.MeshBasicMaterial({
                    map: source.map ?? null,
                    color: source.color ?? new THREE.Color(0xffffff),
                    transparent: source.transparent ?? false,
                    opacity: source.opacity ?? 1,
                    alphaTest: source.alphaTest ?? 0,
                    side: source.side ?? THREE.FrontSide,
                });
            };

            if (Array.isArray(child.material)) {
                child.material = child.material.map((material) =>
                    toBasic(material)
                );
            } else {
                child.material = toBasic(child.material);
            }
        });
    }

    placeNextToKeyboard() {
        const keyboard = this.scene.getObjectByName('keyboard');
        const desk = this.scene.getObjectByName('desk');

        const fallbackPosition = new THREE.Vector3(650, 350, 1180);
        if (!keyboard || !desk) {
            this.model.position.copy(fallbackPosition);
            return;
        }

        const keyboardBox = new THREE.Box3().setFromObject(keyboard);
        const deskBox = new THREE.Box3().setFromObject(desk);
        const keyboardCenter = keyboardBox.getCenter(new THREE.Vector3());

        const targetX = keyboardBox.min.x - 340;
        const targetZ = keyboardCenter.z - 300;
        const deskSurfaceY = deskBox.max.y;

        this.model.position.set(targetX, deskSurfaceY, targetZ);
        this.model.updateMatrixWorld(true);

        const cubeBox = new THREE.Box3().setFromObject(this.model);
        const lift = deskSurfaceY - cubeBox.min.y + 6;
        this.model.position.y += lift;
    }
}
