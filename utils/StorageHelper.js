import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

/**
 * Normalize the genre string to ensure consistency
 * @param {string} genre
 * @return {string}
 */
function normalizeGenre(genre) {
    return genre?.trim().toLowerCase();
}

/**
 * Get the AsyncStorage key for a genre
 * @param {string} genre
 * @return {string}
 */
function getGenreKey(genre) {
    return `@genre_${normalizeGenre(genre)}`;
}

/**
 * Generate a unique ID for songs that don't have one
 * @param {Object} song
 * @returns {string}
 */
function generateUniqueId(song) {
    return `${song.title}-${song.artist}-${Date.now()}`.replace(/\s+/g, '-').toLowerCase();
}

/**
 * Save a song to a specific genre
 * @param {string} genre
 * @param {Object} song
 */
export async function saveSong(genre, song) {
    try {
        if (!genre || !song) {
            console.error("❌ Error: Genre or song is missing.");
            return;
        }

        const normalizedGenre = normalizeGenre(genre);
        const genreKey = getGenreKey(normalizedGenre);

        const storedSongs = JSON.parse(await AsyncStorage.getItem(genreKey)) || [];

        const isDuplicate = storedSongs.some(
            (savedSong) =>
                savedSong.title.toLowerCase() === song.title.toLowerCase() &&
                savedSong.artist.toLowerCase() === song.artist.toLowerCase()
        );

        if (isDuplicate) {
            console.log("⚠️ Duplicate song not saved:", song);
            Alert.alert("Duplicate Song", "This song is already in the genre!");
            return;
        }

        const uniqueId = song.id || generateUniqueId(song);

        const normalizedSong = {
            id: uniqueId,
            title: song.title.trim(),
            artist: song.artist.trim(),
            genre: song.genre?.trim() || "Miscellaneous",
            albumCover: song.albumCover || null,
            preview: song.preview || song.previewUrl || null,
            deezerLink: song.deezerLink || null,
        };

        storedSongs.push(normalizedSong);
        await AsyncStorage.setItem(genreKey, JSON.stringify(storedSongs));

        console.log("✅ Song saved:", normalizedSong);
    } catch (error) {
        console.error("❌ Error saving song:", error);
        throw error;
    }
}


/**
 * Retrieve all songs for a given genre
 * @param {string} genre
 * @returns {Promise<Array>}
 */
export async function getSongsByGenre(genre) {
    try {
        const normalizedGenre = normalizeGenre(genre);
        const genreKey = getGenreKey(normalizedGenre);
        return JSON.parse(await AsyncStorage.getItem(genreKey)) || [];
    } catch (error) {
        console.error("❌ Error retrieving songs by genre:", error);
        return [];
    }
}

/**
 * Get all user-added genres from AsyncStorage
 * Ensures only genres that contain saved songs are returned
 * @returns {Promise<Array>}
 */
export async function getAllGenres() {
    try {
        const keys = await AsyncStorage.getAllKeys();

        const genreKeys = keys.filter(key => key.startsWith("@genre_"));

        const genres = genreKeys.map(key => key.replace("@genre_", ""));

        console.log("🎵 User-added genres: ", genres);
        return genres;
    } catch (error) {
        console.error("❌ Error retrieving stored genres: ", error);
        return [];
    }
}

/**
 * Delete a song from a specific genre
 * If genre is empty, it is deleted
 * @param {string} genre
 * @param {Object} song
 */
export async function deleteSong(genre, song) {
    try {
        const normalizedGenre = normalizeGenre(genre);
        const genreKey = getGenreKey(normalizedGenre);
        const storedSongs = JSON.parse(await AsyncStorage.getItem(genreKey)) || [];
        const updatedSongs = storedSongs.filter((savedSong) => savedSong.id !== song.id);

        if (updatedSongs.length === 0) {
            await AsyncStorage.removeItem(genreKey);
            console.log(`🗑 Deleted genre: ${normalizedGenre} because it had no songs.`);

            const allGenres = JSON.parse(await AsyncStorage.getItem("@allGenres")) || [];
            const updatedGenres = allGenres.filter((g) => g !== normalizedGenre);
            await AsyncStorage.setItem("@allGenres", JSON.stringify(updatedGenres));
        } else {
            await AsyncStorage.setItem(genreKey, JSON.stringify(updatedSongs));
            console.log(`✅ Updated songs for genre: ${normalizedGenre}`, updatedSongs);
        }
    } catch (error) {
        console.error("❌ Error deleting song:", error);
        throw error;
    }
}

/**
 * Debug all AsyncStorage data
 */
export async function debugStorage() {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const allData = await AsyncStorage.multiGet(keys);

        console.log("🛠 All stored data:", allData);
    } catch (error) {
        console.error("❌ Error debugging storage:", error);
    }
}
