// import { http, createConfig } from 'wagmi';
// import { mainnet, sepolia, polygon, polygonMumbai } from 'wagmi/chains';
// import { injected, metaMask, walletConnect } from 'wagmi/connectors';

// // Configure chains for your app
// const chains = [
//   mainnet,
//   sepolia,
//   polygon,
//   polygonMumbai,
//   // Add localhost for development
//   {
//     id: 31337,
//     name: 'Hardhat',
//     network: 'hardhat',
//     nativeCurrency: {
//       decimals: 18,
//       name: 'Ether',
//       symbol: 'ETH',
//     },
//     rpcUrls: {
//       default: { http: ['http://127.0.0.1:8545'] },
//       public: { http: ['http://127.0.0.1:8545'] },
//     },
//   } as const,
// ];

// // Set up wagmi config
// export const config = createConfig({
//   chains,
//   connectors: [
//     injected(),
//     metaMask(),
//     walletConnect({
//       projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
//     }),
//   ],
//   transports: {
//     [mainnet.id]: http(),
//     [sepolia.id]: http(),
//     [polygon.id]: http(),
//     [polygonMumbai.id]: http(),
//     31337: http('http://127.0.0.1:8545'),
//   },
// });

// declare module 'wagmi' {
//   interface Register {
//     config: typeof config;
//   }
// }

