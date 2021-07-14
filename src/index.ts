#!/usr/bin/env node

import { mainLogger, announcementEventLogger } from './Loggers';
import { GameClient } from './GameClient';
import { getNextAnnoucementEvent, getVoiceLineFromEvent } from './voiceLineMapper';
import { VoiceService } from './VoiceService';
import yargs from 'yargs'
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

if (!yargs.option('debug', {}).argv.debug) {
    mainLogger.setSettings({ minLevel: 'info' });
}

console.log(chalk.bold.blueBright(`External LoL Announcer v${version}`));

const voiceService = new VoiceService();
const gameClient = new GameClient();
gameClient.observeEventQueue().subscribe(evts => {
    if (voiceService.canQueue && evts.length > 0) {
        const event = getNextAnnoucementEvent(evts);
        announcementEventLogger.debug(event);
        voiceService.queueOgg(getVoiceLineFromEvent(event));
        gameClient.removeEvent(event);
    }
});
gameClient.run();