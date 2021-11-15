import debounce from "lodash/debounce";
import "rc-slider/assets/index.css";
import "rc-tooltip/assets/bootstrap.css";
import React from "react";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import Form from "react-bootstrap/Form";
import FeatureSliderWithToggleButton from "./featureSlider";
import { logout } from "./login";
import Spotify from "./spotify";
import Token from "./token";
import { randomElement, smallsetImage, toggleElement, trim } from "./util";

// TODO:
// order the playlist / replace songs / ...
// get recently played
// search something specific
// swap items in playlist before save
// Share to facebook/instagram/whatsapp
// ???
// search for similar artists -> albums -> tracks manually...

const spotify = new Spotify(Token.fromLocalStorage());

class SearchBar extends React.Component {
  constructor(props) {
    super(props);

    this.searchDebounced = debounce(this.search, 500);
  }
  render() {
    return (
      <>
        <Form.Control
          onChange={(event) => this.searchDebounced(event.target.value)}
        />
      </>
    );
  }

  async search(query) {
    if (query !== "") {
      const value = await spotify.search(query, ["artist", "track"], {limit: 6});
      this.props.onChange(value);
    } else {
      this.props.onChange({artists: {}, tracks: {}});
    }
  }
}

class CollapsibleSection extends React.Component {
  constructor(props) {
    super(props);

    this.state = { open: props.initialOpen, id: Math.random().toString() };
  }

  render() {
    return (
      <div>
        <Button
          variant="light"
          style={{ boxShadow: "none" }}
          onClick={() => this.setState((state) => ({ open: !state.open }))}
          aria-controls={this.state.id}
          aria-expanded={this.state.open}
        >
          <h2>{this.props.title}</h2>
        </Button>
        <Collapse in={this.state.open}>
          <div id={this.state.id}>{this.props.children}</div>
        </Collapse>
      </div>
    );
  }
}

class InProgress extends React.Component {
  render() {
    return (
      <>
        <div className="spinner-grow text-success" role="status" />
        <div className="spinner-border text-success" role="status" />
      </>
    );
  }
}

class FlexWrap extends React.Component {
  render() {
    return (
      <div className="d-flex flex-row flex-wrap">{this.props.children}</div>
    );
  }
}

class ClickableItem extends React.Component {
  // Render a button from the given name, images, and isActive.
  render() {
    return (
      <Button
        variant="outline-dark"
        active={this.props.isActive}
        style={{ width: "10rem", boxShadow: "none" }}
        onClick={() => this.props.onClick()}
      >
        {this.renderImage()}
        <h5>{trim(this.props.name, 30)}</h5>
      </Button>
    );
  }

  renderImage() {
    if (this.props.images === undefined) {
      return <></>;
    } else {
      const image = smallsetImage(this.props.images);
      const imageSrc = image !== null ? image.url : "placeholder.png";
      return (
        <img width="64" height="64" className="rounded" src={imageSrc} alt="" />
      );
    }
  }
}

class Artists extends React.Component {
  render() {
    if (this.props.artists === undefined) {
      return <InProgress />;
    } else {
      return (
        <FlexWrap>
          {this.props.artists.map((artist, index) => (
            <ClickableItem
              key={index}
              name={artist.name}
              images={artist.images}
              isActive={this.props.pickedArtists.includes(artist)}
              onClick={() => this.props.onClick(index)}
            />
          ))}
        </FlexWrap>
      );
    }
  }
}

class Genres extends React.Component {
  render() {
    if (this.props.genres === undefined) {
      return <InProgress />;
    } else {
      return (
        <FlexWrap>
          {this.props.genres.map((genre, index) => (
            <ClickableItem
              key={index}
              name={genre}
              isActive={this.props.pickedGenres.includes(genre)}
              onClick={() => this.props.onClick(index)}
            />
          ))}
        </FlexWrap>
      );
    }
  }
}

class Tracks extends React.Component {
  render() {
    if (this.props.tracks === undefined) {
      return <InProgress />;
    } else {
      return (
        <FlexWrap>
          {this.props.tracks.map((track, index) => (
            <ClickableItem
              key={index}
              name={track.name}
              images={track.album.images}
              isActive={this.props.pickedTracks.includes(track)}
              onClick={() => this.props.onClick(index)}
            />
          ))}
        </FlexWrap>
      );
    }
  }
}

class PlaylistMaker extends React.Component {
  constructor() {
    super();

    this.state = {
      artists: [],
      genres: [],
      tracks: [],
      playlistName: "",
      playlistTracks: null,
      isInProgress: false,
      showSaveButton: false,
      playingPlaylistTracks: []
    };

    this.audio = null;
  }

  render() {
    return (
      <>
        <div className="text-center">
          <Button
            variant="success"
            onClick={() => this.makePlaylist()}
            disabled={this.state.isInProgress}
          >
            Make my playlist!
          </Button>
        </div>

        {this.renderPlaylist()}
      </>
    );
  }

  renderPlaylist() {
    if (this.state.playlistTracks === null) {
      return null;
    }

    const artists = this.state.artists.map((artist) => artist.name).join(", ");
    const genres = this.state.genres.join(", ");
    const tracks = this.state.tracks.map((track) => track.name).join(", ");
    return (
      <>
        <div className="text-center">
          {this.state.showSaveButton ? (
            <>
              <br />
              <Form.Label>Playlist Name:</Form.Label>
              <Form.Control
                style={{ width: "200px", margin: "auto", textAlign: "center" }}
                type="text"
                placeholder="make-my-playlist"
                onChange={(event) =>
                  this.setState({ playlistName: event.target.value })
                }
              />
              <Button
                variant="dark"
                onClick={() => this.savePlaylist()}
                disabled={this.state.isInProgress}
              >
                Save playlist
              </Button>
            </>
          ) : null}
        </div>
        <CollapsibleSection
          initialOpen={true}
          title={`Playlist (by ${artists} | ${genres} | ${tracks})`}
        >
          <Tracks
            tracks={this.state.playlistTracks}
            pickedTracks={this.state.playingPlaylistTracks}
            onClick={(index) => this.onPlaylistTrackClick(index)}
          />
        </CollapsibleSection>
      </>
    );
  }

  async makePlaylist() {
    const seeds = this.getSeeds();
    this.setState({ isInProgress: true });
    const playlistTracks = await spotify.getRecommendations({
      seed_artists: seeds.artists.map((artist) => artist.id),
      seed_genres: seeds.genres,
      seed_tracks: seeds.tracks.map((track) => track.id),
      ...this.getFeatures(),
    });
    this.setState({ isInProgress: false });
    if (playlistTracks !== undefined) {
      this.setState({
        artists: seeds.artists,
        genres: seeds.genres,
        tracks: seeds.tracks,
        playlistTracks: playlistTracks,
        showSaveButton: true,
      });
    }
  }

  getSeeds() {
    var artists = this.props.pickedArtists;
    var genres = this.props.pickedGenres;
    var tracks = this.props.pickedTracks;
    if (artists.length === 0 && genres.length === 0 && tracks.length === 0) {
      artists = [
        randomElement(this.props.artists),
        randomElement(this.props.artists),
        randomElement(this.props.artists),
      ];
      tracks = [
        randomElement(this.props.tracks),
        randomElement(this.props.tracks),
      ];
    }
    return {
      artists: artists,
      genres: genres,
      tracks: tracks,
    };
  }

  getFeatures() {
    var features = {};
    for (const feature in this.props.features) {
      const value = this.props.features[feature];
      features[`target_${feature}`] = value;

      if (!["popularity", "tempo"].includes(feature)) {
        if (value - 0.25 >= 0) {
          features[`min_${feature}`] = value - 0.25;
        }
        if (value + 0.25 <= 1) {
          features[`max_${feature}`] = value + 0.25;
        }
      }
    }
    return features;
  }

  async savePlaylist() {
    this.setState({ isInProgress: true });
    const playlist = await spotify.createPlaylist(
      this.state.playlistName || "make-my-playlist"
    );
    await spotify.addTracksToPlaylist(playlist.id, this.state.playlistTracks);
    this.setState({ isInProgress: false, showSaveButton: false });
  }

  onPlaylistTrackClick(index) {
    const track = this.state.playlistTracks[index];
    if (!this.state.playingPlaylistTracks.includes(track)) {
      console.log("Playing");
      console.log(track);
      this.playTrack(track);
    } else {
      console.log("Pausing");
      this.pauseTrack();
    }
  }

  playTrack(track) {
    this.pauseTrack();

    if (track.preview_url) {
      this.audio = new Audio(track.preview_url);
      this.audio.play();
      this.audio.onended = () => this.pauseTrack();
      this.setState({playingPlaylistTracks: [track]});
    } else {
      console.log(`No preview for track "${track.name}"`)
    }
  }

  pauseTrack() {
    if (this.audio !== null) {
      this.audio.pause();
      this.audio = null;
    }
    this.setState({playingPlaylistTracks: []});
  }
}

class Main extends React.Component {
  constructor() {
    super();

    this.state = {
      pickedArtists: [],
      pickedGenres: [],
      pickedTracks: [],
      features: {},
      search: {artists: {}, tracks: {}},
    };
  }

  componentDidMount() {
    spotify.getMyTopArtists().then((topArtists) => {
      this.setState({ topArtists: topArtists });
    });
    spotify.getFollowedArtists().then((followedArtists) => {
      this.setState({ followedArtists: followedArtists });
    });
    spotify.getMyTopTracks().then((topTracks) => {
      this.setState({ topTracks: topTracks });
    });
    spotify.getAvailableGenreSeeds().then((genres) => {
      this.setState({ genres: genres });
    });
  }

  render() {
    console.log("* Main render, State:");
    console.log(this.state);
    return (
      <div className="text-center">
        <br />
        <h2>Make my playlist</h2>
        <SearchBar onChange={(value) => this.setState({search: value})} />
        <Artists artists={this.state.search.artists.items || []} pickedArtists={this.state.pickedArtists}/>
        <Tracks tracks={this.state.search.tracks.items || []} pickedTracks={this.state.pickedTracks}/>
        <Button variant="secondary" onClick={logout}>
          Logout
        </Button>
        <br />
        <CollapsibleSection initialOpen={false} title="Your top artists">
          <Artists
            artists={this.state.topArtists}
            pickedArtists={this.state.pickedArtists}
            onClick={(index) => this.onTopArtistClick(index)}
          />
        </CollapsibleSection>
        <CollapsibleSection initialOpen={false} title="Artists you follow">
          <Artists
            artists={this.state.followedArtists}
            pickedArtists={this.state.pickedArtists}
            onClick={(index) => this.onFollowedArtistClick(index)}
          />
        </CollapsibleSection>
        <CollapsibleSection initialOpen={false} title="Genres">
          <Genres
            genres={this.state.genres}
            pickedGenres={this.state.pickedGenres}
            onClick={(index) => this.onGenreClick(index)}
          />
        </CollapsibleSection>
        <CollapsibleSection initialOpen={false} title="Your top tracks">
          <Tracks
            tracks={this.state.topTracks}
            pickedTracks={this.state.pickedTracks}
            onClick={(index) => this.onTopTrackClick(index)}
          />
        </CollapsibleSection>
        {this.renderFeatures()}
        <PlaylistMaker
          artists={[].concat(this.state.topArtists, this.state.followedArtists)}
          tracks={this.state.topTracks}
          pickedArtists={this.state.pickedArtists}
          pickedGenres={this.state.pickedGenres}
          pickedTracks={this.state.pickedTracks}
          features={this.state.features}
        />
        <div style={{ height: "4em" }}></div>
      </div>
    );
  }

  renderFeatures() {
    return (
      <>
        <FeatureSliderWithToggleButton
          title="Acousticness"
          onChange={(enabled, value) =>
            this.onFeatureChange("acousticness", enabled, value)
          }
        />
        <FeatureSliderWithToggleButton
          title="Danceability"
          onChange={(enabled, value) =>
            this.onFeatureChange("danceability", enabled, value)
          }
        />
        <FeatureSliderWithToggleButton
          title="Energy"
          onChange={(enabled, value) =>
            this.onFeatureChange("energy", enabled, value)
          }
        />
        <FeatureSliderWithToggleButton
          title="Instrumentalness"
          onChange={(enabled, value) =>
            this.onFeatureChange("instrumentalness", enabled, value)
          }
        />
        <FeatureSliderWithToggleButton
          title="Live shows"
          onChange={(enabled, value) =>
            this.onFeatureChange("liveness", enabled, value)
          }
        />
        <FeatureSliderWithToggleButton
          title="Popularity"
          max={100}
          onChange={(enabled, value) =>
            this.onFeatureChange("popularity", enabled, value)
          }
        />
        <FeatureSliderWithToggleButton
          title="Speechiness"
          onChange={(enabled, value) =>
            this.onFeatureChange("speechiness", enabled, value)
          }
        />
        <FeatureSliderWithToggleButton
          title="Positivity"
          onChange={(enabled, value) =>
            this.onFeatureChange("valence", enabled, value)
          }
        />
        <FeatureSliderWithToggleButton
          title="Tempo"
          min={50}
          max={250}
          step={1}
          format={(value) => value}
          onChange={(enabled, value) =>
            this.onFeatureChange("tempo", enabled, value)
          }
        />
      </>
    );
  }

  onFeatureChange(feature, enabled, value) {
    this.setState((state) => {
      if (enabled) {
        state.features[feature] = value;
      } else {
        delete state.features[feature];
      }
      return { features: state.features };
    });
  }

  onTopArtistClick(index) {
    const topArtist = this.state.topArtists[index];
    this.setState((state) => ({
      pickedArtists: toggleElement(state.pickedArtists, topArtist),
    }));
  }

  onFollowedArtistClick(index) {
    const followedArtist = this.state.followedArtists[index];
    this.setState((state) => ({
      pickedArtists: toggleElement(state.pickedArtists, followedArtist),
    }));
  }

  onGenreClick(index) {
    const genre = this.state.genres[index];
    this.setState((state) => ({
      pickedArtists: toggleElement(state.pickedGenres, genre),
    }));
  }

  onTopTrackClick(index) {
    const topTrack = this.state.topTracks[index];
    this.setState((state) => ({
      pickedArtists: toggleElement(state.pickedTracks, topTrack),
    }));
  }
}

export default function MakeMyPlaylist() {
  return <Main />;
}
