function addiction() {
    window.location.href = "/video/addiction.html";
}

function alice() {
    window.location.href = "/video/alice.html";
}

function artml() {
    window.location.href = "/video/artmachineintelligence/sketch3.html";
}

function datamosh() {
    window.location.href = "/video/datamosh.html";
}

function d3() {
    window.location.href = "/video/d3.html";
}

function field2() {
    window.location.href = "/video/field2.html";
}

function formCode() {
    window.location.href = "/video/formCode.html";
}

function greece() {
    window.location.href = "/video/greece.html";
}

function greece_video() {
    window.location.href = "https://youtu.be/ixlhGLY-BeQ";
}

function lovely() {
    window.location.href = "/video/lovely.html"
}

function rabbithole() {
    window.location.href = "/video/rabbithole.html";
}

function spook_world_1() {
    window.location.href = "/video/spook-world-1.html";
}

function spook_youtube() {
    window.location.href = "https://www.youtube.com/watch?v=r2pNrH2odog";
}

function tree() {
    window.location.href = "/code/tree/index.html";
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