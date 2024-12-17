import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Normalize the genre string to ensure consistency
 * @param {string} genre
 * @return {string}
 */
function normalizeGenre(genre) {
    return genre.trim().toLowerCase();
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
 * Save a song to a specific genre
 * @param {string} genre
 * @param {Object} song
 */
export async function saveSong(genre, song) {
    try {
        const normalizedGenre = normalizeGenre(genre);
        const genreKey = getGenreKey(normalizedGenre);

        const normalizedSong = {
            title: song.title.trim().toLowerCase(),
            artist: song.artist.trim().toLowerCase(),
        };

        // Retrieve stored songs
        const storedSongs = JSON.parse(await AsyncStorage.getItem(genreKey)) || [];

        // Check for duplicates based on normalized data
        const isDuplicate = storedSongs.some(
            (savedSong) =>
                savedSong.title.toLowerCase() === normalizedSong.title &&
                savedSong.artist.toLowerCase() === normalizedSong.artist
        );

        if (!isDuplicate) {
            // Add the original song (not normalized) to storage if no duplicates
            storedSongs.push({
                title: song.title.trim(),
                artist: song.artist.trim(),
            });
            await AsyncStorage.setItem(genreKey, JSON.stringify(storedSongs));
            console.log("Song saved:", song);
        } else {
            console.log("Duplicate song not saved:", song);
        }
    } catch (error) {
        console.error("Error saving song:", error);
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
        console.error("Error retrieving songs by genre:", error);
        return [];
    }
}

/**
 * Get all genres that have saved songs
 * @returns {Promise<Array>}
 */
export async function getAllGenres() {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const genreKeys = keys.filter((key) => key.startsWith('@genre_'));
        return genreKeys.map((key) => key.replace('@genre_', ''));
    } catch (error) {
        console.error("Error retrieving genres:", error);
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
        const normalizedSong = {
            title: song.title.trim().toLowerCase(),
            artist: song.artist.trim().toLowerCase(),
        };
        const updatedSongs = storedSongs.filter(
            (savedSong) =>
                savedSong.title.toLowerCase() !== normalizedSong.title ||
                savedSong.artist.toLowerCase() !== normalizedSong.artist
        );

        if (updatedSongs.length === 0) {
            await AsyncStorage.removeItem(genreKey);
            console.log(`Deleted genre: ${normalizedGenre} because it had no songs.`);
        } else {
            await AsyncStorage.setItem(genreKey, JSON.stringify(updatedSongs));
            console.log(`Updated songs for genre: ${normalizedGenre}`, updatedSongs);
        }
    } catch (error) {
        console.error("Error deleting song:", error);
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

        console.log("All stored data:", allData);
    } catch (error) {
        console.error("Error debugging storage:", error);
    }
}

