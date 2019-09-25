const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
exports.onCreateFollower = functions.firestore
  .document("/followers/{userId}/userFollowers/{followerId}")
  .onCreate(async (snapshot, context) => {
    console.log("Follower created", snapshot.data());
    const userId = context.params.userId;
    const followerId = context.params.followerId;

    // 1) create followed user's posts ref
    const followedUserPostsRef = admin
      .firestore()
      .collection('posts')
      .doc('userId')
      .collection('userPosts');
    // 2) create following users' timeline ref
    const timelinePostsRef = admin
      .firestore()
      .collection('timeline')
      .doc(followerId)
      .collection('timeLinePosts');

    // 3) get followed user posts
    const querySnapshot = await followedUserPostsRef.get();

    // 4) add each user posts to the timeline (might be changed)
    querySnapshot.forEach(doc => {
      if (doc.exists) {
        const postId = doc.id;
        const postData = doc.data();
        timelinePostsRef.doc(postId).set(postData);
      }
    });
  });

exports.onDeleteFollower = functions.firestore
  .document("/followers/{userId}/userFollowers/{followerId}")
  .onDelete(async (snapshot, context) => {
    console.log("Follower deleted", snapshot.id);

    const userId = context.params.userId;
    const followerId = context.params.followerId;

    // we don't need all user posts, only timeline 
    // create following users' timeline ref where
    const timelinePostsRef = admin
      .firestore()
      .collection('timeline')
      .doc(followerId)
      .collection('timeLinePosts')
      .where("ownerId", "==", userId);

    const querySnapshot = await timelinePostsRef.get();
    querySnapshot.forEach(doc => {
      if (doc.exists) {
        doc.ref.delete();
      }
    });
  });