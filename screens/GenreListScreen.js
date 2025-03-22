import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/utils/ThemeContext';
import { getAllGenres } from '@/utils/StorageHelper';
import { Ionicons } from '@expo/vector-icons';

const GenreListScreen = () => {
    const [username, setUsername] = useState("");
    const [genres, setGenres] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();
    const { isDarkMode } = useTheme();

    useEffect(() => {
        const fetchUsername = async () => {
            try {
                const storedUsername = await AsyncStorage.getItem("username");
                
                if (storedUsername) {
                    console.log("✅ Loaded username: ", storedUsername);
                    setUsername(storedUsername);
                } else {
                    console.log("⚠️ No username found in AsyncStorage");
                }
            } catch (error) {
                console.error("❌ Error fetching username: ", error);
            }
        };

        const unsubscribe = navigation.addListener("focus", fetchUsername);
        fetchUsername();

        return unsubscribe;
    }, [navigation]);

    const fetchGenres = async () => {
        setIsLoading(true);
        try {
            const storedGenres = await getAllGenres();

            const validStoredGenres = Array.isArray(storedGenres)
                ? storedGenres.map((genre, index) => ({
                    id: `stored-${index}`,
                    name: genre.trim(),
                }))
                : [];

            console.log("🎵 User Added Genres:", validStoredGenres);
            setGenres(validStoredGenres);
        } catch (error) {
            console.error('❌ Error fetching stored genres:', error);
            Alert.alert('Error', 'Could not fetch stored genres. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGenres();
    }, []);

    const handleNavigateToDetail = (genre) => {
        if (genre) {
            navigation.navigate('GenreDetail', { genre });
        } else {
            console.error("🚨 Attempted to navigate with invalid genre:", genre);
            Alert.alert("Navigation Error", "Invalid genre selected.");
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.button}
            onPress={() => handleNavigateToDetail(item.name)}
        >
            <Text style={[styles.buttonText, { color: isDarkMode ? "black" : "white" }]}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? "#323231" : "#CCCCCC" }]}>

            <View style={styles.headerContainer}>
                <Text style={[styles.title, { color: isDarkMode ? "#79E872" : "#188D1E" }]}>
                    {username && username.trim() !== "" ? `${username}'s Genres` : "Your Genres"}
                </Text>

                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => navigation.navigate('Settings')}
                >
                    <Ionicons name="settings" size={30} color="white" />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={isDarkMode ? "#79E872" : "#188D1E"} />
                    <Text style={[styles.loadingText, { color: isDarkMode ? "#79E872" : "#188D1E" }]}>Loading genres...</Text>
                </View>
            ) : genres.length > 0 ? (
                <FlatList
                    data={genres}
                    keyExtractor={(item, index) => item.id || `genre-${Math.random().toString(36).substr(2, 9)}`}
                    renderItem={renderItem}
                />
            ) : (
                <Text style={[styles.emptyText, { color: isDarkMode ? "#CCC" : "#666"}]}>No genres available.</Text>
            )}

            <TouchableOpacity style={styles.refreshButton} onPress={fetchGenres}>
                <Text style={[styles.refreshButtonText, { color: isDarkMode ? "black" : "white" }]}>Refresh Genres</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.songRecButton, { backgroundColor: isDarkMode ? "#79E872" : "#188D1E" }]}
                onPress={() => navigation.navigate('SongRecommendation')}
            >
                <Text style={[styles.songRecButtonText, { color: isDarkMode ? "black" : "white" }]}>Go to Song Recommendations</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: "flex-start",
        backgroundColor: '#323231',
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 50,
    },
    settingsButton: {
        position: 'absolute',
        top: 1,
        right: 1,
        width: 50,
        height: 50,
        backgroundColor: '#4A90E2',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        zIndex: 10,
    },
    title: {
        fontSize: 40,
        fontFamily: 'Lobster',
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        left: 80,
        top: 30,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
    },
    emptyText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
    },
    button: {
        backgroundColor: '#C564E8',
        padding: 10,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'black',
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    refreshButton: {
        backgroundColor: '#C564E8',
        padding: 10,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'black',
        alignItems: 'center',
        marginVertical: 10,
    },
    refreshButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    songRecButton: {
        padding: 10,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'black',
        alignItems: 'center',
        marginVertical: 10,
    },
    songRecButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default GenreListScreen;