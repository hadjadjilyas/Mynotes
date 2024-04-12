import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, TouchableWithoutFeedback,
  Keyboard, Alert } from "react-native";
import * as SQLite from "expo-sqlite";
import { FontAwesome } from '@expo/vector-icons'; 

const FormScreen = ({ navigation, route }) => {
  const db = SQLite.openDatabase("tuto.db");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [showPriorityOptions, setShowPriorityOptions] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, priority TEXT DEFAULT 'Normal', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);",
        [],
        () => console.log("Table 'notes' created successfully with priority column."),
        (txObj, error) => console.log(error)
      );
    });

    if (route.params?.note) {
      setTitle(route.params.note.title);
      setDescription(route.params.note.description);
      setPriority(route.params.note.priority);
    }
  }, [route.params?.note]);

  const saveNote = () => {
    if (!title.trim() || !description.trim()) {
      setError("Please fill in both title and description fields.");
      return;
    }

    db.transaction((tx) => {
      if (route.params?.note) {
        tx.executeSql(
          "UPDATE notes SET title = ?, description = ?, priority = ? WHERE id = ?",
          [title, description, priority, route.params.note.id],
          () => navigation.navigate("Dashboard"),
          (txObj, err) => console.log(err)
        );
      } else {
        tx.executeSql(
          "INSERT INTO notes (title, description, priority) VALUES (?, ?, ?)",
          [title, description, priority],
          () => navigation.navigate("Dashboard"),
          (txObj, err) => console.log(err)
        );
      }
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.descriptionInput]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <Text style={styles.error}>{error}</Text>
      <TouchableOpacity
        onPress={() => setPriority("Normal")}
        style={[styles.priorityButton, priority === "Normal" ? styles.selectedPriority : null]}
      >
        <FontAwesome name="circle" size={24} color={priority === "Normal" ? "#2ecc71" : "#ccc"} style={styles.priorityIcon} />
        <Text style={styles.priorityButtonText}>Normal</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setPriority("Important")}
        style={[styles.priorityButton, priority === "Important" ? styles.selectedPriority : null]}
      >
        <FontAwesome name="circle" size={24} color={priority === "Important" ? "#F45B69" : "#ccc"} style={styles.priorityIcon} />
        <Text style={styles.priorityButtonText}>Important</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setPriority("Pense bête")}
        style={[styles.priorityButton, priority === "Pense bête" ? styles.selectedPriority : null]}
      >
        <FontAwesome name="circle" size={24} color={priority === "Pense bête" ? "#7EE4EC" : "#ccc"} style={styles.priorityIcon} />
        <Text style={styles.priorityButtonText}>Pense bête</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.saveButton} onPress={saveNote} disabled={!title.trim() || !description.trim()}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  input: {
    width: "100%",
    height: 40,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: "top",
  },
  priorityButton: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 40,
    marginBottom: 20,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9",
  },
  selectedPriority: {
    backgroundColor: "#007aff",
  },
  priorityIcon: {
    marginRight: 10,
  },
  priorityButtonText: {
    fontSize: 16,
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#007aff",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  saveButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
});

export default FormScreen;
