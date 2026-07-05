/**
 * Shared async retry with exponential backoff, used to ride out transient Gemini
 * overload errors (503 / 429 / UNAVAILABLE) across the pipeline and backfill script.
 */

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Default: retry only the transient overload/rate signals.
const defaultIsRetryable = (e) => /503|429|UNAVAILABLE/.test(e?.message || '');

/**
 * Run `op`, retrying on retryable errors with exponential backoff.
 *
 * @param {() => Promise<any>} op
 * @param {object}   [options]
 * @param {number}   [options.maxRetries=3]  total attempts (not just retries)
 * @param {number}   [options.delayMs=4000]  initial backoff delay
 * @param {number}   [options.factor=1.5]    backoff multiplier
 * @param {(e:any)=>boolean} [options.isRetryable]  decides whether an error is worth retrying
 * @returns {Promise<any>} the op's resolved value
 * @throws the last error once retries are exhausted or the error isn't retryable
 */
export async function withRetry(op, { maxRetries = 3, delayMs = 4000, factor = 1.5, isRetryable = defaultIsRetryable } = {}) {
    let delay = delayMs;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await op();
        } catch (error) {
            if (!isRetryable(error) || attempt >= maxRetries) throw error;
            console.log(`   ⏳ Retryable error. Waiting ${~~(delay / 1000)}s before retry ${attempt}/${maxRetries}...`);
            await wait(delay);
            delay *= factor;
        }
    }
}
