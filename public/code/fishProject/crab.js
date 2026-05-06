
function createCrab(speed, maxAge, maxWeight) {
  var crab = {

    //properties
    
    name: "Crab_" + fishID,
    skin: color(random(100, 220), 0, 0),
    eyeSkin: color(random(140, 255), 0, 0),
    outline: color(0),
    weight:0,
    age:0,
    loc: createVector(width/2, height*.965),
    vel: createVector(random(-1, 1), 0),
    mouthColor: color(255, 255, 255),
    speed: 1,
    maxAge: maxAge,
    maxWeight: maxWeight,
    dead: false,
    dying: false,
    radius: width*.03,
    count: 0,
    
    
    
    //methods (properties that happen to be functions)
    show: function() {
      
     fill(this.skin);
      //body
      ellipse(this.loc.x, this.loc.y, this.radius, this.radius);
      
      fill(this.skin-20);
      //eyesSockets
      ellipse(this.loc.x + this.radius*.4, this.loc.y-this.radius*.4, this.radius*.5, this.radius*.5);
      ellipse(this.loc.x - this.radius*.4, this.loc.y-this.radius*.4, this.radius*.5, this.radius*.5);
      

      fill(255);

      ellipse(this.loc.x + this.radius*.45, this.loc.y-this.radius*.35, this.radius*.3, this.radius*.3);
      ellipse(this.loc.x - this.radius*.45, this.loc.y-this.radius*.35, this.radius*.3, this.radius*.3);
      
      
       stroke(this.skin);
      strokeWeight(3);

      //toprightleg
      line(this.loc.x+this.radius*.5, this.loc.y+this.radius*.15, this.loc.x+this.radius*.9+cos(this.count)*this.radius*.15, this.loc.y-this.radius*.2+sin(this.count)*this.radius*.15);
      line(this.loc.x+this.radius*.9+cos(this.count)*this.radius*.15, this.loc.y-this.radius*.2+sin(this.count)*this.radius*.15, this.loc.x+this.radius+cos(this.count)*this.radius*.3, this.loc.y+this.radius*.8+sin(this.count)*this.radius*.2);

      
      line(this.loc.x-this.radius+cos(this.count)*this.radius*.3, this.loc.y+this.radius*.8-sin(this.count)*this.radius*.2, this.loc.x-this.radius*.9+cos(this.count)*this.radius*.15, this.loc.y-this.radius*.2-sin(this.count)*this.radius*.15);
      line(this.loc.x-this.radius*.9+cos(this.count)*this.radius*.15, this.loc.y-this.radius*.2-sin(this.count)*this.radius*.15, this.loc.x-this.radius*.5, this.loc.y+this.radius*.15);

      strokeWeight(1);
      stroke(0);
      fill(this.skin);


      //rightbottom
      ellipse(this.loc.x+this.radius+cos(this.count)*this.radius*.3, this.loc.y+this.radius*.8+sin(this.count)*this.radius*.2, this.radius*.2, this.radius*.2);
      
      //righttop
      ellipse(this.loc.x+this.radius*.9+cos(this.count)*this.radius*.15, this.loc.y-this.radius*.2+sin(this.count)*this.radius*.15, this.radius*.2, this.radius*.2);
    
      //rightarmattach
      ellipse(this.loc.x+this.radius*.5, this.loc.y+this.radius*.15, this.radius*.2, this.radius*.2);
      

      //leftbottom
      ellipse(this.loc.x-this.radius+cos(this.count)*this.radius*.3, this.loc.y+this.radius*.8-sin(this.count)*this.radius*.2, this.radius*.2, this.radius*.2);
      
      //lefttop
       ellipse(this.loc.x-this.radius*.9+cos(this.count)*this.radius*.15, this.loc.y-this.radius*.2-sin(this.count)*this.radius*.15, this.radius*.2, this.radius*.2);
      
      //leftarmattach
      ellipse(this.loc.x-this.radius*.5, this.loc.y+this.radius*.15, this.radius*.2, this.radius*.2);
      
      stroke(255);
      text(this.name, this.loc.x- 20, this.loc.y-25);

      stroke(0);


    },


    die: function() {
      this.dying = true;
      this.dead = true;
    },

    move: function() {
      
      if(this.loc.x >= width - this.radius*.5){
        this.vel.x = abs(this.vel.x)*-1;
      }

      if(this.loc.x <= 0 + this.radius*.5)
      {
        this.vel.x = abs(this.vel.x);
      }

      this.loc.add(this.vel);
    },

    doAge: function(){
      this.age++;

      if(this.age >= this.maxAge){
        this.die();
      }

      
    },

  

    doWeight: function(){


      if(this.weight >= this.maxWeight){
        this.die();
      }
    },

    setup: function() {
      
        this.vel = createVector(this.vel.x/this.vel.mag()*this.speed, this.vel.y/this.vel.mag()*this.speed);
    },


    update: function() {


      this.show();
      if(this.dying == false)
      {

        this.move();
        this.doAge();
        this.doWeight();
        this.count+=.4;
      }

      else
      {
        this.die();
      }

      
      if(this.count>=2*PI){
        this.count = 0;
      }

    }
  
  }


  return crab;
}
