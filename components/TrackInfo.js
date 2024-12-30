import React from "react";

function TrackInfo({ track }) {
    if (!track) return <p>No track selected.</p>;

    return (
        <div>
            <h2>{track.title}</h2>
            <p>Artist: {track.artist}</p>
            {track.albumCover && <img src={track.albumCover} alt={`${track.title} cover`} />}
            <a href={track.spotifyLink} target="_blank" rel="noopener noreferrer">
                Play on Spotify!
            </a>
        </div>
    );
}

export default TrackInfo;