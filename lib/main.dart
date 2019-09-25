import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:myshare/pages/home.dart';

void main() {
  //ability to use timestamps in snapshots!!!
  Firestore.instance.settings(timestampsInSnapshotsEnabled: true).then((_) {
    //print("timestamps enabled in snapshots\n");
  }, onError: (_) {
    //print("there was an error enabling timestamps in snapshots");
  });
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'My Share',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.blueGrey,
        accentColor: Colors.pink[600],
      ),
      home: Home(),
    );
  }
}
