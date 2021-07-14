interface Event<T> {
    EventID?: number;
    EventName: T;
    EventTime: number;
}

export interface ChampionKillEvent extends Event<'ChampionKill'> {
    KillerName: string;
    VictimName: string;
}

export interface MultiKillEvent extends Event<'Multikill'> {
    KillerName: string;
    KillStreak: number;
}

export interface FirstBloodEvent extends Event<'FirstBlood'> {
    KillerName: string;
}

export interface AceEvent extends Event<'Ace'> {
    AcerName: string;
}

export interface TurretKilledEvent extends Event<'TurretKilled'> {
    TurretKilled: string;
}

export interface InhibKilledEvent extends Event<'InhibKilled'> {
    InhibKilled: string;
}

export interface GameStartEvent extends Event<'GameStart'> {
}

export interface GameEndEvent extends Event<'GameEnd'> {
    Result: 'Win' | 'Lose';
}

export interface InhibRespawningSoonEvent extends Event<'InhibRespawningSoon'> {
    InhibRespawningSoon: string;
}

export interface MinionsSpawningEvent extends Event<'MinionsSpawning'> {
}

export interface WelcomeEvent extends Event<'Welcome'> {
    isHA: boolean;
    hasAhri: boolean;
}

export interface MinionsWillSpawnEvent extends Event<'MinionsWillSpawn'> {
}

export type KillType = 'localKill' | 'localDeath' | 'ally' | 'enemy' | 'executed';

export interface KillEvent extends Event<'ChampionKill'> {
    Type: KillType;
    KillerName: string;
    MultikillStreak: number;
    KillingSpree: number;
    Shutdown: boolean;
}


export interface MappedTurretKilledEvent extends Event<'TurretKilled'> {
    Ally: boolean;
}

export interface MappedInhibKilledEvent extends Event<'InhibKilled'> {
    Ally: boolean;
}

export interface MappedInhibRespawningSoonEvent extends Event<'InhibRespawningSoon'> {
    Ally: boolean;
}

export type GameEvent = ChampionKillEvent | MultiKillEvent | TurretKilledEvent | InhibKilledEvent
    | GameStartEvent | GameEndEvent | InhibRespawningSoonEvent | MinionsSpawningEvent
    | FirstBloodEvent | AceEvent;

export type MappedEvent = KillEvent | FirstBloodEvent | AceEvent | MappedTurretKilledEvent | MappedInhibKilledEvent
    | GameEndEvent | MappedInhibRespawningSoonEvent | MinionsSpawningEvent
    | WelcomeEvent | MinionsWillSpawnEvent;