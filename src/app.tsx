import React from "react";
import { Nav } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { BrowserRouter as Router, Link, Route, Routes } from "react-router-dom";
import { login } from "./login";
import MakeMyPlaylist from "./makeMyPlaylist";
import PreviewAlbums from "./previewAlbums";
import Token from "./token";

function Login() {
  if (Token.fromURI() !== "") {
    Token.setInLocalStorage(Token.fromURI());
    window.location.href = window.location.origin;
    return <></>;
  }

  return (
    <div className="text-center">
      <br />
      <h2>Make my playlist</h2>
      <Button variant="success" onClick={login}>
        Log in with spotify
      </Button>
    </div>
  );
}

export default function App() {
  if (Token.fromLocalStorage() === "") {
    return <Login />;
  }

  return (
    <Router>
      <Nav>
        <Nav.Item>
          <Nav.Link>
            <Link to="/">Home</Link>
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link>
            <Link to="/preview_albums">Preview Albums</Link>
          </Nav.Link>
        </Nav.Item>
      </Nav>

      <Routes>
        <Route path="/" element={<MakeMyPlaylist />} />
        <Route path="/preview_albums" element={<PreviewAlbums />} />
      </Routes>
    </Router>
  );
}
