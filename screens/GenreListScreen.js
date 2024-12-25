import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { getAllGenres } from '@/utils/StorageHelper';
import { useNavigation } from '@react-navigation/native';

const GenreListScreen = () => {
    const [genres, setGenres] = useState([]);
    const navigation = useNavigation();

    const fetchGenres = async () => {
        try {
            const storedGenres = await getAllGenres();
            console.log("Fetched genres:", storedGenres);
            setGenres(storedGenres || []);
        } catch (error) {
            console.error('Error fetching genres:', error);
            Alert.alert('Error', 'Could not fetch genres. Please try again.');
        }
    };

    useEffect(() => {
        fetchGenres();
    }, []);

    const handleNavigateToDetail = (genre) => {
        if (genre) {
            navigation.navigate('GenreDetail', { genre });
        } else {
            console.error("Attempted to navigate with invalid genre:", genre);
            Alert.alert("Navigation Error", "Invalid genre selected.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Genres</Text>
            {genres.length > 0 ? (
                <FlatList
                    data={genres}
                    keyExtractor={(item, index) => `${item}-${index}`}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => handleNavigateToDetail(item)}
                        >
                            <Text style={styles.buttonText}>{item}</Text>
                        </TouchableOpacity>
                    )}
                />
            ) : (
                <Text style={styles.emptyText}>No genres available.</Text>
            )}
            <TouchableOpacity style={styles.button} onPress={fetchGenres}>
                <Text style={styles.buttonText}>Refresh Genres</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('SongRecommendation')}
            >
                <Text style={styles.buttonText}>Back to Song Recommendations</Text>
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
});

export default GenreListScreen;