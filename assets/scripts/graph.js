// create a graph class
export class Graph {
    // defining vertex array and
    // adjacent list
    constructor(noOfVertices)
    {
        this.noOfVertices = noOfVertices;
        this.AdjList = new Map();
    }

    // add vertex to the graph
    addVertex(v)
    {
        // initialize the adjacent list with a
        // null array
        this.noOfVertices++;
        this.AdjList.set(v, []);
    }
    // add edge to the graph
    addEdge(v, w)
    {
        // get the list for vertex v and put the
        // vertex w denoting edge between v and w
        this.AdjList.get(v).push(w);
    }
    // Prints the vertex and adjacency list
    printGraph()
    {
        // get all the vertices
        var get_keys = this.AdjList.keys();

        // iterate over the vertices
        for (var i of get_keys)
        {
            // great the corresponding adjacency list
            // for the vertex
            var get_values = this.AdjList.get(i);
            var conc = "";

            // iterate over the adjacency list
            // concatenate the values into a string
            for (var j of get_values)
                conc += j + " ";

            // print the vertex and its adjacency list
            console.log(i + " -> " + conc);
        }
    }
}

// // create a graph class
// class Graph {
//     // defining vertex array and
//     // adjacent list
//     constructor(noOfVertices)
//     {
//         this.noOfVertices = noOfVertices;
//         this.AdjList = new Map();
//     }
//
//     // add vertex to the graph
//     addVertex(v)
//     {
//         // initialize the adjacent list with a
//         // null array
//         this.noOfVertices++;
//         this.AdjList.set(v, []);
//     }
//     // add edge to the graph
//     addEdge(v, w)
//     {
//         // get the list for vertex v and put the
//         // vertex w denoting edge between v and w
//         this.AdjList.get(v).push(w);
//         var line_mat = new THREE.LineBasicMaterial({color: 0x0000ff});
//         var points = [];
//         points.push(v);
//         points.push(w);
//         console.log("from: " + v.x + "," + v.y + "," + v.z +
//                     "to: " + w.x + "," + w.y + "," + w.z);
//         var line_geo = new THREE.BufferGeometry().setFromPoints( points );
//         var line = new THREE.Line( line_geo, line_mat );
//         scene.add(line);
//     }
//     // Prints the vertex and adjacency list
//     printGraph()
//     {
//         // get all the vertices
//         var get_keys = this.AdjList.keys();
//
//         // iterate over the vertices
//         for (var i of get_keys)
//         {
//             // great the corresponding adjacency list
//             // for the vertex
//             var get_values = this.AdjList.get(i);
//             var conc = "";
//
//             // iterate over the adjacency list
//             // concatenate the values into a string
//             for (var j of get_values)
//                 conc += "(" + j.x + "," + j.y + "," + j.z + ")";
//
//             // print the vertex and its adjacency list
//             if(get_values != null) {
//                 console.log("(" + i.x + "," + i.y + "," + i.z + ") -> " + conc);
//             }
//         }
//     }
// }

// for (const [key, value] of g.AdjList.entries()) {
//     for(var asdf of value)
//     {
//        console.log("fuck" + key.y + " " + asdf.y);
//     }
// }
