import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import Application from '../Application';

const SCREEN_SIZE = { w: 1280, h: 1024 };
const SCREEN_POSITION = new THREE.Vector3(0, 950, 255);

export default class StickyNotes {
    application: Application;
    scene: THREE.Scene;
    loader: FBXLoader;
    model: THREE.Group | null;

    constructor() {
        this.application = new Application();
        this.scene = this.application.scene;
        this.loader = new FBXLoader();
        this.model = null;

        this.setModel();
    }

    setModel() {
        this.loader.load(
            'models/low-poly-sticky-notes/source/post its.fbx',
            (fbx) => {
                this.model = fbx;
                this.applyStickyNoteLook(this.model);

                const noteOffsets = [new THREE.Vector3(400, -655, 160)];

                noteOffsets.forEach((offset, index) => {
                    const note = this.model!.clone(true);
                    this.applyStickyNoteLook(note);
                    this.placeNote(note, offset);
                    note.rotation.y = THREE.MathUtils.degToRad(92);
                    note.rotation.z = THREE.MathUtils.degToRad(60);
                    this.scene.add(note);
                });
            }
        );
    }

    applyStickyNoteLook(model: THREE.Group) {
        model.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;

            child.material = new THREE.MeshBasicMaterial({
                color: '#ffe66d',
                side: THREE.DoubleSide,
            });
        });
    }

    placeNote(note: THREE.Group, offsetFromScreen: THREE.Vector3) {
        const box = new THREE.Box3().setFromObject(note);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const targetWidth = 220;
        const scaleFactor = size.x > 0 ? targetWidth / size.x : 1;

        note.scale.setScalar(scaleFactor);

        const scaledBox = new THREE.Box3().setFromObject(note);
        const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
        const target = SCREEN_POSITION.clone().add(offsetFromScreen);
        note.position.add(target.sub(scaledCenter));

        // Match monitor tilt so notes appear attached to the monitor front.
        note.rotation.x = THREE.MathUtils.degToRad(4);
        note.rotation.y = THREE.MathUtils.degToRad(0);
    }

}
