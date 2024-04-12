import React, { useState, useEffect } from "react";
import { View, Text, Button, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image } from "react-native";
import * as SQLite from "expo-sqlite";
import { Entypo } from "@expo/vector-icons";
import { Alert } from "react-native";

const DashboardScreen = ({ navigation }) => {
  const db = SQLite.openDatabase("tuto.db");
  const [notes, setNotes] = useState([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchNotes();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM notes",
        null,
        (txObj, resultSet) => {
          let sortedNotes = resultSet.rows._array.sort((a, b) => {
            // Tri par ordre d'importance
            const priorityOrder = { "Important": 1, "Normal": 2, "Pense bête": 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          });
          setNotes(sortedNotes);
        },
        (txObj, error) => console.log(error)
      );
    });
  };

  const deleteNote = (id) => {
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
                [id],
                (txObj, resultSet) => {
                  if (resultSet.rowsAffected > 0) {
                    fetchNotes();
                  }
                },
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

  const renderPriorityColor = (priority) => {
    switch (priority) {
      case "Important":
        return "#F45B69"; // Red color for Important priority
      case "Normal":
        return "#32CD32"; // Green color for Normal priority
      case "Pense bête":
        return "#7EE4EC"; // Blue color for Pense bête priority
      default:
        return "#000000"; // Default color
    }
  };

  const handleNotePress = (note) => {
    navigation.navigate("Note", { note });
  };

  const handleSearch = (text) => {
    setSearchText(text);
  };

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const showNotes = () => {
    if (filteredNotes.length === 0) {
      // Afficher l'image et le message lorsque la liste de notes est vide
      return (
        <View style={styles.emptyNotesContainer}>
          <Image source={require('./images/bienvenue.png')} style={styles.welcomeImage} />
          <Text style={styles.emptyNotesText}>No notes available</Text>
        </View>
      );
    } else {
      return filteredNotes.map((note) => {
        return (
          <TouchableOpacity
            key={note.id}
            style={[styles.noteContainer, { borderColor: renderPriorityColor(note.priority) }]}
            onPress={() => handleNotePress(note)}
          >
            <Text style={styles.noteDate}>Date: {formatDate(note.created_at)}</Text>
            <Text style={styles.noteTitle}>{note.title}</Text>
            <View style={styles.deleteButtonContainer}>
              <TouchableOpacity onPress={() => deleteNote(note.id)}>
                <Entypo name="trash" size={20} color={"#ff3b30"} />
              </TouchableOpacity>
            </View>
            <Text style={styles.noteContent}>{note.description}</Text>
            <View style={[styles.priorityContainer, { backgroundColor: renderPriorityColor(note.priority) }]}>
              <Text style={styles.priorityText}>{note.priority}</Text>
            </View>
            <View style={styles.editButtonContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate("Form", { note })}
                style={styles.editButton}
              >
                <Entypo name="edit" size={20} color={"#114B5F"} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        );
      });
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher..."
        onChangeText={handleSearch}
        value={searchText}
        placeholderTextColor="#999" // Couleur du texte de l'placeholder
      />
      <ScrollView>{showNotes()}</ScrollView>
      <TouchableOpacity onPress={() => navigation.navigate("Form")} style={styles.addButton}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  searchInput: {
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    color: "#333", 
  },
  noteContainer: {
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    position: "relative", 
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  noteDate: {
    marginBottom: 5,
    color: "#666",
  },
  noteContent: {
    fontSize: 16,
    marginBottom: 5,
    color: "#666",
  },
  priorityContainer: {
    borderRadius: 5,
    alignSelf: "flex-start",
    marginBottom: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  priorityText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
  },
  deleteButtonContainer: {
    position: "absolute",
    top: 5,
    right: 5,
    zIndex: 999, 
  },
  editButtonContainer: {
    position: "absolute",
    bottom: 5,
    right: 5,
    zIndex: 999, 
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#456990",
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  addButtonText: {
    fontSize: 24,
    color: "#fff",
  },
  emptyNotesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeImage: {
    width: 200,
    height: 200,
  },
  emptyNotesText: {
    marginTop: 20,
    fontSize: 18,
    color: "#666",
  },
});

export default DashboardScreen;
