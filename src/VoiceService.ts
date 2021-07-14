import playSound from 'play-sound';
import { Logger } from 'tslog';
import { VoiceLineCollection } from './voiceLines';

const log: Logger = new Logger({ name: "VoiceService", displayInstanceName: false, displayFilePath: 'hidden', displayFunctionName: false });

const player = playSound({});
const pickRandom = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
}
const playOgg = (name) => {
    return new Promise<void>(resolve => player.play(`ogg/${name}`, {
        mplayer: ['-softvol', '-volume', '5'],
    }, () => resolve()));
}

export class VoiceService {
    _canQueue: boolean = true;

    async queueOgg(voiceLines: VoiceLineCollection) {
        const picked = pickRandom(voiceLines);
        log.debug('Voiceline picked', picked);
        this._canQueue = false;
        await playOgg(picked);
        return this._canQueue = true;
    }

    get canQueue(): boolean {
        return this._canQueue;
    }
}