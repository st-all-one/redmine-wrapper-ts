/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { getLogger, type Logger } from "@logtape";
import { LOG_NAMESPACE } from "../core/constants.ts";

export const logger: Logger = getLogger(LOG_NAMESPACE);

/** Cria um sub-logger com namespace aninhado. */
export function getSubLogger(subName: string): Logger {
    return getLogger([...LOG_NAMESPACE, subName]);
}
