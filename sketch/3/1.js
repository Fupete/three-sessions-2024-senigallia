// Empty sketch
let onWindowResize;
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector';

export function sketch() {
    // CAMERA
    let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // WINDOW RESIZE
    onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onWindowResize);

    // SCENE
    const debugObject = {
        waveDepthColor: "#1e4d40",
        waveSurfaceColor: "#4d9aaa",
        fogNear: 3,
        fogFar: 10,
        fogColor: "#8e99a2"
    };

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(
        debugObject.fogColor,
        debugObject.fogNear,
        debugObject.fogFar
    );
    

    // LIGHTS
    const light1 = new THREE.PointLight(0xffffff, 5);
    light1.castShadow = true;
    scene.add(light1);

    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xFFFFFF, 0.5);
    pointLight.position.set(2.5, 2.5, 2.5);
    pointLight.castShadow = true;
    scene.add(pointLight);

    // PLANE
    const planeGeometry = new THREE.PlaneGeometry(20, 15);
    const planeTexture = new THREE.TextureLoader().load('./assets/Metal002_4K-JPG_Color.jpg');
    const planeNormalMap = new THREE.TextureLoader().load('./assets/Metal002_4K-JPG_NormalDX.jpg');
    const planeDisplacementMap = new THREE.TextureLoader().load('./assets/Metal002_4K-JPG_Displacement.jpg');

    planeTexture.repeat.set(4, 3);
    planeTexture.wrapS = THREE.RepeatWrapping;
    planeTexture.wrapT = THREE.RepeatWrapping;

    planeNormalMap.repeat.set(4, 3);
    planeNormalMap.wrapS = THREE.RepeatWrapping;
    planeNormalMap.wrapT = THREE.RepeatWrapping;

    planeDisplacementMap.repeat.set(4, 3);
    planeDisplacementMap.wrapS = THREE.RepeatWrapping;
    planeDisplacementMap.wrapT = THREE.RepeatWrapping;

    const planeMaterial = new THREE.MeshStandardMaterial({
        map: planeTexture,
        normalMap: planeNormalMap,
        displacementMap: planeDisplacementMap,
        metalness: 1,
        roughness: 0.5,
        displacementScale: 0.2,
    });

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotateX(-Math.PI / 2);
    plane.receiveShadow = true;
    scene.add(plane);

    // REFLECTORS
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

    // CYLINDERS
    const cylinderGeometry = new THREE.CylinderGeometry(0.01, 0.1, 10, 15);
    const cylinderMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x202020,
        roughness: 0.5,
        metalness: 0.1,
    });

    const cylinderSpacingX = 0.5;
    const cylinderSpacingZ = 3;

    let arrayCilindri = [];

    for (let j = 0; j < 4; j++) {
        arrayCilindri[j] = [];
        for (let i = 0; i < 18; i++) {
            const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
            // Posiziona il cilindro in modo che la sua base inferiore aderisca esattamente al piano
            cylinder.position.set(i * cylinderSpacingX - 6.5 * cylinderSpacingX, 5, j * cylinderSpacingZ - 1.5 * cylinderSpacingZ);
            cylinder.castShadow = true;
            scene.add(cylinder);
            arrayCilindri[j][i] = cylinder;
        }
    }

    // RENDER
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.target.set(0, 1, 0);

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        orbitControls.update();
        render();
    }

    function render() {
        renderer.render(scene, camera);
    }

    animate();
}

export function dispose() {
    window.removeEventListener('resize', onWindowResize);
}
