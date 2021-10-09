const TOKEN_KEY = "token";

type Dictionary<V> = {
  [key: string]: V;
};

function getParamsFromURLFragment(): Dictionary<string> {
  var params: Dictionary<string> = {};
  const regex = /([^&;=]+)=?([^&;]*)/g;
  const paramsString = window.location.hash.substring(1);
  while (true) {
    const match = regex.exec(paramsString);
    if (match === null) {
      return params;
    }
    params[match[1]] = decodeURIComponent(match[2]);
  }
}

function fromURI(): string {
  const params = getParamsFromURLFragment();
  const access_token = params["access_token"];
  return access_token == null ? "" : access_token;
}

function fromLocalStorage(): string {
  const token = localStorage.getItem(TOKEN_KEY);
  return token == null ? "" : token;
}

function setInLocalStorage(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

function removeFromLocalStorage() {
  localStorage.removeItem(TOKEN_KEY);
}

export default {
  fromURI,
  fromLocalStorage,
  setInLocalStorage,
  removeFromLocalStorage,
};
