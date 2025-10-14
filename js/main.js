function back() {
    window.location.href = "../index.html";
}

function back_code_1() {
    window.location.href = "../code.html";
}

function back_code_2() {
    window.location.href = "../../code.html";
}

function video_to_code() {
    window.location.href = "../code/code.html";
}

function code() {
    window.location.href = "code.html";
}

function github() {
    window.location.href = "https://github.com/alex-sheen";
}

function video() {
    window.location.href = "../video/reel.html";
}

function video_2() {
    window.location.href = "../../video/reel.html";
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});