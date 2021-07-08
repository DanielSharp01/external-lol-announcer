
import { GameEvent, MappedEvent } from './Events';
import { GameClient } from './GameClient';
let fetchEventsMock: jest.SpyInstance<Promise<{ Events: Array<GameEvent> }>, unknown[]>;
beforeAll(() => {
    jest.useFakeTimers();
});

beforeEach(() => {
    fetchEventsMock = jest.spyOn(GameClient.prototype as any, 'fetchEvents');
    jest.useFakeTimers();
});

afterAll(() => {
    jest.useRealTimers();
});

describe("requestEvents should map the right events", () => {
    test("Welcome SR", async () => {
        fetchEventsMock.mockResolvedValueOnce({
            Events: [
                { EventTime: 0, EventName: 'GameStart' },
            ],
        });
        const gameClient = new GameClient();
        gameClient['_players'] = [{ championName: 'Not Ahri', summonerName: 'Someone', killingSpree: 0, team: 'ORDER' }];
        gameClient['_mapName'] = 'Map11'
        const nextSpy: jest.SpyInstance<void, [Array<MappedEvent>]> = jest.spyOn(gameClient['eventQueue'], 'next');
        expect(await gameClient.requestEvents(true)).toEqual([]);
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
        fetchEventsMock.mockResolvedValueOnce({
            Events: [
                { EventTime: 0, EventName: 'GameStart' },
            ],
        });
        const gameClient = new GameClient();
        gameClient['_players'] = [{ championName: 'Not Ahri', summonerName: 'Someone', killingSpree: 0, team: 'ORDER' }];
        gameClient['_mapName'] = 'Map12'
        const nextSpy: jest.SpyInstance<void, [Array<MappedEvent>]> = jest.spyOn(gameClient['eventQueue'], 'next');
        expect(await gameClient.requestEvents(true)).toEqual([]);
        jest.advanceTimersByTime(30000);
        expect(nextSpy).toHaveBeenCalledWith([{
            EventTime: 30, EventName: 'Welcome', isHA: true, hasAhri: false,
        }]);
        nextSpy.mockClear();
        jest.advanceTimersByTime(10000);
        expect(nextSpy).toHaveBeenCalledTimes(0);
    });

    test("Welcome Ahri", async () => {
        fetchEventsMock.mockResolvedValueOnce({
            Events: [
                { EventTime: 0, EventName: 'GameStart' },
            ],
        });
        const gameClient = new GameClient();
        gameClient['_players'] = [{ championName: 'Ahri', summonerName: 'Someone', killingSpree: 0, team: 'ORDER' }];
        gameClient['_mapName'] = 'Map11'
        const nextSpy: jest.SpyInstance<void, [Array<MappedEvent>]> = jest.spyOn(gameClient['eventQueue'], 'next');
        expect(await gameClient.requestEvents(true)).toEqual([]);
        jest.advanceTimersByTime(25000);
        expect(nextSpy).toHaveBeenCalledWith([{
            EventTime: 25, EventName: 'Welcome', isHA: false, hasAhri: true,
        }]);
    });

    // TODO: First blood test
    // TODO: Shutdown test
    // TODO: Ace test
    // TODO: Shutdown Ace test
    // TODO: Multikill test
    // TODO: Multikill shutdown test
    // TODO: Multikill ace test
    // TODO: Kill type mapper test
    // TODO: All easy to map tests
});