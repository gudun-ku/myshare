import 'package:flutter/material.dart';

AppBar header(context,
    {bool isAppTitle = false,
    String titleText,
    bool removeBackButton = false}) {
  return AppBar(
    automaticallyImplyLeading: removeBackButton ? false : true,
    title: Text(
      isAppTitle ? "MyShare" : titleText,
      style: isAppTitle
          ? TextStyle(
              color: Colors.white,
              fontFamily: "Signatra",
              fontSize: 50.0,
            )
          : TextStyle(
              color: Colors.white,
              fontFamily: "",
              fontSize: 24.0,
            ),
      overflow: TextOverflow.ellipsis,
    ),
    centerTitle: true,
    backgroundColor: Theme.of(context).accentColor,
  );
}
