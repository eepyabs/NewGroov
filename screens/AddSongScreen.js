import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import { saveSong } from '@/utils/StorageHelper';

const AddSongScreen = ({ route, navigation }) => {
    const rawSong = route.params?.song || {title: "Untitled", artist: "Unknown Artist"};
    const genre = route.params?.genre || "Miscellaneous";
    const song = typeof rawSong === "string" ? { title: rawSong.split(" by ")[0].trim(), artist: rawSong.split(" by ")[1]?.trim() || "Unknown Artist" }
    : {
        title: rawSong.title || "Untitled",
        artist: rawSong.artist || "Unknown Artist",
    };

    const handleSave = async () => {
        try {
            await saveSong(genre.trim(), song);
            Alert.alert("Success", "Song saved successfully!");
            navigation.navigate("GenreList");
        } catch (error) {
            console.error("Failed to save the song:", error);
            Alert.alert("Error", "An error occurred while saving the song.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add Song</Text>
            <Text style={styles.subtitle}>Song: {song.title}</Text>
            <Text style={styles.subtitle}>Artist: {song.artist}</Text>
            <Text style={styles.subtitle}>Genre: {genre}</Text>
            <Button title="Save Song" onPress={handleSave} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 10,
    },
});

export default AddSongScreen;