import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Buffer } from 'buffer';
import { Audio } from 'expo-av';

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

        const songs = await Promise.all(
            data.tracks.items.map(async (track) => {
                const artist = track.artists?.[0];
                const artistName = artist?.name || 'Unknown Artist';

                let genre = 'Miscellaneous';
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
                        genre = artistData.genres?.[0] || 'Miscellaneous';
                    }
                }

                return {
                    id: track.id,
                    title: `${track.name} by ${artistName}`,
                    uri: track.uri,
                    genre,
                    albumCover: track.album.images[0]?.url || null,
                    preview_url: track.preview_url || null,
                };
            })
        );
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

    const handleShare = async () => {
        if (songTitle.trim() !== '') {
            setIsLoading(true);
            const suggestions = await fetchSongSuggestions(songTitle);
            setSongSuggestions(suggestions);
            setIsLoading(false);
        }
    };

    const handleSongSelect = async (song) => {
        const genre = song.genre;
        const title = song.title.split(' by ')[0]?.trim() || "Untitled";
        const artist = song.title.split(' by ')[1]?.trim() || "Unknown Artist";
        const songDetails = {
            title,
            artist,
            albumCover: song.albumCover || null,
            spotifyUri: `https://open.spotify.com/track/${song.id}`,
        };

        await stopSong();
        navigation.navigate('AddSong', { song: songDetails, genre });  
    };

    const playSongOnLoop = async () => {
        if (sound) return;
        try {
            const { sound: newSound } = await Audio.Sound.createAsync(
                require('../assets/sounds/itty-bitty-8-bit.mp3'),
                { isLooping: true }
            );
            setSound(newSound);
            await newSound.playAsync();
        } catch (error) {
            console.error('Error playing sound:', error);
            Alert.alert('Playback Error', 'Unable to play the song.');
        }
    };

    const stopSong = async () => {
        if (sound) {
            try {
                await sound.stopAsync();
                await sound.unloadAsync();
            } catch (error) {
                console.error('Error stopping or unloading sound:', error);
            } finally {
                setSound(null);
            }
        }
    };    

    useFocusEffect(
        React.useCallback(() => {
            console.log('Playing sound on focus');
            playSongOnLoop();

            return () => {
                console.log('Stopping sound on unfocus');
                stopSong();
            };
        }, [])
    );

    const renderFooter = () => <View style={{ height: 100 }} />;

    return (
        <View style={styles.container}>
            <Image source={require('../images/dancing_cat.gif')} style={styles.dancingCat} />
            <Image source={require('../images/logo.png')} style={styles.logo} />
            <Text style={styles.title}>Find your NewGroov!</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter song title"
                value={songTitle}
                onChangeText={setSongTitle}
            />
            <TouchableOpacity style={styles.button} onPress={handleShare}>
                <Text style={styles.buttonText}>Search for Suggestions</Text>
            </TouchableOpacity>

            {isLoading ? (
                <ActivityIndicator size="large" color="66BEBA" />
            ) : (
                <FlatList
                    data={songSuggestions}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.button} onPress={() => handleSongSelect(item)}>
                            <Text style={styles.suggestionText}>{item.title}</Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.id}
                    ListFooterComponent={renderFooter}
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
        backgroundColor: '#323231',
    },
    dancingCat: {
        width: 200,
        height: 200,
        position: 'absolute',
        top: 30,
        left: 10,
    },
    logo: {
        width: 100,
        height: 100,
        position: 'absolute',
        top: 200,
        alignSelf: 'center',
    },
    title: {
        fontSize: 24,
        fontFamily: 'Lobster',
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#66BEBA',
        marginTop: 300,
        marginLeft: 10,
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
    suggestionText: {
        fontSize: 16,
        color: '#66BEBA',
    },
});

export default SongRecommendationScreen;
