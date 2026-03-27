/**
 * G.711 μ-law codec: decode to 16-bit linear PCM and re-encode.
 * Pure TypeScript — no native dependencies.
 */

const ULAW_BIAS = 0x84;
const ULAW_CLIP = 32635;

const DECODE_TABLE = new Int16Array(256);

// Pre-compute μ-law → linear PCM lookup table
for (let i = 0; i < 256; i++) {
  const inv = ~i;
  const sign = inv & 0x80;
  const exponent = (inv >> 4) & 0x07;
  let mantissa = inv & 0x0f;
  let sample = (mantissa << 4) + ULAW_BIAS;
  sample <<= exponent;
  sample -= ULAW_BIAS;
  DECODE_TABLE[i] = sign ? -sample : sample;
}

/** Decode a μ-law byte array to 16-bit signed PCM. */
export function ulawDecode(ulawBuf: Uint8Array): Int16Array {
  const pcm = new Int16Array(ulawBuf.length);
  for (let i = 0; i < ulawBuf.length; i++) {
    pcm[i] = DECODE_TABLE[ulawBuf[i]];
  }
  return pcm;
}

/** Encode a single 16-bit PCM sample to μ-law byte. */
function encodeSample(sample: number): number {
  const sign = (sample >> 8) & 0x80;
  if (sign) sample = -sample;
  if (sample > ULAW_CLIP) sample = ULAW_CLIP;
  sample += ULAW_BIAS;

  let exponent = 7;
  for (let mask = 0x4000; (sample & mask) === 0 && exponent > 0; exponent--, mask >>= 1);
  const mantissa = (sample >> (exponent + 3)) & 0x0f;
  return ~(sign | (exponent << 4) | mantissa) & 0xff;
}

/** Encode 16-bit signed PCM to μ-law byte array. */
export function ulawEncode(pcm: Int16Array): Uint8Array {
  const out = new Uint8Array(pcm.length);
  for (let i = 0; i < pcm.length; i++) {
    out[i] = encodeSample(pcm[i]);
  }
  return out;
}

/**
 * Apply a gain multiplier to base64-encoded μ-law audio.
 * Returns the modified audio as a base64 string.
 */
export function applyGainToUlaw(base64Audio: string, gain: number): string {
  if (gain === 1.0) return base64Audio;

  const raw = Buffer.from(base64Audio, "base64");
  const ulaw = new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength);
  const pcm = ulawDecode(ulaw);

  for (let i = 0; i < pcm.length; i++) {
    let sample = Math.round(pcm[i] * gain);
    if (sample > 32767) sample = 32767;
    else if (sample < -32768) sample = -32768;
    pcm[i] = sample;
  }

  const encoded = ulawEncode(pcm);
  return Buffer.from(encoded).toString("base64");
}
