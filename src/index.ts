import { Logger } from 'tslog';
import { GameClient } from './GameClient';
import { getNextAnnoucementEvent, getVoiceLineFromEvent } from './voiceLineMapper';
import { VoiceService } from './VoiceService';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const log: Logger = new Logger({ name: "Main", displayInstanceName: false, displayFilePath: 'hidden', displayFunctionName: false });

const voiceService = new VoiceService();
const gameClient = new GameClient();
gameClient.observeEventQueue().subscribe(evts => {
    if (voiceService.canQueue && evts.length > 0) {
        const event = getNextAnnoucementEvent(evts);
        log.debug('Annoucement event', event);
        voiceService.queueOgg(getVoiceLineFromEvent(event));
        gameClient.removeEvent(event);
    }
});
gameClient.run();