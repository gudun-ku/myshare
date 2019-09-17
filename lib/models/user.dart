import 'package:cloud_firestore/cloud_firestore.dart';

class User {
  final String id;
  final String username;
  final String email;
  final String photoUrl;
  final String diplayName;
  final String bio;


  User({
    this.id,
    this.username,
    this.email,
    this.photoUrl,
    this.diplayName,
    this.bio,
  });


  factory User.fromDocument(DocumentSnapshot doc)  {
    return User(
      id: doc['id'],
      email: doc['email'],
      username: doc['username'],
      photoUrl: doc['photoUrl'],
      diplayName: doc['displayName'],
      bio: doc['bio'],
    );
  }
}


