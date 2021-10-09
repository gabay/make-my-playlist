import Token from "./token";

export function logout() {
  Token.removeFromLocalStorage();
  window.location.reload();
}

export function login() {
  const redirect_uri = window.location.origin;
  const scope =
    "user-read-recently-played user-follow-read user-library-read user-top-read playlist-modify-public";
  const clientID = "5ce934443d3141d48472a8ff73d60a66";
  window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&redirect_uri=${redirect_uri}&scope=${scope}`;
}
