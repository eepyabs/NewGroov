import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@/utils/ThemeContext";
import { getDeezerGenres, getSongsByGenre } from "@/utils/deezerAPI";
import { saveSong } from "@/utils/StorageHelper";
import { Audio } from "expo-av";

const FindGenresScreen = () => {
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [songs, setSongs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [sound, setSound] = useState(null);
    const [offset, setOffset] = useState(0);
    const [allSongsLoaded, setAllSongsLoaded] = useState(false);
    const { isDarkMode } = useTheme();
    const navigation = useNavigation();

    useEffect(() => {
        fetchGenres();
    }, []);

    const fetchGenres = async () => {
        setIsLoading(true);
        try {
            const genreList = await getDeezerGenres();
            setGenres(genreList);
        } catch (error) {
            console.error("Error fetching genres: ", error);
            Alert.alert("Error", "Could not fetch genres. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSongs = async (genre, newOffset = 0) => {
        setIsLoading(true);
        if (newOffset === 0) {
            setSongs([]);
            setAllSongsLoaded(false);
        }
        setSelectedGenre(genre);

        try {
            const newSongs = await getSongsByGenre(genre.id, 10, newOffset);
            console.log("Fetching Songs: ", newSongs);

            if (!newSongs || newSongs.length === 0) {
                setAllSongsLoaded(true);
                return;
            }

            setSongs((prevSongs) => [...prevSongs, ...newSongs]);
            setOffset(newOffset + 10);
        } catch (error) {
            console.error("Error fetching songs: ", error);
            Alert.alert("Error", "Could not fetch songs for this genre.");
        } finally {
            setIsLoading(false);
        }
    };

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
            console.error("Error playing preview: ", error);
        }
    };

    const stopSong = async () => {
        if (sound) {
            try {
                await sound.stopAsync();
                await sound.unloadAsync();
            } catch (error) {
                console.error("Error stopping audio: ", error);
            } finally {
                setSound(null);
            }
        }
    };

    const handleAddSong = async (song) => {
        if (!selectedGenre) return;

        const songData = {
            title: song.title,
            artist: song.artist.name,
            albumCover: song.album.cover_medium || null,
            genre: selectedGenre.name,
        };

        try {
            await saveSong(selectedGenre.name, songData);
            Alert.alert("Success", `"${song.title}" added to ${selectedGenre.name}!`);
        } catch (error) {
            console.error("Failed to save song: ", error);
            Alert.alert("Error", "Could not add song. Try again.");
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? "#323231" : "#CCCCCC"}]}>
            <Text style={[styles.title, { color: isDarkMode ? "#79E872" : "#188D1E" }]}>
                Find Genres
            </Text>

            {isLoading && <ActivityIndicator size="large" color={isDarkMode ? "#79E872" : "#188D1E"} />}

            {!selectedGenre && (
                <FlatList
                    data={genres}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.genreButton}
                            onPress={() => fetchSongs(item)}
                        >
                            <Text style={[styles.genreText, { color: isDarkMode ? "black" : "white" }]}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}

            {selectedGenre && (
                <>
                    <Text style={[styles.subtitle, { color: isDarkMode ? "#79E872" : "#188D1E" }]}>
                        {selectedGenre?.name || "Unknown Genre"} Songs
                    </Text>
                    <FlatList
                        data={songs}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={[styles.songItem, { backgroundColor: isDarkMode ? "#666" : "#DDD" }]}>
                                {item.album?.cover_medium ? (
                                    <Image source={{ uri: item.album.cover_medium }} style={styles.albumCover} />
                                ) : (
                                    <View style={styles.albumCoverPlaceholder}>
                                        <Text style={[styles.noCoverText, { color: isDarkMode ? "white" : "black" }]}>No Cover</Text>
                                    </View>
                                )}
                                <View style={styles.songInfo}>
                                    <Text style={styles.songTitle}>{item.title}</Text>
                                    <Text style={styles.songArtist}>{item.artist.name}</Text>
                                    <TouchableOpacity style={styles.playButton} onPress={() => playPreview(item.preview)}>
                                        <Text style={styles.buttonText}>▶ Play Preview</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.addButton} onPress={() => handleAddSong(item)}>
                                        <Text style={styles.buttonText}>➕ Add to My Genres</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    />
                    {!allSongsLoaded && (
                        <TouchableOpacity style={styles.loadMoreButton} onPress={() => fetchSongs(selectedGenre, offset)}>
                            <Text style={styles.buttonText}>Load More</Text>
                        </TouchableOpacity>
                    )}
                </>
            )}

            <View style={styles.buttonContainer}>
                {selectedGenre && (
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: isDarkMode ? "#79E872" : "#188D1E" }]}
                        onPress={() => {
                            stopSong();
                            setSelectedGenre(null);
                            setSongs([]);
                            setOffset(0);
                            setAllSongsLoaded(false);
                        }}
                    >
                        <Text style={[styles.buttonText, { color: isDarkMode ? "black" : "white" }]}>Back to Genres</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[styles.genreListButton, { backgroundColor: isDarkMode ? "#79E872" : "#188D1E"}]}
                    onPress={() => navigation.navigate("GenreList")}
                >
                    <Text style={[styles.buttonText, { color: isDarkMode ? "black" : "white" }]}>Go to Your Genre List</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: "center",
    },
    buttonContainer: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: 80,

    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginVertical: 15,
    },
    genreButton: {
        backgroundColor: "#C564E8",
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        width: 300,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "black",
    },
    genreText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "white",
    },
    songItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        width: 350,
    },
    songInfo: {
        flex: 1,
        marginHorizontal: 10,
    },
    songTitle: {
        fontSize: 16,
        fontWeight: "bold",
        flexWrap: "wrap",
    },
    albumCover: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    playButton: {
        backgroundColor: "#007BFF",
        padding: 8,
        borderRadius: 5,
        marginVertical: 5,
    },
    addButton: {
        backgroundColor: "#FF6347",
        padding: 8,
        borderRadius: 5,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "white",
    },
    loadMoreButton: {
        backgroundColor: "#C564E8",
        padding: 10,
        borderRadius: 10,
        marginVertical: 10,
        alignItems: "center",
    },
    genreListButton: {
        padding: 5,
        borderRadius: 10,
        marginTop: 10,
        width: 100,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "black",
    },
    backButton: {
        padding: 5,
        borderRadius: 10,
        marginTop: 10,
        width: 100,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "black",
    },
});

export default FindGenresScreen;