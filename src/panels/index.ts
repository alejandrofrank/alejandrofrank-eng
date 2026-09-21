// Projects displayed on the personal homepage, in presentation order.
import type { Panel } from "./types";
import { bakiano } from "./bakiano";
import { jev } from "./jev";

export const PANELS: Panel[] = [bakiano, jev];

export type { Panel, Env, Slot } from "./types";
