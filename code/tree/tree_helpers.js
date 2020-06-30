export function getRand(min, max) {
  return ((Math.random() * (max - min) ) + min);
}

export function printVec(v) {
    return "(" + v.x + "," + v.y + "," + v.z + ")";
}

export function round(num) {
    return +(Math.round(num + "e+2")  + "e-2");
}

export function graph_to_stack(g, q, node) {
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
