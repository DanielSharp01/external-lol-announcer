import fs from 'fs';
import path from 'path';


const oggDir = __dirname.includes('dist') ? path.join(__dirname, '../../', './ogg') : path.join(__dirname, '../', './ogg');
const oggList = fs.readdirSync(oggDir);

export type VoiceLineCollection = Array<string>;

export const getAllVoiceLines = (prefix: string): VoiceLineCollection => {
    return oggList.filter(ogg => ogg.startsWith(prefix));
}

export const welcome = getAllVoiceLines('upon_entering_summoners_rift');
export const welcomeAram = getAllVoiceLines('upon_entering_howling_abyss');
export const welcomeAhri = getAllVoiceLines('when_ahri_is_in_the_game');

export const minionsWillSpawn = getAllVoiceLines('minions_spawning');
export const minionsSpawned = getAllVoiceLines('minions_spawned');

export const firstBlood = getAllVoiceLines('upon_first_blood');

export const allyMultiKill = {
    1: getAllVoiceLines('on_ally_kill'),
    2: getAllVoiceLines('ally_double_kill'),
    3: getAllVoiceLines('ally_triple_kill'),
    4: getAllVoiceLines('ally_quadra_kill'),
    5: getAllVoiceLines('ally_pentakill'),
};
export const allyKillingSpree = {
    3: getAllVoiceLines('an_ally_killing_spree'),
    4: getAllVoiceLines('an_ally_rampage'),
    5: getAllVoiceLines('an_ally_is_unstoppable'),
    6: getAllVoiceLines('an_ally_is_dominating'),
    7: getAllVoiceLines('an_ally_is_godlike'),
    8: getAllVoiceLines('an_ally_is_legendary'),
};

export const enemyMultiKill = {
    1: getAllVoiceLines('on_enemy_kill'),
    2: getAllVoiceLines('enemy_double_kill'),
    3: getAllVoiceLines('enemy_triple_kill'),
    4: getAllVoiceLines('enemy_quadra_kill'),
    5: getAllVoiceLines('enemy_pentakill'),
};
export const enemyKillingSpree = {
    3: getAllVoiceLines('an_enemy_killing_spree'),
    4: getAllVoiceLines('an_enemy_rampage'),
    5: getAllVoiceLines('an_enemy_is_unstoppable'),
    6: getAllVoiceLines('an_enemy_is_dominating'),
    7: getAllVoiceLines('an_enemy_is_godlike'),
    8: getAllVoiceLines('an_enemy_is_legendary'),
};

export const onPlayerKill = getAllVoiceLines('on_player_kill');
export const onPlayerDeath = getAllVoiceLines('on_player_death');
export const playerKillingSpree = {
    3: getAllVoiceLines('the_player_goes_on_a_killing_spree'),
    4: getAllVoiceLines('the_player_goes_on_a_rampage'),
    5: getAllVoiceLines('the_player_is_unstoppable'),
    6: getAllVoiceLines('the_player_is_dominating'),
    7: getAllVoiceLines('the_player_is_godlike'),
    8: getAllVoiceLines('the_player_is_legendary'),
};

export const shutDown = getAllVoiceLines('upon_shut_down');
export const executed = getAllVoiceLines('upon_execution');
export const ace = getAllVoiceLines('when_an_ace_occurs');

export const victory = getAllVoiceLines('upon_victory');
export const defeat = getAllVoiceLines('upon_defeat');

export const allyTurretDestroyed = getAllVoiceLines('upon_an_allied_turret_being_destroyed');
export const allyInhibDestroyed = getAllVoiceLines('upon_allied_inhibitor_being_destroyed');
export const allyInhibRespawning = getAllVoiceLines('upon_allied_inhibitor_respawning_soon');
export const enemyTurretDestroyed = getAllVoiceLines('upon_an_enemy_turret_being_destroyed');
export const enemyInhibDestroyed = getAllVoiceLines('upon_enemy_inhibitor_being_destroyed');
export const enemyInhibRespawning = getAllVoiceLines('upon_enemy_inhibitor_respawning_soon');