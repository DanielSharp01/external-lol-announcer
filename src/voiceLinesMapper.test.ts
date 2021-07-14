import { getNextAnnoucementEvent, getVoiceLineFromEvent } from './voiceLineMapper';
import * as voiceLines from './voiceLines';
import { mainLogger } from './Loggers';

describe("getNextAnnoucementEvent should return right priority", () => {
    beforeAll(() => {
        mainLogger.setSettings({ suppressStdOutput: true });
    });

    test("Time matters", () => {
        expect(getNextAnnoucementEvent([
            { EventID: 0, EventTime: 0.15, EventName: 'Ace', AcerName: 'Someone' },
            { EventID: 1, EventTime: 0, EventName: 'FirstBlood', KillerName: 'Someone' },
        ]).EventID).toEqual(1);
    });

    test("Essentialy equal time (FirstBlood > Ace)", () => {
        expect(getNextAnnoucementEvent([
            { EventID: 0, EventTime: 0, EventName: 'Ace', AcerName: 'Someone' },
            { EventID: 1, EventTime: 0.05, EventName: 'FirstBlood', KillerName: 'Someone' },
        ]).EventID).toEqual(1);
    });

    test("Same time (Multikill > ChampionKill)", () => {
        expect(getNextAnnoucementEvent([
            { EventID: 0, EventTime: 0, EventName: 'ChampionKill', Type: 'localKill', KillerName: 'Someone', Shutdown: false, KillingSpree: 3, MultikillStreak: 3 },
            { EventID: 1, EventTime: 0, EventName: 'ChampionKill', Type: 'localKill', KillerName: 'Someone', Shutdown: false, KillingSpree: 3, MultikillStreak: 1 },
        ]).EventID).toEqual(0);
    });

    test("Same time (Shutdown > ChampionKill)", () => {
        expect(getNextAnnoucementEvent([
            { EventID: 0, EventTime: 0, EventName: 'ChampionKill', Type: 'localKill', KillerName: 'Someone', Shutdown: true, KillingSpree: 3, MultikillStreak: 1 },
            { EventID: 1, EventTime: 0, EventName: 'ChampionKill', Type: 'localKill', KillerName: 'Someone', Shutdown: false, KillingSpree: 3, MultikillStreak: 1 },
        ]).EventID).toEqual(0);
    });

    test("Same time (Multikill > Shutdown)", () => {
        expect(getNextAnnoucementEvent([
            { EventID: 0, EventTime: 0, EventName: 'ChampionKill', Type: 'localKill', KillerName: 'Someone', Shutdown: false, KillingSpree: 3, MultikillStreak: 3 },
            { EventID: 1, EventTime: 0, EventName: 'ChampionKill', Type: 'localKill', KillerName: 'Someone', Shutdown: true, KillingSpree: 3, MultikillStreak: 1 },
        ]).EventID).toEqual(0);
    });

    test("Same time (Multikill > Double kill shutdown)", () => {
        expect(getNextAnnoucementEvent([
            { EventID: 0, EventTime: 0, EventName: 'ChampionKill', Type: 'localKill', KillerName: 'Someone', Shutdown: false, KillingSpree: 3, MultikillStreak: 3 },
            { EventID: 1, EventTime: 0, EventName: 'ChampionKill', Type: 'localKill', KillerName: 'Someone', Shutdown: true, KillingSpree: 3, MultikillStreak: 2 },
        ]).EventID).toEqual(0);
    });
});

describe("getVoiceLineFromEvent should return the right voice line", () => {
    test("GameEnd Win", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'GameEnd',
            Result: 'Win',
        })).toEqual(voiceLines.victory);
    });

    test("GameEnd Lose", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'GameEnd',
            Result: 'Lose',
        })).toEqual(voiceLines.defeat);
    });

    test("Welcome SR Ahri", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'Welcome',
            hasAhri: true,
            isHA: false,
        })).toEqual(voiceLines.welcomeAhri);
    });

    test("Welcome SR", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'Welcome',
            hasAhri: false,
            isHA: false,
        })).toEqual(voiceLines.welcome);
    });

    test("Welcome HA Ahri", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'Welcome',
            hasAhri: true,
            isHA: true,
        })).toEqual(voiceLines.welcomeAhri);
    });

    test("Welcome HA", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'Welcome',
            hasAhri: false,
            isHA: true,
        })).toEqual(voiceLines.welcomeAram);
    });

    test("FirstBlood", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'FirstBlood',
            KillerName: 'Someone'
        })).toEqual(voiceLines.firstBlood);
    });

    test("Ace", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'Ace',
            AcerName: 'Someone'
        })).toEqual(voiceLines.ace);
    });

    test("MinionsWillSpawn", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'MinionsWillSpawn',
        })).toEqual(voiceLines.minionsWillSpawn);
    });

    test("MinionsSpawning", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'MinionsSpawning',
        })).toEqual(voiceLines.minionsSpawned);
    });

    test("TurretKilled ally", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'TurretKilled',
            Ally: true,
        })).toEqual(voiceLines.allyTurretDestroyed);
    });

    test("TurretKilled enemy", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'TurretKilled',
            Ally: false,
        })).toEqual(voiceLines.enemyTurretDestroyed);
    });

    test("InhibKilled ally", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'InhibKilled',
            Ally: true,
        })).toEqual(voiceLines.allyInhibDestroyed);
    });

    test("InhibKilled enemy", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'InhibKilled',
            Ally: false,
        })).toEqual(voiceLines.enemyInhibDestroyed);
    });

    test("InhibRespawning ally", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'InhibRespawningSoon',
            Ally: true,
        })).toEqual(voiceLines.allyInhibRespawning);
    });

    test("InhibRespawning enemy", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'InhibRespawningSoon',
            Ally: false,
        })).toEqual(voiceLines.enemyInhibRespawning);
    });
});

describe('getVoiceLineFromEvent should deal with ChampionKills', () => {
    beforeAll(() => {
        mainLogger.setSettings({ suppressStdOutput: true });
    });

    test("localKill", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'localKill',
            KillerName: 'Someone',
            KillingSpree: 1,
            MultikillStreak: 1,
            Shutdown: false,
        })).toEqual(voiceLines.onPlayerKill);
    });

    test("localKill killing spree", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'localKill',
            KillerName: 'Someone',
            KillingSpree: 5,
            MultikillStreak: 1,
            Shutdown: false,
        })).toEqual(voiceLines.playerKillingSpree[5]);
    });

    test("localKill killing spree multikill", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'localKill',
            KillerName: 'Someone',
            KillingSpree: 5,
            MultikillStreak: 5,
            Shutdown: false,
        })).toEqual(voiceLines.allyMultiKill[5]);
    });

    test("localKill killing spree shutdown", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'localKill',
            KillerName: 'Someone',
            KillingSpree: 5,
            MultikillStreak: 1,
            Shutdown: true,
        })).toEqual(voiceLines.shutDown);
    });

    test("localKill shutdown", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'localKill',
            KillerName: 'Someone',
            KillingSpree: 1,
            MultikillStreak: 1,
            Shutdown: true,
        })).toEqual(voiceLines.shutDown);
    });

    test("localKill double kill", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'localKill',
            KillerName: 'Someone',
            KillingSpree: 1,
            MultikillStreak: 2,
            Shutdown: false,
        })).toEqual(voiceLines.allyMultiKill[2]);
    });

    test("localKill double kill shutdown", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'localKill',
            KillerName: 'Someone',
            KillingSpree: 1,
            MultikillStreak: 2,
            Shutdown: true,
        })).toEqual(voiceLines.shutDown);
    });

    test("localKill penta kill", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'localKill',
            KillerName: 'Someone',
            KillingSpree: 1,
            MultikillStreak: 5,
            Shutdown: false,
        })).toEqual(voiceLines.allyMultiKill[5]);
    });

    test("localKill penta kill shutdown", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'localKill',
            KillerName: 'Someone',
            KillingSpree: 1,
            MultikillStreak: 5,
            Shutdown: true,
        })).toEqual(voiceLines.allyMultiKill[5]);
    });

    test("localDeath", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'localDeath',
            KillerName: 'Someone',
            KillingSpree: 1,
            MultikillStreak: 1,
            Shutdown: false,
        })).toEqual(voiceLines.onPlayerDeath);
    });

    test("localDeath killing spree", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'localDeath',
            KillerName: 'Someone',
            KillingSpree: 5,
            MultikillStreak: 1,
            Shutdown: false,
        })).toEqual(voiceLines.enemyKillingSpree[5]);
    });

    test("localDeath killing spree multikill", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'localDeath',
            KillerName: 'Someone',
            KillingSpree: 5,
            MultikillStreak: 5,
            Shutdown: false,
        })).toEqual(voiceLines.enemyMultiKill[5]);
    });

    test("localDeath killing spree shutdown", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'localDeath',
            KillerName: 'Someone',
            KillingSpree: 5,
            MultikillStreak: 1,
            Shutdown: true,
        })).toEqual(voiceLines.shutDown);
    });

    test("localDeath shutdown", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'localDeath',
            KillerName: 'Someone',
            KillingSpree: 1,
            MultikillStreak: 1,
            Shutdown: true,
        })).toEqual(voiceLines.shutDown);
    });

    test("localDeath double kill", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'localDeath',
            KillerName: 'Someone',
            KillingSpree: 1,
            MultikillStreak: 2,
            Shutdown: false,
        })).toEqual(voiceLines.enemyMultiKill[2]);
    });

    test("localDeath double kill shutdown", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'localDeath',
            KillerName: 'Someone',
            KillingSpree: 1,
            MultikillStreak: 2,
            Shutdown: true,
        })).toEqual(voiceLines.shutDown);
    });

    test("localDeath penta kill", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'localDeath',
            KillerName: 'Someone',
            KillingSpree: 1,
            MultikillStreak: 5,
            Shutdown: false,
        })).toEqual(voiceLines.enemyMultiKill[5]);
    });

    test("localDeath penta kill shutdown", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'localDeath',
            KillerName: 'Someone',
            KillingSpree: 1,
            MultikillStreak: 5,
            Shutdown: true,
        })).toEqual(voiceLines.enemyMultiKill[5]);
    });

    test("ally kill", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'ally',
            KillerName: 'Someone',
            KillingSpree: 1,
            MultikillStreak: 1,
            Shutdown: false,
        })).toEqual(voiceLines.allyMultiKill[1]);
    });

    test("ally killing spree", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'ally',
            KillerName: 'Someone',
            KillingSpree: 5,
            MultikillStreak: 1,
            Shutdown: false,
        })).toEqual(voiceLines.allyKillingSpree[5]);
    });

    test("ally killing spree multikill", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'ally',
            KillerName: 'Someone',
            KillingSpree: 5,
            MultikillStreak: 5,
            Shutdown: false,
        })).toEqual(voiceLines.allyMultiKill[5]);
    });

    test("ally killing spree shutdown", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'ally',
            KillerName: 'Someone',
            KillingSpree: 5,
            MultikillStreak: 1,
            Shutdown: true,
        })).toEqual(voiceLines.shutDown);
    });

    test("ally shutdown", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'ally',
            KillerName: 'Someone',
            KillingSpree: 1,
            MultikillStreak: 1,
            Shutdown: true,
        })).toEqual(voiceLines.shutDown);
    });

    test("ally double kill", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'ally',
            KillerName: 'Someone',
            KillingSpree: 1,
            MultikillStreak: 2,
            Shutdown: false,
        })).toEqual(voiceLines.allyMultiKill[2]);
    });

    test("ally double kill shutdown", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'ally',
            KillerName: 'Someone',
            KillingSpree: 1,
            MultikillStreak: 2,
            Shutdown: true,
        })).toEqual(voiceLines.shutDown);
    });

    test("ally penta kill", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'ally',
            KillerName: 'Someone',
            KillingSpree: 1,
            MultikillStreak: 5,
            Shutdown: false,
        })).toEqual(voiceLines.allyMultiKill[5]);
    });

    test("ally penta kill shutdown", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'ally',
            KillerName: 'Someone',
            KillingSpree: 1,
            MultikillStreak: 5,
            Shutdown: true,
        })).toEqual(voiceLines.allyMultiKill[5]);
    });

    test("enemy kill", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'enemy',
            KillerName: 'Someone',
            KillingSpree: 1,
            MultikillStreak: 1,
            Shutdown: false,
        })).toEqual(voiceLines.enemyMultiKill[1]);
    });

    test("enemy killing spree", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'enemy',
            KillerName: 'Someone',
            KillingSpree: 5,
            MultikillStreak: 1,
            Shutdown: false,
        })).toEqual(voiceLines.enemyKillingSpree[5]);
    });

    test("enemy killing spree multikill", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'enemy',
            KillerName: 'Someone',
            KillingSpree: 5,
            MultikillStreak: 5,
            Shutdown: false,
        })).toEqual(voiceLines.enemyMultiKill[5]);
    });

    test("enemy killing spree shutdown", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'enemy',
            KillerName: 'Someone',
            KillingSpree: 5,
            MultikillStreak: 1,
            Shutdown: true,
        })).toEqual(voiceLines.shutDown);
    });

    test("enemy shutdown", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'enemy',
            KillerName: 'Someone',
            KillingSpree: 1,
            MultikillStreak: 1,
            Shutdown: true,
        })).toEqual(voiceLines.shutDown);
    });

    test("enemy double kill", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'enemy',
            KillerName: 'Someone',
            KillingSpree: 1,
            MultikillStreak: 2,
            Shutdown: false,
        })).toEqual(voiceLines.enemyMultiKill[2]);
    });

    test("enemy double kill shutdown", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'enemy',
            KillerName: 'Someone',
            KillingSpree: 1,
            MultikillStreak: 2,
            Shutdown: true,
        })).toEqual(voiceLines.shutDown);
    });

    test("enemy penta kill", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'enemy',
            KillerName: 'Someone',
            KillingSpree: 1,
            MultikillStreak: 5,
            Shutdown: false,
        })).toEqual(voiceLines.enemyMultiKill[5]);
    });

    test("enemy penta kill shutdown", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'enemy',
            KillerName: 'Someone',
            KillingSpree: 1,
            MultikillStreak: 5,
            Shutdown: true,
        })).toEqual(voiceLines.enemyMultiKill[5]);
    });

    test("enemy kill", () => {
        expect(getVoiceLineFromEvent({
            EventTime: 0,
            EventName: 'ChampionKill',
            Type: 'executed',
            KillerName: 'Someone',
            KillingSpree: 1,
            MultikillStreak: 1,
            Shutdown: false,
        })).toEqual(voiceLines.executed);
    });
});