import Vue from 'vue'
import Vuex from 'vuex'
import * as fb from '../firebase'
import router from "../router/index";

Vue.use(Vuex)

// realtime firebase connection
fb.postsCollection.orderBy('createdOn','desc').onSnapshot(snapshot => {
  let postsArray = []

  // loop through the array of objects
  snapshot.forEach(doc => {
    //grab the data from the object
    let post = doc.data()

    // assign an id to each post
    post.id = doc.id

    postsArray.push(post)
  })

  // commit a mutation to update the state
  store.commit('setPosts', postsArray)
})

const store = new Vuex.Store({
  state: {
    userProfile: {},
    posts: []
  },
  mutations: {
    setUserProfile(state, val) {
      state.userProfile = val
    },
    setPosts(state, val) {
      state.posts = val
    }
  },
  actions: {
    async login({dispatch}, form) {
      // sign in user
      try {
        const {user} = await fb.auth.signInWithEmailAndPassword(form.email, form.password)

        //fetch user profile and set in state
        dispatch('fetchUserProfile', user)
      }catch (e) {
        alert(e.message)
      }

    },

    async fetchUserProfile({commit}, user) {
      // fetch user profile
      const userProfile = await fb.usersCollection.doc(user.uid).get()

      // set user profile in state
      commit('setUserProfile', userProfile.data())

      // change route to dashboard
      if (router.currentRoute.path === '/login') {
        router.push('/')
      }
    },
    async signup({dispatch}, form) {
      // sign user up
      const { user } = await fb.auth.createUserWithEmailAndPassword(form.email, form.password)

      // create user profile object in userCollections
      await fb.usersCollection.doc(user.uid).set({
        name: form.name,
        title: form.title
      })

      // fetch user profile and set in state
      dispatch('fetchUserProfile', user)
    },
    async logout({commit}) {
      await fb.auth.signOut()

      // clear user profile and redirect to login
      commit('setUserProfile', {})
      router.push('/login')
    },
    async createPost({state, commit}, post) {
      await fb.postsCollection.add({
        createdOn: new Date(),
        content: post.content,
        userId: fb.auth.currentUser.uid,
        userName: state.userProfile.name,
        comments: 0,
        likes: 0
      }).catch(error => {
        alert(error.message)
      })
    },

    async likePost({commit}, post) {
      const userID = fb.auth.currentUser.uid
      const docId = `${userID}_${post.id}`

      // check if user has liked post
      const doc = await fb.likesCollection.doc(docId).get()
      if (doc.exists) { return }
      // create post
      await fb.likesCollection.doc(docId).set({
        postId: post.id,
        userId: userID
      })
      // update post likes count
      await fb.postsCollection.doc(post.id).update({
        likes: post.likesCount + 1
      })
    },
    async updateProfile({ dispatch }, user) {
      const userId = fb.auth.currentUser.uid
      // update user object
      const userRef = await fb.usersCollection.doc(userId).update({
        name: user.name,
        title: user.title
      })

      dispatch('fetchUserProfile', { uid: userId })

      // update all posts by user
      const postDocs = await fb.postsCollection.where('userId', '==', userId).get()
      postDocs.forEach(doc => {
        fb.postsCollection.doc(doc.id).update({
          userName: user.name
        })
      })

      // update all comments by user
      const commentDocs = await fb.commentsCollection.where('userId', '==', userId).get()
      commentDocs.forEach(doc => {
        fb.commentsCollection.doc(doc.id).update({
          userName: user.name
        })
      })
    }
    },
  modules: {
  }
})

export default store