import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Entypo } from "@expo/vector-icons";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("tuto.db");
const NoteScreen = ({ route, navigation }) => {
  const { note } = route.params;

  const handleEditNote = () => {
    navigation.navigate("Form", { note });
  };

  const handleDeleteNote = () => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            db.transaction((tx) => {
              tx.executeSql(
                "DELETE FROM notes WHERE id = ?",
                [route.params.note.id],
                () => navigation.navigate("Dashboard"),
                (txObj, err) => console.log(err)
              );
            });
          },
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.noteContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{note.title}</Text>
        </View>
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{note.description}</Text>
        </View>
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.editButton} onPress={handleEditNote}>
          <Entypo name="edit" size={24} color="#114B5F" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteNote}>
          <Entypo name="trash" size={24} color="#FF6347" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  noteContainer: {
    flex: 1,
  },
  titleContainer: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#456990",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  descriptionContainer: {
    marginTop: 20,
  },
  description: {
    fontSize: 18,
    color: "#444",
    lineHeight: 24,
  },
  metaContainer: {
    marginTop: 20,
  },
  metaText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  editButton: {
    marginRight: "auto",
  },
  deleteButton: {
    marginLeft: "auto",
  },
});

export default NoteScreen;
