import { Logger } from 'tslog';

export const mainLogger: Logger = new Logger({ name: "System", displayInstanceName: false, displayFilePath: 'hidden', displayFunctionName: false });
export const gameEventLogger: Logger = mainLogger.getChildLogger({ name: "GameEvent" });
export const voiceServiceLogger: Logger = mainLogger.getChildLogger({ name: "VoiceService" });
export const announcementEventLogger: Logger = mainLogger.getChildLogger({ name: "AnnouncementEvent" });