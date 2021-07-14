import { BehaviorSubject, Observable } from 'rxjs';
import { Player } from './Player';
import { GameEvent, MappedEvent, FirstBloodEvent, AceEvent, KillType, KillEvent, MultiKillEvent } from './Events';
import fetch from 'node-fetch';
import { Logger } from 'tslog';

const log: Logger = new Logger({ name: "GameClient", displayInstanceName: false, displayFilePath: 'hidden', displayFunctionName: false });

const delayPromise = ms => new Promise<void>(resolve => setTimeout(() => resolve(), ms))
export class GameClient {
    private _players: Array<Player & { killingSpree: number }>;
    private _mapName: string;
    private _localPlayer: Player & { killingSpree: number };
    private eventQueue = new BehaviorSubject<Array<MappedEvent>>([]);
    private lastEventId: number;

    async run() {
        log.info('Waiting for game');
        while (true) {
            // Wait for the game
            while (!(this._players?.[0]?.summonerName)) {
                try {
                    this._players = (await this.fetchPlayers())?.map(p => ({
                        ...p,
                        killingSpree: 0,
                    }));
                } catch (ex) {
                    await delayPromise(1000);
                }
            }

            // Game found
            try {
                const activeSummName = await this.fetchActiveSummonerName();
                this._localPlayer = this.players.find(p => p.summonerName == activeSummName);
                const { team, summonerName, championName } = this._localPlayer
                log.info('Game found with', { team, summonerName, championName });
                this._mapName = await this.fetchMapName();
                this.lastEventId = -1;
                await this.requestEvents(false);
                while (true) {
                    try {
                        const events = await this.requestEvents(true);
                        if (events.length > 0) {
                            this.eventQueue.next([...this.eventQueue.value, ...events])
                        }
                    }
                    catch (err) {
                        log.info('Game aborted due to exception', err);
                        break;
                    }

                    this.eventQueue.next(this.eventQueue.value);
                    await delayPromise(50);
                }
            } catch (err) {
                log.info('Game aborted due to exception', err);
            }
            this._players = null;
            log.info('Waiting for game');
        }
    }

    async requestEvents(addToUnprocessed: boolean): Promise<Array<MappedEvent>> {
        const events = (await this.fetchEvents(this.lastEventId)).Events;
        if (events.length > 0) log.debug('Processing', events);
        const mappedEvents: Array<MappedEvent> = [];
        const resolveKillType = (killer: Player, victim: Player): KillType => {
            return !killer ? 'executed' : killer?.summonerName === this.localPlayerName
                ? 'localKill' : victim.summonerName === this.localPlayerName ? 'localDeath' :
                    killer?.team === this.localTeam ? 'ally' : 'enemy';
        }

        if (events.length > 0) {
            events.forEach((e, idx) => {
                if (e.EventName === 'GameStart') {
                    if (events.length === 1 || addToUnprocessed) {
                        const welcomeTime = this._mapName === 'Map12' ? 30 : 25;
                        const minionSpawnTime = 35;
                        setTimeout(() => {
                            this.eventQueue.next([...this.eventQueue.value,
                            {
                                EventName: 'Welcome',
                                EventTime: welcomeTime,
                                isHA: this._mapName === 'Map12',
                                hasAhri: this._players.some(p => p.championName === 'Ahri'),
                            }]);
                        }, welcomeTime * 1000);
                        if (this._mapName !== 'Map12') {
                            setTimeout(() => {
                                this.eventQueue.next([...this.eventQueue.value,
                                {
                                    EventName: 'MinionsWillSpawn',
                                    EventTime: minionSpawnTime
                                }]);
                            }, minionSpawnTime * 1000);
                        }
                    }
                }
                else if (e.EventName === 'ChampionKill') {
                    const killerName = e.KillerName;
                    const victimName = e.VictimName;
                    const killer = this._players.find(p => p.summonerName === killerName);
                    if (killer) killer.killingSpree++;
                    const victim = this._players.find(p => p.summonerName === victimName);
                    const mappedKillEvent: KillEvent = {
                        ...e,
                        KillingSpree: killer && killer.killingSpree,
                        MultikillStreak: 1,
                        Shutdown: killer && victim.killingSpree >= 2,
                        Type: resolveKillType(killer, victim),
                    };
                    if (addToUnprocessed) {
                        if (idx < events.length - 1 && events[idx + 1].EventName === 'FirstBlood') {
                            mappedEvents.push(events[idx + 1] as FirstBloodEvent);
                        } else if (idx < events.length - 1 && events[idx + 1].EventName === 'Ace') {
                            if (victim.killingSpree >= 2) {
                                mappedEvents.push(mappedKillEvent);
                            }
                            mappedEvents.push(events[idx + 1] as AceEvent);
                        } else if (idx >= events.length - 1 || events[idx + 1].EventName !== 'Multikill') {
                            mappedEvents.push(mappedKillEvent);
                        } else {
                            if (addToUnprocessed) {
                                const existingIdx = mappedEvents.findIndex(ue => ue.EventName === 'ChampionKill' && ue.KillerName === killerName);
                                const mappedMultiKillEvent = { ...mappedKillEvent, MultikillStreak: (events[idx + 1] as MultiKillEvent).KillStreak };
                                if (existingIdx >= 0) {
                                    mappedEvents.splice(existingIdx, 1, mappedMultiKillEvent);
                                } else {
                                    mappedEvents.push(mappedMultiKillEvent);
                                }

                                if (idx < events.length - 2 && events[idx + 2].EventName === 'Ace') {
                                    mappedEvents.push(events[idx + 2] as AceEvent);
                                }
                            }
                        }
                    }
                    if (killer) victim.killingSpree = 0;
                } else if (e.EventName === 'TurretKilled') {
                    if (addToUnprocessed) mappedEvents.push(
                        { EventTime: e.EventTime, EventName: e.EventName, Ally: e.TurretKilled.startsWith(this.turretPrefix) },
                    );
                } else if (e.EventName === 'InhibKilled') {
                    if (addToUnprocessed) mappedEvents.push(
                        { EventTime: e.EventTime, EventName: e.EventName, Ally: e.InhibKilled.startsWith(this.inhibPrefix) },
                    );
                } else if (e.EventName === 'InhibRespawningSoon') {
                    if (addToUnprocessed) mappedEvents.push(
                        { EventTime: e.EventTime, EventName: e.EventName, Ally: e.InhibRespawningSoon.startsWith(this.inhibPrefix) },
                    );
                } else if (e.EventName === 'MinionsSpawning') {
                    if (addToUnprocessed) mappedEvents.push(e);
                } else if (e.EventName === 'GameEnd') {
                    if (addToUnprocessed) mappedEvents.push(e);
                }
            })

            this.lastEventId = events[events.length - 1].EventID;
        }

        return mappedEvents;
    }

    observeEventQueue(): Observable<Array<MappedEvent>> {
        return this.eventQueue.asObservable();
    }

    removeEvent(event: MappedEvent) {
        this.eventQueue.next(this.eventQueue.value.filter(e => e !== event));
    }

    get players() {
        return this._players;
    }

    get localPlayerName() {
        return this._localPlayer.summonerName;
    }

    get localTeam() {
        return this._localPlayer.team;
    }

    get structurePrefix() {
        return this._localPlayer.team === 'ORDER' ? 'T1' : 'T2';
    }

    get turretPrefix() {
        return `Turret_${this.structurePrefix}`;
    }

    get inhibPrefix() {
        return `Barracks_${this.structurePrefix}`;
    }

    get mapName() {
        return this._mapName;
    }

    async fetchPlayers(): Promise<Array<Player>> {
        return fetch('https://127.0.0.1:2999/liveclientdata/playerlist', {}).then(res => res.json());
    }

    async fetchActiveSummonerName(): Promise<string> {
        return fetch('https://127.0.0.1:2999/liveclientdata/activeplayername', {}).then(res => res.json());
    }

    async fetchMapName(): Promise<string> {
        return fetch('https://127.0.0.1:2999/liveclientdata/gamestats', {}).then(res => res.json()).then(res => res.mapName);
    }

    async fetchEvents(lastEventId: number): Promise<{ Events: Array<GameEvent> }> {
        return fetch(`https://127.0.0.1:2999/liveclientdata/eventdata?eventID=${lastEventId + 1}`, {}).then(res => res.json());
    }
}