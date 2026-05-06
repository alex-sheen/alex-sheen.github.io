/*  Alex's Fish Project
Buttons at the top :
  Create different fish
  Create different pellets
  Tap the tank changes the direction of the fish
  Clear the tank removes dead fish from the top of the tank and dead crabs

Fish : fish die when they go over the maxWeight or maxAge
  Goldfish
  Piranha : follow and eat the goldfish
  Whale : eats goldfish and piranhas, will spout water when it hits the surface
  Dolphin : jumps out of the water when it hits the surface

Pellets
  Food : increase weight
  Poison : decrease weight
  Big Boi : make the fish explode

Crab : eats and removes pellets

Bubbles : randomly appear and float to the surface

Squid

*/

var fishID = 0;
var fish= [];
var pellet =[];
var particles = [];
var crab = [];
var bubbles = [];
var squid = [];

var areAvailableFish = false;
var sameCollision = true;

var pelletButton;
var poisonButton;
var bigBoiButton;
var goldfishButton;
var piranhaButton;
var whaleButton;
var dolphinButton;
var crabButton;
var squidButton;
var tapTankButton;
var clearTankButton;


function setup() {

  createCanvas(600, 600).parent("canvas");
  //createCanvas(windowWidth*0.4, windowHeight*0.4).parent("canvas");

//Button setup
  pelletButton = createButton('Pellets').parent("buttons");
  pelletButton.position(width*.1, height*.31);
  pelletButton.mousePressed(makePellets);

  poisonButton = createButton('Poison').parent("buttons");
  poisonButton.position(width*.2, height*.31);
  poisonButton.mousePressed(makePoison);

  bigBoiButton = createButton('Bomb').parent("buttons");
  bigBoiButton.position(width*.3, height*.31);
  bigBoiButton.mousePressed(makeBigBois);

  tapTankButton = createButton('Tap the Tank').parent("buttons");
  tapTankButton.position(width*.1, height*.36);
  tapTankButton.mousePressed(tapTank);

  clearTankButton = createButton('Clear the Tank').parent("buttons");
  clearTankButton.position(width*.26, height*.36);
  clearTankButton.mousePressed(clearTank);

  goldfishButton = createButton('Goldfish').parent("buttons");
  goldfishButton.position(width*.1, height*.41);
  goldfishButton.mousePressed(makeGoldfish);

  piranhaButton = createButton('Piranha').parent("buttons");
  piranhaButton.position(width*.21, height*.41);
  piranhaButton.mousePressed(makePiranha);

  whaleButton = createButton('Whale').parent("buttons");
  whaleButton.position(width*.315, height*.41);
  whaleButton.mousePressed(makeWhale);

  dolphinButton = createButton('Dolphin').parent("buttons");
  dolphinButton.position(width*.405, height*.41);
  dolphinButton.mousePressed(makeDolphin);

  crabButton = createButton('Crab').parent("buttons");
  crabButton.position(width*.51, height*.41);
  crabButton.mousePressed(makeCrab);

  squidButton = createButton('Squid').parent("buttons");
  squidButton.position(width*.59, height*.41);
  squidButton.mousePressed(makeSquid);


//Makes an initial goldfish
  makeFish("Goldfish");

  //Makes an initial piranha
    makeFish("Piranha");

    //Makes an initial piranha
      makeFish("Dolphin");
}

function draw() {
//Backround
  background(113, 244, 255);
  fill(240);
  rect(0, 0, width, height*.3);

//randomly creates bubbles
  if(round(random(1, 60)) == 10)
  {
    bubbles.push(createBubble());
  }

//updates bubbles
  for(var b = 0; b<bubbles.length; b++)
  {
    bubbles[b].update();
    if(bubbles[b].dead == true)
    {
      bubbles.splice(b, 1);
    }
  }

//updates squids
  for(var s = 0; s<squid.length; s++)
  {
    squid[s].update();

    if(squid[s].dead == true)
    {
      squid.splice(s, 1);
    }
  }

 //Updates crab
  for(var c = 0; c<crab.length; c++){

    crab[c].update();

    //runs through each pellet
    for(var p = 0; p<pellet.length; p++)
    {
      //if its close to the crab, delete the pellet
    if(checkDistance(createVector(crab[c].loc.x, crab[c].loc.y+crab[c].radius), pellet[p].loc, crab[c].radius*.5) == true && crab[c].dying == false && crab[c].dead == false)
      {
        pellet.splice(p, 1);
      }
    }

  }

//Updates fish
  for(var f = 0; f<fish.length; f++){

    //updates the closest fish to another fish
    if(fish[f].needsNewcf == true)
    {
      //If there is a target fish
      if(findClosestGoldFish(f) != -1)
      {
        //Sets the target fish location
        fish[f].cfLoc = fish[findClosestGoldFish(f)].loc;
        fish[f].updatecf();
      }
    }

    //runs through each fish
    for(var fishHit = 0; fishHit<fish.length; fishHit++)
    {
      //If the two fish collide
      if(checkDistance(fish[fishHit].loc, fish[f].loc, fish[f].radius*.5) == true && fish[fishHit].dying == false && fish[f].dying == false && fish[f].dead == false && fish[fishHit].dead == false)
      {

        //If the fish hit is a piranha and the selected fish is goldfish
        if(fish[f].type == "Piranha" && fish[fishHit].type == "Goldfish")
        {

          fish[fishHit].dead = true
          fish[f].weight += fish[fishHit].weight*.25;

          //blood
          for(var x =0; x<30; x++)
              {
                particles.push(createExplosion());
                particles[particles.length-1].loc.x = fish[fishHit].loc.x;
                particles[particles.length-1].loc.y = fish[fishHit].loc.y;
              }



        }

        //If the fish hit is a whale and the selected fish is a piranha or a goldfish
        else if(fish[f].type == "Whale" && fish[fishHit].type == "Piranha" || fish[fishHit].type == "Goldfish" && fish[f].type == "Whale")
        {

          fish[fishHit].dead = true;
          fish[f].weight += fish[fishHit].weight*.25;

          //blood
          for(var x =0; x<30; x++)
              {
                particles.push(createExplosion());
                particles[particles.length-1].loc.x = fish[fishHit].loc.x;
                particles[particles.length-1].loc.y = fish[fishHit].loc.y;
              }


        }

        //If two fish hit that are the same
        else if(fish[f].name != fish[fishHit].name && fish[fishHit].type == fish[f].type && sameCollision == true)
        {

          //creates new fish with 10% chance
          // if(round(random(0, 9)) == 9)
          // {
          //   console.log("Breed :" + fish[f].type);
          //   makeFish(fish[f].type);
          // }
        }
      }
    }

//runs through pellets
    for(var p = 0; p<pellet.length; p++){

      //detects collisions
      if(checkDistance(pellet[p].loc, fish[f].loc, fish[f].radius) == true && fish[f].dying == false){
        if(pellet[p].type === "food")
        {
           fish[f].weight += 100;
            pellet[p].delete();
        }

        else if(pellet[p].type === "poison")
        {
            fish[f].weight -= 200;
          pellet[p].delete();
        }

        else if(pellet[p].type === "bigboi")
        {
             fish[f].dead = true;

            pellet[p].delete();

            //blood
            for(var x =0; x<30; x++)
            {
              particles.push(createExplosion());
              particles[particles.length-1].loc.x = fish[f].loc.x;
              particles[particles.length-1].loc.y = fish[f].loc.y;
            }

        }
      }
    }

  fish[f].update();

  if(fish[f].dead == true)
  {
    fish.splice(f, 1);
  }
  }

//Updates pellets
  for(var p = 0; p<pellet.length; p++){

    pellet[p].update();

    if(pellet[p].dead == true){
      pellet.splice(p, 1);
    }

  }

//Updates particles
  for(var p = 0; p<particles.length; p++){

    particles[p].update();

    if(particles[p].dead == true){
      particles.splice(p, 1);
    }

  }
}

//Returns true if distance between f1 and f2 < r
function checkDistance(f1, f2, r){
  if(r > sqrt(sq(f1.x - f2.x) + sq(f1.y - f2.y))  )
  {
    return true;
  }

  else
  {
    return false;
  }
}



function keyTyped(){
  if(key === ' ')
  {
    makeFish("Goldfish");
  }

  else if(key === 'f')
  {
    makePellets();
  }

   else if(key === 'c')
  {
    makeFish("Piranha");
  }

  else if(key === 'p')
  {
    makePoison();
  }

  else if(key === 'e')
  {
    makeBigBois();
  }
}



function makeFish(type){


  if(type == "Piranha")
  {
    makePiranha();
  }

  else if(type == "Whale")
  {
    //makeWhale();
    //I took this out because the whales are so large that they being to breed uncontrollably
  }

  else if(type == "Dolphin")
  {
    makeDolphin();
  }

  else
  {
    makeGoldfish();
  }
}



function makePiranha()
{
  fishID+=1;
  fish.push(createFish("Piranha", random(2, 6), 2600, 3000, 300));

  if(findClosestGoldFish(0) != -1)
  {
    fish[fish.length-1].cfLoc = fish[findClosestGoldFish(fish.length-1)].loc;
  }
  fish[fish.length-1].mouthColor = color(0, 0, 0);
  fish[fish.length-1].skin = color(random(170, 255), 0, 0);
  fish[fish.length-1].setup();
}

function makeGoldfish()
{
  fishID+=1;
  fish.push(createFish("Goldfish", random(1, 5), 2000, 2400, 270));
  fish[fish.length-1].setup();
}

function makeWhale()
{
  fishID+=1;
  fish.push(createFish("Whale", random(.5, 1),120000, 18000, 4000));
  fish[fish.length-1].setup();
}

function makeDolphin()
{
  fishID+=1;
  fish.push(createFish("Dolphin", random(2, 3),12000, 1800, 500));
  var blue = random(70, 170);
  fish[fish.length-1].skin = color(0, blue*.5, blue);
  fish[fish.length-1].mouthColor = color(0, blue*.5, blue);
  fish[fish.length-1].neckLength = 1.7;
  fish[fish.length-1].setup();
}

function makeCrab()
{
  fishID+=1
  crab.push(createCrab(1, 2000, 3000));
  crab[crab.length-1].setup();
}

function makeSquid()
{
  fishID+=1
  squid.push(createSquid(1, 2000, 3000));
  squid[squid.length-1].setup();
}

function makePellets()
{
  for (var i = 0; i<8; i++){
      pellet.push(createPellets());
      pellet[pellet.length-1].type = "food";
    }
}

function makePoison()
{
  for (var i = 0; i<8; i++){
     pellet.push(createPellets());
     pellet[pellet.length-1].type = "poison";
  }
}

function makeBigBois()
{
    for (var i = 0; i<8; i++){
     pellet.push(createPellets());
     pellet[pellet.length-1].type = "bigboi";
    }
}

//Finds the closest fish to the fish[index]
function findClosestGoldFish(index)
{
    var d = 10000000;
    var cf = -1; //If there are no other available fish, then returns -1
    for(var f = 0; f<fish.length; f++)
    {
          if(fish[f].dying == false && fish[f].type == "Goldfish" && sqrt(sq(fish[index].loc.x - fish[f].loc.x) + sq(fish[index].loc.y - fish[f].loc.y)) < d && sqrt(sq(fish[index].loc.x - fish[f].loc.x) + sq(fish[index].loc.y - fish[f].loc.y)) != 0)
          {
            d = sqrt(sq(fish[index].loc.x - fish[f].loc.x) + sq(fish[index].loc.y - fish[f].loc.y));
            cf = f;
          }
    }


    return cf;

}

function tapTank()
{
  for(var f = 0; f<fish.length; f++)
  {
    if(fish[f].dying == false)
    {
      fish[f].vel.mult(-1);
    }
  }
}


function clearTank(){
  for(var f = 0; f<fish.length; f++)
  {
    if(fish[f].atTop == true)
    {
      fish.splice(f, 1);
    }
  }

  for(var c = 0; c<crab.length; c++)
  {
    if(crab[c].dead == true)
    {
      crab.splice(c, 1);
    }
  }

  for(var p = 0; p<pellet.length; p++)
  {
    if(pellet[p].dead == true)
    {
      pellet.splice(p, 1);
    }
  }
}
