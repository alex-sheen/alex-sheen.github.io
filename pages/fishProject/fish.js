
function createFish(fishType, speed, maxAge, maxWeight, initialWeight) {
  var fish = {

    //properties
    type: fishType,
    name: fishType + "_" + fishID,
    skin: color(random(100, 255), random(100, 255), random(100, 255)),
    outline: color(0),
    weight: initialWeight,
    age:0,
    loc: createVector(random(width*.1, width*.9), random(height*.4, height*.9)),
    vel: createVector(random(-1, 1), random(-1, 1)),
    mouthColor: color(255, 255, 255),
    speed: speed,
    maxAge: maxAge,
    maxWeight: maxWeight,
    dead: false,
    dying: false,
    radius: 10,
    count: 0,
    cfLoc: createVector(1, 1),
    needsNewcf: false,
    spouting: false,
    spoutCount: 0,
    jumping: false,
    neckLength: 1,
    atTop: false,
    
    //methods (properties that happen to be functions)
    show: function() {
      
    //face
        fill(this.mouthColor);
        ellipse(this.loc.x + this.vel.x/this.vel.mag()*this.radius*.4*this.neckLength, this.loc.y + this.vel.y/this.vel.mag()*this.radius*.4*this.neckLength, this.radius*.5, this.radius*.5);
      
      
        fill(this.skin);
        stroke(this.outline);

    //Setting up the tail
        var perpV = this.vel.copy();
        perpV.div(perpV.mag());

        var tailX1 = this.vel.x/this.vel.mag()*this.radius*.8*(sin(this.count)/7+1) + this.vel.y/this.vel.mag()*this.radius*.6;
        var tailY1 = this.vel.y/this.vel.mag()*this.radius*.8*(sin(this.count)/7+1) - this.vel.x/this.vel.mag()*this.radius*.6;

        var tailX2 = this.vel.x/this.vel.mag()*this.radius*.8*(sin(this.count)/7+1) - this.vel.y/this.vel.mag()*this.radius*.6;
        var tailY2 = this.vel.y/this.vel.mag()*this.radius*.8*(sin(this.count)/7+1) + this.vel.x/this.vel.mag()*this.radius*.6;


    //Drawing the tail
        triangle(this.loc.x - tailX1, this.loc.y - tailY1,    /**/ this.loc.x - tailX2, this.loc.y - tailY2, /**/ this.loc.x, this.loc.y);
      
    //body
        ellipse(this.loc.x, this.loc.y, this.radius, this.radius);
      
    //name
        fill(255);
        text(this.name, this.loc.x- 20, this.loc.y- 10);
    },


    die: function() {
      this.dying = true;
    
      //sends the fish towards the surface of the fish tank
          if(this.loc.y > height*.3){
            
            this.vel = createVector(0, -1);
            this.loc.add(this.vel);
          }

      //stops the fish if its at the top
          else
          {
            this.atTop = true;
          }    
    },

    move: function() {
      
      //borders
          if(this.loc.x >= width - this.radius*.5 && this.jumping == false){
            this.vel.x = abs(this.vel.x)*-1;
          }

          if(this.loc.x <= 0 + this.radius*.5 && this.jumping == false)
          {
            this.vel.x = abs(this.vel.x);
          }

          if(this.loc.y >= height - this.radius*.5){
            this.vel.y = abs(this.vel.y)*-1;
          }

          if(this.loc.y >= height*.3+this.radius*.5 && this.jumping == true)
          {
            this.jumping = false;
            this.vel.mult(.5);
         
          }

      //If fish hits the surface
          if(this.loc.y <= height*.3+this.radius*.5 && this.jumping == false){
           

            if(this.type == "Whale")
            {
              this.vel.y = abs(this.vel.y);
              this.spouting = true;
              this.spoutWater();
            }

            else if(this.type == "Dolphin")
            {
              this.jumping = true;
              this.jump();
            }

            else
            {
              this.vel.y = abs(this.vel.y);
            }

      }

      this.loc.add(this.vel);
    },


    doAge: function(){
      this.age++;

      if(this.age >= this.maxAge){
        this.die();
      }

      
    },


    jump: function(){
      this.vel.mult(2.2);
    },


    spoutWater: function(){
      for(var x =0; x<30; x++)
              {
                particles.push(createDroplets());
                particles[particles.length-1].loc.x = this.loc.x;
                particles[particles.length-1].loc.y = this.loc.y;
              }
    },


    doWeight: function(){
      this.weight++;

      this.radius = 10+this.weight/50;

      if(this.weight >= this.maxWeight){
        this.die();
      }

      else if(this.weight <= .1*this.maxWeight){
        this.die();
      }
    },


    setup: function() {
      
        this.vel = createVector(this.vel.x/this.vel.mag()*this.speed, this.vel.y/this.vel.mag()*this.speed);
    },

    updatecf: function(){
      if(this.type == "Piranha" && this.dying == false && this.cfLoc != NaN)
      {
        this.vel = createVector(this.cfLoc.x - this.loc.x, this.cfLoc.y - this.loc.y);  
        this.vel = createVector(this.vel.x/this.vel.mag()*this.speed, this.vel.y/this.vel.mag()*this.speed);
      }
    },

  

    update: function() {

      if(this.spouting == true)
      {
        this.spoutCount += 1;
        this.spoutWater();
        if(this.spoutCount > 20)
        {
          this.spoutCount = 0;
          this.spouting = false;
        }
      }

      if(this.jumping == true)
      {
        this.vel.y+=.2;
      }

      this.show();
      if(this.dying == false)
      {
        this.move();
        this.doAge();
        this.doWeight();
        this.count++;
      }

      else
      {
        this.die();
      }

      
      if(this.count>=2*PI){
        this.count = 0;
        this.needsNewcf = true;
      }

    }
  
  }


  return fish;
}
