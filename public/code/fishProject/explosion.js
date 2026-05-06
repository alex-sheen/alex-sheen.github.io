
function createExplosion() {
  var explosion = {
    loc: createVector(width*.5, height*.5),
    vel: createVector(random(-1.3, 1.3), random(-1.3, 1.3)),
    timer: 70,
    dead: false,
    size: random(5, 10),
    
    show: function() {
     
      fill(255, 50, 50);
      
      
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

      if(this.timer < 0)
      {
        this.dead = true;
      }
    },

    delete: function(){
      this.dead = true;
    }

  
  }
  return explosion;
}
