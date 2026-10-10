import type { Env } from './panels';
import { renderAmbientCalendar } from './panels/github';
import { renderProjectIndex } from './projects/page';

export async function renderPage(env: Env, origin: string): Promise<string> {
  return renderProjectIndex(origin, await renderAmbientCalendar(env));
}
