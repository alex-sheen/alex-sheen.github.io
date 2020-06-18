import * as THREE from '../assets/scripts/three.js-master/build/three.module.js';
import { OrbitControls } from '../assets/scripts/three.js-master/examples/jsm/controls/OrbitControls.js';
import {Queue} from '../assets/scripts/Queue.js';
import {Graph} from '../assets/scripts/graph.js';

var camera, scene, renderer, controls;
var geometry, material, mesh, sphere;

var g = new Graph(0);
var g_r = new Graph(0);

var edge_q = new Queue();
var a_points = [];
var removable_points = [];
var removable_lines = [];
var removable_skeleton = [];

var num_points = 2000;
var radius = 20;
var di = 7;
var dk = 5.5;
var D = 2.0;

var speed = 5;

var done = false;

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
    controls.target.set(0, radius, 0);
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
        removable_points.push(point.mesh);
        scene.add (point.mesh);
        point.mesh.position.set(point.pos.x, point.pos.y, point.pos.z);
    }
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

document.addEventListener('keyup', event => {
  if (event.code === 'Space') {
      stage++;
      if(stage == 4) {
          stage = 0;
      }
      todo = true;
  }
})

function addLineRem(s0, s1, line_mat) {
    var points = [];
    points.push(s0);
    points.push(s1);
    var line_geo = new THREE.BufferGeometry().setFromPoints( points );
    var line = new THREE.Line( line_geo, line_mat );
    scene.add(line);
    removable_lines.push(line);
}

function addLine(s0, s1, line_mat) {
    var points = [];
    points.push(s0);
    points.push(s1);
    var line_geo = new THREE.BufferGeometry().setFromPoints( points );
    var line = new THREE.Line( line_geo, line_mat );
    scene.add(line);
}

function addBranch(s0, s1, r) {
    geometry = new THREE.CylinderGeometry( r, r, D, 20 );
    geometry.translate( 0, D/2, 0 );
    material = new THREE.MeshBasicMaterial( {color: 0x664d00} );
    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );
    mesh.position.set(s0.x,s0.y,s0.z);
    var axis = new THREE.Vector3(0, 1, 0);
    mesh.quaternion.setFromUnitVectors(axis, s1.clone().sub(s0).clone().normalize());
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

function clean_lines() {
      if( removable_lines.length > 0 ) {
        removable_lines.forEach(function(v,i) {
            scene.remove(v);
        });
        removable_lines = null;
        removable_lines = [];
      }
}

function clean_points() {
      if( removable_points.length > 0 ) {
        removable_points.forEach(function(v,i) {
            scene.remove(v);
        });
        removable_points = null;
        removable_points = [];
      }
}

function clean_skeleton() {
      if( removable_skeleton.length > 0 ) {
        removable_skeleton.forEach(function(v,i) {
            scene.remove(v);
        });
        removable_skeleton = null;
        removable_skeleton = [];
      }
}

function reverse_graph() {
    console.log("reverse graph");
    var visited = [];
    for(const [node, adjs] of g.AdjList.entries()) {
        for(var i = 0; i < adjs.length; i++) {
            if(visited.includes(adjs[i]) == false) {
                g_r.addVertex(adjs[i]);//g_r.AdjList.set(adjs[i], []);
                visited.push(adjs[i]);
            }
            g_r.addEdge(adjs[i],node);
        }
    }
}

function generate_trunk(node) {
    clean_skeleton();
    console.log("generate(" + node.x + "," + node.y + "," + node.z + ")");
    var ret = 0;
    var are_adjs = false;
    for(const [key, adjs] of g.AdjList.entries()) {
        if(key.x == node.x && key.y == node.y && key.z == key.z) {
            for(var i = 0; i < adjs.length; i++) {
                var next_ret = generate_trunk(adjs[i]);
                ret += (next_ret*next_ret);
                addBranch(node, adjs[i], Math.sqrt(next_ret));
                are_adjs = true;
            }
        }
    }

    if(are_adjs == false) {
        ret = 0.001;
    }
    ret = Math.sqrt(ret);
    return ret;
}

var stage = 0;
var count = 0;
var todo = false;

var vprime_pairs_stage2 = new Queue();
var vprime_stage3 = new Queue();

// stage 0 | clean
function stage_0() {
    clean_lines();
    clean_points();
    for(var i = 0; i < a_points.length; i++) {
        scene.add (a_points[i].mesh);
        removable_points.push(a_points[i].mesh);
    }
}

// stage 1 | association point lines
function stage_1() {
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
            }
        } // end of if
    } // end of for loop, iterating through nodes
}

// stage 2 | stem generation
function stage_2() {
    while(!vprime_pairs_stage2.isEmpty()) {
        var entry = vprime_pairs_stage2.dequeue();
        var vprime = entry.vprime;
        var node = entry.node;

        var line_mat = new THREE.LineBasicMaterial({color: 0x00ff00});
        var points = [];
        points.push(node);
        points.push(vprime);
        var line_geo = new THREE.BufferGeometry().setFromPoints( points );
        var line = new THREE.Line( line_geo, line_mat );
        scene.add(line);
        removable_skeleton.push(line);

        var edge = {s0: node, s1: vprime};
        edge_q.enqueue(edge);

        material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        geometry = new THREE.SphereGeometry( 0.15, 15, 15 );
        mesh = new THREE.Mesh(geometry, material)
        scene.add (mesh);
        removable_skeleton.push(mesh);

        mesh.position.set(vprime.x, vprime.y, vprime.z);

        vprime_stage3.enqueue(vprime);
    }
}

// stage 3 | kill lines
function stage_3() {
    clean_lines();
    var hit = false;
    while(!vprime_stage3.isEmpty()) {
        var vprime = vprime_stage3.dequeue();

        var line_mat = new THREE.LineBasicMaterial({color: 0xffff00});
        var culled = a_points.filter(point => point.pos.distanceTo(vprime) < dk);
        for(var i = 0; i < culled.length; i++) {
            addLineRem(vprime, culled[i].pos, line_mat);
        }
        a_points = a_points.filter(point => point.pos.distanceTo(vprime) >= dk);

        for(var i = 0; i < a_points.length; i++) {
            scene.add (a_points[i].mesh);
            removable_points.push(a_points[i].mesh);
            if(a_points[i].pos.distanceTo(vprime) < di)
            {
                hit = true;
            }
        }
    }
    if(hit == false || a_points.length == 0) {
        console.log("stage 5 set");
        todo = true;
        stage = 5;
        clean_points();
        clean_lines();
        scene.remove(sphere);
    }
}

// stage 5 | trunk generation
function stage_5() {
    done = true;
    reverse_graph();
    generate_trunk(new THREE.Vector3(0,0,0));
}

function animate() {
	requestAnimationFrame( animate );
    controls.update();

    if(done == false) { count++; }

    if(count >= speed) {
        stage++;
        count = 0;
        todo = true;
    }
    if(stage == 4) { stage = 0; }

    if(done == false && todo == true) {
        todo = false;

        // stage 0 | clean
        if(stage == 0) {
            stage_0();
        }

        // stage 1 | association point lines
        else if(stage == 1) {
           stage_1();
        }

        // stage 2 | stem generation
        else if(stage == 2) {
            stage_2();
        }

        // stage 3 | kill lines
        else if(stage == 3) {
            stage_3();
        }

        // stage 5 | trunk generation
        else if(stage == 5) {
            stage_5();
        }

        while(!edge_q.isEmpty()) {
            var edge = edge_q.dequeue();
            g.addVertex(edge.s1);
            g.addEdge(edge.s0, edge.s1);
        }
    } //end of main

	renderer.render( scene, camera );
}
