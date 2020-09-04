import * as THREE from '../../assets/scripts/three.js-master/build/three.module.js';
import { OrbitControls } from '../../assets/scripts/three.js-master/examples/jsm/controls/OrbitControls.js';
import {Queue} from '../../assets/scripts/Queue.js';
import {Graph} from '../../assets/scripts/graph.js';
import * as Constants from './tree_consts.js';
import * as Helpers from './tree_helpers.js';

var camera, scene, renderer, controls;
var geometry, material, mesh, sphere, box;

var g_tmp = new Graph(0);
var g_main = new Graph(0); //graphs

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

var speed = 1;//5;
var count = 0;

var x_coord = 0;
var y_coord = 0;
var z_coord = 0;
var radius_val = 18;
var width_val = 2;
var height_val = 2;
var depth_val = 2;

var editing = Constants.editing_t.NONE;
var growth = Constants.g_phases.ASSOCIATION;
var phase = Constants.phases.GROWTH;
var twigs_todo = true;

init();
init_tree();
//phase = Constants.phases.DONE;
speed = 4;
animate();

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

    document.getElementById("instructions1").style.opacity = "100";
    document.getElementById("instructions2").style.opacity = "0";
    document.getElementById("tree_geometry").style.opacity = "0";
    document.getElementById("tree_render").style.opacity = "0";
    document.getElementById("tree_edit").style.opacity = "0";
}

function set_sphere(radius, x_offset, y_offset, z_offset) {
    scene.remove(sphere);
    geometry = new THREE.SphereGeometry( radius, 32, 32 );
    material = new THREE.MeshBasicMaterial( {color: 0x5555F2, opacity: 0.5, transparent: true} );
    sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    sphere.position.set(x_offset, radius + y_offset, z_offset);
    removable_envelope.push(sphere);
}

function render_sphere(radius, x_offset, y_offset, z_offset, num_points) {
    geometry = new THREE.SphereGeometry( 0.3, 15, 15 );
    material = new THREE.MeshBasicMaterial( {color: 0x00ffff} );
    for (var i = 0; i < num_points; i++) {
        var point = {pos: new THREE.Vector3(Helpers.getRand(-radius,radius) + x_offset, Helpers.getRand(-radius,radius) + y_offset + radius, Helpers.getRand(-radius,radius) + z_offset),
                     mesh: new THREE.Mesh(geometry, material)};
        while(point.pos.distanceTo(new THREE.Vector3(x_offset,radius + y_offset, z_offset)) > radius)
        {
            point.pos = new THREE.Vector3(Helpers.getRand(-radius,radius) + x_offset, Helpers.getRand(-radius,radius) + y_offset + radius, Helpers.getRand(-radius,radius) + z_offset);
        }
        a_points.push(point);
        removable_points.push(point.mesh);
        scene.add (point.mesh);
        point.mesh.position.set(point.pos.x, point.pos.y, point.pos.z);
    }
}

function set_box(width, height, depth, x_offset, y_offset, z_offset) {
    scene.remove(box);
    geometry = new THREE.BoxGeometry( width, height, depth );
    material = new THREE.MeshBasicMaterial( {color: 0x5555F2, opacity: 0.5, transparent: true} );
    box = new THREE.Mesh(geometry, material);
    scene.add(box);
    box.position.set(x_offset, y_offset, z_offset);
    removable_envelope.push(box);
}

function render_box(width, height, depth, x_offset, y_offset, z_offset, num_points) {
    console.log("dimensions: (" + width + "," + height + "," + depth + ")");
    console.log("position: (" + x_offset + "," + y_offset + "," + z_offset + ")");
    geometry = new THREE.SphereGeometry( 0.3, 15, 15 );
    material = new THREE.MeshBasicMaterial( {color: 0x00ffff} );
    for (var i = 0; i < num_points; i++) {
        var point = {pos: new THREE.Vector3(Helpers.getRand(-width/2,width/2) + x_offset, Helpers.getRand(-height/2,height/2) + y_offset, Helpers.getRand(-depth/2,depth/2) + z_offset),
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

    count = 0;
    phase = Constants.phases.GROWTH;
    speed = 1;
}

function reset_scene() {
    clean_all();
    g_main = new Graph(0);
    g_tmp = new Graph(0);
    vprime_pairs_stage2 = new Queue();
    vprime_stage3 = new Queue();
    edge_q = new Queue();
}
function init_tree() {
    reset_scene();

    di = 7;
    dk = 5.5;
    D = 2;
    initial_radius = 0.0005;
    verbose = true;
    increase_radius = true;

    set_sphere(18, 0, 6, 0);
    render_sphere(18, 0, 6, 0, 2000);
    set_box(3, 7, 3, 0, 3.5, 0);
    render_box(3, 7, 3, 0, 3.5, 0, 9);

    init_root();
}

function init_boxes() {
    clean_all();
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
    set_box(40, 5, 5, 0, 0, 0);
    render_box(40, 5, 5, 0, 0, 0, box_num_points);
    set_box(40, 5, 5, 0, 0, 40);
    render_box(40, 5, 5, 0, 0, 40, box_num_points);
    set_box(5, 5, 40, 20, 0, 20);
    render_box(5, 5, 40, 20, 0, 20, box_num_points);
    set_box(5, 5, 40, -20, 0, 20);
    render_box(5, 5, 40, -20, 0, 20, box_num_points);

    set_box(40, 5, 5, 0, 40, 0);
    render_box(40, 5, 5, 0, 40, 0, box_num_points);
    set_box(40, 5, 5, 0, 40, 40);
    render_box(40, 5, 5, 0, 40, 40, box_num_points);
    set_box(5, 5, 40, 20, 40, 20);
    render_box(5, 5, 40, 20, 40, 20, box_num_points);
    set_box(5, 5, 40, -20, 40, 20);
    render_box(5, 5, 40, -20, 40, 20, box_num_points);

    set_box(5, 40, 5, 20, 20, 0);
    render_box(5, 40, 5, 20, 20, 0, box_num_points);
    set_box(5, 40, 5, -20, 20, 0);
    render_box(5, 40, 5, -20, 20, 0, box_num_points);
    set_box(5, 40, 5, 20, 20, 40);
    render_box(5, 40, 5, 20, 20, 40, box_num_points);
    set_box(5, 40, 5, -20, 20, 40);
    render_box(5, 40, 5, -20, 20, 40, box_num_points);
    init_root();
    count = 0;
    phase = Constants.phases.GROWTH;
}

function clean_all() {
    clean_envelope();
    clean_points();
    clean_lines();
    clean_tree();
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
                vprime = new THREE.Vector3(Helpers.round(vprime.x, 2), Helpers.round(vprime.y, 2), Helpers.round(vprime.z, 2));
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
if(count >= speed) {
    count = 0;
    switch(phase){
        case Constants.phases.GROWTH:
            switch(growth){
                case Constants.g_phases.CLEAN:
                    stage_clean();
                    growth = Constants.g_phases.ASSOCIATION;
                    break;
                case Constants.g_phases.ASSOCIATION:
                    stage_association();
                    growth = Constants.g_phases.STEM;
                    break;
                case Constants.g_phases.STEM:
                    stage_stem();
                    growth = Constants.g_phases.KILL;
                    while(!edge_q.isEmpty()) {
                        var edge = edge_q.dequeue();
                        g_main.addVertex(edge.s1);
                        g_main.addEdge(edge.s0, edge.s1);
                        g_tmp.addVertex(edge.s1);
                        g_tmp.addEdge(edge.s0, edge.s1);
                    }
                    break;
                case Constants.g_phases.KILL:
                    growth = Constants.g_phases.CLEAN;
                    if(stage_kill()) {
                        clean_points();
                        clean_lines();
                        phase = Constants.phases.TRUNK;
                    }
                    break;
            }
            break; // end of GROWTH
        case Constants.phases.TRUNK:
            stage_trunk();
            phase = Constants.phases.LEAVES;
            break; // end of TRUNK
        case Constants.phases.LEAVES:
            phase = Constants.phases.DONE;
            clean_envelope();
            break; // end of LEAVES
    }
}

	renderer.render( scene, camera );
}

function update_geometry () {
    if(editing == Constants.editing_t.SPHERE) {
        set_sphere(radius_val, x_coord, y_coord, z_coord);
    }
    else if(editing == Constants.editing_t.BOX){
        set_box(width_val, height_val, depth_val, x_coord, y_coord, z_coord);
    }
}
document.getElementById("tree_new_scene").addEventListener("click", new_scene);
function new_scene() {
    if(phase == Constants.phases.DONE) {
        clean_all();
        document.getElementById("tree_new_scene").style.opacity = "0";
        document.getElementById("tree_geometry").style.opacity = "100";
        document.getElementById("instructions1").style.opacity = "0";
        document.getElementById("instructions2").style.opacity = "100";
        phase = Constants.phases.GEOMETRY;
    }
}

document.getElementById("tree_box").addEventListener("click", trigger_box);
function trigger_box() {
    if(phase == Constants.phases.GEOMETRY) {
        console.log("box created");
        set_box(2, 2, 2, 0, 0, 0);
        slider_width.value = 2; width_val = 2;
        slider_height.value = 2; height_val = 2;
        slider_depth.value = 2; depth_val = 2;
        slider_x.value = 0; x_coord = 0;
        slider_y.value = 0; y_coord = 0;
        slider_z.value = 0; z_coord = 0;
        phase = Constants.phases.EDIT;
        editing = Constants.editing_t.BOX;
        document.getElementById("tree_edit").style.opacity = "100";
        document.getElementById("tree_geometry").style.opacity = "0";
        document.getElementById("tree_render").style.opacity = "0";
    }
}

document.getElementById("tree_sphere").addEventListener("click", trigger_sphere);
function trigger_sphere() {
    if(phase == Constants.phases.GEOMETRY) {
        console.log("sphere created");
        set_sphere(18, 0, 0, 0);
        slider_radius.value = 18; radius_val = 18;
        slider_x.value = 0; x_coord = 0;
        slider_y.value = 0; y_coord = 0;
        slider_z.value = 0; z_coord = 0;
        phase = Constants.phases.EDIT;
        editing = Constants.editing_t.SPHERE;
        document.getElementById("tree_edit").style.opacity = "100";
        document.getElementById("tree_geometry").style.opacity = "0";
        document.getElementById("tree_render").style.opacity = "0";
    }
}

var slider_x = document.getElementById("slider_x");
var slider_y = document.getElementById("slider_y");
var slider_z = document.getElementById("slider_z");
var slider_radius = document.getElementById("slider_radius");
var slider_width = document.getElementById("slider_width");
var slider_height = document.getElementById("slider_height");
var slider_depth = document.getElementById("slider_depth");

slider_x.oninput = function() {
  x_coord = parseFloat(this.value);
  update_geometry();
}

slider_y.oninput = function() {
  y_coord = parseFloat(this.value);
  update_geometry();
}

slider_z.oninput = function() {
  z_coord = parseFloat(this.value);
  update_geometry();
}

slider_radius.oninput = function() {
  radius_val = parseFloat(this.value);
  update_geometry();
}

slider_width.oninput = function() {
  width_val = parseFloat(this.value);
  update_geometry();
}

slider_height.oninput = function() {
  height_val = parseFloat(this.value);
  update_geometry();
}

slider_depth.oninput = function() {
  depth_val = parseFloat(this.value);
  update_geometry();
}

document.getElementById("tree_finish").addEventListener("click", trigger_finish);
function trigger_finish() {
    if(phase == Constants.phases.EDIT) {
        phase = Constants.phases.GEOMETRY;
        if(editing == Constants.editing_t.SPHERE) {
            console.log("sphere finished");
            render_sphere(radius_val, x_coord, y_coord, z_coord, 4 / 6 * radius_val * radius_val * radius_val);
        }
        else if(editing == Constants.editing_t.BOX){
            console.log("box finished");
            render_box(width_val, height_val, depth_val, x_coord, y_coord, z_coord, width_val * height_val * depth_val * 2);
        }
        editing = Constants.editing_t.NONE;
        document.getElementById("tree_edit").style.opacity = "0";
        document.getElementById("tree_geometry").style.opacity = "100";
        document.getElementById("tree_render").style.opacity = "100";
    }
}

document.getElementById("tree_render").addEventListener("click", trigger_render);
function trigger_render() {
    if(phase == Constants.phases.EDIT || phase == Constants.phases.GEOMETRY) {
        document.getElementById("tree_geometry").style.opacity = "0";
        document.getElementById("instructions2").style.opacity = "0";
        document.getElementById("tree_render").style.opacity = "0";
        document.getElementById("tree_edit").style.opacity = "0";
        document.getElementById("tree_new_scene").style.opacity = "100";
        reset_scene();
        init_root();
    }
}
