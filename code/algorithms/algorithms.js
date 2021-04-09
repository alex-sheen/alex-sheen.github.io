var elesfn$1 = {
  dijkstra: function dijkstra(options) {
    if (!plainObject(options)) {
      var args = arguments;
      options = {
        root: args[0],
        weight: args[1],
        directed: args[2]
      };
    }

    var _dijkstraDefaults = dijkstraDefaults(options),
        root = _dijkstraDefaults.root,
        weight = _dijkstraDefaults.weight,
        directed = _dijkstraDefaults.directed;

    var eles = this;
    var weightFn = weight;
    var source = string(root) ? this.filter(root)[0] : root[0];
    var dist = {};
    var prev = {};
    var knownDist = {};

    var _this$byGroup = this.byGroup(),
        nodes = _this$byGroup.nodes,
        edges = _this$byGroup.edges;

    edges.unmergeBy(function (ele) {
      return ele.isLoop();
    });

    var getDist = function getDist(node) {
      return dist[node.id()];
    };

    var setDist = function setDist(node, d) {
      dist[node.id()] = d;
      Q.updateItem(node);
    };

    var Q = new Heap(function (a, b) {
      return getDist(a) - getDist(b);
    });

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      dist[node.id()] = node.same(source) ? 0 : Infinity;
      Q.push(node);
    }

    var distBetween = function distBetween(u, v) {
      var uvs = (directed ? u.edgesTo(v) : u.edgesWith(v)).intersect(edges);
      var smallestDistance = Infinity;
      var smallestEdge;

      for (var _i = 0; _i < uvs.length; _i++) {
        var edge = uvs[_i];

        var _weight = weightFn(edge);

        if (_weight < smallestDistance || !smallestEdge) {
          smallestDistance = _weight;
          smallestEdge = edge;
        }
      }

      return {
        edge: smallestEdge,
        dist: smallestDistance
      };
    };

    while (Q.size() > 0) {
      var u = Q.pop();
      var smalletsDist = getDist(u);
      var uid = u.id();
      knownDist[uid] = smalletsDist;

      if (smalletsDist === Infinity) {
        continue;
      }

      var neighbors = u.neighborhood().intersect(nodes);

      for (var _i2 = 0; _i2 < neighbors.length; _i2++) {
        var v = neighbors[_i2];
        var vid = v.id();
        var vDist = distBetween(u, v);
        var alt = smalletsDist + vDist.dist;

        if (alt < getDist(v)) {
          setDist(v, alt);
          prev[vid] = {
            node: u,
            edge: vDist.edge
          };
        }
      } // for

    } // while


    return {
      distanceTo: function distanceTo(node) {
        var target = string(node) ? nodes.filter(node)[0] : node[0];
        return knownDist[target.id()];
      },
      pathTo: function pathTo(node) {
        var target = string(node) ? nodes.filter(node)[0] : node[0];
        var S = [];
        var u = target;
        var uid = u.id();

        if (target.length > 0) {
          S.unshift(target);

          while (prev[uid]) {
            var p = prev[uid];
            S.unshift(p.edge);
            S.unshift(p.node);
            u = p.node;
            uid = u.id();
          }
        }

        return eles.spawn(S);
      }
    };
  }
};

var elesfn$2 = {
  // kruskal's algorithm (finds min spanning tree, assuming undirected graph)
  // implemented from pseudocode from wikipedia
  kruskal: function kruskal(weightFn) {
    weightFn = weightFn || function (edge) {
      return 1;
    };

    var _this$byGroup = this.byGroup(),
        nodes = _this$byGroup.nodes,
        edges = _this$byGroup.edges;

    var numNodes = nodes.length;
    var forest = new Array(numNodes);
    var A = nodes; // assumes byGroup() creates new collections that can be safely mutated

    var findSetIndex = function findSetIndex(ele) {
      for (var i = 0; i < forest.length; i++) {
        var eles = forest[i];

        if (eles.has(ele)) {
          return i;
        }
      }
    }; // start with one forest per node


    for (var i = 0; i < numNodes; i++) {
      forest[i] = this.spawn(nodes[i]);
    }

    var S = edges.sort(function (a, b) {
      return weightFn(a) - weightFn(b);
    });

    for (var _i = 0; _i < S.length; _i++) {
      var edge = S[_i];
      var u = edge.source()[0];
      var v = edge.target()[0];
      var setUIndex = findSetIndex(u);
      var setVIndex = findSetIndex(v);
      var setU = forest[setUIndex];
      var setV = forest[setVIndex];

      if (setUIndex !== setVIndex) {
        A.merge(edge); // combine forests for u and v

        setU.merge(setV);
        forest.splice(setVIndex, 1);
      }
    }

    return A;
  }
};
