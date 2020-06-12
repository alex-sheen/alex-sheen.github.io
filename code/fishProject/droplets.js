
function createDroplets() {
  var droplets = {
    loc: createVector(width*.5, height*.5),
    vel: createVector(random(-1, 1), random(-4, -5.6)),
    timer: 160,
    dead: false,
    size: random(5, 10),
    
    show: function() {
     
      fill(200, 200, 255);
      
      
      ellipse(this.loc.x, this.loc.y, this.size, this.size);
    },

    move: function(){
      if(this.loc.y<=height-2){
      this.loc.add(this.vel);
      }
    },

    update: function() {
      this.show();
      this.move();
      this.timer -= 1;
      this.size-=.07;
      this.vel.add(createVector(0, .05));

      if(this.timer < 0)
      {
        this.dead = true;
      }
    },

    delete: function(){
      this.dead = true;
    }

  
  }
  return droplets;
}
