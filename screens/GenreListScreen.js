import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getDeezerGenres } from '@/utils/deezerAPI';
import { getAllGenres } from '@/utils/StorageHelper';

const GenreListScreen = () => {
    const [genres, setGenres] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();

    const fetchGenres = async () => {
        setIsLoading(true);
        try {
            const storedGenres = await getAllGenres();
            const deezerGenres = await getDeezerGenres();

            const validDeezerGenres = Array.isArray(deezerGenres)
                ? deezerGenres.filter((genre) => genre.id && genre.name).map((genre) => ({
                    id: `deezer-${genre.id}`,
                    name: genre.name.trim(),
                }))
                : [];

            const validStoredGenres = Array.isArray(storedGenres)
                ? storedGenres.map((genre, index) => ({
                    id: `stored-${index}`,
                    name: genre.trim(),
                }))
                : [];

            const mergedGenres = [...validStoredGenres, ...validDeezerGenres].filter(
                (value, index, self) => index === self.findIndex((g) => g.name === value.name)
            );

            console.log("🎵 Fetched Genres:", mergedGenres);
            setGenres(mergedGenres);
        } catch (error) {
            console.error('❌ Error fetching genres:', error);
            Alert.alert('Error', 'Could not fetch genres from Deezer. Please try again.');
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
            <Text style={styles.buttonText}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Genres</Text>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#66BEBA" />
                    <Text style={styles.loadingText}>Loading genres...</Text>
                </View>
            ) : genres.length > 0 ? (
                <FlatList
                    data={genres}
                    keyExtractor={(item, index) => item.id || `genre-${Math.random().toString(36).substr(2, 9)}`}
                    renderItem={renderItem}
                />
            ) : (
                <Text style={styles.emptyText}>No genres available.</Text>
            )}

            <TouchableOpacity style={styles.refreshButton} onPress={fetchGenres}>
                <Text style={styles.refreshButtonText}>Refresh Genres</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate('SongRecommendation')}
            >
                <Text style={styles.backButtonText}>Back to Song Recommendations</Text>
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
    title: {
        fontSize: 30,
        fontFamily: 'Lobster',
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#66BEBA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#66BEBA',
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
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
    refreshButton: {
        backgroundColor: '#FF6347',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 10,
    },
    refreshButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    backButton: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 10,
    },
    backButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default GenreListScreen;