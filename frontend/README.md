# Learnopoly - Tech Learning Platform

Learnopoly is a unified platform for tech enthusiasts that combines real-time updates, professional networking, and educational resources. This project is built with Next.js 15 for the frontend and Solidity smart contracts deployed on EduChain.

## Project Structure

- `/contracts` - Solidity smart contracts
- `/scripts` - Deployment scripts
- `/frontend` - Next.js 15 frontend application

## Smart Contract Features

The Learnopoly smart contract includes:

- User profile creation and management
- Course creation and enrollment
- Reputation system

## Frontend Features

- Tech news feed
- Course discovery and enrollment
- Professional networking
- User profiles

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- MetaMask or another Web3 wallet

### Backend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/santhoshkumar0918/Learnovix.git
   cd learnopoly
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:

   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your private key (without 0x prefix)

5. Compile the smart contract:

   ```bash
   npx hardhat compile
   ```

6. Deploy to EduChain:

   ```bash
   npx hardhat run scripts/deploy.ts --network educhain
   ```

7. Update the contract address in the frontend:
   - Note the contract address from the deployment output
   - Update `LEARNOPOLY_CONTRACT_ADDRESS` in `frontend/app/components/Web3Provider.tsx`

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Using the Application

1. Connect your wallet (make sure it's configured for EduChain)
2. Create a profile
3. Explore courses or create your own
4. Connect with other professionals

## EduChain Configuration

The application is configured to work with EduChain:

- Chain ID: 656476
- RPC URL: https://rpc.open-campus-codex.gelato.digital
- Explorer: https://edu-chain-testnet.blockscout.com

Make sure to add EduChain to your MetaMask:

1. Open MetaMask
2. Click "Add Network"
3. Enter the EduChain details above

## Mock Data

For demonstration purposes, the frontend uses mock data for:

- Tech news feed
- Sample courses
- User profiles

In a production environment, this data would come from the blockchain and/or a backend API.

## License

MIT
