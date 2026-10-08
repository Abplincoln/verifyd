/**
 * Calculates SHA-256 hash/fingerprint of a File using the browser Web Crypto API.
 * The file is read strictly in memory and is never uploaded to any remote server.
 */
export async function calculateFileSha256(file: File): Promise<{
  rawHex: string;
  bytes32Hex: `0x${string}`;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const rawHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  const bytes32Hex = `0x${rawHex}` as `0x${string}`;

  return {
    rawHex,
    bytes32Hex,
  };
}
