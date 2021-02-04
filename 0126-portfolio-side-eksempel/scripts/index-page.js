// Flamelink-oppsettet ligger i egen fil (init-flamelink.js)

// hent inn referanser til html-elementer
let projectsContainer = document.querySelector('#projects_container');

app.content.get({
	schemaKey: 'project', // navnet på schema-et ditt
	populate: [{
		field: 'mainImage',
		size: {
			height: 9999,
			quality: 1,
			width: 375
		}
	}]
})
.then(projects => {
	let html = "";

	for(const property in projects) {
		let proj = projects[property];

		html += `
		<a class="project-listing" href="/project.html?id=${proj.id}">
			<h2>${proj.projectTitle}</h2>
			<img src="${ proj.mainImage[0].url }">
		</a>
		`;
	}

	projectsContainer.innerHTML = html;
})
.catch(error => {console.error('Det skjedde en feil', error);})
