import playSound from 'play-sound';
import { voiceServiceLogger } from './Loggers';
import { VoiceLineCollection } from './voiceLines';

const player = playSound({});
const pickRandom = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
}
const playOgg = (name) => {
    return new Promise<void>((resolve, reject) => player.play(`ogg/${name}`, {
        mplayer: ['-softvol', '-volume', '5'],
    }, (err) => {
        if (err) reject(err);
        resolve();
    }));
}

export class VoiceService {
    _canQueue: boolean = true;

    async queueOgg(voiceLines: VoiceLineCollection) {
        const picked = pickRandom(voiceLines);
        voiceServiceLogger.debug(picked);
        this._canQueue = false;
        await playOgg(picked);
        return this._canQueue = true;
    }

    get canQueue(): boolean {
        return this._canQueue;
    }
}