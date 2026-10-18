/** Batch "b" helpers + screen-only sample data (appointments, queue, journey, routine, prescriptions, consent). */
import { PERSONA, SERVICE, TODAY } from "@/lib/data";
import { arDate } from "@/lib/format";

export const PKG_SERVICE = SERVICE[PERSONA.packageService];
export const PKG_TOTAL = PERSONA.sessionsDone + PERSONA.sessionsLeft; // 6
export const NEXT_SESSION_NO = PERSONA.sessionsDone + 1; // 4
export const DAYS_TO_NEXT = Math.round((PERSONA.nextSession.getTime() - TODAY.getTime()) / 86400000); // 28
export const NEXT_LABEL = arDate(PERSONA.nextSession);
export const TODAY_LABEL = arDate(TODAY);

/** Past sessions newest first, with their number in the package. */
export const PAST_SESSIONS = PERSONA.sessions.map((d, i) => ({ date: d, no: i + 1 })).reverse();
