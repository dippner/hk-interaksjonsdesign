// Legg inn deres data her (som dere fikk fra Firebase-oppsettet)
var firebaseConfig = {
	apiKey: "...",
	authDomain: "...",
	projectId: "...",
	storageBucket: "...",
	messagingSenderId: "...",
	appId: "..."
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// init database
const database = firebase.firestore();

// init autorisering
const auth = firebase.auth();

// hent inn referanser til html-elementer (ikke firebase-relatert)
// knapper:
let logInBtn = document.querySelector('#log_in_btn');
let signUpBtn = document.querySelector('#sign_up_btn');
let logOutBtn = document.querySelector('#log_out_btn');
let addBtn = document.querySelector('#add_item_btn');
// containere:
let signInContainer = document.querySelector('.sign-in-container');
let todosContainer = document.querySelector('.todos-container');
let todos = document.querySelector('.todos'); // forelder-elementet til alle todo-ene
// tekstfelt
let textField = document.querySelector('#todo_text');
let authForm = document.querySelector('#auth_form');
let emailField = document.querySelector('#email');
let passwordField = document.querySelector('#password');
let username = document.querySelector('#username');
// firestore-relatert:
let todosRef = database.collection('todos'); // referanse til todo-ene våre
let unsubscribe;
// annet:
let loggedInUserId = "";

// onAuthStateChanged "lytter" på endringer i autoriseringsstatusen
auth.onAuthStateChanged(user => {
	if (user) { // bruker er logget inn
		username.textContent = user.email;
		loggedInUserId = user.uid;
		// skjul <form>, vis todos
		todosContainer.style.display = 'block';
		signInContainer.style.display = 'none';

		// lytt på endringer i databasen
		unsubscribe = todosRef
			.where('uid', '==', user.uid)
			.onSnapshot(querySnapshot => {
				// lag html-elementer fra hvert av dokumentene (todo-ene) vi får fra databasen
				// og legg denne html-en i todos-containeren (div)
				const todosFromDB = querySnapshot.docs.map(doc => `
					<div class="item">
						<button class="delete-btn" data-docid="${doc.id}">Slett</button>
						<button class="completed-btn ${doc.data().completed ? 'completed' : ''}" data-docid="${doc.id}">Done</button>
						<span>${doc.data().text}</span>
					</div>`);
				todos.innerHTML = todosFromDB.join('');
			});
	}
	else { // bruker er logget ut
		// slutt å lytte på endringer i databasen
		unsubscribe && unsubscribe();

		// skjul todos, vis <form>
		todosContainer.style.display = 'none';
		signInContainer.style.display = 'block';
	}
});

// Legge til todo
addBtn.addEventListener('click', event => {
	let label = textField.value;
	textField.value = "";
	if (label) {
		let todoObject = {
			text: label,
			completed: false,
			uid: loggedInUserId
		};
		todosRef.add(todoObject)
			.then(docRef => { console.log('Vi fikk lagret en ny todo med id ', docRef.id); })
			.catch(error => console.log('Noe gikk galt: ', error));
			// (lag gjerne en visuell tilbakemelding til brukeren i form av
			// en liten popup e.l. ved success/failure hvis dere har tid)
	}
});

// slette todo og complete todo
todos.addEventListener('click', event => {
	// hvis du trykket på delete-btn
	if (event.target.className === "delete-btn") {
		let docId = event.target.dataset.docid;

		todosRef.doc(docId).delete()
			.then(() => { console.log('Du fikk slettet todo-en'); })
			.catch(error => { console.log('Noe gikk galt ved sletting: ', error); });
	}

	// hvis man trykket på completed-btn
	if (event.target.classList.contains("completed-btn")) {
		let docId = event.target.dataset.docid;
		let setCompleted;
		if (event.target.classList.contains('completed')) // (prøv gjerne å gjøre denne om til ternary expression)
			setCompleted = false;
		else
			setCompleted = true;

		todosRef.doc(docId).update({ completed: setCompleted })
			.then(() => console.log('Todo ble oppdatert'))
			.catch(error => console.error('Det skjedde en feil'));
	}
});

// hindre <form> i å laste inn siden på nytt når den blir sendt inn (submit)
authForm.addEventListener('submit', e => { e.preventDefault(); });

// registrer ny bruker
signUpBtn.addEventListener('click', e => {
	let email = emailField.value;
	let password = passwordField.value;
	if (email && password) {
		auth.createUserWithEmailAndPassword(email, password)
			.then(data => {
				console.log('data', data);
				emailField.value = "";
				passwordField.value = "";
			})
			.catch(error => { console.error('error', error); });
			// todo: lag tilbakemelding til brukeren
	}
});

// logg inn eksisterende bruker
logInBtn.addEventListener('click', e => {
	let email = emailField.value;
	let password = passwordField.value;

	if (email && password) {
		auth.signInWithEmailAndPassword(email, password)
			.then(data => {
				console.log('data', data);
				emailField.value = "";
				passwordField.value = "";
			})
			.catch(error => { console.error('error', error); });
			// todo: lag tilbakemelding til brukeren
	}
});

// logg ut bruker
logOutBtn.addEventListener('click', () => {
	auth.signOut();
	todos.innerHTML = "";
});


// Regler for Firestore (Cloud Firestore -> Rules) for å sikre at en bruker
// bare redigerer sine egne todos:

/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }

    match /todos/{docId} {
    	allow write: if request.auth.uid == request.resource.data.uid;
      allow read, delete: if request.auth.uid == resource.data.uid;
    }
  }
}
*/

// Forklaring:
// request.auth.uid -> bruker-id i requesten vår
// request.resource.data.uid -> bruker-id på todo-objektet vi sender med for lagring
// resource.data.uid -> bruker-id på dokumentene (todo-ene) i databasen