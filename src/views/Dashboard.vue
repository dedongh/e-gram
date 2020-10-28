<template>
    <div id="dashboard">
        <transition name="fade">
            <CommentModal v-if="showCommentModal" :post="selectedPost" @close="toggleCommentModal()"></CommentModal>
        </transition>
        <section>
            <div class="col1">
                <div class="profile">
                    <h5>{{userProfile.name}}</h5>
                    <p>@{{userProfile.title}}</p>
                    <p>@{{userProfile}}</p>
                    <div class="create-post">
                        <p>create a post</p>
                        <form @submit.prevent ref="form">
                            <textarea v-model.trim="post.content"></textarea>
                            <input type="file" @change="previewImage" accept="image/*" >
                            <p>Progress:
                                <progress id="progress" :value="uploadValue" max="100" ></progress>
                                {{uploadValue.toFixed()+"%"}}
                            </p>
                            <img height="300"  :src="picture" v-if="imageData != null" alt="...">
                            <button @click="createPost()" :disabled="post.content === ''" class="button">post</button>
                        </form>
                    </div>
                </div>
            </div>
            <div class="col2">
                <div v-if="posts.length">
                    <div v-for="post in posts" :key="post.id" class="post">
                        <h5>{{ post.userName }}</h5>
                        <span>{{ post.createdOn | formatDate }}</span>
                        <p>{{ post.content | trimLength }}</p>
                        <img v-if="post.photo" :src="post.photo" height="200" alt="...">
                        <ul>
                            <li><a @click="toggleCommentModal(post)">comments {{ post.comments }}</a></li>
                            <li><a @click="likePost(post.id, post.likes)">likes {{ post.likes }}</a></li>
                            <li><a @click="viewPost(post)">view full post</a></li>
                            <li><a  @click="deletePost(post)" style="color: red">delete</a></li>
                        </ul>
                    </div>
                </div>
                <div v-else>
                    <p class="no-results">There are currently no posts</p>
                </div>
            </div>
        </section>
        <!-- full post modal -->
        <transition name="fade">
            <div v-if="showPostModal" class="p-modal">
                <div class="p-container">
                    <a @click="closePostModal()" class="close">close</a>
                    <div class="post">
                        <h5>{{ fullPost.userName }}</h5>
                        <span>{{ fullPost.createdOn | formatDate }}</span>
                        <p>{{ fullPost.content }}</p>
                        <ul>
                            <li><a>comments {{ fullPost.comments }}</a></li>
                            <li><a>likes {{ fullPost.likes }}</a></li>
                        </ul>
                    </div>
                    <div v-show="postComments.length" class="comments">
                        <div v-for="comment in postComments" :key="comment.id" class="comment">
                            <p>{{ comment.userName }}</p>
                            <span>{{ comment.createdOn | formatDate }}</span>
                            <p>{{ comment.content }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
    import {mapState} from 'vuex'
    import moment from 'moment'
    import CommentModal from "../components/CommentModal";
    import {commentsCollection, postsCollection} from "../firebase";
    import * as fb from '../firebase'

    export default {
        name: "Dashboard",
        components: {
            CommentModal,
        },
        data: function () {
            return {
                post: {
                    content:'',
                    photo: ''
                },
                showCommentModal: false,
                selectedPost: {},
                likePost(id, likesCount) {
                    this.$store.dispatch('likePost', {id, likesCount})
                },
                showPostModal: false,
                fullPost: {},
                postComments: [],
                // image upload
                imageData: null,
                picture: null,
                uploadValue: 0

            }
        },
        computed: {
            ...mapState(['userProfile','posts']),
        },
        methods: {
            previewImage(event) {
                this.uploadValue = 0
                this.imageData = event.target.files[0]
                this.picture = window.URL.createObjectURL(this.imageData)
            },
            createPost() {

                const storageRef = fb.storage.ref('users/'+`${this.imageData.name}`).put(this.imageData)
                storageRef.on('state_changed', snapshot => {
                    this.uploadValue = (snapshot.bytesTransferred/snapshot.totalBytes)*100;
                }, error => {
                    console.log(error.message)
                },
                    () => {
                    this.uploadValue = 100
                        storageRef.snapshot.ref.getDownloadURL().then((url) => {
                            this.post.photo = url
                            this.$store.dispatch('createPost', {
                                content: this.post.content,
                                photo: url
                            })
                            this.post.content = ''
                            this.imageData = null
                            this.picture = ''
                            this.$refs.form.reset()
                        })
                    })
            },
            toggleCommentModal(post) {
                this.showCommentModal = !this.showCommentModal

                //set selected post
                if (this.showCommentModal) {
                    this.selectedPost = post;
                } else {
                    this.selectedPost = {}
                }
            },
            closePostModal() {
                this.postComments = []
                this.showPostModal = false
            },
            async deletePost(post) {
                if (fb.auth.currentUser.uid === post.userId) {
                    await postsCollection.doc(post.id).delete();
                } else {
                    alert("You can't delete this post...")
                }


            },
            async viewPost(post) {
                const docs = await commentsCollection.where('postId', '==', post.id).get()

                docs.forEach(doc => {
                    let comment = doc.data()
                    comment.id = doc.id
                    this.postComments.push(comment)
                })
                this.fullPost = post
                this.showPostModal = true
            }
        },
        filters: {
            formatDate(val) {
                if (!val) { return '-' }

                let date = val.toDate()
                return moment(date).fromNow()
            },
            trimLength(val) {
                if (val.length < 200) { return val }
                return `${val.substring(0, 200)}...`
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>