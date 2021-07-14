#!/usr/bin/env node

import { Logger } from 'tslog';
import { GameClient } from './GameClient';
import { getNextAnnoucementEvent, getVoiceLineFromEvent } from './voiceLineMapper';
import { VoiceService } from './VoiceService';
import chalk from 'chalk';
import { version } from '../package.json';

// Suppress warning since we do not want to install the cert for the LiveClientAPI
const originalEmitWarning = process.emitWarning
process.emitWarning = (warning, options) => {
    if (warning && warning.includes && warning.includes('NODE_TLS_REJECT_UNAUTHORIZED')) {
        return
    }

    return originalEmitWarning.call(process, warning, options)
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

console.log(chalk.bold.blueBright(`External LoL Announcer v${version}`));

// TODO: Make the logging be disableable both with flags and for tests

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