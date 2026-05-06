var cy = cytoscape({

  container: document.getElementById('cy'), // container to render in

  elements: [ // list of graph elements to start with
    // { // node a
    //   data: { id: 'node0' }
    // }
    // { // node b
    //   data: { id: 'b' }
    // },
    // { // edge ab
    //   data: { id: 'ab', source: 'a', target: 'b' }
    // }
  ],


  style: cytoscape.stylesheet()
   .selector('node')
     .style({
       'content': 'data(id)'
     })
   .selector('edge')
     .style({
       'curve-style': 'bezier',
       'target-arrow-shape': 'triangle',
       'width': 4,
       'line-color': '#ddd',
       'target-arrow-color': '#ddd',
       'content': 'data(weight)'
     })
   .selector('.highlighted')
     .style({
       'background-color': '#61bffc',
       'line-color': '#61bffc',
       'target-arrow-color': '#61bffc',
       'transition-property': 'background-color, line-color, target-arrow-color',
       'transition-duration': '0.5s'
     }),


  // initial viewport state:
  zoom: 1,
  pan: { x: 0, y: 0 },

  // interaction options:
  minZoom: 1e-50,
  maxZoom: 1e50,
  zoomingEnabled: true,
  userZoomingEnabled: false,
  panningEnabled: true,
  userPanningEnabled: true,
  boxSelectionEnabled: true,
  selectionType: 'single',
  touchTapThreshold: 8,
  desktopTapThreshold: 4,
  autolock: false,
  autoungrabify: false,
  autounselectify: false,

  // rendering options:
  headless: false,
  styleEnabled: true,
  hideEdgesOnViewport: false,
  textureOnViewport: false,
  motionBlur: false,
  motionBlurOpacity: 0.2,
  wheelSensitivity: 1,
  pixelRatio: 'auto'
});


var vertex_list = [];
vertex_list.push(0);
var edge_index = 1;
cy.add({
    data: { id: 'node' + 0, label: 1 }
    }
);
for (var i = 1; i < 10; i++) {
    cy.add({
        data: { id: 'node' + i, label: 1 }
        }
    );
    var u = i;
    var v = Math.floor(vertex_list.length*Math.random());
    vertex_list.push(v);
    cy.add({
        data: {
            id: 'edge' + i,
            weight: 1,
            source: 'node' + i,
            target: 'node' + v
        }
    });
    edge_index++;
}

for (var i = 1; i < 10; i++) {
    var u = Math.floor(vertex_list.length*Math.random());
    var v = Math.floor(vertex_list.length*Math.random());
    if (u==v){
      v = (v+1)%vertex_list.length
    }
    cy.add({
        data: {
            id: 'edge' + edge_index,
            weight: 1,
            source: 'node' + u,
            target: 'node' + v
        }
    });
    edge_index++;
}

cy.layout({
    name: 'circle',
    directed: true,
    roots: '#node0',
}).run();


document.getElementById("greedy_algos").style.display = "block";
document.getElementById("flow_algos").style.display = "none";
var select_algo_category = document.getElementById("algo_category");
select_algo_category.addEventListener("change", function() {
  if (select_algo_category.value == "greedy") {
    document.getElementById("greedy_algos").style.display = "block";
    document.getElementById("flow_algos").style.display = "none";
  }
  else if (select_algo_category.value == "flow") {
    document.getElementById("greedy_algos").style.display = "none";
    document.getElementById("flow_algos").style.display = "block";
  }
});


// var bfs;
// // -------------- TAP ------------
// cy.on('tap', 'node', function(evt){
//   var node = evt.target;
//   console.log( 'tapped ' + node.id() );
//
//   if (bfs) {
//     for (var i=0; i<bfs.path.length; i++) {
//       bfs.path[i].removeClass('highlighted');
//     }
//   }
//
//   bfs = cy.elements().bfs('#' + node.id(), function(){}, true);
//
//   var i = 0;
//   var highlightNextEle = function(){
//     if( i < bfs.path.length ){
//       bfs.path[i].addClass('highlighted');
//
//       i++;
//       setTimeout(highlightNextEle, 500);
//     }
//   };
//
//   // kick off first highlight
//   highlightNextEle();
// }); //end TAP

function run_dijkstra(node) {
  var dijkstra = cy.elements().dijkstra('#' + node.id());

  for (i=0; i<cy.nodes().length; i++) {
    if ('node' + i != node.id()) {
      var distToJ = dijkstra.distanceTo( cy.$('#node' + i) );
      console.log(distToJ);
    }
  }
}

// -------------- TAP ------------
cy.on('tap', 'node', function(evt){
  var node = evt.target;
  console.log( 'tapped ' + node.id() );
  run_dijkstra(node);
}); //end TAP
