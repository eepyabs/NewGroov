import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { useTheme } from '../utils/ThemeContext';

const fetchSongSuggestions = async (songTitle) => {
    try {
        const response = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(songTitle)}`);

        if (!response.ok) {
            throw new Error(`Error fetching songs: ${response.statusText}`);
        }

        const data = await response.json();

        const songs = await Promise.all(data.data.map(async (song) => {
            let genreName = "Unknown Genre";
            
            try {
                // Fetch the genre from the album details
                const albumResponse = await fetch(`https://api.deezer.com/album/${song.album.id}`);
                if (albumResponse.ok) {
                    const albumData = await albumResponse.json();
                    genreName = albumData?.genres?.data?.[0]?.name || "Unknown Genre";
                }
            } catch (genreError) {
                console.error(`Error fetching genre for song: ${song.title}`, genreError);
            }

            return {
                id: song.id.toString(),
                title: song.title,
                artist: song.artist.name,
                albumCover: song.album.cover_medium || null,
                previewUrl: song.preview || null,
                genre: genreName,
            };
        }));

        return songs;
    } catch (error) {
        console.error('Error in fetchSongSuggestions:', error);
        return [];
    }
};

const SongRecommendationScreen = ({ navigation }) => {
    const [songTitle, setSongTitle] = useState('');
    const [songSuggestions, setSongSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [sound, setSound] = useState(null);
    const { isDarkMode } = useTheme();

    const handleShare = async () => {
        if (songTitle.trim() !== '') {
            setIsLoading(true);
            const suggestions = await fetchSongSuggestions(songTitle);
            setSongSuggestions(suggestions);
            setIsLoading(false);
        }
    };

    const handleSongSelect = async (song) => {
        await stopSong();
        navigation.navigate('AddSong', { song, genre: song.genre }); 
    };

    const playPreview = async (previewUrl) => {
        await stopSong();
        if (!previewUrl) {
            Alert.alert("Preview Unavailable", "This song does not have a preview.");
            return;
        }
        try {
            await Audio.setIsEnabledAsync(true);

            const response = await fetch(previewUrl, { method: 'HEAD'});

            if (!response.ok) {
                throw new Error(`Invalid preview URL: ${previewUrl}`);
            }
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: previewUrl },
                { shouldPlay: true }
            );
            setSound(newSound);
        } catch (error) {
            console.error('Error playing preview:', error);
        }
    };

    const stopSong = async () => {
        if (sound) {
            try {
                await sound.stopAsync();
                await sound.unloadAsync();
            } catch (error) {
                console.error('Error stopping audio:', error);
            } finally {
                setSound(null);
            }
        }
    };    

    useFocusEffect(
        React.useCallback(() => {
            return () => stopSong();  
        }, [])
    );

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? "#323231" : "#CCCCCC" }]}>
            <Image source={require('../images/logo.png')} style={styles.logo} />

            <Text style={[styles.title, { color: isDarkMode ? "#79E872" : "#188D1E" }]}>
                Find your NewGroov!
            </Text>

            <TextInput
                style={[styles.input, {backgroundColor: isDarkMode ? "#91908F" : "#FFFFFF", color: isDarkMode ? "#FFFFFF" : "#000" }]}
                placeholder="Enter song title"
                placeholderTextColor={isDarkMode ? "#DDD" : "#666"}
                value={songTitle}
                onChangeText={setSongTitle}
            />
            <TouchableOpacity style={styles.button} onPress={handleShare}>
                <Text style={styles.buttonText}>Search for Suggestions</Text>
            </TouchableOpacity>

            {isLoading ? (
                <ActivityIndicator size="large" color="79E872" />
            ) : (
                <FlatList
                    data={songSuggestions}
                    renderItem={({ item }) => (
                        <View style={[styles.songItem, { backgroundColor: isDarkMode ? "#444" : "#DDD" }]}>
                            <Image source={{ uri: item.albumCover }} style={styles.albumCover} />
                            <View style={styles.songInfo}>
                                <Text style={[styles.songTitle, { color: isDarkMode ? "white" : "black" }]}>{item.title}</Text>
                                <Text style={[styles.songArtist, {color: isDarkMode ? "white" : "black"}]}>{item.artist}</Text>

                                <TouchableOpacity style={styles.playButton} onPress={() => playPreview(item.previewUrl)}>
                                    <Text style={[styles.playButtonText, { color: isDarkMode ? "black" : "white" }]}>▶ Play Preview</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.selectButton} onPress={() => handleSongSelect(item)}>
                                    <Text style={[styles.SelectButtonText, { color: isDarkMode ? "black" : "white" }]}>✔ Select Song</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    keyExtractor={(item) => item.id}
                />
            )}

            <TouchableOpacity
                style={styles.button}
                onPress={async () => {
                    await stopSong();
                    navigation.replace('GenreList');
                }}
            >
                <Text style={styles.buttonText}>Go to Genre List</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 20,
    },
    logo: {
        width: 200,
        height: 200,
        position: 'absolute',
        top: 100,
        alignSelf: 'center',
    },
    title: {
        fontSize: 24,
        fontFamily: 'Lobster',
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop: 300,
        marginLeft: 10,
    },
    input: {
        width: '80%',
        height: 40,
        borderWidth: 1,
        paddingLeft: 10,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#C564E8',
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'white',
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: '#79E872',
        fontSize: 16,
        fontWeight: 'bold',
    },
    songItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        width: 300,
        minHeight: 150,
    },
    albumCover: {
        width: 90,
        height: 90,
        borderRadius: 8,
        marginRight: 15,
    },
    songInfo: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    songTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    songArtist: {
        fontSize: 14,
        marginBottom: 5,
    },
    playButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 8,
    },
    playButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    selectButton: {
        backgroundColor: '#FF6347',
        paddingVertical: 4,
        paddingHorizontal: 4,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 8,
    },
    SelectButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SongRecommendationScreen;
