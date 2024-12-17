import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Buffer } from 'buffer';
import { saveSong } from '../utils/StorageHelper';

const getSpotifyAccessToken = async () => {
    const clientId = '3e4c690e51954611b47b9d26b8ad1540';
    const clientSecret = '9728de64de00412ab0f0d89072951af7';
    const authString = `${clientId}:${clientSecret}`;
    const encodedAuth = Buffer.from(authString).toString('base64');

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${encodedAuth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
        });

        if (!response.ok) {
            throw new Error(`Error fetching access token: ${response.statusText}`);
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Error in getSpotifyAccessToken:', error);
        throw error;
    }
};

const fetchSongSuggestions = async (songTitle) => {
    try {
        const accessToken = await getSpotifyAccessToken();

        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(songTitle)}&type=track&limit=5`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Error fetching songs: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("API Response Data:", data);

        const songs = await Promise.all(
            data.tracks.items.map(async (track) => {
                console.log("Track Artists:", track.artists);
            
                const artist = track.artists?.[0];
                const artistName = artist?.name || 'Unknown Artist';

                let genre = 'Unknown Genre';
                if (artist) {
                    const artistResponse = await fetch(
                        `https://api.spotify.com/v1/artists/${artist.id}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${accessToken}`,
                            },
                        }
                    );

                    if (artistResponse.ok) {
                        const artistData = await artistResponse.json();
                        genre = artistData.genres?.[0] || 'Unknown Genre';
                    }
                }

                return {
                    id: track.id,
                    title: `${track.name} by ${artistName}`,
                    uri: track.uri,
                    genre,
                };
            })
        );
        return songs;
    } catch (error) {
        console.error('Error in fetchSongSuggestions:', error);
        return [];
    }
};

const SongRecommendationScreen = () => {
    const [songTitle, setSongTitle] = useState('');
    const [songSuggestions, setSongSuggestions] = useState([]);
    const navigation = useNavigation(); // Use the navigation hook

    const handleShare = async () => {
        if (songTitle.trim() !== '') {
            const suggestions = await fetchSongSuggestions(songTitle);
            setSongSuggestions(suggestions);
        }
    };

    const handleSongSelect = async (song) => {
        try {
            const genre = song.genre;
            const title = song.title.split(' by ')[0]?.trim() || "Untitled";
            const artist = song.title.split(' by ')[1]?.trim() || "Unknown Artist";
            const songDetails = {
                title,
                artist,
            };
            if (genre) {
                navigation.navigate("AddSong", { song: songDetails, genre });
            } else {
                console.error("Genre is undefined");
            }
        } catch (error) {
            console.error('Error categorizing song:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Search for a Song</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter song title"
                value={songTitle}
                onChangeText={setSongTitle}
            />
            <TouchableOpacity style={styles.button} onPress={handleShare}>
                <Text style={styles.buttonText}>Search for Suggestions</Text>
            </TouchableOpacity>

            {songSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    <Text style={styles.suggestionsTitle}>Select a Song:</Text>
                    <FlatList
                        data={songSuggestions}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => handleSongSelect(item)}
                                >
                                    <Text style={styles.suggestionText}>{item.title}</Text>
                                </TouchableOpacity>
                        )}
                        keyExtractor={item => item.id}
                    />
                </View>
            )}

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('GenreList')}
            >
                <Text style={styles.buttonText}>Go to Genre List</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'black',
    },
    suggestionsContainer: {
        marginTop: 20,
        width: '80%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#66BEBA',
    },
    suggestionsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#66BEBA',
    },
    input: {
        width: '80%',
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        paddingLeft: 10,
        marginBottom: 20,
        color: '#66BEBA',
    },
    button: {
        backgroundColor: '#59045C',
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'white',
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: '#66BEBA',
        fontSize: 16,
        fontWeight: 'bold',
    },
    navigationButton: {
        marginTop: 20,
        width: '80%',
    },
    suggestionText: {
        fontSize: 16,
        color: '#66BEBA',
    },
});

export default SongRecommendationScreen;
