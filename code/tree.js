import * as THREE from '../assets/scripts/three.js-master/build/three.module.js';
import { OrbitControls } from '../assets/scripts/three.js-master/examples/jsm/controls/OrbitControls.js';

var camera, scene, renderer;
var geometry, material, mesh;
var a_points = [];
var num_points = 50;
var radius = 10;

init();
animate();


function getRand(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xBABABA );
    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );
 	//camera.position.set( 15, 20, 30 );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

	// controls
	var controls = new OrbitControls( camera, renderer.domElement );
	controls.minDistance = 20;
	controls.maxDistance = 50;
	//controls.maxPolarAngle = Math.PI / 2;

	scene.add( new THREE.AmbientLight( 0x222222 ) );

	// light

	var light = new THREE.PointLight( 0xffffff, 1 );
	camera.add( light );

	// helper

	scene.add( new THREE.AxesHelper( 20 ) );

    camera.position.z = 5;
	window.addEventListener( 'resize', onWindowResize, false );

    set_initial_geometry();
}

function set_initial_geometry() {
    geometry = new THREE.SphereGeometry( radius, 32, 32 );
    material = new THREE.MeshBasicMaterial( {color: 0x5555F2, opacity: 0.5, transparent: true} );
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    geometry = new THREE.SphereGeometry( 0.5, 15, 15 );
    material = new THREE.MeshBasicMaterial( {color: 0x101010} );
    for (var i = 0; i < num_points; i++) {
        var point = {vec: new THREE.Vector3(getRand(-radius,radius), getRand(-radius,radius), getRand(-radius,radius)),
                     mesh: new THREE.Mesh(geometry, material)};
        while(point.vec.distanceTo(new THREE.Vector3()) > radius-1)
        {
            point.vec = new THREE.Vector3(getRand(-radius,radius), getRand(-radius,radius), getRand(-radius,radius));
        }
        a_points.push(point);
        scene.add (point.mesh);
        point.mesh.position.set(point.vec.x, point.vec.y, point.vec.z);
    }
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {
	requestAnimationFrame( animate );

	//cube.rotation.x += 0.01;
	//cube.rotation.y += 0.01;

	renderer.render( scene, camera );
}
