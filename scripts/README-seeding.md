# Prize Seeding Script

## Overview
Production-ready script for seeding MysteryBox contracts with prize data. Supports comprehensive validation, error handling, and progress tracking.

## Usage

### Environment Setup
```bash
export MYSTERYBOX_ADDRESS=0x1234567890123456789012345678901234567890
```

### Local Network
```bash
npx hardhat run scripts/seed-prizes.js --network localhost
```

### Testnet (Sepolia)
```bash
npx hardhat run scripts/seed-prizes.js --network sepolia
```

### Mainnet
```bash
npx hardhat run scripts/seed-prizes.js --network mainnet
```

## Prize Data Format

The script reads from `data/prize-seeds.json` with the following structure:

```json
{
  "name": "Prize Set Name",
  "totalWeight": 100,
  "prizes": [
    {
      "id": 1,
      "uri": "ipfs://QmHash/metadata.json",
      "rarity": "legendary",
      "weight": 1,
      "description": "Prize Description",
      "category": "premium"
    }
  ]
}
```

## Features

- **Validation**: Comprehensive data and contract validation
- **Error Handling**: Detailed error reporting with continuation on failure
- **Gas Tracking**: Per-transaction and total gas usage monitoring
- **Rate Limiting**: Network-friendly transaction spacing
- **Progress Reporting**: Real-time seeding progress
- **Verification**: Post-seeding contract state verification
- **Statistics**: Rarity distribution analysis

## Error Recovery

The script continues processing even if individual prize additions fail, providing a complete error report at the end.

## Security

- Validates contract ownership before execution
- Verifies prize data structure and content
- Confirms final contract state matches expected results