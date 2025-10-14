class Header extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
      this.innerHTML = `
      <div class="base_padding header">
        <div class="w3-row">
            <div class="name">
                Alex Sheen
            </div>
        </div>

        <div class="w3-row">
            <div class="title">
                Computer Science | Media Arts & Design
            </div>
        </div>

        <div class="w3-row">
            <div class="links">
                <a href="/">CS</a><span></span>
                <a href="/art.html">Art</a><span></span>
                <a href = "mailto: alexsheen@uchicago.edu">Email</a>
            </div>
        </div>
    </div>
      `;
    }
  }
  
  customElements.define('header-component', Header);

  class HeaderWhite extends HTMLElement {
    constructor() {
      super();
    }
  
    // connectedCallback() {
    //   this.innerHTML = `
    //   <div class="base_padding header">
    //         <div class="w3-row">
    //             <div class="name white_text">
    //                 Alex Sheen
    //             </div>
    //         </div>

    //         <div class="w3-row">
    //             <div class="title white_text">
    //                 Computer Science | Media Arts & Design
    //             </div>
    //         </div>

    //         <div class="w3-row">
    //             <div class="links white_text">
    //                 <a href="/">CS</a><span></span>
    //                 <a href="/art.html">Art</a><span></span>
    //                 <a href = "mailto: alexsheen@uchicago.edu">Email</a>
    //             </div>
    //         </div>
    //     </div>
    //   `;
    // }
    connectedCallback() {
          this.innerHTML = `
            <div class="w3-row header">
                <div class="name white_text">
                <a href="/">Alex Sheen</a><span></span>
                </div>
            </div>
          `;
        }
  }
  
  customElements.define('header-component-white', HeaderWhite);