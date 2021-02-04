// Flamelink-oppsettet ligger i egen fil (init-flamelink.js)

// hent inn referanser til html-element
let projectContainer = document.querySelector('#project_container');

// hent id fra url
const queryString = window.location.search; // "?id=asdfasdfasdf"
const urlParams = new URLSearchParams(queryString);
const id = urlParams.get('id');

if(id) {
  app.content.get({
    schemaKey: 'project', // navnet på schema-et ditt i Flamelink
    entryId: id, // det er denne som gjør at du henter data for ett prosjekt (med angitt id)
    populate: [{ // uten populate for bildefelt, får man ikke med bildedataen (se https://flamelink.github.io/flamelink-js-sdk/#/content)
      field: 'mainImage', // navn på bildefeltet i Flamelink
      size: { // her kan du angi størrelsen på bildet du får returnert
        height: 9999,
        quality: 1,
        width: 667
      }
    }]
  })
  .then(project => {
    let html = `
      <div class="${project.themeColour || 'project-blue'}">
        <div class="top-banner">
          <h1>${project.projectTitle}</h1>
          <img src="${project.mainImage[0].url}" class="main-project-image">
        </div>
        ${ project.linkToWebsite ? `<a href="${project.linkToWebsite}" target="_blank">Link til prosjekt-nettsiden</a>` : "" }
        <p>${project.introText}</p>
      </div>
      `;

    projectContainer.innerHTML = html;
  })
  .catch(error => { console.error('Det skjedde en feil', error); })
}
else {
  projectsContainer.innerHTML = "Fant ikke prosjekt-ID :/";
}
