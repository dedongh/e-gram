import * as firebase from "firebase/app";
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

const firebaseConfig = {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
}
firebase.initializeApp(firebaseConfig)

// utils
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// collection references
const usersCollection = db.collection('users')
const postsCollection = db.collection('posts')
const commentsCollection = db.collection('comments')
const likesCollection = db.collection('likes')

// export utils/refs
export {
    db,
    auth,
    storage,
    usersCollection,
    postsCollection,
    commentsCollection,
    likesCollection
}
