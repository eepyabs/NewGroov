import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { saveSong } from '@/utils/StorageHelper';

const AddSongScreen = ({ route, navigation }) => {
    const rawSong = route.params?.song || {title: "Untitled", artist: "Unknown Artist"};
    const genre = route.params?.genre || "Miscellaneous";

    const handleSave = async () => {
        const song = (() => {
            if (typeof rawSong === "string") {
                const [title, artist] = rawSong.split(" by ").map((s) => s.trim());
                return {
                    title: title || "Untitled",
                    artist: artist || "Unknown Artist",
                };
            }
            return {
                title: rawSong.title?.trim() || "Untitled",
                artist: rawSong.artist?.trim() || "Unknown Artist",
            };
        })();
        try {
            await saveSong(genre.trim(), song);
            Alert.alert("Success", "Song saved successfully!");
            navigation.navigate("GenreList");
        } catch (error) {
            console.error("Failed to save the song:", error);
            Alert.alert("Error", "An error occurred while saving the song.");
        }
    };
    
    const displaySong = typeof rawSong === "string"
        ?{
            title: rawSong.split(" by ")[0]?.trim() || "Untitled",
            artist: rawSong.split(" by ")[1]?.trim() || "Unknown Artist",
        }
        : {
            title: rawSong.title?.trim() || "Untitled",
            artist: rawSong.artist?.trim() || "Unknown Artist",
        };
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add Song</Text>
            <Text style={styles.subtitle}>Song: {displaySong.title}</Text>
            <Text style={styles.subtitle}>Artist: {displaySong.artist}</Text>
            <Text style={styles.subtitle}>Genre: {genre}</Text>
            <TouchableOpacity style={styles.roundButton} onPress={handleSave}>
                <Text style={styles.roundButtonText}>Save Song</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#323231",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#66BEBA",
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 10,
        color: "#66BEBA",
    },
    roundButton: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#59045C",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        borderWidth: 5,
        borderColor: "black",
        marginTop: 20,
    },
    roundButtonText: {
        color: "#66BEBA",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },
});

export default AddSongScreen;