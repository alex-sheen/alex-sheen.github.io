import * as THREE from '../assets/scripts/three.js-master/build/three.module.js';
import { OrbitControls } from '../assets/scripts/three.js-master/examples/jsm/controls/OrbitControls.js';
import {Queue} from '../assets/scripts/Queue.js';
import {Graph} from '../assets/scripts/graph.js';

var camera, scene, renderer, controls;
var geometry, material, mesh;
var a_points = [];
var num_points = 300;
var radius = 10;
var g = new Graph(0);
var done = false;
var di = 7;
var dk = 3;
var D = 2.0;
var removable_items = [];
var edge_q = new Queue();

init();
build_tree();
animate();

function getRand(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xBABABA );
    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );


    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

	// controls
	controls = new OrbitControls( camera, renderer.domElement );
	controls.minDistance = 10;
	controls.maxDistance = 70;
    controls.target.set(0, radius/4, 0);
    camera.position.set( 50, 14, 50 );
    controls.update();
	//controls.maxPolarAngle = Math.PI / 2;

	scene.add( new THREE.AmbientLight( 0x222222 ) );

	// light

	var light = new THREE.PointLight( 0xffffff, 1 );
	camera.add( light );

	// helper

	//scene.add( new THREE.AxesHelper( 20 ) );

    camera.position.z = 5;
	window.addEventListener( 'resize', onWindowResize, false );

    set_initial_geometry();
}

function set_initial_geometry() {
    geometry = new THREE.SphereGeometry( radius, 32, 32 );
    material = new THREE.MeshBasicMaterial( {color: 0x5555F2, opacity: 0.5, transparent: true} );
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    mesh.position.set(0,radius,0);

    geometry = new THREE.SphereGeometry( 0.5, 15, 15 );
    material = new THREE.MeshBasicMaterial( {color: 0x00ffff} );
    for (var i = 0; i < num_points; i++) {
        var point = {pos: new THREE.Vector3(getRand(-radius,radius), getRand(-radius,radius) + radius, getRand(-radius,radius)),
                     mesh: new THREE.Mesh(geometry, material)};
        while(point.pos.distanceTo(new THREE.Vector3(0,radius,0)) > radius-1)
        {
            point.pos = new THREE.Vector3(getRand(-radius,radius), getRand(-radius,radius) + radius, getRand(-radius,radius));
        }
        a_points.push(point);
        removable_items.push(point.mesh);
        scene.add (point.mesh);
        point.mesh.position.set(point.pos.x, point.pos.y, point.pos.z);
    }
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function addLineRem(s0, s1, line_mat) {
    var points = [];
    points.push(s0);
    points.push(s1);
    var line_geo = new THREE.BufferGeometry().setFromPoints( points );
    var line = new THREE.Line( line_geo, line_mat );
    scene.add(line);
    removable_items.push(line);
}

function addLine(s0, s1, line_mat) {
    var points = [];
    points.push(s0);
    points.push(s1);
    var line_geo = new THREE.BufferGeometry().setFromPoints( points );
    var line = new THREE.Line( line_geo, line_mat );
    scene.add(line);
}
function build_tree() {
    //adding base stem
    var s0 = new THREE.Vector3(0,0,0);
    var s1 = new THREE.Vector3(0,0.5,0);
    g.addVertex(s0);
    g.addVertex(s1);
    g.addEdge(s0, s1);
    var line_mat = new THREE.LineBasicMaterial({color: 0x101010});
    addLine(s0, s1, line_mat);
}

function printVec(v) {
    return "(" + v.x + "," + v.y + "," + v.z + ")";
}

function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

function clean() {
      if( removable_items.length > 0 ) {
        removable_items.forEach(function(v,i) {
            scene.remove(v);
        });
        removable_items = null;
        removable_items = [];
      }
}

var count = 0;
function animate() {
	requestAnimationFrame( animate );
    controls.update();

    if(done == false && count < 100) {
        for (const [node1, adjs] of g.AdjList.entries()) {
            if(!(node1.x == 0 && node1.y == 0 && node1.z == 0)) {
                clean();
                var vprime = new THREE.Vector3(0,0,0);
                var line_mat = new THREE.LineBasicMaterial({color: 0x0000ff});
                for(var i = 0; i < a_points.length; i++) {
                    if(a_points[i].pos.distanceTo(node1) < di) {
                        //addLine(node1, a_points[i].pos, line_mat);
                        var sv = a_points[i].pos.clone().sub(node1);
                        sv.normalize();
                        vprime.add(sv);
                    }
                }

                if(vprime.length() > 0) {
                    line_mat = new THREE.LineBasicMaterial({color: 0x00ff00});
                    vprime.normalize();
                    vprime.multiplyScalar(D);
                    vprime = node1.clone().add(vprime);
                    vprime = new THREE.Vector3(round(vprime.x, 2), round(vprime.y, 2), round(vprime.z, 2));
                    addLine(node1, vprime, line_mat);
                    var edge = {s0: node1, s1: vprime};
                    edge_q.enqueue(edge);

                    material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
                    geometry = new THREE.SphereGeometry( 0.15, 15, 15 );
                    mesh = new THREE.Mesh(geometry, material)
                    scene.add (mesh);
                    mesh.position.set(vprime.x, vprime.y, vprime.z);

                }

                line_mat = new THREE.LineBasicMaterial({color: 0xffff00});
                var culled = a_points.filter(point => point.pos.distanceTo(vprime) < dk);
                for(var i = 0; i < culled.length; i++) {
                    addLine(vprime, culled[i].pos, line_mat);
                }
                a_points = a_points.filter(point => point.pos.distanceTo(vprime) >= dk);
                console.log(culled.length + " + " + a_points.length);
                var hit = false;
                for(var i = 0; i < a_points.length; i++) {
                    scene.add (a_points[i].mesh);
                    removable_items.push(a_points[i].mesh);
                    if(a_points[i].pos.distanceTo(vprime) < di)
                    {
                        hit = true;
                    }
                }
                if(hit == false || a_points.length == 0) { done = true };
            }
        }

        while(!edge_q.isEmpty()) {
            var edge = edge_q.dequeue();
            g.addVertex(edge.s1);
            g.addEdge(edge.s0, edge.s1);
        }
        count++;
        //done = true;
    }

	renderer.render( scene, camera );
}
