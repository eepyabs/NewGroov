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

        console.log("Fetched Genres: ", data.data);

        return data.data.map((genre) => ({
            id: Number(genre.id),
            name: genre.name
        }));
    } catch (error) {
        console.error("Error fetching Deezer genres:", error);
        return [];
    }
};

export const getRandomDeezerSongs = async () => {
    try {
        console.log("Fetching global top songs as a fallback...");
        const response = await fetch("https://api.deezer.com/chart");
        if (!response.ok) {
            throw new Error(`Error fetching top songs: ${response.statusText}`);
        }
        const data = await response.json();

        return data.tracks.data.map(song => ({
            id: song.id,
            title: song.title,
            artist: { name: song.artist.name },
            album: song.album ? { cover_medium: song.album.cover_medium } : null,
            preview: song.preivew || null
        }));
    } catch (error) {
        console.error("Error fetching global songs: ", error);
        return [];
    }
};

export const getSongsByGenre = async (genreId, limit = 10, offset = 0) => {
    try {
        console.log(` Fetching artists for genre ID: ${genreId} | Limit: ${limit} | Offset: ${offset}`);

        const artistResponse = await fetch(`https://api.deezer.com/genre/${genreId}/artists`);
        if (!artistResponse.ok) {
            throw new Error(`Error fetching artists: ${artistResponse.statusText}`);
        }
        const artistData = await artistResponse.json();

        if (!artistData || !artistData.data || artistData.data.length === 0) {
            console.warn(`No artist found for genre ID: ${genreId}.`);
            return [];
        }

        const firstArtist = artistData.data[0];
        console.log(`Fetching songs for artist: ${firstArtist.name} (ID: ${firstArtist.id})`);

        const songResponse = await fetch(`https://api.deezer.com/artist/${firstArtist.id}/top?limit=${limit}&index=${offset}`);
        if (!songResponse.ok) {
            throw new Error(`Error fetching artist songs: ${songResponse.statusText}`);
        }

        const songData = await songResponse.json();
        return songData.data.map(song => ({
            id: song.id,
            title: song.title,
            artist: { name: song.artist.name },
            album: song.album ? { cover_medium: song.album.cover_medium } : null,
            preview: song.preview || null
        }));
    } catch (error) {
        console.error("Error fetching songs for genre: ", error);
        return [];
    }

};