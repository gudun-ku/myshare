const functions = require("firebase-functions");
const admin = require("firebase-admin");
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
      .collection("posts")
      .doc(userId)
      .collection("userPosts");
    // 2) create following users' timeline ref
    const timelinePostsRef = admin
      .firestore()
      .collection("timeline")
      .doc(followerId)
      .collection("timeLinePosts");

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
      .collection("timeline")
      .doc(followerId)
      .collection("timeLinePosts")
      .where("ownerId", "==", userId);

    const querySnapshot = await timelinePostsRef.get();
    querySnapshot.forEach(doc => {
      if (doc.exists) {
        doc.ref.delete();
      }
    });
  });

//when a post is created, add post to a timeline of each follower  (of the post owner)
exports.onCreatePost = functions.firestore
  .document("/posts/{userId}/userPosts/{postId}")
  .onCreate(async (snapshot, context) => {
    console.log("Post created", snapshot.id);
    const postCreated = snapshot.data();
    const userId = context.params.userId;
    const postId = context.params.postId;

    // 1) get all the followers of the user who made the post
    const userFollowersRef = admin.firestore()
      .collection("followers")
      .doc(userId)
      .collection("userFollowers");

    const querySnapshot = await userFollowersRef.get();
    // add new post to each followers timeline
    querySnapshot.forEach(doc => {
      const followerId = doc.id;
      admin
        .firestore()
        .collection("timeline")
        .doc(followerId)
        .collection("timelinePosts")
        .doc(postId)
        .set(postCreated);
    });
  });

//when a post is delete
exports.onUpdatePost = functions.firestore
  .document("/posts/{userId}/userPosts/{postId}")
  .onUpdate(async (change, context) => {
    console.log("Post updated", snapshot.id);
    const postUpdated = change.after.data();
    const userId = context.params.userId;
    const postId = context.params.postId;

    // 1) get all the followers of the user who made the post
    const userFollowersRef = admin.firestore()
      .collection("followers")
      .doc(userId)
      .collection("userFollowers");

    const querySnapshot = await userFollowersRef.get();
    // Update each post to each followers timeline
    querySnapshot.forEach(doc => {
      const followerId = doc.id;
      admin
        .firestore()
        .collection("timeline")
        .doc(followerId)
        .collection("timelinePosts")
        .doc(postId)
        .get()
        .then(doc => {
          if (doc.exists) {
            doc.ref.update(postUpdated);
          }
        });
    });
  });

exports.onDeletePost = functions.firestore
  .document("/posts/{userId}/userPosts/{postId}")
  .onDelete(async (snapshot, context) => {
    console.log("Post deleted", snapshot.id);

    const userId = context.params.userId;
    const postId = context.params.postId;

    // 1) get all the followers of the user who made the post
    const userFollowersRef = admin.firestore()
      .collection("followers")
      .doc(userId)
      .collection("userFollowers");

    const querySnapshot = await userFollowersRef.get();
    // Update each post to each followers timeline
    querySnapshot.forEach(doc => {
      const followerId = doc.id;
      admin
        .firestore()
        .collection("timeline")
        .doc(followerId)
        .collection("timelinePosts")
        .doc(postId)
        .get()
        .then(doc => {
          if (doc.exists) {
            doc.ref.delete();
          }
        });
    });
  });

//send push notifications

exports.onCreateActivityFeedItem = functions.firestore
  .document("/feed/{userId}/feedItems/{activityFeedItem}")
  .onCreate(async (snapshot, context) => {
    console.log("Activity feed item created", snapshot.data());

    // 1) get the user connected to the feed
    const userId = context.params.userId;
    const userRef = admin.firestore().doc(`users/${userId}`);
    const doc = await userRef.get();

    // 2) once we have user, check if they have a notification token;
    // send notification if they have the token
    const createdActivityFeedItem = snapshot.data();
    const androidNotificationToken = doc.data().androidNotificationToken;
    if (androidNotificationToken) {
      // send notification
      sendNotification(androidNotificationToken, createdActivityFeedItem);
    } else {
      console.log("No token for user, can't send notification");
    }

    // 3) create function to make message text depends on event type
    function sendNotification(androidNotificationToken, activityFeedItem) {
      let body;

      //switch body value based on notification type
      switch (activityFeedItem.type) {
        case "comment":
          body = `${activityFeedItem.username} replied : 
                  ${activityFeedItem.commentData}`;
          break;
        case "like":
          body = `${activityFeedItem.username} liked your post`;
          break;
        case "follow":
          body = `${activityFeedItem.username} followed you`;
          break;
        default:
          break;
      }

      // 4) create message for push notification
      const message = {
        notification: { body },
        token: androidNotificationToken,
        data: { recipient: userId }
      };

      // 5) send message
      admin
        .messaging()
        .send(message)
        .then(response => {
          // response is a message ID string
          console.log("Succesfully send message", response);
        })
        .catch(err => {
          console.log("Error sending message", err);
        });
    }
  });
