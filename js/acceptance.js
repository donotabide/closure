var camera, scene, renderer, controls;

var objects = [];

var raycaster;

var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );

// http://www.html5rocks.com/en/tutorials/pointerlock/intro/

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

if ( havePointerLock ) {

    var element = document.body;

    var pointerlockchange = function ( event ) {

        if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

            controlsEnabled = true;
            controls.enabled = true;

            blocker.style.display = 'none';

        } else {

            controls.enabled = false;

            blocker.style.display = 'block';

            instructions.style.display = '';

        }

    };

    var pointerlockerror = function ( event ) {

        instructions.style.display = '';

    };

    // Hook pointer lock state change events
    document.addEventListener( 'pointerlockchange', pointerlockchange, false );
    document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
    document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

    document.addEventListener( 'pointerlockerror', pointerlockerror, false );
    document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
    document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

    instructions.addEventListener( 'click', function ( event ) {

        instructions.style.display = 'none';

        // Ask the browser to lock the pointer
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
        element.requestPointerLock();

    }, false );

} else {

    instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

}

init();
animate();

var controlsEnabled = false;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;

var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();


var sky1, sky2, sky3;

var lightHelper;
var shadowCameraHelper;


var lights = [];

function init() {


    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1200 );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );
    scene.fog = new THREE.Fog( 0xffffff, 0, 750 );


    // // Setting Light
    var light = new THREE.HemisphereLight( 0xffffff, 0xffee00, 0.5 );
    light.position.set( 0.1, 0.1, 0.1);
    scene.add( light );

    // Setting Controls and Keys
    controls = new THREE.PointerLockControls( camera );
    scene.add( controls.getObject() );

    // Key controls for key on
    var onKeyDown = function ( event ) {
        switch ( event.keyCode ) {
            case 38: // up
            case 87: // w
                moveForward = true;
                break;
            case 37: // left
            case 65: // a
                moveLeft = true; break;
            case 40: // down
            case 83: // s
                moveBackward = true;
                break;
            case 39: // right
            case 68: // d
                moveRight = true;
                break;
            case 32: // space
                if ( canJump === true ) velocity.y += 350;
                canJump = false;
                break;
        }
    };

    // Key controls for key off
    var onKeyUp = function ( event ) {
        switch( event.keyCode ) {
            case 38: // up
            case 87: // w
                moveForward = false;
                break;
            case 37: // left
            case 65: // a
                moveLeft = false;
                break;
            case 40: // down
            case 83: // s
                moveBackward = false;
                break;
            case 39: // right
            case 68: // d
                moveRight = false;
                break;
        }
    };
    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );

    // To check intersecting objects
    raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 20);


    // Adding sky as cave interior
    var skyGeo1 = new THREE.SphereGeometry(600, 10, 10);
    var loader  = new THREE.TextureLoader(),
        texture1 = loader.load( "./images/stars.png");

    var material1 = new THREE.MeshBasicMaterial({
        map: texture1,
    });

    sky1 = new THREE.Mesh(skyGeo1, material1);
    sky1.material.side = THREE.BackSide;
    scene.add(sky1);

    var loaderFloor = new THREE.DDSLoader();
    var map1 = loaderFloor.load( './images/disturb_dxt1_nomip.dds' );
    map1.minFilter = map1.magFilter = THREE.LinearFilter;
    map1.anisotropy = 4;

    var cubemap1 = loaderFloor.load( './images/Mountains.dds', function ( texture ) {
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearFilter;
        texture.mapping = THREE.CubeReflectionMapping;
        floorMaterial.needsUpdate = true;
    } );

    var floorMaterial = new THREE.MeshBasicMaterial( { map: map1, envMap: cubemap1, receiveShadow: true} );


    var floorGeometry = new THREE.PlaneGeometry( 500, 500, 100, 100 );
    floorGeometry.rotateX( - Math.PI / 2 );

    var floor = new THREE.Mesh( floorGeometry, floorMaterial );
    floor.receiveShadow = true;
    scene.add( floor );


    var loader  = new THREE.TextureLoader(),
        wallTexture = loader.load("./images/textureCrazy.png"),
        boxTexture = loader.load("./images/roots.png");

    // Wall material
    var wallMaterial = new THREE.MeshLambertMaterial({
        map: wallTexture,
    });

    var wallLeftGeo = new THREE.PlaneGeometry( 1000, 700, 100, 100 );
    wallLeftGeo.rotateY( Math.PI / 2 );

    var wallLeft = new THREE.Mesh( wallLeftGeo, wallMaterial);
    wallLeft.position.set(-250, 250, 0);
    scene.add(wallLeft);

    var wallBackGeo = new THREE.PlaneGeometry( 500, 500, 100, 100 );
    wallBackGeo.rotateY( Math.PI);

    var wallBack = new THREE.Mesh( wallBackGeo, wallMaterial);
    wallBack.position.set(0, 250, 250);
    scene.add(wallBack);

    var wallRightGeo = new THREE.PlaneGeometry( 1000, 800, 100, 100 );
    wallRightGeo.rotateY(- Math.PI / 2);

    var wallRight = new THREE.Mesh( wallRightGeo, wallMaterial);
    wallRight.position.set(250, 250, 0);
    scene.add( wallRight);

    var ceilingGeo = new THREE.PlaneGeometry( 500, 500, 100, 100 );
    ceilingGeo.rotateX(Math.PI / 2);

    var ceiling = new THREE.Mesh( ceilingGeo, wallMaterial);
    ceiling.position.set(0, 500, 0);
    scene.add( ceiling);


    // boxes
    var boxGeometry = new THREE.BoxGeometry( 20, 20, 20 );

    var boxMaterial = new THREE.MeshLambertMaterial({
        map: boxTexture,
    });

    for ( var i = 0; i < 4000; i +=20 ) {

        for(var j = 0; j < 500; j += 20){

            var box = new THREE.Mesh(boxGeometry, boxMaterial);
            box.position.set(-250+j+10, i+10, -250-i-10);
            box.castShadow = true;
            scene.add(box);
            objects.push(box);

        }

    }

    var light1_1= new THREE.SpotLight( 0xffffff);//, 1, 100 );
    light1_1.position.set( 100, 100, 0 );

    light1_1.angle = Math.PI / 3;
    light1_1.penumbra = 0.05;
    light1_1.decay = 2;

    light1_1.castShadow = true;

    light1_1.shadow.mapSize.width = 1024;
    light1_1.shadow.mapSize.height = 1024;

    light1_1.shadow.camera.near = 10;
    light1_1.shadow.camera.far = 4000;
    light1_1.shadow.camera.fov = 90;

    scene.add(light1_1);

    var light1_2= new THREE.SpotLight( 0xff00ff);//, 1, 100 );
    light1_2.position.set( 200, 100, 50 );
    scene.add( light1_2);

    var light1_3= new THREE.SpotLight( 0xf0f000);//, 1, 100 );
    light1_3.position.set( 200, 100, 200 );
    scene.add( light1_3);


    light1_2.angle = Math.PI / 3;
    light1_2.penumbra = 0.05;
    light1_2.decay = 1;

    light1_2.castShadow = true;

    light1_2.shadow.mapSize.width = 1024;
    light1_2.shadow.mapSize.height = 1024;

    light1_2.shadow.camera.near = 500;
    light1_2.shadow.camera.far = 4000;
    light1_2.shadow.camera.fov = 30;

    light1_3.angle = Math.PI / 3;
    light1_3.penumbra = 0.05;
    light1_3.decay = 0.5;

    light1_3.castShadow = true;

    light1_3.shadow.mapSize.width = 1024;
    light1_3.shadow.mapSize.height = 1024;

    light1_3.shadow.camera.near = 500;
    light1_3.shadow.camera.far = 4000;
    light1_3.shadow.camera.fov = 30;

    //

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild( renderer.domElement );

    //

    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    requestAnimationFrame( animate );

    if ( controlsEnabled === true ) {


        // TODO: Figure out how raycaster works so you can block the
        //       user from going through the wall
        raycaster.ray.origin.copy( controls.getObject().position );
        raycaster.ray.origin.y -= 10;

        var intersections = raycaster.intersectObjects( objects );

        var onObject = intersections.length > 0;

        var time = performance.now();
        var delta = ( time - prevTime ) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        direction.z = Number( moveForward ) - Number( moveBackward );
        direction.x = Number( moveLeft ) - Number( moveRight );
        direction.normalize(); // this ensures consistent movements in all directions

        if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
        if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

        if ( onObject === true ) {

            velocity.y = Math.max( 0, velocity.y );

            canJump = true;

            console.log("On object");

            window.location.href = "http://i6.cims.nyu.edu/~rds493/drawing/final/present/"
        }

        controls.getObject().translateX( velocity.x * delta );
        controls.getObject().translateY( velocity.y * delta );
        controls.getObject().translateZ( velocity.z * delta );

        if ( controls.getObject().position.y < 10 ) {

            velocity.y = 0;
            controls.getObject().position.y = 10;

            canJump = true;

        }

        prevTime = time;

    }

    // sky1.rotateX(0.001);
    // sky2.rotateX(0.002);
    // sky3.rotateX(0.003);
    sky1.rotateX(-0.001);
    renderer.render( scene, camera );

}