{(
  async () => {
    const cachedData = localStorage.getItem("mhaList")
    let sagas = cachedData ? JSON.parse(cachedData) : null;

    if (!sagas) {
      let response = await fetch('https://cdn.statically.io/gh/cpxcristian/_nonsenseprojects@develop/nonsensecdns/mh.list.json')
      sagas = await response.json();
      localStorage.setItem("mhaList", JSON.stringify(sagas));
    }

    const list = {};
    const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);
    [...document.querySelectorAll('.post-body a')].filter(el => /Cap[ií]tulo/i.test(el.textContent)).map(el=>{
      const chapter = el.textContent.substring(el.textContent.search(/Cap[ií]tulo/i) + 9);
      const isHtml = el.href.includes('.html');
      if (!isNaN(chapter) && isHtml) {
        list[chapter] = el.href
      }
    });
    const displayContent = (params) => {
      let content = '';
      params.forEach((el) => {
        content += `
          <details id="menu-${el.range_chapters !== undefined ? el.range_chapters : ''}">
            <summary>
              ${el.range_chapters !== undefined ? el.range_chapters : '+'} ${el.name} ${el.chapters !== undefined ? el.chapters.length : ''}
            </summary>
            <section>
        `
        if (el.data !== undefined) {
          content += displayContent(el.data)
        } else {
          const [rI, rE] = el.range_chapters.split("-").map(Number);
          content += `
            <ul>`;
          for (ch of range(rI, rE)) {
            if (Number(ch) > Object.keys(list).length) {
              content += `</ul>`.replaceAll('>,', '>')
              break;
            }
            content += `
            <li>
              <span 
                class="item-link" 
                role="link" 
                id="chapter-${ch}" 
                data-link="${list[ch]}"
                onClick="openElement(this)"
                ondblclick="window.open(this.dataset.link, '_blank')"
              >
                Capítulo-${ch}
              </span>
            </li>`
          }
          content += `</ul>`.replaceAll('>,', '>')
        }
        content += `</section></details>`
      })
      return content
    }
    document.querySelector('body').innerHTML=`
      <nav id="sidebar" class="col-12 col-xl-2">
        <section class="list">${displayContent(sagas)}</section>
        <button class="floating-button" id="hide-sidebar" onclick="hideSidebar(this)">x</button>
        <button class="floating-button" id="floating-button-prev" onclick="openPrev(this)"><</button>
        <button class="floating-button" id="floating-button-next" onclick="openNext(this)">></button>
      </nav>
      <section id="content" class="col d-md-block"></section>
    `

    window.addCSS = css => document.head.appendChild(document.createElement("style")).innerHTML=css;

    addCSS(`body{font-size:18px!important;height:99vh!important;display:flex!important;padding:0!important;min-height:initial!important}#sidebar{height:100vh;position:relative!important;z-index:99}#sidebar .list{overflow:hidden scroll;height:100%}.col-2{flex:0 0 auto;width:16.66666667%}.col-12{flex:0 0 auto;width:100%}.col{flex:1 0 0%;width:100%}.d-none{display:none!important}details{cursor:pointer;padding-left:12px}details>summary:hover{color:#c60}.item-link{color:#f4a900}.item-link.selected,.item-link:hover{color:#c60}.floating-button{position:absolute;width:26px;height:45px;top:0;right:-26px;width:26px;border-radius:0 8px 8px 0;display:flex;align-items:center;text-align:center;padding-left:8px;cursor:pointer;border:none}#hide-sidebar{background-color:gray;color:#fff!important}#floating-button-prev{background-color:gray;color:#fff!important;top:calc(50vh);right:-26px}#floating-button-next{background-color:gray;color:#fff!important;top:calc(50vh);left:calc(100vw - 26px);border-radius:8px 0 0 8px}.hidden{width:0!important;height:0!important;display:block!important}@media (max-width:767px){#hide-sidebar{right:0!important;transform:scaleX(-1)}#sidebar #floating-button-next,#sidebar #floating-button-prev{display:none}.hidden #floating-button-next,.hidden #floating-button-prev{display:block!important}.hidden #hide-sidebar{right:-26px!important;transform:scaleX(1)}}@media (min-width:768px){.d-md-block{display:block!important}}@media (min-width:1200px){.col-xl-2{flex:0 0 auto;width:16.66666667%}}`)
  }
)()}

window.hideSidebar = window.hideSidebar !== undefined ? window.hideSidebar : (param) =>  {
  let c = param.closest('#sidebar');
  if (!c.classList.contains('hidden')) {
    c.classList.remove('col-2')
    c.classList.add('hidden')
    document.querySelector('#content').classList.remove('d-none')
  } else {
    c.classList.add('col-2')
    c.classList.remove('hidden')
    document.querySelector('#content').classList.add('d-none')
  }
}

window.openElement = window.openElement !== undefined ? window.openElement : (el)=>{
  const link = el.dataset.link;
  const id = el.id.replace('chapter-','');

  document.querySelectorAll('span.item-link').forEach(el=>el.classList.remove('selected'))
  if (el) {
    el.classList.add('selected')
    el.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest'
    })
    el.closest('details').open = true
    el.closest('details').closest('details').open = true
  }
  history.replaceState(null, null, `${window.location.origin}${window.location.pathname}?chapter=${id}`)
  document.querySelector('#content').innerHTML = `<embed src="${link}" style="width:100%;height:100%;">`
}

window.getChapter = window.getChapter !== undefined ? window.getChapter : () => {
  let params = new URLSearchParams(document.location.search);
  let chapter = params.get('chapter');

  if (chapter == undefined) {
    chapter = 1;
  }
  return chapter;
}

window.openPrev = window.openPrev !== undefined ? window.openPrev : (param) => {
  let chapter = window.getChapter();
  if (chapter == 1) {
    return;
  }
  const prev = Number(chapter) - 1;
  const el = document.querySelector(`.item-link#chapter-${prev}`)
  window.openElement(el)
}

window.openNext = window.openNext !== undefined ? window.openNext : (param) => {
  let chapter = window.getChapter();
  const next = Number(chapter) + 1;
  const el = document.querySelector(`.item-link#chapter-${next}`)
  window.openElement(el)
}

