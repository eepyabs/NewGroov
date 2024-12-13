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
 * Save a song to a specific genre
 * @param {string} genre
 * @param {Object} song
 */

export async function saveSong(genre, song) {
    try {
        const normalizedGenre = normalizeGenre(genre);
        const genreKey = getGenereKey(genre);

        song.title = song.title ? song.title.trim() : "Unknown Title";
        song.artist = song.artist ? song.artist.trim() : "Unknown Artist";

        if (song.title.includes(' by ') && song.artist === "Unknown Artist") {
            const [title, artist] = song.title.split(' by ');
            song.title = title.trim();
            song.artist = artist.trim();
        }

        const storedSongs = JSON.parse(await AsyncStorage.getItem(genreKey)) || [];

        const isDuplicate = storedSongs.some(
            (savedSong) =>
                savedSong.title.trim().toLowerCase() === song.title.trim().toLowerCase() &&
                savedSong.artist.trim().toLowerCase() === song.artist.trim().toLowerCase()
        );
        
        if (!isDuplicate) {
            storedSongs.push(song);
            await AsyncStorage.setItem(genreKey, JSON.stringify(storedSongs));
            console.log(`Save songs:`, song);
        } else {
            console.log(`Duplicate song not saved.`);
        }
    } catch (error) {
        console.error('Error saving song:', error);
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
        const genreKey = `@genre_${normalizedGenre}`;
        return JSON.parse(await AsyncStorage.getItem(genreKey)) || [];
    } catch (error) {
        console.error('Error retrieving songs by genre:', error);
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
        console.error('Error retrieving genre:', error);
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
        const genreKey = `@genre_${normalizedGenre}`;
        const storedSongs = JSON.parse(await AsyncStorage.getItem(genreKey)) || [];
        const updatedSongs = storedSongs.filter(
            (savedSong) => savedSong.title !== song.title || savedSong.artist !== song.artist
        );

        if (updatedSongs.length === 0) {
            await AsyncStorage.removeItem(genreKey);
            console.log(`Deleted genre: ${normalizedGenre} because it had no songs.`);
        } else {
            await AsyncStorage.setItem(genreKey, JSON.stringify(updatedSongs));
            console.log(`Updated songs for genre: ${normalizedGenre}`, updatedSongs);
        }
    } catch (error) {
        console.error('Error deleting song:', error);
        throw error;
    }
}

export async function debugStorage() {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const allData = await AsyncStorage.multiGet(keys);

        console.log('All stored data:', allData);
    } catch (error) {
        console.error('Error debugging storage:', error);
    }
}

function getGenereKey(genre) {
    return `@genre_${normalizeGenre(genre)}`;
}