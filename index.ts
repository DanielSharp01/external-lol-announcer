import playSound from 'play-sound';
import fs from 'fs';
import fetch from 'node-fetch';

const player = playSound({});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const oggList = fs.readdirSync('./ogg');

const getAllVoiceLines = (prefix: string) => {
    return oggList.filter(ogg => ogg.startsWith(prefix));
}

const welcome = getAllVoiceLines('upon_entering_summoners_rift');
const welcomeAram = getAllVoiceLines('upon_entering_howling_abyss');
const ahriWelcome = getAllVoiceLines('when_ahri_is_in_the_game');

const minionsWillSpawn = getAllVoiceLines('minions_spawning');
const minionsSpawned = getAllVoiceLines('minions_spawned');

const firstBlood = getAllVoiceLines('upon_first_blood');

const allyMultiKill = {
    1: getAllVoiceLines('on_ally_kill'),
    2: getAllVoiceLines('ally_double_kill'),
    3: getAllVoiceLines('ally_triple_kill'),
    4: getAllVoiceLines('ally_quadra_kill'),
    5: getAllVoiceLines('ally_pentakill'),
};
const allyKillingSpree = {
    3: getAllVoiceLines('an_ally_killing_spree'),
    4: getAllVoiceLines('an_ally_rampage'),
    5: getAllVoiceLines('an_ally_is_unstoppable'),
    6: getAllVoiceLines('an_ally_is_dominating'),
    7: getAllVoiceLines('an_ally_is_godlike'),
    8: getAllVoiceLines('an_ally_is_legendary'),
};

const enemyMultiKill = {
    1: getAllVoiceLines('on_enemy_kill'),
    2: getAllVoiceLines('enemy_double_kill'),
    3: getAllVoiceLines('enemy_triple_kill'),
    4: getAllVoiceLines('enemy_quadra_kill'),
    5: getAllVoiceLines('enemy_pentakill'),
};
const enemyKillingSpree = {
    3: getAllVoiceLines('an_enemy_killing_spree'),
    4: getAllVoiceLines('an_enemy_rampage'),
    5: getAllVoiceLines('an_enemy_is_unstoppable'),
    6: getAllVoiceLines('an_enemy_is_dominating'),
    7: getAllVoiceLines('an_enemy_is_godlike'),
    8: getAllVoiceLines('an_enemy_is_legendary'),
};

const onPlayerKill = getAllVoiceLines('on_player_kill');
const onPlayerDeath = getAllVoiceLines('on_player_death');
const playerKillingSpree = {
    3: getAllVoiceLines('the_player_goes_on_a_killing_spree'),
    4: getAllVoiceLines('the_player_goes_on_a_rampage'),
    5: getAllVoiceLines('the_player_is_unstoppable'),
    6: getAllVoiceLines('the_player_is_dominating'),
    7: getAllVoiceLines('the_player_is_godlike'),
    8: getAllVoiceLines('the_player_is_legendary'),
};

const shutDown = getAllVoiceLines('upon_shut_down');
const executed = getAllVoiceLines('upon_execution');
const ace = getAllVoiceLines('when_an_ace_occurs');

const victory = getAllVoiceLines('upon_victory');
const defeat = getAllVoiceLines('upon_defeat');

const allyTurretDestroyed = getAllVoiceLines('upon_an_allied_turret_being_destroyed');
const allyInhibDestroyed = getAllVoiceLines('upon_allied_inhibitor_being_destroyed');
const allyInhibRespawning = getAllVoiceLines('upon_allied_inhibitor_respawning_soon');
const enemyTurretDestroyed = getAllVoiceLines('upon_an_enemy_turret_being_destroyed');
const enemyInhibDestroyed = getAllVoiceLines('upon_enemy_inhibitor_being_destroyed');
const enemyInhibRespawning = getAllVoiceLines('upon_enemy_inhibitor_respawning_soon');

const delayPromise = ms => new Promise<void>(resolve => setTimeout(() => resolve(), ms))

const pickRandom = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
}

const playOgg = (name) => {
    return new Promise<void>(resolve => player.play(`ogg/${name}`, {
        mplayer: ['-softvol', '-volume', '5'],
    }, () => resolve()));
}

const getPlayers = async (): Promise<any> => {
    return fetch('https://127.0.0.1:2999/liveclientdata/playerlist', {}).then(res => res.json());
}

const getActivePlayerName = async (): Promise<string> => {
    return fetch('https://127.0.0.1:2999/liveclientdata/activeplayername', {}).then(res => res.json());
}
const getMapName = async (): Promise<string> => {

    return fetch('https://127.0.0.1:2999/liveclientdata/gamestats', {}).then(res => res.json()).then(res => res.mapName);
}

const getEvents = async (lastEventId: number): Promise<any> => {
    return fetch(`https://127.0.0.1:2999/liveclientdata/eventdata?eventID=${lastEventId + 1}`, {}).then(res => res.json());
}

(async () => {
    while (true) {
        let players;
        while (!(players?.[0]?.summonerName)) {
            try {
                players = (await getPlayers())?.map(p => ({
                    ...p,
                    killingSpree: 0,
                }));
            } catch (ex) {
                await delayPromise(1000);
            }
        }
        const activeSummonerName = await getActivePlayerName();
        let lastEventId = -1;

        const localPlayer = players.find(p => p.summonerName === activeSummonerName);
        const structurePrefix = localPlayer.team === 'ORDER' ? 'T1' : 'T2';
        let currentOgg = Promise.resolve();
        let canQueue = true;

        const queueOgg = arr => {
            const picked = pickRandom(arr);
            console.log('Playing', picked);
            currentOgg = currentOgg.then(() => playOgg(picked));
            currentOgg.then(() => {
                canQueue = true;
            })
            canQueue = false;
        }

        let unprocessedEvents = [];

        const queueRightVoiceLine = () => {
            const findAndRemove = (name: string, callback: (e: any) => void): boolean => {
                const idx = unprocessedEvents.findIndex(e => e.EventName === name || (name === 'Shutdown' && e.shutdown));
                if (idx >= 0) {
                    console.log(unprocessedEvents[idx]);
                    callback(unprocessedEvents[idx]);
                    unprocessedEvents.splice(idx, 1);
                    return true;
                }

                return false;
            }

            const anyOf = (...params: Array<boolean>) => {
                return params.some(s => s);
            }

            anyOf(
                findAndRemove('GameEnd', e => {
                    unprocessedEvents = [];
                    if (e.Result === 'Win') {
                        queueOgg(victory);
                    } else {
                        queueOgg(defeat);
                    }
                }),
                findAndRemove('FirstBlood', e => {
                    queueOgg(firstBlood);
                }),
                findAndRemove('Multikill', e => {
                    if (e.KillStreak >= 3 || !e.shutdown) {
                        if (e.type === 'localKill' || e.type === 'ally') {
                            queueOgg(allyMultiKill[Math.min(e.KillStreak, 5)]);
                        } else {
                            queueOgg(enemyMultiKill[Math.min(e.KillStreak, 5)]);
                        }
                    } else {
                        queueOgg(shutDown);
                    }
                }),
                findAndRemove('Welcome', e => {
                    queueOgg(e.hasAhri ? ahriWelcome : e.isHA ? welcomeAram : welcome);
                }),
                findAndRemove('MinionsWillSpawn', e => {
                    queueOgg(minionsWillSpawn);
                }),
                findAndRemove('MinionsSpawning', e => {
                    queueOgg(minionsSpawned);
                }),
                findAndRemove('TurretKilled', e => {
                    const isAlly = e.TurretKilled.startsWith(`Turret_${structurePrefix}`);
                    if (isAlly) {
                        queueOgg(allyTurretDestroyed);
                    } else {
                        queueOgg(enemyTurretDestroyed);
                    }
                }),
                findAndRemove('InhibKilled', e => {
                    const isAlly = e.InhibKilled.startsWith(`Barracks_${structurePrefix}`);
                    if (isAlly) {
                        queueOgg(allyInhibDestroyed);
                    } else {
                        queueOgg(enemyInhibDestroyed);
                    }
                }),
                findAndRemove('Shutdown', e => {
                    queueOgg(shutDown);
                }),
                findAndRemove('ChampionKill', e => {
                    if (e.killingSpree >= 3) {
                        if (e.type === 'localKill') {
                            queueOgg(playerKillingSpree[Math.min(e.killingSpree, 8)]);
                        } else if (e.type === 'ally') {
                            queueOgg(allyKillingSpree[Math.min(e.killingSpree, 8)]);
                        } else {
                            queueOgg(enemyKillingSpree[Math.min(e.killingSpree, 8)]);
                        }
                    } else if (e.type === 'localKill') {
                        queueOgg(onPlayerKill);
                    } else if (e.type === 'localDeath') {
                        queueOgg(onPlayerDeath);
                    } else if (e.type === 'ally') {
                        queueOgg(allyMultiKill[1]);
                    } else if (e.type === 'enemy') {
                        queueOgg(enemyMultiKill[1]);
                    } else {
                        queueOgg(executed);
                    }
                }),
                findAndRemove('Ace', e => {
                    queueOgg(ace);
                }),
                findAndRemove('InhibRespawningSoon', e => {
                    const isAlly = e.InhibRespawningSoon.startsWith(`Barracks_${structurePrefix}`);
                    if (isAlly) {
                        queueOgg(allyInhibRespawning);
                    } else {
                        queueOgg(enemyInhibRespawning);
                    }
                }),
            );
        }

        const mapName = await getMapName();
        const requestEvents = async (addToUnprocessed: boolean) => {
            const events = (await getEvents(lastEventId)).Events;
            if (events.length > 0) {
                events.forEach((e, idx) => {
                    if (e.EventName === 'GameStart') {
                        if (events.length === 1 || addToUnprocessed) {
                            setTimeout(() => {
                                unprocessedEvents.push({ EventName: 'Welcome', isHA: mapName === 'Map12', hasAhri: players.some(p => p.championName === 'Ahri') });
                            }, mapName === 'Map12' ? 30000 : 25000);
                            if (mapName !== 'Map12') {
                                setTimeout(() => {
                                    unprocessedEvents.push({ EventName: 'MinionsWillSpawn' });
                                }, 35000);
                            }
                        }
                    }
                    else if (e.EventName === 'ChampionKill') {
                        const killer = players.find(p => p.summonerName === e.KillerName);
                        if (killer) killer.killingSpree++;
                        const victim = players.find(p => p.summonerName === e.VictimName);
                        if (addToUnprocessed) {
                            if (idx < events.length - 1 && events[idx + 1].EventName === 'FirstBlood') {
                                unprocessedEvents.push(events[idx + 1]);
                            } else if (idx < events.length - 1 && events[idx + 1].EventName === 'Ace') {
                                if (victim.killingSpree >= 2) {
                                    unprocessedEvents.push({
                                        ...e,
                                        killingSpree: killer.killingSpree,
                                        shutdown: killer && victim.killingSpree >= 2,
                                        type: !killer ? 'executed' : killer?.summonerName === localPlayer.summonerName
                                            ? 'localKill' : victim.summonerName === localPlayer.summonerNAme ? 'localDeath' :
                                                killer?.team === localPlayer.team ? 'ally' : 'enemy',
                                    });
                                }
                                unprocessedEvents.push(events[idx + 1]);
                            } else if (idx >= events.length - 1 || events[idx + 1].EventName !== 'Multikill') {
                                unprocessedEvents.push({
                                    ...e,
                                    killingSpree: killer?.killingSpree ?? 0,
                                    shutdown: killer && victim.killingSpree >= 2,
                                    type: !killer ? 'executed' : killer?.summonerName === localPlayer.summonerName
                                        ? 'localKill' : victim.summonerName === localPlayer.summonerName ? 'localDeath' :
                                            killer?.team === localPlayer.team ? 'ally' : 'enemy',
                                });
                            } else {
                                e = events[idx + 1];
                                if (addToUnprocessed) {
                                    const killer = players.find(p => p.summonerName === events[idx].KillerName);
                                    const victim = players.find(p => p.summonerName === events[idx].VictimName);
                                    const existingIdx = unprocessedEvents.findIndex(ue => ue.EventName === 'Multikill' && ue.KillerName === e.KillerName);
                                    if (existingIdx >= 0) {
                                        unprocessedEvents.splice(existingIdx, 1, {
                                            ...e,
                                            killingSpree: killer.killingSpree,
                                            shutdown: killer && victim.killingSpree >= 2,
                                            type: !killer ? 'executed' : killer?.summonerName === localPlayer.summonerName
                                                ? 'localKill' : victim.summonerName === localPlayer.summonerName ? 'localDeath' :
                                                    killer?.team === localPlayer.team ? 'ally' : 'enemy',
                                        });
                                    } else {
                                        unprocessedEvents.push({
                                            ...e,
                                            killingSpree: killer?.killingSpree,
                                            shutdown: killer && victim.killingSpree >= 2,
                                            type: !killer ? 'executed' : killer?.summonerName === localPlayer.summonerName
                                                ? 'localKill' : victim.summonerName === localPlayer.summonerName ? 'localDeath' :
                                                    killer?.team === localPlayer.team ? 'ally' : 'enemy',
                                        });
                                    }

                                    if (idx < events.length - 2 && events[idx + 2].EventName === 'Ace') {
                                        unprocessedEvents.push(events[idx + 2]);
                                    }
                                }
                            }
                        }
                        if (killer) victim.killingSpree = 0;
                    } else if (e.EventName === 'TurretKilled') {
                        if (addToUnprocessed) unprocessedEvents.push(e);
                    } else if (e.EventName === 'InhibKilled') {
                        if (addToUnprocessed) unprocessedEvents.push(e);
                    } else if (e.EventName === 'InhibRespawningSoon') {
                        if (addToUnprocessed) unprocessedEvents.push(e);
                    } else if (e.EventName === 'MinionsSpawning') {
                        if (addToUnprocessed) unprocessedEvents.push(e);
                    } else if (e.EventName === 'GameEnd') {
                        if (addToUnprocessed) unprocessedEvents.push(e);
                    }
                })

                lastEventId = events[events.length - 1].EventID;
            }
        }
        await requestEvents(false);
        while (true) {
            try {
                await requestEvents(true);
            }
            catch (err) {
                break;
            }

            if (canQueue) queueRightVoiceLine();
            await delayPromise(100);
        }
    }
})();