import firebase from 'firebase';
  
const firebaseConfig = {
  apiKey: "AIzaSyDY7l6ris2zZ-AiTWj76nFRJQxYZNMiyj4",
  authDomain: "globaldiwali.firebaseapp.com",
  projectId: "globaldiwali",
  storageBucket: "globaldiwali.appspot.com",
  messagingSenderId: "413325831829",
  appId: "1:413325831829:web:3494929ca18869d0d5f59c"
};
  
firebase.initializeApp(firebaseConfig);
var auth = firebase.auth();
export {auth , firebase};