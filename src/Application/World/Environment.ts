import * as THREE from 'three';
import Application from '../Application';
import BakedModel from '../Utils/BakedModel';
import Resources from '../Utils/Resources';

export default class Environment {
    application: Application;
    scene: THREE.Scene;
    resources: Resources;
    bakedModel: BakedModel;
    meModel: THREE.Group;
    hologramColor: THREE.Color;

    constructor() {
        this.application = new Application();
        this.scene = this.application.scene;
        this.resources = this.application.resources;
        this.hologramColor = new THREE.Color('#59fff4');

        this.bakeModel();
        this.setModel();
        this.setMeModel();
    }

    bakeModel() {
        this.bakedModel = new BakedModel(
            this.resources.items.gltfModel.environmentModel,
            this.resources.items.texture.environmentTexture,
            900
        );
    }

    setModel() {
        this.scene.add(this.bakedModel.getModel());
    }

    setMeModel() {
        const meScale = 2500;
        const meYawOffset = Math.PI + THREE.MathUtils.degToRad(55);
        const meVerticalOffset = -3200;
        const meForwardOffset = 230;
        const meSideOffset = -490;

        const meModel = this.resources.items.gltfModel.meModel;
        const environmentModel = this.bakedModel.getModel();
        const chairSeat = environmentModel.getObjectByName('chair_seat');

        if (!chairSeat || !meModel) return;

        this.meModel = meModel.scene;
        this.meModel.scale.setScalar(meScale);

        const seatBox = new THREE.Box3().setFromObject(chairSeat);
        const seatCenter = seatBox.getCenter(new THREE.Vector3());
        const seatQuaternion = chairSeat.getWorldQuaternion(
            new THREE.Quaternion()
        );
        const meBox = new THREE.Box3().setFromObject(this.meModel);
        const meBottom = meBox.min.y;

        this.meModel.position.set(
            seatCenter.x,
            seatBox.max.y - meBottom + meVerticalOffset,
            seatCenter.z
        );
        const seatForward = new THREE.Vector3(0, 0, -1)
            .applyQuaternion(seatQuaternion)
            .normalize();
        const seatRight = new THREE.Vector3(1, 0, 0)
            .applyQuaternion(seatQuaternion)
            .normalize();
        this.meModel.position.addScaledVector(seatForward, meForwardOffset);
        this.meModel.position.addScaledVector(seatRight, meSideOffset);
        this.meModel.setRotationFromQuaternion(seatQuaternion);
        this.meModel.rotateY(meYawOffset);

        this.preserveOriginalTextureLook(this.meModel);
        this.addHologramOverlay(this.meModel);
        this.scene.add(this.meModel);
    }

    preserveOriginalTextureLook(model: THREE.Group) {
        model.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;

            const toBasic = (material: THREE.Material) => {
                const source = material as THREE.MeshStandardMaterial;
                const tintedColor = (source.color ?? new THREE.Color(0xffffff))
                    .clone()
                    .lerp(this.hologramColor, 0.43);

                return new THREE.MeshBasicMaterial({
                    map: source.map ?? null,
                    color: tintedColor,
                    transparent: true,
                    opacity: 0.39,
                    alphaTest: source.alphaTest ?? 0,
                    side: source.side ?? THREE.FrontSide,
                    depthWrite: false,
                });
            };

            if (Array.isArray(child.material)) {
                child.material = child.material.map((material) =>
                    toBasic(material)
                );
                return;
            }

            child.material = toBasic(child.material);
        });
    }

    addHologramOverlay(model: THREE.Group) {
        const sourceMeshes: THREE.Mesh[] = [];
        model.traverse((child) => {
            if (child instanceof THREE.Mesh && !child.userData.hologramLayer) {
                sourceMeshes.push(child);
            }
        });

        for (const source of sourceMeshes) {
            const innerShell = new THREE.Mesh(
                source.geometry,
                new THREE.MeshBasicMaterial({
                    color: this.hologramColor,
                    transparent: true,
                    opacity: 0.15,
                    side: THREE.DoubleSide,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false,
                })
            );
            innerShell.userData.hologramLayer = true;
            innerShell.renderOrder = 9;
            source.add(innerShell);

            const glowShell = new THREE.Mesh(
                source.geometry,
                new THREE.MeshBasicMaterial({
                    color: this.hologramColor,
                    transparent: true,
                    opacity: 0.36,
                    side: THREE.BackSide,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false,
                })
            );
            glowShell.userData.hologramLayer = true;
            glowShell.scale.multiplyScalar(1.031);
            glowShell.renderOrder = 10;
            source.add(glowShell);
        }
    }

    update() {}
}
