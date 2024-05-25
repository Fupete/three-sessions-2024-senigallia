// Importa i moduli necessari
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector';
import { Water } from 'three/examples/jsm/objects/Water2.js'; // Importa Water2

export function sketch() {
    // Configura il renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Configura la scena
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog("#8e99a2", 3, 10);

    // Configura la camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Configura il controllo dell'orbita
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.target.set(0, 1, 0);

    // Configura la luce
    const light1 = new THREE.PointLight(0xffffff, 5);
    light1.castShadow = true;
    scene.add(light1);

    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xFFFFFF, 0.5);
    pointLight.position.set(2.5, 2.5, 2.5);
    pointLight.castShadow = true;
    scene.add(pointLight);

    // Configura il piano con texture di caustiche
    const planeGeometry = new THREE.PlaneGeometry(20, 15);
    const planeTexture = new THREE.TextureLoader().load('./assets/caustics.png'); // Carica la texture di caustiche
    planeTexture.wrapS = THREE.RepeatWrapping;
    planeTexture.wrapT = THREE.RepeatWrapping;
    planeTexture.repeat.set(4, 3);

    const planeMaterial = new THREE.MeshPhongMaterial({
        map: planeTexture,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
    });

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotateX(-Math.PI / 2);
    plane.receiveShadow = true;
    scene.add(plane);

    // Configura il riflettore
    const mirrorBack1 = new Reflector(new THREE.PlaneGeometry(30, 20), {
        color: new THREE.Color(0x7f7f7f),
        textureWidth: window.innerWidth * window.devicePixelRatio,
        textureHeight: window.innerHeight * window.devicePixelRatio,
    });

    mirrorBack1.position.y = 1;
    mirrorBack1.position.z = -7;
    scene.add(mirrorBack1);

    const mirrorFront2 = new Reflector(new THREE.PlaneGeometry(30, 20), {
        color: new THREE.Color(0x7f7f7f),
        textureWidth: window.innerWidth * window.devicePixelRatio,
        textureHeight: window.innerHeight * window.devicePixelRatio,
    });
    mirrorFront2.position.y = 1;
    mirrorFront2.position.z = 7;
    mirrorFront2.rotateY(Math.PI);
    scene.add(mirrorFront2);

    // Configura le pareti
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const wallSide1 = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), wallMaterial);
    wallSide1.position.x = -10;
    wallSide1.rotation.y = Math.PI / 2;
    scene.add(wallSide1);

    const wallSide2 = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), wallMaterial);
    wallSide2.position.x = 10;
    wallSide2.rotation.y = -Math.PI / 2;
    scene.add(wallSide2);

    // Configura i cilindri
    const cylinderGeometry = new THREE.CylinderGeometry(0.01, 0.1, 10, 15);
    const cylinderMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x202020,
        roughness: 0.5,
        metalness: 0.1,
    });

    const cylinderSpacingX = 1;
    const cylinderSpacingZ = 3;
    const reflectorSizeZ = 20;
    const minZ = -reflectorSizeZ / 2 + 0.9;
    const maxZ = reflectorSizeZ / 2 - 0.9;

    let arraycilindri = [];

    for (let j = 0; j < 4; j++) {
        arraycilindri[j] = [];
        for (let i = 0; i < 14; i++) {
            const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
            cylinder.position.set(i * cylinderSpacingX - 6.5 * cylinderSpacingX, 5, j * cylinderSpacingZ - 1.5 * cylinderSpacingZ);
            if (cylinder.position.z >= minZ && cylinder.position.z <= maxZ) {
                cylinder.castShadow = true;
                scene.add(cylinder);
                arraycilindri[j][i] = cylinder;
            }
        }
    }

    // Configura il mondo CANNON.js
    const world = new CANNON.World();
    world.gravity.set(-10, -9.81, 10);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;

    const fixedBody = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(0, 2, 0),
    });
    world.addBody(fixedBody);

    const cylinderBodies = [];
    const cylinderShape = new CANNON.Cylinder(0.01, 0.1, 10, 15);
    const mass = 1;

    for (let j = 0; j < 4; j++) {
        for (let i = 0; i < 14; i++) {
            const cylinderBody = new CANNON.Body({
                mass: mass,
                position: new CANNON.Vec3(i * cylinderSpacingX - 6.5 * cylinderSpacingX, 5, j * cylinderSpacingZ - 1.5 * cylinderSpacingZ),
            });
            cylinderBody.addShape(cylinderShape);
            world.addBody(cylinderBody);

            const constraint = new CANNON.PointToPointConstraint(cylinderBody, new CANNON.Vec3(0, 0, 0), fixedBody, new CANNON.Vec3(i * cylinderSpacingX - 6.5 * cylinderSpacingX, 0, j * cylinderSpacingZ - 1.5 * cylinderSpacingZ));
            world.addConstraint(constraint);
        }
    }

    // Movimento sinusoidale dei cilindri
    const clock = new THREE.Clock();

    function applySinusoidalMovement() {
        const time = performance.now() * 0.001;
        const amplitude = 10;
        const frequency = 1;

        for (let j = 0; j < 4; j++) {
            for (let i = 0; i < 14; i++) {
                const cylinder = arraycilindri[j][i];
                if (cylinder) {
                    const randomVerticalOffset = Math.sin(time * frequency + i * 0.5) * amplitude;
                    cylinder.position.y = 5 + randomVerticalOffset;
                }
            }
        }
    }

    // Funzione di animazione
    function animate() {
        requestAnimationFrame(animate);
        applySinusoidalMovement();
        renderer.render(scene, camera);
    }

    animate();

    // Gestione del ridimensionamento della finestra
    const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onWindowResize);
}

export function dispose() {
    cancelAnimationFrame(animation);
    window.removeEventListener('resize', onWindowResize);
}
