var camera, scene, renderer, controls;

//TODO: Materials - only use images that have dimensions that are power of 2
function init(){
    scene = new THREE.Scene();
    var width = window.innerWidth;
    var height = window.innerHeight;

    camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 25000);
    camera.position.set(0, 0, 700);
    scene.add(camera);

    var light = new THREE.DirectionalLight(0xffffff, 1); // color, intensity

    light.position.set(1, 1, 1);
    scene.add(light);

    var spotLight = new THREE.SpotLight(0x0000ff, 0.8, 2000);
    spotLight.position.set(500, 500, 500);
    spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = 4096; // should be a power of 2
    spotLight.shadow.mapSize.heigth = 4096; // should be a power of 2

    // perspective shadow camera frustrum near parameter
    spotLight.shadow.camera.near = 1000;
    spotLight.shadow.camera.far = 2000;
    // perspective shadow camera frustrum field of view
    spotLight.shadow.camera.fov = 45;

    scene.add(spotLight);


    var textureLoader = new THREE.TextureLoader();


    textureLoader.load('../images/marble.jpg', function(texture){
        var material= new THREE.MeshStandardMaterial({
            map: texture,
        });
        var sphereGeometry = new THREE.SphereGeometry(100, 50, 50);
        var sphere = new THREE.Mesh(sphereGeometry, material);
        sphere.position.y = 300;
        sphere.castShadow = true;
        scene.add(sphere);

        var cylinderGeometry = new THREE.CylinderGeometry( 70, 100, 200, 32);
        var cylinder = new THREE.Mesh( cylinderGeometry, material);
        cylinder.position.y = 100;
        scene.add(cylinder);

    });

    textureLoader.load('../images/spiral_.jpg', function(texture){
        var planeGeometry = new THREE.PlaneGeometry(12800, 7200, 10, 10);
        var planeMaterial = new THREE.MeshStandardMaterial({
            map: texture, side: THREE.DoubleSide,
        });
        var plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = Math.PI/2; // in radians

        plane.receiveShadow = true;

        scene.add(plane);
    });

    renderer = new THREE.WebGLRenderer({
        alpha: 1, antialias: true
    });

    renderer.setSize(width, height);

    renderer.shadowMap.enabled = true;

    controls = new THREE.OrbitControls(camera, renderer.domElement);

    document.body.appendChild(renderer.domElement);

}

function animate(){
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

init();
animate();