import React, {useState} from "react";
import Spotify from "./spotify";
import Token from "./token";
import SearchBar from "./searchBar";
import Artists from "./artists";

const spotify = new Spotify(Token.fromLocalStorage());

export default function Discography() {
  const [artists, setArtists] = useState([]);
  const [selected, setSelected] = useState([]);

  return (
    <div className="text-center">
      <br />
      <h2>Discography</h2>
      <SearchBar onChange={(value) => update(value, setArtists)} />
      <Artists
        artists={artists || []}
        pickedArtists={selected}
        onClick={(index) => setSelected([artists[index]])}
      />
      <div style={{ height: "4em" }}></div>
    </div>
  );
}

async function update(value, setArtists) {
  if (value === "") {
    const artists = await spotify.getMyTopArtists().items + await spotify.getFollowedArtists().items;
    setArtists(artists);
  } else {
    const searchResult = await spotify.search(value, ["artist"]);
    setArtists(searchResult.artists.items);
  }
}