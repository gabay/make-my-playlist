import "rc-slider/assets/index.css";
import "rc-tooltip/assets/bootstrap.css";
import React from "react";
import Button from "react-bootstrap/Button";
import Spotify from "./spotify";
import Token from "./token";
import SearchBar from "./searchBar";
import Albums from "./albums";
import Tracks from "./tracks";


const spotify = new Spotify(Token.fromLocalStorage());

class TracksPlayer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentAlbum: null,
      tracks: null,
      currentTrack: null,
    };

    this.audio = null;
  }

  componentDidMount() {
    this.fetchTracksIfNeeded();
  }

  componentDidUpdate() {
    this.fetchTracksIfNeeded();
  }

  render() {
    if (this.props.album === null) {
      return <></>;
    }

    return (
      <>
        <h2>{this.props.album.name} Tracks</h2>
        <Tracks
          tracks={this.state.tracks || []}
          pickedTracks={[this.state.currentTrack]}
          onClick={(index) => this.onTrackClick(index)}
        />
        {this.renderOpenInSpotifyIfNeeded()}
      </>
    );
  }

  renderOpenInSpotifyIfNeeded() {
    if (this.state.currentTrack === null) {
      return <></>;
    }

    return (
      <Button
        variant="success"
        target="_blank"
        href={"https://open.spotify.com/track/" + this.state.currentTrack.id}
      >
        Open song in Spotify
      </Button>
    );
  }

  onTrackClick(index) {
    if (this.state.currentTrack === this.state.tracks[index]) {
      this.pauseTrack();
    } else {
      this.playTrack(index);
    }
  }

  async fetchTracksIfNeeded() {
    if (this.props.album === this.state.currentAlbum) {
      return;
    }

    this.pauseTrack();
    this.setState({ currentAlbum: this.props.album, tracks: null });

    if (this.props.album !== null) {
      const tracks = await spotify.getAlbumTracks(this.props.album.id);
      this.setState({ tracks: tracks });
      this.playTrack(0);
    }
  }

  playTrack(index) {
    this.pauseTrack();

    if (index >= this.state.tracks.length) {
      return;
    }

    const track = this.state.tracks[index];
    console.log(track.preview_url);
    if (track.preview_url) {
      this.audio = new Audio(track.preview_url);
      this.audio.play();
      this.audio.onended = () => this.playTrack(index + 1);
      this.setState({ currentTrack: track });
    } else {
      console.log(`No preview for track "${track.name}"`);
      this.playTrack(index + 1);
    }
  }

  pauseTrack() {
    if (this.audio !== null) {
      this.audio.pause();
      this.audio = null;
      this.setState({ currentTrack: null });
    }
  }
}

class Main extends React.Component {
  constructor() {
    super();

    this.state = {
      albums: null,
      selectedAlbum: null,
    };
  }

  componentDidMount() {
    this.updateQuery("");
  }

  render() {
    return (
      <div className="text-center">
        <br />
        <h2>Preview Albums</h2>
        <SearchBar onChange={(value) => this.updateQuery(value)} />
        <Albums
          albums={this.state.albums || []}
          pickedAlbum={this.state.selectedAlbum}
          onClick={(index) => this.onAlbumClick(index)}
        />
        <TracksPlayer album={this.state.selectedAlbum} />
        <div style={{ height: "4em" }}></div>
      </div>
    );
  }

  async updateQuery(value) {
    this.setState({ albums: null });

    const albums =
      value === ""
        ? await spotify.getNewReleases({ limit: 10 })
        : (await spotify.search(value, ["album"], { limit: 10 })).albums.items;
    this.setState({ albums: albums });
  }

  onAlbumClick(index) {
    const album = this.state.albums[index];

    this.setState((state) => {
      if (state.selectedAlbum === album) {
        return { selectedAlbum: null };
      } else {
        return { selectedAlbum: album };
      }
    });
  }
}

export default function PreviewAlbums() {
  return <Main />;
}
