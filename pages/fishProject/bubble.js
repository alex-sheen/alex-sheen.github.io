
function createBubble() {
  var bubble = {
    loc: createVector(random(0, width), random(height*.3, height)),
    vel: createVector(0, random(-.5, -1.6)),
    radius: random(3, 5),
    dead: false,
    type: "food",
    
    show: function() {
     
          fill(255);
      
      
          ellipse(this.loc.x, this.loc.y, this.radius, this.radius);
    },

    move: function(){
      if(this.loc.y>=height*.3)
      {
        this.loc.add(this.vel);
      }

      else
      {
        this.dead = true;
      }
    },

    update: function() {
      this.show();
      this.move();
    },

  

  
  }
  return bubble;
}
