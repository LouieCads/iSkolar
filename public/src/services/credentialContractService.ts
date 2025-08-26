// import { 
//   readContract, 
//   writeContract, 
//   waitForTransactionReceipt,
//   type Address,
//   type Hash 
// } from 'wagmi/actions';
// import { CredentialRegistryAbi } from '@/lib/contracts/abi/CredentialRegistry';
// import { getContractAddress } from '@/lib/contracts/addresses';
// import { type Credential } from '@/lib/contracts/abi/CredentialRegistry';

// export class CredentialContractService {
//   private contractAddress: Address;
//   private chainId: number;

//   constructor(chainId: number) {
//     this.chainId = chainId;
//     this.contractAddress = this.getContractAddress() as Address;
//   }

//   private getContractAddress(): string {
//     switch (this.chainId) {
//       case 31337: // Hardhat
//         return getContractAddress('localhost', 'CredentialRegistry');
//       case 80001: // Mumbai
//         return getContractAddress('mumbai', 'CredentialRegistry');
//       case 137: // Polygon
//         return getContractAddress('polygon', 'CredentialRegistry');
//       case 11155111: // Sepolia
//         return getContractAddress('sepolia', 'CredentialRegistry');
//       default:
//         throw new Error(`Unsupported chainId: ${this.chainId}`);
//     }
//   }

//   // Read operations
//   async getCredential(credentialId: Hash): Promise<Credential> {
//     try {
//       const result = await readContract({
//         address: this.contractAddress,
//         abi: CredentialRegistryAbi,
//         functionName: 'getCredential',
//         args: [credentialId],
//       });
//       return result;
//     } catch (error) {
//       console.error('Error getting credential:', error);
//       throw error;
//     }
//   }

//   async getCredentialByHash(docHash: Hash): Promise<{ credential: Credential; credentialId: Hash }> {
//     try {
//       const result = await readContract({
//         address: this.contractAddress,
//         abi: CredentialRegistryAbi,
//         functionName: 'getCredentialByHash',
//         args: [docHash],
//       });
//       return result;
//     } catch (error) {
//       console.error('Error getting credential by hash:', error);
//       throw error;
//     }
//   }

//   async getStudentCredentials(
//     student: Address, 
//     offset: bigint, 
//     limit: bigint
//   ): Promise<{ credentialIds: Hash[]; totalCount: bigint }> {
//     try {
//       const result = await readContract({
//         address: this.contractAddress,
//         abi: CredentialRegistryAbi,
//         functionName: 'getStudentCredentials',
//         args: [student, offset, limit],
//       });
//       return result;
//     } catch (error) {
//       console.error('Error getting student credentials:', error);
//       throw error;
//     }
//   }

//   async getIssuerCredentials(
//     issuer: Address, 
//     offset: bigint, 
//     limit: bigint
//   ): Promise<{ credentialIds: Hash[]; totalCount: bigint }> {
//     try {
//       const result = await readContract({
//         address: this.contractAddress,
//         abi: CredentialRegistryAbi,
//         functionName: 'getIssuerCredentials',
//         args: [issuer, offset, limit],
//       });
//       return result;
//     } catch (error) {
//       console.error('Error getting issuer credentials:', error);
//       throw error;
//     }
//   }

//   async getStudentCredentialCount(student: Address): Promise<bigint> {
//     try {
//       const result = await readContract({
//         address: this.contractAddress,
//         abi: CredentialRegistryAbi,
//         functionName: 'getStudentCredentialCount',
//         args: [student],
//       });
//       return result;
//     } catch (error) {
//       console.error('Error getting student credential count:', error);
//       throw error;
//     }
//   }

//   async getIssuerCredentialCount(issuer: Address): Promise<bigint> {
//     try {
//       const result = await readContract({
//         address: this.contractAddress,
//         abi: CredentialRegistryAbi,
//         functionName: 'getIssuerCredentialCount',
//         args: [issuer],
//       });
//       return result;
//     } catch (error) {
//       console.error('Error getting issuer credential count:', error);
//       throw error;
//     }
//   }

//   async getTotalCredentials(): Promise<bigint> {
//     try {
//       const result = await readContract({
//         address: this.contractAddress,
//         abi: CredentialRegistryAbi,
//         functionName: 'getTotalCredentials',
//       });
//       return result;
//     } catch (error) {
//       console.error('Error getting total credentials:', error);
//       throw error;
//     }
//   }

//   async isIssuer(account: Address): Promise<boolean> {
//     try {
//       const result = await readContract({
//         address: this.contractAddress,
//         abi: CredentialRegistryAbi,
//         functionName: 'isIssuer',
//         args: [account],
//       });
//       return result;
//     } catch (error) {
//       console.error('Error checking if account is issuer:', error);
//       throw error;
//     }
//   }

//   async isValid(docHash: Hash): Promise<boolean> {
//     try {
//       const result = await readContract({
//         address: this.contractAddress,
//         abi: CredentialRegistryAbi,
//         functionName: 'isValid',
//         args: [docHash],
//       });
//       return result;
//     } catch (error) {
//       console.error('Error checking if credential is valid:', error);
//       throw error;
//     }
//   }

//   async isDocHashRevokedByIssuer(issuer: Address, docHash: Hash): Promise<boolean> {
//     try {
//       const result = await readContract({
//         address: this.contractAddress,
//         abi: CredentialRegistryAbi,
//         functionName: 'isDocHashRevokedByIssuer',
//         args: [issuer, docHash],
//       });
//       return result;
//     } catch (error) {
//       console.error('Error checking if docHash is revoked by issuer:', error);
//       throw error;
//     }
//   }

//   // Write operations
//   async issueCredential(
//     student: Address,
//     docHash: Hash,
//     schema: string,
//     metadataURI: string
//   ): Promise<Hash> {
//     try {
//       const hash = await writeContract({
//         address: this.contractAddress,
//         abi: CredentialRegistryAbi,
//         functionName: 'issueCredential',
//         args: [student, docHash, schema, metadataURI],
//       });

//       // Wait for transaction confirmation
//       const receipt = await waitForTransactionReceipt({ hash });
      
//       // Extract credential ID from logs
//       const credentialIssuedEvent = receipt.logs.find(
//         log => log.topics[0] === '0x' + 'CredentialIssued'.padEnd(64, '0')
//       );
      
//       if (!credentialIssuedEvent) {
//         throw new Error('CredentialIssued event not found in transaction receipt');
//       }

//       // The credential ID is the first indexed parameter
//       return credentialIssuedEvent.topics[1] as Hash;
//     } catch (error) {
//       console.error('Error issuing credential:', error);
//       throw error;
//     }
//   }

//   async revokeCredential(credentialId: Hash, reason: string): Promise<void> {
//     try {
//       const hash = await writeContract({
//         address: this.contractAddress,
//         abi: CredentialRegistryAbi,
//         functionName: 'revokeCredential',
//         args: [credentialId, reason],
//       });

//       await waitForTransactionReceipt({ hash });
//     } catch (error) {
//       console.error('Error revoking credential:', error);
//       throw error;
//     }
//   }

//   async addIssuer(issuer: Address): Promise<void> {
//     try {
//       const hash = await writeContract({
//         address: this.contractAddress,
//         abi: CredentialRegistryAbi,
//         functionName: 'addIssuer',
//         args: [issuer],
//       });

//       await waitForTransactionReceipt({ hash });
//     } catch (error) {
//       console.error('Error adding issuer:', error);
//       throw error;
//     }
//   }

//   async removeIssuer(issuer: Address): Promise<void> {
//     try {
//       const hash = await writeContract({
//         address: this.contractAddress,
//         abi: CredentialRegistryAbi,
//         functionName: 'removeIssuer',
//         args: [issuer],
//       });

//       await waitForTransactionReceipt({ hash });
//     } catch (error) {
//       console.error('Error removing issuer:', error);
//       throw error;
//     }
//   }

//   async addEmergencyAdmin(admin: Address): Promise<void> {
//     try {
//       const hash = await writeContract({
//         address: this.contractAddress,
//         abi: CredentialRegistryAbi,
//         functionName: 'addEmergencyAdmin',
//         args: [admin],
//       });

//       await waitForTransactionReceipt({ hash });
//     } catch (error) {
//       console.error('Error adding emergency admin:', error);
//       throw error;
//     }
//   }

//   async removeEmergencyAdmin(admin: Address): Promise<void> {
//     try {
//       const hash = await writeContract({
//         address: this.contractAddress,
//         abi: CredentialRegistryAbi,
//         functionName: 'removeEmergencyAdmin',
//         args: [admin],
//       });

//       await waitForTransactionReceipt({ hash });
//     } catch (error) {
//       console.error('Error removing emergency admin:', error);
//       throw error;
//     }
//   }

//   async pause(): Promise<void> {
//     try {
//       const hash = await writeContract({
//         address: this.contractAddress,
//         abi: CredentialRegistryAbi,
//         functionName: 'pause',
//       });

//       await waitForTransactionReceipt({ hash });
//     } catch (error) {
//       console.error('Error pausing contract:', error);
//       throw error;
//     }
//   }

//   async unpause(): Promise<void> {
//     try {
//       const hash = await writeContract({
//         address: this.contractAddress,
//         abi: CredentialRegistryAbi,
//         functionName: 'unpause',
//       });

//       await waitForTransactionReceipt({ hash });
//     } catch (error) {
//       console.error('Error unpausing contract:', error);
//       throw error;
//     }
//   }
// }

