import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, Animated, Easing } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { saveSong } from '@/utils/StorageHelper';

const AddSongScreen = ({ route, navigation }) => {
    const rawSong = route.params?.song || { title: "Untitled", artist: "Unknown Artist", albumCover: null };
    const genre = route.params?.genre || "Unknown Genre";

    const colorAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(colorAnimation, {
                toValue: 1,
                duration: 1500,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: false,
            })
        ).start();
    }, []);

    const handleSave = async () => {
        const song = {
            title: rawSong.title || "Untitled",
            artist: rawSong.artist || "Unknown Artist",
            albumCover: rawSong.albumCover || null,
            genre: genre,
        };

        try {
            await saveSong(genre.trim(), song);
            Alert.alert("Success", "Song saved successfully!");
            navigation.navigate("GenreList");
        } catch (error) {
            console.error("Failed to save the song:", error);
            Alert.alert("Error", "An error occurred while saving the song.");
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.navButton} 
                onPress={() => navigation.navigate("SongRecommendation")}
            >
                <AntDesign name="arrowleft" size={24} color="#66BEBA" style={styles.arrowIcon} />
                <Text style={styles.navButtonText}>Back to Recommendations</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Add Song!</Text>

            {rawSong.albumCover ? (
                <Image source={{ uri: rawSong.albumCover }} style={styles.albumCover} />
            ) : (
                <Text style={styles.subtitle}>No Album Cover Available</Text>
            )}

            <Text style={styles.subtitle}>🎵 Song: {rawSong.title}</Text>
            <Text style={styles.subtitle}>🎤 Artist: {rawSong.artist}</Text>
            <Text style={styles.subtitle}>🎼 Genre: {genre}</Text>

            <Animated.View style={[styles.roundButton, { backgroundColor: colorAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ["#59045C", "#49034B"],
            }) }]}>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={styles.roundButtonText}>Save Song</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#323231",
    },
    title: {
        fontSize: 40,
        fontFamily: 'Lobster',
        fontWeight: "bold",
        marginBottom: 60,
        color: "#66BEBA",
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 10,
        color: "#66BEBA",
    },
    albumCover: {
        width: 200,
        height: 200,
        marginBottom: 20,
        borderRadius: 10,
    },
    roundButton: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
    },
    roundButtonText: {
        color: "#66BEBA",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },
    navButton: {
        position: "absolute",
        top: 20,
        left: 10,
        flexDirection: "row",
        alignItems: "center",
    },
    navButtonText: {
        color: "#66BEBA",
        fontSize: 14,
        fontWeight: "bold",
    },
});

export default AddSongScreen;
