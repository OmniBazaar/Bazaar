# OmniBazaar Marketplace

## Overview
OmniBazaar is a decentralized marketplace for physical goods, NFTs, and other digital goods. It is built on blockchain technology and uses smart contracts for secure transactions.

## Features
- Decentralized marketplace for physical and digital goods
- NFT-based listing system
- IPFS-based storage
- Privacy features from COTI V2
- Reputation system
- Arbitration system
- Cross-chain compatibility

## Development Setup

### Prerequisites
- Node.js >= 16
- npm >= 8
- TypeScript
- IPFS
- MetaMask or other Web3 wallet

### Installation
1. Clone the repository:
```bash
git clone https://github.com/your-org/OmniBazaar.git
cd OmniBazaar/Bazaar
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start development server:
```bash
npm run dev
```

### Building
```bash
npm run build
```

### Testing
```bash
npm test
```

## Project Structure
```
Bazaar/
├── src/              # Source code
├── contracts/        # Smart contracts
├── tests/           # Test files
├── docs/            # Documentation
└── scripts/         # Build and deployment scripts
```

## Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
