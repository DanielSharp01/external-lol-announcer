import { MappedEvent } from './Events';
import { VoiceLineCollection } from './voiceLines';
import * as voiceLines from './voiceLines';

const timeEssentiallyEquals = (a: number, b: number) => {
    return Math.abs(a - b) <= 0.1;
}

const mapPseudoEventName = (e: MappedEvent): string => {
    if (e.EventName === 'ChampionKill') {
        if (e.MultikillStreak >= 3) return 'Multikill';
        if (e.Shutdown) return 'Shutdown';
        if (e.MultikillStreak >= 2) return 'Multikill';
    }

    return e.EventName;
}

export function getNextAnnoucementEvent(evts: Array<MappedEvent>): MappedEvent {
    const eventNamePriority = [
        'GameEnd', 'FirstBlood', 'Multikill', 'Welcome', 'MinionsWillSpawn', 'MinionsSpawning',
        'TurretKilled', 'InhibKilled', 'Shutdown', 'ChampionKill', 'Ace', 'InhibRespawningSoon',
    ];

    evts.sort((a, b) => {
        if (!timeEssentiallyEquals(a.EventTime, b.EventTime)) {
            return a.EventTime - b.EventTime;
        }

        return eventNamePriority.indexOf(mapPseudoEventName(a)) - eventNamePriority.indexOf(mapPseudoEventName(b));
    });

    return evts[0];
}

export function getVoiceLineFromEvent(event: MappedEvent): VoiceLineCollection {

    switch (event.EventName) {
        case 'GameEnd':
            if (event.Result === 'Win') {
                return voiceLines.victory;
            } else {
                return voiceLines.defeat;
            }
        case "Welcome":
            return event.hasAhri ? voiceLines.welcomeAhri : event.isHA ? voiceLines.welcomeAram : voiceLines.welcome;
        case "MinionsWillSpawn":
            return voiceLines.minionsWillSpawn;
        case "MinionsSpawning":
            return voiceLines.minionsSpawned;
        case "Ace":
            return voiceLines.ace;
        case 'FirstBlood':
            return voiceLines.firstBlood;
        case 'ChampionKill':
            const pseudoName = mapPseudoEventName(event);
            if (pseudoName === 'Multikill') {
                if (event.Type === 'localKill' || event.Type === 'ally') {
                    return voiceLines.allyMultiKill[Math.min(event.MultikillStreak, 5)];
                } else {
                    return voiceLines.enemyMultiKill[Math.min(event.MultikillStreak, 5)];
                }
            } else if (pseudoName === 'Shutdown') {
                return voiceLines.shutDown;
            } else if (event.KillingSpree >= 3) {
                if (event.Type === 'localKill') {
                    return voiceLines.playerKillingSpree[Math.min(event.KillingSpree, 8)];
                } else if (event.Type === 'ally') {
                    return voiceLines.allyKillingSpree[Math.min(event.KillingSpree, 8)];
                } else {
                    return voiceLines.enemyKillingSpree[Math.min(event.KillingSpree, 8)];
                }
            } else if (event.Type === 'localKill') {
                return voiceLines.onPlayerKill;
            } else if (event.Type === 'localDeath') {
                return voiceLines.onPlayerDeath;
            } else if (event.Type === 'ally') {
                return voiceLines.allyMultiKill[1];
            } else if (event.Type === 'enemy') {
                return voiceLines.enemyMultiKill[1];
            } else {
                return voiceLines.executed;
            }
        case 'TurretKilled':
            if (event.Ally) {
                return voiceLines.allyTurretDestroyed;
            } else {
                return voiceLines.enemyTurretDestroyed;
            }
        case 'InhibKilled':
            if (event.Ally) {
                return voiceLines.allyInhibDestroyed;
            } else {
                return voiceLines.enemyInhibDestroyed;
            }
        case 'InhibRespawningSoon':
            if (event.Ally) {
                return voiceLines.allyInhibRespawning;
            } else {
                return voiceLines.enemyInhibRespawning;
            }
    }
}