import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert } from "react-native";
import { useRoute, useNavigation } from '@react-navigation/native';
import { getSongsByGenre, deleteSong } from '../utils/StorageHelper';

const GenreDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { genre } = route.params || {};
    const [songs, setSongs] = useState([]);

    useEffect(() => {
        if (genre) {
            const fetchSongs = async () => {
                const genreSongs = await getSongsByGenre(genre);
                setSongs(genreSongs || []);
            };
            fetchSongs();
        }
    }, [genre]);

    const handleDeleteSong = async (song) => {
        Alert.alert(
            "Delete Song",
            `Are you sure you want to delete "${song.title}" from ${genre}?`,
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    onPress: async () => {
                        try{
                            await deleteSong(genre, song);
                            setSongs((prevSongs) =>
                                prevSongs.filter(
                                    (item) => 
                                        item.title.toLowerCase() !== song.title.toLowerCase() || 
                                        item.artist.toLowerCase() !== song.artist.toLowerCase()
                                )
                            );
                        } catch (error) {
                            console.error("Error deleting song:", error);
                        }
                    },
                    style: "destructive",
                },
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.songItem}>
            <Text style={styles.songTitle}>{item.title}</Text>
            <Text style={styles.songArtist}>{item.artist}</Text>
            <Button
                title="Delete"
                onPress={() => handleDeleteSong(item)}
                color="#FF6347"
            />
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Genre: {genre || "Unknown Genre"}</Text>
            {songs.length > 0 ? (
                <FlatList
                    data={songs}
                    renderItem={renderItem}
                    keyExtractor={(item) => `${item.title.toLowerCase()}-${item.artist.toLowerCase()}`}
                />
            ): (
                <Text>No songs found in this genre.</Text>
            )}
            <Button
                title="Back to Genres"
                onPress={() => navigation.goBack()}
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
        padding: 10,
        borderBottomColor: "#ccc",
        borderBottomWidth: 1,
        width: "100%",
    },
    songTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: '#66BEBA',
    },
    songArtist: {
        fontSize: 14,
        color: "#555",
    }
});


export default GenreDetailScreen;