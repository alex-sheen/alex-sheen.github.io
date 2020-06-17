import * as THREE from '../assets/scripts/three.js-master/build/three.module.js';
import { OrbitControls } from '../assets/scripts/three.js-master/examples/jsm/controls/OrbitControls.js';
import {Queue} from '../assets/scripts/Queue.js';
import {Graph} from '../assets/scripts/graph.js';

var camera, scene, renderer, controls;
var geometry, material, mesh;

var a_points = [];
var num_points = 1000;
var radius = 10;
var g = new Graph(0);
var done = false;
var di = 7;
var dk = 5.5;
var D = 2.0;
var removable_items = [];
var edge_q = new Queue();
var sphere;

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
    controls.target.set(0, radius/2, 0);
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
    sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    sphere.position.set(0,radius,0);

    geometry = new THREE.SphereGeometry( 0.3, 15, 15 );
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

var stage = 0;
var count = 0;
var todo = false;
document.addEventListener('keyup', event => {
  if (event.code === 'Space') {
      stage++;
      if(stage >= 4) {
          stage = 0;
      }
      todo = true;
  }
})

var vprime_pairs_stage2 = new Queue();
var vprime_stage3 = new Queue();
function animate() {
	requestAnimationFrame( animate );
    controls.update();

    if(done == false && count < 100 && todo == true) {
        todo = false;
        count++;

        // stage+=.05;
        // consol.log(stage);

        if(stage == 0) {
            console.log("stage 0: clean");
            clean();
            for(var i = 0; i < a_points.length; i++) {
                scene.add (a_points[i].mesh);
                removable_items.push(a_points[i].mesh);
            }
        }

        else if(stage == 1) {
            for(const [node1, adjs] of g.AdjList.entries()) {
                if(!(node1.x == 0 && node1.y == 0 && node1.z == 0)) {
                    var vprime = new THREE.Vector3(0,0,0);
                    var line_mat = new THREE.LineBasicMaterial({color: 0x0000ff});
                    for(var i = 0; i < a_points.length; i++) {
                        if(a_points[i].pos.distanceTo(node1) < di) {

                            addLineRem(node1, a_points[i].pos, line_mat);

                            var sv = a_points[i].pos.clone().sub(node1);
                            sv.normalize();
                            vprime.add(sv);
                        }
                    }
                    if(vprime.length() > 0) {
                        vprime.normalize();
                        vprime.multiplyScalar(D);
                        vprime = node1.clone().add(vprime);
                        vprime = new THREE.Vector3(round(vprime.x, 2), round(vprime.y, 2), round(vprime.z, 2));
                        var tmp = {vprime: vprime, node: node1};
                        vprime_pairs_stage2.enqueue(tmp);
                        console.log("stage 1: enqueued");
                    }
                } // end of if
            } // end of for loop, iterating through nodes
        } // stage 1

        if(stage == 2) {
            while(!vprime_pairs_stage2.isEmpty()) {
                var entry = vprime_pairs_stage2.dequeue();
                var vprime = entry.vprime;
                var node = entry.node;

                line_mat = new THREE.LineBasicMaterial({color: 0x00ff00});
                addLine(node, vprime, line_mat);

                var edge = {s0: node, s1: vprime};
                edge_q.enqueue(edge);

                material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
                geometry = new THREE.SphereGeometry( 0.15, 15, 15 );
                mesh = new THREE.Mesh(geometry, material)
                scene.add (mesh);
                mesh.position.set(vprime.x, vprime.y, vprime.z);

                console.log("drew new stem: " + stage);
                console.log("vprime: (" + vprime.x + "," + vprime.y + "," + vprime.z + ")");
                printVec(vprime);

                vprime_stage3.enqueue(vprime);
            }
        }

        else if(stage == 3) {
            var hit = false;
            while(!vprime_stage3.isEmpty()) {
                var vprime = vprime_stage3.dequeue();

                console.log("post-cull: " + stage);
                console.log("vprime: (" + vprime.x + "," + vprime.y + "," + vprime.z + ")");

                line_mat = new THREE.LineBasicMaterial({color: 0xffff00});
                var culled = a_points.filter(point => point.pos.distanceTo(vprime) < dk);
                for(var i = 0; i < culled.length; i++) {
                    addLineRem(vprime, culled[i].pos, line_mat);
                }
                a_points = a_points.filter(point => point.pos.distanceTo(vprime) >= dk);
                console.log(culled.length + " + " + a_points.length);

                for(var i = 0; i < a_points.length; i++) {
                    scene.add (a_points[i].mesh);
                    removable_items.push(a_points[i].mesh);
                    if(a_points[i].pos.distanceTo(vprime) < di)
                    {
                        hit = true;
                    }
                }
            }
            if(hit == false || a_points.length == 0) {
                console.log("done");
                done = true;
                clean();
                scene.remove(sphere);
            };
        }

        while(!edge_q.isEmpty()) {
            var edge = edge_q.dequeue();
            g.addVertex(edge.s1);
            g.addEdge(edge.s0, edge.s1);
        }
    } //end of main

	renderer.render( scene, camera );
}
