// Flamelink-oppsettet ligger i egen fil (init-flamelink.js)

// hent inn referanser til html-elementer
let projectsContainer = document.querySelector('#projects_container');
let overlay = document.querySelector('#overlay');
let overlayContent = document.querySelector('#overlay_content');
let body = document.querySelector('body');
let projectsArray = [];

app.content.get({
  schemaKey: 'project', // navnet på schema-et ditt i Flamelink
  populate: [{ /// uten populate for bildefelt, får man ikke med bildedataen (se https://flamelink.github.io/flamelink-js-sdk/#/content)
    field: 'mainImage', // navn på bildefeltet i Flamelink
    size: { // her kan du angi størrelsen på bildet du får returnert
      height: 9999,
      quality: 1,
      width: 375
    }
  }]
})
.then(projects => {
  let html = "";

  for (const property in projects) {
    let proj = projects[property];
    projectsArray.push(proj); // legg hvert prosjekt i projectsArray, slik at vi kan hente dataen derfra når vi skal lage html for overlay
    html += `
    <a class="project-listing" href="#" data-id="${proj.id}">
      <h2>${proj.projectTitle}</h2>
      <img src="${proj.mainImage[0].url}">
    </a>
    `;
  }

  projectsContainer.innerHTML = html;

  let projectListItems = document.querySelectorAll('.project-listing');
  // Når vi trykker på et prosjekt, ønsker vi å lage html for det aktuelle prosjektet
  // og legge den html-en i overlay. Og så åpne overlay.

  projectListItems.forEach(item => {
    item.addEventListener('click', (e) => {
      // e.preventDefault();
      let idFromLink = item.dataset.id;
      openOverlay(idFromLink);
    })
  })
})
.catch(error => { console.error('Det skjedde en feil', error); })

// funksjon som lager html for det aktuelle prosjektet, legger denne html-en i overlay
// og så åpner overlay (og legger en class på body som hindrer rar scrolling).
// (Dere kan også lage én overlay per prosjekt og bruke javascript til å veksle mellom disse)
function openOverlay(projectId) {
  let activeProject = projectsArray.find(el => el.id === projectId);

  if(activeProject) {
    let html = `
      <div class="${activeProject.themeColour || 'project-blue'}">
        <div class="top-banner">
          <h1>${activeProject.projectTitle}</h1>
          <img src="${activeProject.mainImage[0].url}" class="main-project-image">
        </div>
        <div class="project-content">
          ${activeProject.linkToWebsite ? `<a href="${activeProject.linkToWebsite}" target="_blank">Link til prosjekt-nettsiden</a>` : ""}
          <p>${activeProject.introText}</p>
        </div>
      </div>
    `;
    overlayContent.innerHTML = html;
    overlay.classList.add('open');
    body.classList.add('overlay-open');
  }
}

function closeOverlay() {
  overlayContent.innerHTML = "";
  overlay.classList.remove('open');
  body.classList.remove('overlay-open');
}

document.querySelector('#close_overlay').addEventListener('click', closeOverlay);