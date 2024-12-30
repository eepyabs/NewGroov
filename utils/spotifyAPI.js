import axios from "axios";

const SPOTIFY_API_URL = "https://api.spotify.com/v1";

/**
 * Searches for track on Spotify
 * @param {string} query searches
 * @param {string} token OAuth token
 * @returns {Object} object containing track's info
 * @throws throws error if fails
 */

export async function searchTrack(query, token) {
    try {
        const response = await axios.get(`${SPOTIFY_API_URL}/search`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                q: query,
                type: "track",
                limit: 1,
            },
            timeout: 5000,
        });

        if (response.data.tracks.items.length === 0) {
            console.log("Spotify API response:", response.data.tracks.items[0]);
            throw new Error("No tracks found for the given query.");
        }
        const track = response.data.tracks.items[0];
        return {
            title: track.name,
            artist: track.artists.map((artist) => artist.name).join(", "),
            albumCover: track.album.images[0]?.url || null,
            spotifyLink: track.external_urls.spotify,
        };
    } catch (error) {
        console.error("Error fetching track from Spotify:", error);
        throw error;
    }
}