import * as amplitude from '@amplitude/analytics-node';

let initialized = false;

export function getAmplitudeClient() {
  if (!initialized) {
    amplitude.init(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY);
    initialized = true;
  }
  return amplitude;
}
