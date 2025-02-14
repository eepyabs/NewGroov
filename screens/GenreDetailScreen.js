import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert, ActivityIndicator, Image, TouchableOpacity } from "react-native";
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { getSongsByGenre, deleteSong } from '@/utils/StorageHelper';
import { Audio } from 'expo-av';

const GenreDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { genre } = route.params || {};

    const [songs, setSongs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [sound, setSound] = useState(null);

    const fetchUserSongs = async () => {
        setIsLoading(true);
        try {
            const savedSongs = await getSongsByGenre(genre);
            setSongs(savedSongs || []);
        } catch (error) {
            console.error("❌ Error fetching saved songs:", error);
            Alert.alert("Error", "Failed to fetch songs for this genre.");
        } finally {
            setIsLoading(false);
        }
    };

    // 🔄 **Re-fetch songs when screen is focused**
    useFocusEffect(
        useCallback(() => {
            fetchUserSongs();
        }, [genre])
    );

    const playPreview = async (previewUrl) => {
        if (!previewUrl) {
            Alert.alert("Preview Unavailable", "This song does not have a preview.");
            return;
        }

        await stopSong();

        try {
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: previewUrl },
                { shouldPlay: true }
            );
            setSound(newSound);
        } catch (error) {
            console.error("❌ Error playing preview:", error);
        }
    };

    const stopSong = async () => {
        if (sound) {
            try {
                await sound.stopAsync();
                await sound.unloadAsync();
            } catch (error) {
                console.error("❌ Error stopping audio:", error);
            } finally {
                setSound(null);
            }
        }
    };

    const handleDeleteSong = async (song) => {
        Alert.alert(
            "Delete Song",
            `Are you sure you want to delete "${song.title}" from ${genre}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: async () => {
                        try {
                            await deleteSong(genre, song);

                            // 🔄 **Force fresh fetch after deletion**
                            fetchUserSongs();

                            Alert.alert("Success", `"${song.title}" deleted successfully!`);
                        } catch (error) {
                            console.error("❌ Error deleting song:", error);
                            Alert.alert("Error", "Failed to delete the song.");
                        }
                    },
                    style: "destructive",
                },
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.songItem}>
            {item.albumCover && <Image source={{ uri: item.albumCover }} style={styles.albumCover} />}
            <View style={styles.songInfo}>
                <Text style={styles.songTitle}>{item.title}</Text>
                <Text style={styles.songArtist}>{item.artist}</Text>
                <View style={styles.buttonContainer}>
                    {item.preview && (
                        <TouchableOpacity style={styles.previewButton} onPress={() => playPreview(item.preview)}>
                            <Text style={styles.buttonText}>▶ Play</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteSong(item)}>
                        <Text style={styles.buttonText}>🗑 Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#66BEBA" />
                <Text style={styles.loadingText}>Loading songs...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Genre: {genre || "Unknown Genre"}</Text>
            {songs.length > 0 ? (
                <FlatList
                    data={songs}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => item.id?.toString() || `song-${index}`}
                />
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No songs found in this genre.</Text>
                </View>
            )}
            <Button
                title="Back to Genres"
                onPress={() => {
                    stopSong();
                    navigation.goBack();
                }}
                color="#66BEBA"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: 'black',
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        color: '#66BEBA',
    },
    songItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#444",
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        width: 500,
        minHeight: 100,
    },
    albumCover: {
        width: 70,
        height: 70,
        borderRadius: 8,
        marginRight: 15,
    },
    songInfo: {
        flex: 1,
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    songTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: '#66BEBA',
    },
    songArtist: {
        fontSize: 14,
        color: "#ccc",
        marginBottom: 5,
    },
    buttonContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 5,
    },
    previewButton: {
        backgroundColor: "#66BEBA",
        padding: 6,
        borderRadius: 5,
        marginRight: 10,
    },
    deleteButton: {
        backgroundColor: "#FF6347",
        padding: 6,
        borderRadius: 5,
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
    },
});

export default GenreDetailScreen;
