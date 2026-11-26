const DEV_FALLBACK_JWT_SECRET =
  "aksaventra_default_jwt_secret_dev_key_32_chars_long";

export function getJwtSecretString(): string {
  const secret = process.env.CBT_JWT_SECRET?.trim();
  if (secret && secret.length >= 16) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "CBT_JWT_SECRET wajib dikonfigurasi minimal 16 karakter pada lingkungan produksi.",
    );
  }

  return DEV_FALLBACK_JWT_SECRET;
}

export function getEncodedJwtSecret(): Uint8Array {
  return new TextEncoder().encode(getJwtSecretString());
}
