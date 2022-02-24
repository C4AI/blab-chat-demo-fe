## Installation:

- Install [Node.js](https://nodejs.org/) 17 or newer.
- Install the dependencies by running `npm install`.

- Set the required environment variables. This can be done using
  system tools, cloud server settings or [`.env` files](https://create-react-app.dev/docs/adding-custom-environment-variables/#what-other-env-files-can-be-used): _.env_ is always loaded;
  _.env.development_ and _.env.production_ are only loaded
  in the corresponding environments; _.env.development.local_
  and _.env.production.local_ are only loaded
  in the corresponding environments and are not committed to
  the repository. The _.env.development_ file has an initial
  setup. The environment variables are listed below.

  - `REACT_APP_CHAT_MODE`: Either _rooms_ or _bots_.
    In _rooms_ mode, which should only be used for testing
    purposes, users can create chat rooms and talk to each
    other and to bots. In _bots_ mode, the user cannot see
    or create rooms and can only start conversations with
    bots.
  - `REACT_APP_CHAT_BOTS`: A JSON-encoded array of bots
    to include. Only used if mode is _bots_. Must contain
    only bots that the server provides. Example:
    `["Calculator", "ECHO"]`.
  - `REACT_APP_CHAT_WS_URL`: address of the WebSocket server.
    In a development environment, it should be set to
    `"ws://localhost:8000"` (or a similar address if
    the back-end server is listening on a different port).
    In a production environment, it might not be needed
    if the server is the same as the one that hosts the
    front-end.

- To start the development server, run `npm start`.

- To generate a static build for production, run `npm run build`.
