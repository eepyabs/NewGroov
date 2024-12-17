import React, { useState, useEffect } from 'react';
import { Button, View, Text, StyleSheet, FlatList } from 'react-native';
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
                    keyExtractor={(item, index) => `${item}-${item}`}
                    renderItem={({ item }) => (
                        <Button
                            title={item}
                            onPress={() => handleNavigateToDetail(item)}
                        />
                    )}
                />
            ) : (
                <Text style={styles.emptyText}>No genres available.</Text>
            )}
            <Button title="Refresh Genres" onPress={fetchGenres} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: "flex-start",
        backgroundColor: 'black',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#66BEBA',
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default GenreListScreen;