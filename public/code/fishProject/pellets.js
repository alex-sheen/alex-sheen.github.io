
function createPellets() {
  var pellet = {
    loc: createVector(random(0, width), height*.3),
    vel: createVector(0, random(1, 3)),
    dead: false,
    type: "food",
    
    show: function() {
      if(this.type == "food")
      {
          fill(0, 255, 0);
      }

      else if(this.type == "poison")
      {
          fill(255, 0, 0);
      }

      else if(this.type == "bigboi")
      {
          fill(255, 0, 255);
      }
      
      ellipse(this.loc.x, this.loc.y, 10, 10);
    },

    move: function(){
      if(this.loc.y<=height-2)
      {
        this.loc.add(this.vel);
      }

      // else
      // {
      //   this.dead = true;
      // }
    },

    update: function() {
      this.show();
      this.move();
    },

    delete: function(){
      this.dead = true;
    }

  
  }
  return pellet;
}
