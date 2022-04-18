import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Artists from "./artists";
import InProgress from "./inProgress";
import SearchBar from "./searchBar";
import Spotify from "./spotify";
import Token from "./token";

const spotify = new Spotify(Token.fromLocalStorage());

export default function Discography() {
  const [artists, setArtists] = useState([]);
  const [selected, setSelected] = useState({});
  const [tracks, setTracks] = useState([]);

  useEffect(() => updateArtists("", setArtists), []);

  return (
    <div className="text-center">
      <br />
      <h2>Discography</h2>
      <SearchBar onChange={(value) => updateArtists(value, setArtists)} />
      <Artists
        artists={artists}
        pickedArtists={[selected]}
        onClick={(index) => {
          setSelected(artists[index]);
          updateTracks(artists[index].id, setTracks);
        }}
      />
      <div style={{ height: "1em" }}></div>
      <ArtistTracks artistName={selected.name} tracks={tracks} />
      <div style={{ height: "3em" }}></div>
    </div>
  );
}

function ArtistTracks({ artistName, tracks }) {
  const [inProgress, setInProgress] = useState(false);
  const [didSave, setDidSave] = useState(false);

  useEffect(() => setDidSave(false), [artistName]);

  if (artistName === undefined) {
    return null;
  }
  if (tracks.length === 0) {
    return <InProgress />;
  }

  return (
    <>
      {didSave ? (
        <h4>Saved as "{artistName} - discography"</h4>
      ) : (
        <Button
          variant="success"
          onClick={() => {
            setInProgress(true);
            savePlaylist(artistName + " - discography", tracks);
            setDidSave(true);
            setInProgress(false);
          }}
          disabled={inProgress}
        >
          Make playlist named "{artistName} - discography"
        </Button>
      )}
      <ul style={{ textAlign: "left" }}>
        {tracks.map((track, index) => (
          <li key={index}>{track.name}</li>
        ))}
      </ul>
    </>
  );
}

async function updateArtists(value, setArtists) {
  if (value === "") {
    const artists = await spotify.getMyTopArtists(8);
    setArtists(artists);
  } else {
    const searchResult = await spotify.search(value, ["artist"], { limit: 8 });
    setArtists(searchResult.artists.items);
  }
}

async function updateTracks(artistId, setTracks) {
  setTracks([]);
  if (artistId !== undefined && artistId !== "") {
    const artistAlbums = await spotify.getArtistAlbums(artistId);
    const artistAlbumIds = artistAlbums.map((album) => album.id);
    const albums = await spotify.getAlbums(artistAlbumIds);
    const tracks = albums.map((album) => album.tracks.items).flat();
    setTracks(tracks);
  }
}

async function savePlaylist(name, tracks) {
  const playlist = await spotify.createPlaylist(name);
  await spotify.addTracksToPlaylist(playlist.id, tracks);
}
