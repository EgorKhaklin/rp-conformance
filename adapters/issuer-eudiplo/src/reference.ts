import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** The file that pins the reference EUDIPLO (`reference.env`), for `docker compose --env-file` and CI. */
export const REFERENCE_ENV_PATH = fileURLToPath(new URL('../reference.env', import.meta.url));

/** The pinned reference EUDIPLO: the image digest, the version `GET /api/version` reports, and its source revision. */
export interface ReferenceEudiplo {
  image: string;
  version: string;
  revision: string;
}

function read(): ReferenceEudiplo {
  const values = Object.fromEntries(
    readFileSync(REFERENCE_ENV_PATH, 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)]),
  );
  const { EUDIPLO_IMAGE: image, EUDIPLO_EXPECT_VERSION: version, EUDIPLO_REVISION: revision } = values;
  if (!image || !version || !revision) throw new Error(`${REFERENCE_ENV_PATH}: EUDIPLO_IMAGE, EUDIPLO_EXPECT_VERSION and EUDIPLO_REVISION are required`);
  return { image, version, revision };
}

/** The reference EUDIPLO of the issuer suite, from `reference.env`. */
export const REFERENCE_EUDIPLO: ReferenceEudiplo = read();
