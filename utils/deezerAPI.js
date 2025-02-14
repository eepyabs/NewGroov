export const searchSongOnDeezer = async (query) => {
    try {
        const response = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.data.length > 0) {
            const song = data.data[0];
            let genre = "Miscellaneous";
            if (song.album && song.album.id) {
                genre = await fetchGenreFromDeezer(song.album.id);
            }

            return {
                title: song.title,
                artist: song.artist.name,
                albumCover: song.album.cover_big,
                deezerLink: song.link,
                preview: song.preview,
                genre: genre
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching song from Deezer:", error);
        return null;
    }
};

export const fetchGenreFromDeezer = async (albumId) => {
    try {
        const response = await fetch(`https://api.deezer.com/album/${albumId}`);
        const data = await response.json();

        if (data && data.genre_id) {
            const genreResponse = await fetch(`https://api.deezer.com/genre/${data.genre_id}`);
            const genreData = await genreResponse.json();

            return genreData.name || "Miscellaneous";
        }
    } catch (error) {
        console.error("Error fetching genre for album:", error);
    }
    return "Miscellaneous";
};

export const getDeezerGenres = async () => {
    try {
        const response = await fetch(`https://api.deezer.com/genre`);
        if (!response.ok) {
            throw new Error(`Error fetching genres: ${response.statusText}`);
        }
        const data = await response.json();
        return data.data.map((genre) => genre.name);
    } catch (error) {
        console.error("Error fetching Deezer genres:", error);
        return [];
    }
};