
class ProjectCard extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const img = this.getAttribute("img") || "";
        const imgOnClick = this.getAttribute("imgOnClick") || "";
        const title = this.getAttribute("title") || "";
        const description = this.getAttribute("description") || "";
        const imgObjectPosition = this.getAttribute("imgObjectPosition") || "50% 50%";
        
        this.innerHTML = `
        <div class="w3-row">
            <div class="project_box">
                <img src="${img}" class="project_image" style="width:100%; object-position: ${imgObjectPosition};" onclick="${imgOnClick}">
                <div class="project_box_desc white_text">
                    ${title}

                    <div class="project_box_sub_desc">
                        ${description}
                    </div>
                </div>
            </div>
        </div>
        `;
    }
}

customElements.define('project-card', ProjectCard);

class ProjectCardVideo extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const video = this.getAttribute("video") || "";
        const videoOnClick = this.getAttribute("videoOnClick") || "";
        const title = this.getAttribute("title") || "";
        const description = this.getAttribute("description") || "";
        
        this.innerHTML = `
        <div class="w3-row">
            <div class="project_box">
                <video class="project_image videoembedded" muted loop playsinline onclick="${videoOnClick}"
                onmouseover="this.play();" onmouseout="this.pause();"
                >
                    <source src="${video}" type="video/mp4" style="width:100%">
                    Your browser does not support the video tag.
                </video>
                <div class="project_box_desc white_text">
                    ${title}

                    <div class="project_box_sub_desc">
                        ${description}
                    </div>
                </div>
            </div>
        </div>
        `;
    }
}

customElements.define('project-card-video', ProjectCardVideo);