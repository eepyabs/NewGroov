import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { useTheme } from '../utils/ThemeContext';

const dancingCatGif = require('../images/dancing_cat.gif');

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
                if (song.album && song.album.id) {
                    const albumResponse = await fetch(`https://api.deezer.com/album/${song.album.id}`);
                    if (albumResponse.ok) {
                        const albumData = await albumResponse.json();
                        genreName = albumData?.genres?.data?.[0]?.name || "Unknown Genre";
                    }
                }
            } catch (genreError) {
                console.error(`Error fetching genre for song: ${song.title}`, genreError);
            }

            return {
                id: song.id ? song.id.toString() : `unknown-${Math.random().toString(36).substr(2, 9)}`,
                title: song.title || "Unknown Title",
                artist: song.artist?.name || "Unknown Artist",
                albumCover: song.album?.cover_medium || null,
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
    const [showGif, setShowGif] = useState(true);

    const logoSource = isDarkMode
        ? require('../images/logo_dark.png')
        : require('../images/logo_light.png');

    const handleShare = async () => {
        if (songTitle.trim() !== '') {
            setShowGif(false);
            setIsLoading(true);
            const suggestions = await fetchSongSuggestions(songTitle);
            setSongSuggestions(suggestions);
            setIsLoading(false);
        }
    };

    const handleSongSelect = async (song) => {
        if (sound) {
            await stopSong();
        }

        console.log("saving song: ", song);
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
            <TouchableOpacity
                style={[styles.quizButton, { backgroundColor: isDarkMode ? "#C564E8" : "#BB2BF4" }]}
                onPress={() => navigation.navigate('QuizScreen')}
            >
                <Text style={[styles.quizButtonText, { color: isDarkMode ? "black" : "white" }]}>Can't Decide❓</Text>
            </TouchableOpacity>
            <Image source={logoSource} style={styles.logo} />

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
            <TouchableOpacity style={[styles.button, { backgroundColor: isDarkMode ? '#ED5CB1' : '#CF3890' }]} onPress={handleShare}>
                <Text style={[styles.buttonText, { color: isDarkMode ? "black" : "white" }]}>Search for a Song!</Text>
            </TouchableOpacity>

            {showGif && (
                <Image source={dancingCatGif} style={styles.gif} resizeMode="contain" />
            )}

            {isLoading ? (
                <ActivityIndicator size="large" color="79E872" />
            ) : (
                <FlatList
                    data={songSuggestions}
                    renderItem={({ item }) => (
                        <View style={[styles.songItem, { backgroundColor: isDarkMode ? "#444" : "#DDD" }]}>
                            <Image source={{ uri: item.albumCover }} style={styles.albumCover} />
                            <View style={styles.songInfo}>
                                <Text style={[styles.songTitle, { color: isDarkMode ? "black" : "white" }]}>{item.title}</Text>
                                <Text style={[styles.songArtist, {color: isDarkMode ? "black" : "white"}]}>{item.artist}</Text>

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

           <View style={styles.bottomButtonContainer}>
            <TouchableOpacity
                style={[styles.bottomButton, {
                    backgroundColor: isDarkMode ? "#C564E8" : "#BB2BF4"
                }]}
                onPress={async () => {
                    await stopSong();
                    navigation.replace('GenreList');
                }}
            >
                <Text style={[styles.buttonText, { color: isDarkMode ? "black" : "white" }]}>Go to Genre List</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.bottomButton, {
                    backgroundColor: isDarkMode ? "#79E872" : "#188D1E"
                }]}
                onPress={() => navigation.navigate('FindGenres')}
            >
                <Text style={[styles.buttonText, { color: isDarkMode ? "black" : "white" }]}>🔍 Find Genres</Text>
            </TouchableOpacity>
           </View>
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
    bottomButtonContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    quizButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'black',
        zIndex: 999,
    },
    quizButtonText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    logo: {
        width: 250,
        height: 250,
        position: 'absolute',
        top: 50,
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
    gif: {
        width: 200,
        height: 200,
        marginBottom: 100,
    },
    button: {
        padding: 10,
        borderRadius: 10,
        borderWidth: 2,
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
        backgroundColor: '#188D1E',
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
    bottomButton: {
        padding: 10,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'black',
        width: '48%',
        alignItems: 'center',
    },
});

export default SongRecommendationScreen;
