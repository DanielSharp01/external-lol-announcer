import { GameClient } from './GameClient';
import { getNextAnnoucementEvent, getVoiceLineFromEvent } from './voiceLineMapper';
import { VoiceService } from './VoiceService';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const voiceService = new VoiceService();
const gameClient = new GameClient();
gameClient.observeEventQueue().subscribe(evts => {
    if (voiceService.canQueue && evts.length > 0) {
        const event = getNextAnnoucementEvent(evts);
        voiceService.queueOgg(getVoiceLineFromEvent(event));
        gameClient.removeEvent(event);
    }
});
gameClient.run();