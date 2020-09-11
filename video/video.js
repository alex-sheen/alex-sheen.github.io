function datamosh() {
    window.location.href = "datamosh.html";
}

function spook_world_1() {
    window.location.href = "spook-world-1.html";
}

function spook_youtube() {
    window.location.href = "https://www.youtube.com/watch?v=r2pNrH2odog";
}

function toggleSound(img)
{
   img.src= img.src=="/assets/images/unmuted.png" ? "/assets/images/muted.png" : "/assets/images/unmuted.png";
   var video=document.getElementById("vid");
   video.muted = !video.muted;
}
