import { keccak256, toHex, stringToHex } from 'viem';

/**
 * Generate a document hash from file content
 * @param fileContent - The file content as ArrayBuffer or string
 * @returns The keccak256 hash of the file content
 */
export function generateDocumentHash(fileContent: ArrayBuffer | string): `0x${string}` {
  if (fileContent instanceof ArrayBuffer) {
    return keccak256(toHex(fileContent));
  }
  return keccak256(stringToHex(fileContent));
}

/**
 * Generate a document hash from file bytes
 * @param fileBytes - The file bytes as Uint8Array
 * @returns The keccak256 hash of the file bytes
 */
export function generateDocumentHashFromBytes(fileBytes: Uint8Array): `0x${string}` {
  return keccak256(toHex(fileBytes));
}

/**
 * Validate if an address is a valid Ethereum address
 * @param address - The address to validate
 * @returns True if the address is valid
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Shorten an Ethereum address for display
 * @param address - The full address
 * @param chars - Number of characters to show from start and end
 * @returns Shortened address (e.g., "0x1234...5678")
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!isValidAddress(address)) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Convert a file to ArrayBuffer
 * @param file - The file to convert
 * @returns Promise that resolves to ArrayBuffer
 */
export async function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Convert a file to Uint8Array
 * @param file - The file to convert
 * @returns Promise that resolves to Uint8Array
 */
export async function fileToUint8Array(file: File): Promise<Uint8Array> {
  const arrayBuffer = await fileToArrayBuffer(file);
  return new Uint8Array(arrayBuffer);
}

