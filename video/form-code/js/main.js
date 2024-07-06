let x_mid;
let y_mid;
let r;

let objs = [];
let sel;

let c_d = 1;
let c_r;
let c_g;
let c_b = 255;

function setup() {
  createCanvas(innerWidth, innerHeight)
  background(0)
  noFill();
  strokeWeight(r/200);

  x_mid = width / 2;
  y_mid = height / 2;
  r = width / 3;

  c_r = random(30, 170);
  c_g = random(30, 170);

  textAlign(CENTER);
  sel = createSelect();
  sel.position(50, height/2);
  // sel.option('experiment 1');
  sel.option('v1');
  sel.option('v2');
  sel.selected('v1');
  sel.changed(resetCanvas);


  resetCanvas();
}

function resetCanvas(){
  clear();
  background(0);
  objs = [];
  c_r = random(30, 170);
  c_g = random(30, 170);
  switch(sel.value()) {
    // case "experiment 1":
    //   for(let i = 0; i < 100; i++){
    //     let x_rand = random(x_mid - r/2, x_mid + r/2);
    //     let y_rand = random(y_mid - r/2, y_mid + r/2);
    //     while(dist(x_rand, y_rand, x_mid, y_mid) > r/2 - 10) {
    //       x_rand = random(x_mid - r/2, x_mid + r/2);
    //       y_rand = random(y_mid - r/2, y_mid + r/2);
    //     }
    //     objs.push({pos: createVector(x_rand, y_rand), target: createVector(r/200, 0).rotate(random(-4,4))});
    //   }
    //   break;
    case "v1":
      for(let i = 0; i < 100; i++){
        objs.push({pos: createVector(width / 2, height / 2), target: createVector(r/200, 0).rotate(random(-4,4))});
      }
      break;
    case "v2":
      objs.push({pos: createVector(width / 2, height / 2), target: createVector(r/200, 0).rotate(random(-4,4)), c_r: random(30,170), c_g: random(30,170), c_b: random(30,170), c_d: Math.round(random(0,1)*2-1)});
    default:
      // code block
  }

  fill(255, 255, 255);
  textSize(26);
  text('Press any key to reset', innerWidth / 2, 110);
  noFill()
}

function keyPressed() {
  resetCanvas();
}

function v1_draw() {
  stroke(color(c_r, c_g, c_b));
  if(c_b >= 255) {c_d = -1}
  else if(c_b <= 0) {c_d = 1}
  c_b += c_d;

  for(let i = 0; i < objs.length; i++){
    objs[i].target.rotate(random(-0.3, 0.3));
    if(dist(objs[i].pos.x, objs[i].pos.y, x_mid, y_mid) > r/2-4) {
        objs[i].target = createVector(-1*(objs[i].pos.x-x_mid), -1*(objs[i].pos.y-y_mid)).normalize().mult(r/200);
    }
    objs[i].pos.add(objs[i].target);
    for(let j = i+1; j < objs.length; j++){
      /* draw a line between close objs */
      if(dist(objs[i].pos.x, objs[i].pos.y, objs[j].pos.x, objs[j].pos.y) < r/40) {
        line(objs[i].pos.x, objs[i].pos.y, objs[j].pos.x, objs[j].pos.y);
      }
    }
  }
  stroke(255);
  ellipse(x_mid, y_mid, r);
}

function v2_draw() {
  stroke(color(c_r, c_g, c_b));
  if(c_b >= 255) {c_d = -1}
  else if(c_b <= 0) {c_d = 1}
  c_b += c_d;

  for(let i = 0; i < objs.length; i++){
    objs[i].target.rotate(random(-0.3, 0.3));
    if(dist(objs[i].pos.x, objs[i].pos.y, x_mid, y_mid) > r/2-4) {
        objs[i].target = createVector(-1*(objs[i].pos.x-x_mid), -1*(objs[i].pos.y-y_mid)).normalize().mult(r/200);
    }
    let tmp_pos = objs[i].pos;
    objs[i].pos.add(objs[i].target);
    line(tmp_pos.x, tmp_pos.y, objs[i].pos.x, objs[i].pos.y);
  }
  stroke(255);
  ellipse(x_mid, y_mid, r);
}

let count = 0;
function v3_draw() {

  count++;
  if(count > 100) {
    count = 0;
  }
  let tmp_len = objs.length;
  for(let i = 0; i < tmp_len; i++){
    objs[i].target.rotate(random(-0.3, 0.3));
    if(dist(objs[i].pos.x, objs[i].pos.y, x_mid, y_mid) > r/2-4) {
        objs[i].target = createVector(-1*(objs[i].pos.x-x_mid), -1*(objs[i].pos.y-y_mid)).normalize().mult(r/200);
    }
    let tmp_pos = objs[i].pos;
    objs[i].pos.add(objs[i].target);

    stroke(color(objs[i].c_r, objs[i].c_g, objs[i].c_b));
    if(objs[i].c_b >= 255) {objs[i].c_d = -1}
    else if(objs[i].c_b <= 0) {objs[i].c_d = 1}
    objs[i].c_b += objs[i].c_d;

    line(tmp_pos.x, tmp_pos.y, objs[i].pos.x, objs[i].pos.y);

    if(count == 75 && tmp_len < 200) {
      objs.push({pos: createVector(objs[i].pos.x, objs[i].pos.y), target: objs[i].target.copy().rotate(random(-1,1)), c_r: objs[i].c_r, c_g: objs[i].c_g, c_b: objs[i].c_b, c_d: Math.round(random(0,1)*2-1)});
    }
  }
  stroke(255);
  ellipse(x_mid, y_mid, r);
}

function draw() {
  switch(sel.value()) {
    // case "experiment 1":
    //   v1_draw();
    //   break;
    case "v1":
      v2_draw();
      break;
    case "v2":
      v3_draw();
      break;
    default:
      // code block
  }
}
