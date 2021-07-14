
import { GameEvent, MappedEvent } from './Events';
import { GameClient } from './GameClient';
import { Player } from './Player';

describe("mapAndDispatchEvents should map the right events", () => {
    let gameClient = new GameClient();
    let nextSpy: jest.SpyInstance<void, [Array<MappedEvent>]>;
    let localPlayer: Player & { killingSpree: number };
    let ally1: Player & { killingSpree: number };
    let enemy1: Player & { killingSpree: number };
    beforeAll(() => {
        jest.useFakeTimers();
    });

    beforeEach(() => {
        gameClient = new GameClient();
        localPlayer = { championName: 'Ahri', summonerName: 'Someone', killingSpree: 0, team: 'ORDER' };
        ally1 = { championName: 'Brand', summonerName: 'Someone ally', killingSpree: 0, team: 'ORDER' };
        enemy1 = { championName: 'Teemo', summonerName: 'Someone else', killingSpree: 0, team: 'CHAOS' };
        gameClient['_localPlayer'] = localPlayer;
        gameClient['_players'] = [
            localPlayer,
            ally1,
            enemy1,
        ];
        gameClient['_mapName'] = 'Map11'
        nextSpy = jest.spyOn(gameClient['eventQueue'], 'next');
        jest.useFakeTimers();
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    test("Welcome SR", async () => {
        localPlayer.championName = 'Not Ahri';
        gameClient.mapAndDispatchEvents([
            { EventTime: 0, EventName: 'GameStart' },
        ], true);
        jest.advanceTimersByTime(25000);
        expect(nextSpy).toHaveBeenCalledWith([{
            EventTime: 25, EventName: 'Welcome', isHA: false, hasAhri: false,
        }]);
        nextSpy.mockClear();
        jest.advanceTimersByTime(10000);
        expect(nextSpy).toHaveBeenCalledWith([{
            EventTime: 25, EventName: 'Welcome', isHA: false, hasAhri: false,
        }, {
            EventTime: 35, EventName: 'MinionsWillSpawn'
        }]);
    });

    test("Welcome HA", async () => {
        localPlayer.championName = 'Not Ahri';
        gameClient['_mapName'] = 'Map12'
        gameClient.mapAndDispatchEvents([
            { EventTime: 0, EventName: 'GameStart' },
        ], true);
        jest.advanceTimersByTime(30000);
        expect(nextSpy).toHaveBeenCalledWith([{
            EventTime: 30, EventName: 'Welcome', isHA: true, hasAhri: false,
        }]);
        nextSpy.mockClear();
        jest.advanceTimersByTime(10000);
        expect(nextSpy).toHaveBeenCalledTimes(0);
    });

    test("Welcome Ahri", async () => {
        gameClient.mapAndDispatchEvents([
            { EventTime: 0, EventName: 'GameStart' },
        ], true);
        jest.advanceTimersByTime(25000);
        expect(nextSpy).toHaveBeenCalledWith([{
            EventTime: 25, EventName: 'Welcome', isHA: false, hasAhri: true,
        }]);
    });

    test("First blood", async () => {
        gameClient.mapAndDispatchEvents([
            { EventTime: 90, EventName: 'ChampionKill', KillerName: "Someone", VictimName: "Someone else" },
            { EventTime: 90, EventName: 'FirstBlood', KillerName: "Someone" },
        ], true);
        expect(nextSpy).toHaveBeenCalledWith([{
            EventTime: 90, EventName: 'FirstBlood', KillerName: "Someone",
        }]);
    });

    test("Shutdown positive test", async () => {
        enemy1.killingSpree = 2;
        gameClient.mapAndDispatchEvents([
            { EventTime: 90, EventName: 'ChampionKill', KillerName: "Someone", VictimName: "Someone else" },
        ], true);
        expect(nextSpy).toHaveBeenCalledWith([{
            Type: 'localKill',
            EventTime: 90,
            EventName: 'ChampionKill',
            KillerName: "Someone",
            VictimName: "Someone else",
            MultikillStreak: 1,
            KillingSpree: 1,
            Shutdown: true,
        }]);
    });

    test("Shutdown negative test", async () => {
        enemy1.killingSpree = 1;
        gameClient.mapAndDispatchEvents([
            { EventTime: 90, EventName: 'ChampionKill', KillerName: "Someone", VictimName: "Someone else" },
        ], true);
        expect(nextSpy).toHaveBeenCalledWith([{
            Type: 'localKill',
            EventTime: 90,
            EventName: 'ChampionKill',
            KillerName: "Someone",
            VictimName: "Someone else",
            MultikillStreak: 1,
            KillingSpree: 1,
            Shutdown: false,
        }]);
    });

    test("Ace test", async () => {
        gameClient.mapAndDispatchEvents([
            { EventTime: 90, EventName: 'ChampionKill', KillerName: "Someone", VictimName: "Someone else" },
            { EventTime: 90, EventName: 'Ace', AcerName: "Someone" },
        ], true);
        expect(nextSpy).toHaveBeenCalledWith([{
            EventTime: 90, EventName: 'Ace', AcerName: "Someone",
        }]);
    });

    test("Shutdown ace test", async () => {
        enemy1.killingSpree = 2;
        gameClient.mapAndDispatchEvents([
            { EventTime: 90, EventName: 'ChampionKill', KillerName: "Someone", VictimName: "Someone else" },
            { EventTime: 90, EventName: 'Ace', AcerName: "Someone" },
        ], true);
        expect(nextSpy).toHaveBeenCalledWith([
            {
                Type: 'localKill',
                EventTime: 90,
                EventName: 'ChampionKill',
                KillerName: "Someone",
                VictimName: "Someone else",
                MultikillStreak: 1,
                KillingSpree: 1,
                Shutdown: true,
            },
            { EventTime: 90, EventName: 'Ace', AcerName: "Someone" },
        ]);
    });

    test("Multikill test", async () => {
        localPlayer.killingSpree = 2;
        gameClient.mapAndDispatchEvents([
            { EventTime: 90, EventName: 'ChampionKill', KillerName: "Someone", VictimName: "Someone else" },
            { EventTime: 90, EventName: 'Multikill', KillerName: "Someone", KillStreak: 3 },
        ], true);
        expect(nextSpy).toHaveBeenCalledWith([
            {
                Type: 'localKill',
                EventTime: 90,
                EventName: 'ChampionKill',
                KillerName: "Someone",
                VictimName: "Someone else",
                MultikillStreak: 3,
                KillingSpree: 3,
                Shutdown: false,
            }
        ]);
    });

    test("Multikill shutdown test", async () => {
        localPlayer.killingSpree = 2;
        enemy1.killingSpree = 2;
        gameClient.mapAndDispatchEvents([
            { EventTime: 90, EventName: 'ChampionKill', KillerName: "Someone", VictimName: "Someone else" },
            { EventTime: 90, EventName: 'Multikill', KillerName: "Someone", KillStreak: 3 },
        ], true);
        expect(nextSpy).toHaveBeenCalledWith([
            {
                Type: 'localKill',
                EventTime: 90,
                EventName: 'ChampionKill',
                KillerName: "Someone",
                VictimName: "Someone else",
                MultikillStreak: 3,
                KillingSpree: 3,
                Shutdown: true,
            }
        ]);
    });

    test("Multikill ace test", async () => {
        localPlayer.killingSpree = 2;
        gameClient.mapAndDispatchEvents([
            { EventTime: 90, EventName: 'ChampionKill', KillerName: "Someone", VictimName: "Someone else" },
            { EventTime: 90, EventName: 'Multikill', KillerName: "Someone", KillStreak: 3 },
            { EventTime: 90, EventName: 'Ace', AcerName: "Someone" },
        ], true);
        expect(nextSpy).toHaveBeenCalledWith([
            {
                Type: 'localKill',
                EventTime: 90,
                EventName: 'ChampionKill',
                KillerName: "Someone",
                VictimName: "Someone else",
                MultikillStreak: 3,
                KillingSpree: 3,
                Shutdown: false,
            },
            { EventTime: 90, EventName: 'Ace', AcerName: "Someone" },
        ]);
    });

    test("Multikill shutdown ace test", async () => {
        localPlayer.killingSpree = 2;
        enemy1.killingSpree = 2;
        gameClient.mapAndDispatchEvents([
            { EventTime: 90, EventName: 'ChampionKill', KillerName: "Someone", VictimName: "Someone else" },
            { EventTime: 90, EventName: 'Multikill', KillerName: "Someone", KillStreak: 3 },
            { EventTime: 90, EventName: 'Ace', AcerName: "Someone" },
        ], true);
        expect(nextSpy).toHaveBeenCalledWith([
            {
                Type: 'localKill',
                EventTime: 90,
                EventName: 'ChampionKill',
                KillerName: "Someone",
                VictimName: "Someone else",
                MultikillStreak: 3,
                KillingSpree: 3,
                Shutdown: true,
            },
            { EventTime: 90, EventName: 'Ace', AcerName: "Someone" },
        ]);
    });

    test("ChampionKill Type=localKill", async () => {
        gameClient.mapAndDispatchEvents([
            { EventTime: 90, EventName: 'ChampionKill', KillerName: "Someone", VictimName: "Someone else" },
        ], true);
        expect(nextSpy).toHaveBeenCalledWith([
            {
                Type: 'localKill',
                EventTime: 90,
                EventName: 'ChampionKill',
                KillerName: "Someone",
                VictimName: "Someone else",
                MultikillStreak: 1,
                KillingSpree: 1,
                Shutdown: false,
            },
        ]);
    });

    test("ChampionKill Type=localDeath", async () => {
        gameClient.mapAndDispatchEvents([
            { EventTime: 90, EventName: 'ChampionKill', KillerName: "Someone else", VictimName: "Someone" },
        ], true);
        expect(nextSpy).toHaveBeenCalledWith([
            {
                Type: 'localDeath',
                EventTime: 90,
                EventName: 'ChampionKill',
                KillerName: "Someone else",
                VictimName: "Someone",
                MultikillStreak: 1,
                KillingSpree: 1,
                Shutdown: false,
            },
        ]);
    });

    test("ChampionKill Type=ally", async () => {
        gameClient.mapAndDispatchEvents([
            { EventTime: 90, EventName: 'ChampionKill', KillerName: "Someone ally", VictimName: "Someone else" },
        ], true);
        expect(nextSpy).toHaveBeenCalledWith([
            {
                Type: 'ally',
                EventTime: 90,
                EventName: 'ChampionKill',
                KillerName: "Someone ally",
                VictimName: "Someone else",
                MultikillStreak: 1,
                KillingSpree: 1,
                Shutdown: false,
            },
        ]);
    });

    test("ChampionKill Type=enemy", async () => {
        gameClient.mapAndDispatchEvents([
            { EventTime: 90, EventName: 'ChampionKill', KillerName: "Someone else", VictimName: "Someone ally" },
        ], true);
        expect(nextSpy).toHaveBeenCalledWith([
            {
                Type: 'enemy',
                EventTime: 90,
                EventName: 'ChampionKill',
                KillerName: "Someone else",
                VictimName: "Someone ally",
                MultikillStreak: 1,
                KillingSpree: 1,
                Shutdown: false,
            },
        ]);
    });

    test("ChampionKill Type=executed", async () => {
        gameClient.mapAndDispatchEvents([
            { EventTime: 90, EventName: 'ChampionKill', KillerName: "SRU_something_something", VictimName: "Someone" },
        ], true);
        expect(nextSpy).toHaveBeenCalledWith([
            {
                Type: 'executed',
                EventTime: 90,
                EventName: 'ChampionKill',
                KillerName: "SRU_something_something",
                VictimName: "Someone",
                MultikillStreak: 1,
                KillingSpree: undefined,
                Shutdown: undefined,
            },
        ]);
    });

    test("TurretKilled ally", async () => {
        gameClient.mapAndDispatchEvents([
            { EventTime: 90, EventName: 'TurretKilled', TurretKilled: 'Turret_T1_Something' },
        ], true);
        expect(nextSpy).toHaveBeenCalledWith([
            { EventTime: 90, EventName: 'TurretKilled', Ally: true },
        ]);
    });

    test("TurretKilled enemy", async () => {
        gameClient.mapAndDispatchEvents([
            { EventTime: 90, EventName: 'TurretKilled', TurretKilled: 'Turret_T2_Something' },
        ], true);
        expect(nextSpy).toHaveBeenCalledWith([
            { EventTime: 90, EventName: 'TurretKilled', Ally: false },
        ]);
    });

    test("InhibKilled ally", async () => {
        gameClient.mapAndDispatchEvents([
            { EventTime: 90, EventName: 'InhibKilled', InhibKilled: 'Barracks_T1_Something' },
        ], true);
        expect(nextSpy).toHaveBeenCalledWith([
            { EventTime: 90, EventName: 'InhibKilled', Ally: true },
        ]);
    });

    test("InhibKilled enemy", async () => {
        gameClient.mapAndDispatchEvents([
            { EventTime: 90, EventName: 'InhibKilled', InhibKilled: 'Barracks_T2_Something' },
        ], true);
        expect(nextSpy).toHaveBeenCalledWith([
            { EventTime: 90, EventName: 'InhibKilled', Ally: false },
        ]);
    });

    test("InhibRespawningSoon ally", async () => {
        gameClient.mapAndDispatchEvents([
            { EventTime: 90, EventName: 'InhibRespawningSoon', InhibRespawningSoon: 'Barracks_T1_Something' },
        ], true);
        expect(nextSpy).toHaveBeenCalledWith([
            { EventTime: 90, EventName: 'InhibRespawningSoon', Ally: true },
        ]);
    });

    test("InhibRespawningSoon enemy", async () => {
        gameClient.mapAndDispatchEvents([
            { EventTime: 90, EventName: 'InhibRespawningSoon', InhibRespawningSoon: 'Barracks_T2_Something' },
        ], true);
        expect(nextSpy).toHaveBeenCalledWith([
            { EventTime: 90, EventName: 'InhibRespawningSoon', Ally: false },
        ]);
    });

    test("MinionsSpawning", async () => {
        gameClient.mapAndDispatchEvents([
            { EventTime: 90, EventName: 'MinionsSpawning' },
        ], true);
        expect(nextSpy).toHaveBeenCalledWith([
            { EventTime: 90, EventName: 'MinionsSpawning' },
        ]);
    });

    test("GameEnd", async () => {
        gameClient.mapAndDispatchEvents([
            { EventTime: 90, EventName: 'GameEnd', Result: 'Win' },
        ], true);
        expect(nextSpy).toHaveBeenCalledWith([
            { EventTime: 90, EventName: 'GameEnd', Result: 'Win' },
        ]);
    });
});