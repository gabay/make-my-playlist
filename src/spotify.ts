import SpotifyWebApi from "spotify-web-api-node";
import { logout } from "./login";

export default class Spotify {
  spotify: SpotifyWebApi;

  constructor(token: string) {
    this.spotify = new SpotifyWebApi();
    this.spotify.setAccessToken(token);
  }

  async search(query: string, types: any[], options?: any): Promise<any> {
    return this.spotify.search(query, types, options).then((result) => {
      logResult(`search(${query})`, result);
      return result.body;
    })
  }

  async getMyTopArtists(limit: number = 50): Promise<any> {
    return this.spotify.getMyTopArtists({ limit: limit }).then((result) => {
      logResult("getMyTopArtists", result);
      return result.body.items;
    }, handleError);
  }

  async getFollowedArtists(): Promise<any> {
    return this.spotify.getFollowedArtists({ limit: 50 }).then((result) => {
      logResult("getFollowedArtists", result);
      return result.body.artists.items;
    }, handleError);
  }

  async getArtistAlbums(artistId: string, options: any): Promise<any> {
    return this.spotify.getArtistAlbums(artistId, options).then((result) => {
      logResult("getArtistAlbums", result);
      return result.body.items;
    }, handleError);
  }

  async getMyTopTracks(): Promise<any> {
    return this.spotify.getMyTopTracks({ limit: 50 }).then((result) => {
      logResult("getMyTopTracks", result);
      return result.body.items;
    }, handleError);
  }

  async getNewReleases(options: any): Promise<any> {
    return this.spotify.getNewReleases(options).then((result) => {
      logResult("getNewReleases", result);
      return result.body.albums.items;
    }, handleError);
  }

  async getAlbums(albumIds: string[]): Promise<any> {
    return this.spotify.getAlbums(albumIds).then((result) => {
      logResult("getAlbums", result);
      return result.body.albums;
    }, handleError);
  }

  async getAlbumTracks(albumId: string): Promise<any> {
    return this.spotify.getAlbumTracks(albumId).then((result) => {
      logResult("getAlbumTracks", result);
      return result.body.items;
    }, handleError);
  }

  async getRecommendations(options: any): Promise<any> {
    return this.spotify.getRecommendations(options).then((result) => {
      logResult("getRecommendations", result);
      return result.body.tracks;
    }, handleError);
  }

  async getAvailableGenreSeeds(options: any): Promise<any> {
    return this.spotify.getAvailableGenreSeeds().then((result) => {
      logResult("getAvailableGenreSeeds", result);
      return result.body.genres;
    }, handleError);
  }

  async createPlaylist(options: any): Promise<any> {
    return this.spotify.createPlaylist(options).then((result) => {
      logResult("createPlaylist", result);
      return result.body;
    }, handleError);
  }

  async addTracksToPlaylist(playlistId: string, tracks: any[], options: any): Promise<any> {
    if (tracks.length > 100) {
      return this.addTracksToPlaylist(playlistId, tracks.slice(0, 100), options).then((result) => this.addTracksToPlaylist(playlistId, tracks.slice(100), options), handleError);
    }
    const trackURIs = tracks.map((track) => track.uri);
    return this.spotify
      .addTracksToPlaylist(playlistId, trackURIs, options)
      .then((result) => {
        logResult("addTracksToPlaylist", result);
        return result.body;
      }, handleError);
  }
}

function logResult(title: string, result: any) {
  console.log(title);
  console.log(result);
}

function handleError(error: any) {
  console.error("[*] SPOTIFY REQUEST ERRORED:");
  console.error(error);
  if (error.statusCode === 401) {
    alert("Access token expired, logging you out");
    logout();
  }
}
