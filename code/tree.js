import * as THREE from '../assets/scripts/three.js-master/build/three.module.js';
import { OrbitControls } from '../assets/scripts/three.js-master/examples/jsm/controls/OrbitControls.js';
import {Queue} from '../assets/scripts/Queue.js';
import {Graph} from '../assets/scripts/graph.js';

var camera, scene, renderer, controls;
var geometry, material, mesh, sphere;

var g = new Graph(0);
var g_r = new Graph(0);

var vprime_pairs_stage2 = new Queue();
var vprime_stage3 = new Queue();
var edge_q = new Queue();
var visited = [];
var a_points = [];
var removable_points = [];
var removable_lines = [];
var removable_skeleton = [];

var num_points = 2000;
var radius = 20;
var di = 7;
var dk = 5.5;
var D = 2;
var initial_radius = 0.001;
var verbose = true;

var speed = 1;//5;
var count = 0;

const g_phases = {
    CLEAN: 'clean',
    ASSOCIATION: 'association',
    STEM: 'stem',
    KILL: 'kill'
}

var growth = g_phases.ASSOCIATION;

const phases = {
    GROWTH: 'growth',
    TRUNK: 'trunk',
    LEAVES: 'leaves',
    DONE: 'done'
}

var phase = phases.GROWTH;
var twigs_todo = true;

init();
build_tree();
animate();

function getRand(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
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
    set_materials();
}

function set_space() {
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
var leaf_geo;
function set_initial_geometry() {
    set_space();

    leaf_geo = new THREE.Geometry();
    leaf_geo.vertices.push( new THREE.Vector3( -0.5, 0, 0 ) );
    leaf_geo.vertices.push( new THREE.Vector3(  0.5, 0, 0 ) );
    leaf_geo.vertices.push( new THREE.Vector3(  0, 1, 0 ) );

    var leaf_face = new THREE.Face3( 0, 1, 2);
    leaf_geo.faces.push( leaf_face );

    //the face normals and vertex normals can be calculated automatically if not supplied above
    leaf_geo.computeFaceNormals();
    leaf_geo.computeVertexNormals();
}

var association_mat, branch_mat, kill_mat, leaf_mat, stem_mat;
function set_materials() {
    branch_mat = new THREE.MeshBasicMaterial( {color: 0x664d00} );
    leaf_mat = new THREE.MeshStandardMaterial( { color : 0x00cc00 } );
    leaf_mat.side = THREE.DoubleSide;

    association_mat = new THREE.LineBasicMaterial({color: 0x0000ff});
    stem_mat = new THREE.LineBasicMaterial({color: 0x00ff00});
    kill_mat = new THREE.LineBasicMaterial({color: 0xffff00});
}

function addLine(s0, s1, line_mat, removable) {
    var points = [];
    points.push(s0);
    points.push(s1);
    var line_geo = new THREE.BufferGeometry().setFromPoints( points );
    var line = new THREE.Line( line_geo, line_mat );
    scene.add(line);
    if(removable) {
        removable_lines.push(line);
    }
}

var axis = new THREE.Vector3(0, 1, 0);
function addBranch(s0, s1, r) {
    geometry = new THREE.CylinderGeometry( r, r, D, 20 );
    geometry.translate( 0, D/2, 0 );
    mesh = new THREE.Mesh( geometry, branch_mat );
    scene.add( mesh );
    mesh.position.set(s0.x,s0.y,s0.z);
    mesh.quaternion.setFromUnitVectors(axis, s1.clone().sub(s0).clone().normalize());
}

function addLeaf(s0, vector) {
    mesh = new THREE.Mesh( leaf_geo, leaf_mat );
    scene.add(mesh);
    mesh.position.set(s0.x,s0.y,s0.z);
    mesh.quaternion.setFromUnitVectors(axis, vector.clone().normalize());
}

function build_tree() {
    //adding base stem
    var s0 = new THREE.Vector3(0,0,0);
    var s1 = new THREE.Vector3(0,0.5,0);
    g.addVertex(s0);
    g.addVertex(s1);
    g.addEdge(s0, s1);
    var line_mat = new THREE.LineBasicMaterial({color: 0x101010});
    addLine(s0, s1, line_mat, true);
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

function generate_trunk(node) {
    clean_skeleton();
    var ret = 0;
    var are_adjs = false;
    for(const [key, adjs] of g.AdjList.entries()) {
        if(key.x == node.x && key.y == node.y && key.z == node.z) {
            for(var i = 0; i < adjs.length; i++) {
                var next_ret = generate_trunk(adjs[i]);
                ret += (next_ret*next_ret);
                if(!visited.includes(adjs[i])) {
                    visited.push(adjs[i]);
                    addBranch(node, adjs[i], Math.sqrt(next_ret));
                }
                are_adjs = true;
            }
        }
    }

    if(are_adjs == false) {
        ret = initial_radius;
    }
    ret = Math.sqrt(ret);
    return ret;
}

function generate_leaves(node, vector) {
    var ret = 0;
    var are_adjs = false;
    for(const [key, adjs] of g.AdjList.entries()) {
        if(key.x == node.x && key.y == node.y && key.z == key.z) {
            for(var i = 0; i < adjs.length; i++) {
                generate_leaves(adjs[i], adjs[i].clone().sub(node));
            }

            if(adjs.length == 0) {
                addLeaf(key, vector);
            }
        }
    }
}



// stage clean
function stage_clean() {
    clean_lines(); clean_points();
    for(var i = 0; i < a_points.length; i++) {
        scene.add (a_points[i].mesh);
        removable_points.push(a_points[i].mesh);
    }
}

// stage association | association point lines
function stage_association() {
    for(const [node1, adjs] of g.AdjList.entries()) {
        if(!(node1.x == 0 && node1.y == 0 && node1.z == 0)) {
            var vprime = new THREE.Vector3(0,0,0);
            for(var i = 0; i < a_points.length; i++) {
                if(a_points[i].pos.distanceTo(node1) < di) {
                    if(verbose == true) {
                        addLine(node1, a_points[i].pos, association_mat, true);
                    }

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

// stage stem | stem generation
function stage_stem() {
    //console.log("stage 2 | stem generation");
    while(!vprime_pairs_stage2.isEmpty()) {
        var entry = vprime_pairs_stage2.dequeue();
        var vprime = entry.vprime;
        var node = entry.node;

        var points = [];
        points.push(node);
        points.push(vprime);
        var line_geo = new THREE.BufferGeometry().setFromPoints( points );
        var line = new THREE.Line( line_geo, stem_mat, true);
        scene.add(line);
        removable_skeleton.push(line);

        var edge = {s0: node, s1: vprime};
        edge_q.enqueue(edge);

        geometry = new THREE.SphereGeometry( 0.15, 15, 15 );
        mesh = new THREE.Mesh(geometry, stem_mat)
        scene.add (mesh);
        removable_skeleton.push(mesh);

        mesh.position.set(vprime.x, vprime.y, vprime.z);

        vprime_stage3.enqueue(vprime);
    }
}

// stage kill | kill lines
function stage_kill() {
    clean_lines();
    var hit = false;
    while(!vprime_stage3.isEmpty()) {
        var vprime = vprime_stage3.dequeue();

        var culled = a_points.filter(point => point.pos.distanceTo(vprime) < dk);

        a_points = a_points.filter(point => point.pos.distanceTo(vprime) >= dk);

        if(verbose == true) {
            for(var i = 0; i < culled.length; i++) {
                addLine(vprime, culled[i].pos, kill_mat, true);
            }

            for(var i = 0; i < a_points.length; i++) {
                scene.add (a_points[i].mesh);
                removable_points.push(a_points[i].mesh);
                if(a_points[i].pos.distanceTo(vprime) < di)
                {
                    hit = true;
                }
            }
        }
    }
    if(hit == false || a_points.length == 0) {
        return true;
    }
    else { return false; }
}

// stage trunk | trunk generation
function stage_trunk() {
    generate_trunk(new THREE.Vector3(0,0,0));
}

// stage leaves | leaf generation
function stage_leaves() {
    generate_leaves(new THREE.Vector3(0,0,0));
}

function animate() {
	requestAnimationFrame( animate );
    controls.update();
    count++;
if(count >= speed) {
    count = 0;
    switch(phase){
        case phases.GROWTH:
            switch(growth){
                case g_phases.CLEAN:
                    stage_clean();
                    growth = g_phases.ASSOCIATION;
                    break;
                case g_phases.ASSOCIATION:
                    stage_association();
                    growth = g_phases.STEM;
                    break;
                case g_phases.STEM:
                    stage_stem();
                    growth = g_phases.KILL;
                    while(!edge_q.isEmpty()) {
                        var edge = edge_q.dequeue();
                        g.addVertex(edge.s1);
                        g.addEdge(edge.s0, edge.s1);
                    }
                    break;
                case g_phases.KILL:
                    growth = g_phases.CLEAN;
                    if(stage_kill()) {
                        clean_points();
                        clean_lines();
                        scene.remove(sphere);
                        phase = phases.TRUNK;
                    }
                    break;
            }
            break; // end of GROWTH
        case phases.TRUNK:
            stage_trunk();
            phase = phases.LEAVES;
            break; // end of TRUNK
        case phases.LEAVES:
            if(twigs_todo) {
                set_space();
                num_points = 2000;
                initial_radius = 0.0001;
                di = di/2;
                dk = dk/2;
                D = D/4;
                phase = phases.GROWTH;
                twigs_todo = false;
            }
            else {
                stage_leaves();
                phase = phases.DONE;
            }
            break; // end of LEAVES
    }
}

	renderer.render( scene, camera );
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
