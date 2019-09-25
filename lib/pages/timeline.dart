import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:fluttershare/models/user.dart';
import 'package:fluttershare/pages/search.dart';
import 'package:fluttershare/widgets/header.dart';
import 'package:fluttershare/widgets/post.dart';
import 'package:fluttershare/widgets/progress.dart';

import 'home.dart';

final usersRef = Firestore.instance.collection('users');

class Timeline extends StatefulWidget {
  final User currentUser;

  Timeline({this.currentUser});

  @override
  _TimelineState createState() => _TimelineState();
}

class _TimelineState extends State<Timeline> {
  List<Post> posts;
  List<String> followingList = [];

  @override
  void initState() {
    super.initState();
    getTimeLine();
    getFollowing();
  }

  getTimeLine() async {
    QuerySnapshot snapshot = await timeLineRef
        .document(widget.currentUser.id)
        .collection('timeLinePosts')
        .orderBy('timestamp', descending: true)
        .getDocuments();
    List<Post> posts =
        snapshot.documents.map((doc) => Post.fromDocument(doc)).toList();
    setState(() {
      this.posts = posts;
    });
  }

  getFollowing() async {
    QuerySnapshot snapshot = await followingRef
        .document(currentUser.id)
        .collection('userFollowing')
        .getDocuments();
    setState(() {
      followingList = snapshot.documents.map((doc) => doc.documentID).toList();
    });
  }

  buildTimeLine() {
    if (posts == null) {
      return circularProgress();
    } else if (posts.isEmpty) {
      return buildUsersToFollow();
    } else {
      return ListView(
        children: this.posts,
      );
    }
  }

  buildUsersToFollow() {
    //realtime updates - use stream builder
    return StreamBuilder(
      stream:
          usersRef.orderBy('timestamp', descending: true).limit(10).snapshots(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return circularProgress();
        }
        List<UserResult> userResults = [];
        snapshot.data.documents.forEach((doc) {
          User user = User.fromDocument(doc);
          if (!(currentUser.id == user.id || followingList.contains(user.id))) {
            userResults.add(UserResult(user));
          }
        });
        //snapshot.data.documents.map((doc) => User.fromDocument(doc) as UserResult).toList();
        return Container(
          color: Theme.of(context).accentColor.withOpacity(0.2),
          child: Column(
            children: <Widget>[
              Container(
                padding: EdgeInsets.all(12.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: <Widget>[
                    Icon(Icons.person_add,
                        color: Theme.of(context).primaryColor, size: 30.0),
                    SizedBox(
                      width: 8.0,
                    ),
                    Text(
                      "Users to follow",
                      style: TextStyle(
                          color: Theme.of(context).primaryColor,
                          fontSize: 30.0),
                    ),
                  ],
                ),
              ),
              Column(
                children: userResults,
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(context) {
    return Scaffold(
      appBar: header(context, isAppTitle: true),
      body: RefreshIndicator(
        onRefresh: () => getTimeLine(),
        child: buildTimeLine(),
      ),
    );
  }

  Widget _buildListItem(dynamic data) {
    return new ListTile(
      title: new Text(data['username'] ?? "No name"),
      subtitle: new Text("Class"),
    );
  }
}
