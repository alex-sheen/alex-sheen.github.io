
function createSquid(speed, maxAge, maxWeight) {
  var squid = {

    //properties
    
    name: "Squid" + fishID,
    skin: color(0, random(100, 220), 0),
    eyeSkin: color(0, random(140, 255), 0),
    outline: color(0),
    weight:0,
    age:0,
    loc: createVector(width/2, random(height*.4, height*.9)),
    vel: createVector(1, 0),
    mouthColor: color(255, 255, 255),
    speed: 1,
    maxAge: maxAge,
    maxWeight: maxWeight,
    dead: false,
    dying: false,
    radius: width*.1,
    count: 0,
    d: -1,
    
    
    
    //methods (properties that happen to be functions)
    show: function() {
      
     
      
      fill(255, 255, 255);
      stroke(0);
      strokeWeight(1);

      ellipse(this.loc.x+this.d*this.radius*.7+this.d*cos(this.count)*this.radius*.15, this.loc.y-this.radius*.2+this.d*sin(this.count)*this.radius*.15, this.radius*.2, this.radius*.2);
      ellipse(this.loc.x+this.d*this.radius*1.2+this.d*cos(this.count-PI/4)*this.radius*.15, this.loc.y-this.radius*.2+this.d*sin(this.count-PI/4)*this.radius*.15, this.radius*.2, this.radius*.2);
      ellipse(this.loc.x+this.d*this.radius*1.7+this.d*cos(this.count-PI/2)*this.radius*.15, this.loc.y-this.radius*.2+this.d*sin(this.count-PI/2)*this.radius*.15, this.radius*.2, this.radius*.2);
      ellipse(this.loc.x+this.d*this.radius*2.2+this.d*cos(this.count-PI/4*3)*this.radius*.15, this.loc.y-this.radius*.2+this.d*sin(this.count-PI/4*3)*this.radius*.15, this.radius*.2, this.radius*.2);

      stroke(255);
      strokeWeight(3);

      line(this.loc.x, this.loc.y, this.loc.x+this.d*this.radius*.7+this.d*cos(this.count)*this.radius*.15, this.loc.y-this.radius*.2+this.d*sin(this.count)*this.radius*.15);
      line(this.loc.x+this.d*this.radius*.7+this.d*cos(this.count)*this.radius*.15, this.loc.y-this.radius*.2+this.d*sin(this.count)*this.radius*.15, this.loc.x+this.d*this.radius*1.2+this.d*cos(this.count-PI/4)*this.radius*.15, this.loc.y-this.radius*.2+this.d*sin(this.count-PI/4)*this.radius*.15);
      line(this.loc.x+this.d*this.radius*1.7+this.d*cos(this.count-PI/2)*this.radius*.15, this.loc.y-this.radius*.2+this.d*sin(this.count-PI/2)*this.radius*.15, this.loc.x+this.d*this.radius*1.2+this.d*cos(this.count-PI/4)*this.radius*.15, this.loc.y-this.radius*.2+this.d*sin(this.count-PI/4)*this.radius*.15,);
      line(this.loc.x+this.d*this.radius*1.7+this.d*cos(this.count-PI/2)*this.radius*.15, this.loc.y-this.radius*.2+this.d*sin(this.count-PI/2)*this.radius*.15, this.loc.x+this.d*this.radius*2.2+this.d*cos(this.count-PI/4*3)*this.radius*.15, this.loc.y-this.radius*.2+this.d*sin(this.count-PI/4*3)*this.radius*.15);


      stroke(0);
      strokeWeight(1);

      ellipse(this.loc.x+this.d*this.radius*.7+this.d*cos(this.count)*this.radius*.15, this.loc.y+this.radius*.2+this.d*-1*sin(this.count)*this.radius*.15, this.radius*.2, this.radius*.2);
      ellipse(this.loc.x+this.d*this.radius*1.2+this.d*cos(this.count-PI/4)*this.radius*.15, this.loc.y+this.radius*.2+this.d*-1*sin(this.count-PI/4)*this.radius*.15, this.radius*.2, this.radius*.2);
      ellipse(this.loc.x+this.d*this.radius*1.7+this.d*cos(this.count-PI/2)*this.radius*.15, this.loc.y+this.radius*.2+this.d*-1*sin(this.count-PI/2)*this.radius*.15, this.radius*.2, this.radius*.2);
      ellipse(this.loc.x+this.d*this.radius*2.2+this.d*cos(this.count-PI/4*3)*this.radius*.15, this.loc.y+this.radius*.2+this.d*-1*sin(this.count-PI/4*3)*this.radius*.15, this.radius*.2, this.radius*.2);



      stroke(255);
      strokeWeight(3);

      line(this.loc.x, this.loc.y, this.loc.x+this.d*this.radius*.7+this.d*cos(this.count)*this.radius*.15, this.loc.y+this.radius*.2+this.d*-1*sin(this.count)*this.radius*.15);
      line(this.loc.x+this.d*this.radius*.7+this.d*cos(this.count)*this.radius*.15, this.loc.y+this.radius*.2+this.d*-1*sin(this.count)*this.radius*.15, this.loc.x+this.d*this.radius*1.2+this.d*cos(this.count-PI/4)*this.radius*.15, this.loc.y+this.radius*.2+this.d*-1*sin(this.count-PI/4)*this.radius*.15);
      line(this.loc.x+this.d*this.radius*1.7+this.d*cos(this.count-PI/2)*this.radius*.15, this.loc.y+this.radius*.2+this.d*-1*sin(this.count-PI/2)*this.radius*.15, this.loc.x+this.d*this.radius*1.2+this.d*cos(this.count-PI/4)*this.radius*.15, this.loc.y+this.radius*.2+this.d*-1*sin(this.count-PI/4)*this.radius*.15,);
      line(this.loc.x+this.d*this.radius*1.7+this.d*cos(this.count-PI/2)*this.radius*.15, this.loc.y+this.radius*.2+this.d*-1*sin(this.count-PI/2)*this.radius*.15, this.loc.x+this.d*this.radius*2.2+this.d*cos(this.count-PI/4*3)*this.radius*.15, this.loc.y+this.radius*.2+this.d*-1*sin(this.count-PI/4*3)*this.radius*.15);


      stroke(0);
      strokeWeight(1);


       fill(this.skin);
      //body
      ellipse(this.loc.x, this.loc.y, this.radius, this.radius);
      
      stroke(255);
      text(this.name, this.loc.x- 20, this.loc.y-35);

      stroke(0);


    },


    die: function() {
      this.dying = true;
      this.dead = true;
    },

    move: function() {
      
      if(this.loc.x >= width - this.radius*.5){
        this.vel.x = abs(this.vel.x)*-1;
        this.d = 1;
      }

      if(this.loc.x <= 0 + this.radius*.5)
      {
        this.vel.x = abs(this.vel.x);
        this.d = -1;
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
        this.count+=.2;
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


  return squid;
}
