function addiction() {
    window.location.href = "addiction.html";
}

function alice() {
    window.location.href = "alice.html";
}

function datamosh() {
    window.location.href = "datamosh.html";
}

function d3() {
    window.location.href = "d3.html";
}

function reel() {
    window.location.href = "reel.html";
}

function spook_world_1() {
    window.location.href = "spook-world-1.html";
}

function spook_youtube() {
    window.location.href = "https://www.youtube.com/watch?v=r2pNrH2odog";
}

function tree() {
    window.location.href = "../code/tree/index.html";
}

function toggleSound(img)
{
   console.log(img.src);
   if(img.src == "https://alex-sheen.github.io/assets/images/muted.png") {
       img.src = "/assets/images/unmuted.png";
   }
   else {
       img.src = "/assets/images/muted.png";
   }
   var video=document.getElementById("vid");
   video.muted = !video.muted;
}
