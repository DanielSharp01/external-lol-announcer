# External League of Legends announcer

League of Legends has made it difficult to change the announcer to one of the event ones with simple file changes. This project aims to "bring back" that feature by hooking into the `liveclientdata` API of the game client and replicating the announcer logic as best as possible. There are a couple assumptions made but with time problems can get ironed out. Based on my own experience it's already quite convincing.

## Usage

1. `npm install` to install dependencies
2. `npm link` to create a semi executable
3. `external-announcer [--debug]` optional `debug` flag to see events

As of now you will need a shell that can run `.sh` scripts, I use and recommend git bash on Windows.

## Configuring different voice lines

Apart from the greeting Ahri logic there's nothing connected to her being the announcer, if you change the files different announcers will work. But will somehow have to live with saying something else when an Ahri is in game 😛

If someone will ever raise an issue I will make this behavior configurable.

## Notable issues
- Shutdown gold is impossible to find in the `liveclientdata` API so a simple heuristic is used (2 kill killing spree), it works suprisingly well
- Summoner disconnected and reconnected messages are missing the API does not support them 😔