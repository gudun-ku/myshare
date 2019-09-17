import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:fluttershare/widgets/header.dart';
import 'package:fluttershare/widgets/progress.dart';

final usersRef = Firestore.instance.collection('users');

class Timeline extends StatefulWidget {
  @override
  _TimelineState createState() => _TimelineState();
}

class _TimelineState extends State<Timeline> {
  List<dynamic> users = [];

  @override
  void initState() {
    deleteUser();
    createUser();
    updateUser();
    getUsers();
    super.initState();
  }

  deleteUser() async {
    final doc = await usersRef.document("asdafffddd").get();
    if (doc.exists) {
      usersRef.document().delete();
    }
  }

  createUser() async {
    final doc = await usersRef.document("asdafffddd").get();
    if (!doc.exists) {
      usersRef.document("asdafffddd").setData({
        "username": "Jeff",
        "postsCount": 0,
        "isAdmin": false,
      });
    }
  }

  updateUser() async {
    final doc = await usersRef.document("asdafffd").get();
    if (doc.exists) {
      doc.reference.updateData({
        "username": "Jonh",
        "postsCount": 33,
        "isAdmin": false,
      });
    }
  }

  getUsers() async {
    final QuerySnapshot snapshot = await usersRef     
        .getDocuments();

    setState(() {
      users = snapshot.documents;
    });
    snapshot.documents.forEach((DocumentSnapshot doc) {
      // print(doc.documentID);
      // print(doc.data);
      // print(doc.exists);
    });
  }

  @override
  Widget build(context) {
    return Scaffold(
      appBar: header(context, isAppTitle: true),
      body: StreamBuilder(
          stream: usersRef.snapshots(),
          builder: (context, snapshot) {
            if (!snapshot.hasData) {
              return circularProgress();
            }

            final children = snapshot.data.documents
                .map<Widget>((data) => _buildListItem(data))
                .toList();
            return Container(
              child: ListView(children: children),
            );
          }),
      // body: Container(
      //   child: ListView(
      //     children: users.map((user) => Text(user['username'])).toList(),
      //   ),
      // ),
    );
  }

  Widget _buildListItem(dynamic data) {
    return new ListTile(
      title: new Text(data['username']),
      subtitle: new Text("Class"),
    );
  }
}
