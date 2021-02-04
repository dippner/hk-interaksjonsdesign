// (Denne filen er bare for å initialisere Firebase og Flamelink)

// Legg inn deres data her (som dere fikk fra Firebase-oppsettet)
var firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);

// det er denne dere bruker når dere skal hente data (app.content.get(), etc)
const app = flamelink({
  firebaseApp,
  dbType: 'cf' // cloud firestore
});