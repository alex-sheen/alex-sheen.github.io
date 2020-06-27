import * as THREE from '../assets/scripts/three.js-master/build/three.module.js';
import { OrbitControls } from '../assets/scripts/three.js-master/examples/jsm/controls/OrbitControls.js';
import {Queue} from '../assets/scripts/Queue.js';
import {Graph} from '../assets/scripts/graph.js';

var camera, scene, renderer, controls;
var geometry, material, mesh, sphere;

var g_tmp = new Graph(0);
var g_main = new Graph(0);

var vprime_pairs_stage2 = new Queue();
var vprime_stage3 = new Queue();
var edge_q = new Queue();
var branch_q = [];
var visited = [];
var a_points = [];
var removable_points = [];
var removable_lines = [];
var removable_skeleton = [];
var removable_envelope = [];
var removable_tree = [];

var di = 7;
var dk = 5.5;
var D = 2;
var initial_radius = 0.0005;
var verbose = true;
var increase_radius = true;

var speed = 2;//5;
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
    DONE: 'done',
    DISPLAY: 'display'
}

var phase = phases.GROWTH;
var twigs_todo = true;

init();
init_tree();
speed = 4;
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
    controls.target.set(0, 20, 0);
    camera.position.set( 80, 14, 80 );
    controls.update();
	//controls.maxPolarAngle = Math.PI / 2;

	scene.add( new THREE.AmbientLight( 0x222222 ) );

	// light
	var light = new THREE.PointLight( 0xffffff, 1 );
	camera.add( light );

	// helper
	scene.add( new THREE.AxesHelper( 20 ) );

    camera.position.z = 5;
	window.addEventListener( 'resize', onWindowResize, false );
    set_materials();
}

function set_sphere(radius, x_offset, y_offset, z_offset, num_points) {
    geometry = new THREE.SphereGeometry( radius, 32, 32 );
    material = new THREE.MeshBasicMaterial( {color: 0x5555F2, opacity: 0.5, transparent: true} );
    sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    sphere.position.set(x_offset, radius + y_offset, z_offset);
    removable_envelope.push(sphere);

    geometry = new THREE.SphereGeometry( 0.3, 15, 15 );
    material = new THREE.MeshBasicMaterial( {color: 0x00ffff} );
    for (var i = 0; i < num_points; i++) {
        var point = {pos: new THREE.Vector3(getRand(-radius,radius) + x_offset, getRand(-radius,radius) + y_offset + radius, getRand(-radius,radius) + z_offset),
                     mesh: new THREE.Mesh(geometry, material)};
        while(point.pos.distanceTo(new THREE.Vector3(x_offset,radius + y_offset, z_offset)) > radius)
        {
            point.pos = new THREE.Vector3(getRand(-radius,radius) + x_offset, getRand(-radius,radius) + y_offset + radius, getRand(-radius,radius) + z_offset);
        }
        a_points.push(point);
        removable_points.push(point.mesh);
        scene.add (point.mesh);
        point.mesh.position.set(point.pos.x, point.pos.y, point.pos.z);
    }
}

function set_box(width, height, depth, x_offset, y_offset, z_offset, num_points) {
    geometry = new THREE.BoxGeometry( width, height, depth );
    material = new THREE.MeshBasicMaterial( {color: 0x5555F2, opacity: 0.5, transparent: true} );
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    mesh.position.set(x_offset, y_offset, z_offset);
    removable_envelope.push(mesh);

    geometry = new THREE.SphereGeometry( 0.3, 15, 15 );
    material = new THREE.MeshBasicMaterial( {color: 0x00ffff} );
    for (var i = 0; i < num_points; i++) {
        var point = {pos: new THREE.Vector3(getRand(-width/2,width/2) + x_offset, getRand(-height/2,height/2) + y_offset, getRand(-depth/2,depth/2) + z_offset),
                     mesh: new THREE.Mesh(geometry, material)};
        a_points.push(point);
        removable_points.push(point.mesh);
        scene.add (point.mesh);
        point.mesh.position.set(point.pos.x, point.pos.y, point.pos.z);
    }
}

var leaf_geo;
function set_initial_geometry() {
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
    stem_mat = new THREE.LineBasicMaterial({color: 0x0F0F0F});
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
    removable_tree.push(mesh);
    mesh.position.set(s0.x,s0.y,s0.z);
    mesh.quaternion.setFromUnitVectors(axis, s1.clone().sub(s0).clone().normalize());
}

function addLeaf(s0, vector) {
    mesh = new THREE.Mesh( leaf_geo, leaf_mat );
    scene.add(mesh);
    mesh.position.set(s0.x,s0.y,s0.z);
    mesh.quaternion.setFromUnitVectors(axis, vector.clone().normalize());
}

function init_root() {
    //adding base stem
    var s0 = new THREE.Vector3(0,0,0);
    var s1 = new THREE.Vector3(0,0.5,0);
    g_main.addVertex(s0);

    g_tmp.addVertex(s0);
    g_tmp.addVertex(s1);
    g_tmp.addEdge(s0, s1);
    var line_mat = new THREE.LineBasicMaterial({color: 0x101010});
    addLine(s0, s1, line_mat, true);
}


function init_tree() {
    clean_envelope();
    clean_envelope();
    clean_points();
    clean_lines();
    clean_tree();
    g_main = new Graph(0);
    g_tmp = new Graph(0);
    vprime_pairs_stage2 = new Queue();
    vprime_stage3 = new Queue();
    edge_q = new Queue();
    verbose = true;
    increase_radius = false;

    di = 7;
    dk = 5.5;
    D = 2;
    initial_radius = 0.0005;
    verbose = true;
    increase_radius = true;

    set_sphere(18, 0, 6, 0, 2000);
    set_box(3, 7, 3, 0, 3.5, 0, 9);

    init_root();
    count = 0;
    phase = phases.GROWTH;
    speed = 1;//5;
}
function init_boxes() {
    clean_envelope();
    clean_envelope();
    clean_points();
    clean_lines();
    clean_tree();
    g_main = new Graph(0);
    g_tmp = new Graph(0);
    vprime_pairs_stage2 = new Queue();
    vprime_stage3 = new Queue();
    edge_q = new Queue();
    verbose = true;
    increase_radius = false;

    di = 2;
    dk = 1.5;
    D = 1;

    var box_num_points = 700;
    set_box(40, 5, 5, 0, 0, 0, box_num_points);
    set_box(40, 5, 5, 0, 0, 40, box_num_points);
    set_box(5, 5, 40, 20, 0, 20, box_num_points);
    set_box(5, 5, 40, -20, 0, 20, box_num_points);

    set_box(40, 5, 5, 0, 40, 0, box_num_points);
    set_box(40, 5, 5, 0, 40, 40, box_num_points);
    set_box(5, 5, 40, 20, 40, 20, box_num_points);
    set_box(5, 5, 40, -20, 40, 20, box_num_points);

    set_box(5, 40, 5, 20, 20, 0, box_num_points);
    set_box(5, 40, 5, -20, 20, 0, box_num_points);
    set_box(5, 40, 5, 20, 20, 40, box_num_points);
    set_box(5, 40, 5, -20, 20, 40, box_num_points);
    init_root();
    count = 0;
    phase = phases.GROWTH;
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

function clean_envelope() {
      if( removable_envelope.length > 0 ) {
        removable_envelope.forEach(function(v,i) {
            scene.remove(v);
        });
        removable_envelope = null;
        removable_envelope = [];
      }
}

function clean_tree() {
      if( removable_tree.length > 0 ) {
        removable_tree.forEach(function(v,i) {
            scene.remove(v);
        });
        removable_tree = null;
        removable_tree = [];
      }
}

function graph_to_stack(g, q, node) {
    var are_adjs = false;
    for(const [key, adjs] of g.AdjList.entries()) {
        if(key.x == node.x && key.y == node.y && key.z == node.z) {
            for(var i = 0; i < adjs.length; i++) {
                graph_to_stack(g, q, adjs[i]);
                var obj = {s0: key, s1: adjs[i]};
                q.push(obj);
            }
        }
    }
}

function generate_trunk(node) {
    clean_skeleton();
    var ret = 0;
    var are_adjs = false;
    for(const [key, adjs] of g_main.AdjList.entries()) {
        if(key.x == node.x && key.y == node.y && key.z == node.z) {
            for(var i = 0; i < adjs.length; i++) {
                var next_ret = generate_trunk(adjs[i]);
                if(increase_radius) { ret += (next_ret*next_ret); }
                else { ret = next_ret; }
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
    if(increase_radius) { ret = Math.sqrt(ret); }
    return ret;
}

function generate_leaves(node, vector) {
    var ret = 0;
    var are_adjs = false;
    for(const [key, adjs] of g_main.AdjList.entries()) {
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
    for(const [node1, adjs] of g_tmp.AdjList.entries()) {
        if(!(node1.x == 0 && node1.y == 0.5 && node1.z == 0)) {
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
            else {
                g_tmp.delete(node1);
            }
        } // end of if
    } // end of for loop, iterating through nodes
}

// stage stem | stem generation
function stage_stem() {
    clean_lines();
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

var branch_count = 0;
function animate() {
	requestAnimationFrame( animate );
    controls.update();
    count++;

// if(verbose == false && phase == phases.GROWTH) {
//     var tmp_while = false;
//     while(tmp_while == false) {
//         stage_clean();
//         stage_association();
//         stage_stem();
//         while(!edge_q.isEmpty()) {
//             var edge = edge_q.dequeue();
//             g_main.addVertex(edge.s1);
//             g_main.addEdge(edge.s0, edge.s1);
//             g_tmp.addVertex(edge.s1);
//             g_tmp.addEdge(edge.s0, edge.s1);
//         }
//         tmp_while = stage_kill();
//     }
//     clean_points();
//     clean_lines();
//     clean_envelope();
//     graph_to_stack(g_main, branch_q, new THREE.Vector3(0,0,0));
//     phase = phases.DONE;
// }
// if(phase = phases.DISPLAY) {
//     if(branch_q.length > 0) {
//         var tmp = branch_q.pop();
//         addBranch(tmp.s0, tmp.s1, 1);
//     }
//     else {
//         phase = phases.DONE;
//     }
// }
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
                        g_main.addVertex(edge.s1);
                        g_main.addEdge(edge.s0, edge.s1);
                        g_tmp.addVertex(edge.s1);
                        g_tmp.addEdge(edge.s0, edge.s1);
                    }
                    break;
                case g_phases.KILL:
                    growth = g_phases.CLEAN;
                    if(stage_kill()) {
                        clean_points();
                        clean_lines();
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
            phase = phases.DONE;
            clean_envelope();
            break; // end of LEAVES
    }
}

	renderer.render( scene, camera );
}

document.addEventListener('keyup', event => {
  if (event.code === 'Space' && phase == phases.DONE) {
      init_tree();
  }
})
