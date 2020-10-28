import * as firebase from "firebase/app";
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

const firebaseConfig = {
    apiKey: 'AIzaSyCWNl2BdwQbBkq8Pvj1s_n0ecMbALoJu7U',
    authDomain: 'kasa-7da25.firebaseapp.com',
    databaseURL: 'https://kasa-7da25.firebaseio.com',
    projectId: 'kasa-7da25',
    storageBucket: 'kasa-7da25.appspot.com',
    messagingSenderId: '756276944787',
    appId: '1:756276944787:web:c85cfc733040a9d1045266'
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