import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

const firebaseConfig = {
   // Seus dados do Firebase aqui.
};

firebase.initializeApp(firebaseConfig);

export default firebase;
