# Rock Paper Scissors Spock Lizard Game

This is a dapp on testnet Spolia chain for playing Rock Paper Scissors Spock Lizard using smart contracts and MetaMask wallet. The game contract is deployed when a new game is created, and Infura is used as a faster and more stable provider.

## Features

- Connect to MetaMask wallet
- Retry mechanism on failed deployment
- Network Switcher
- Create a new game and deploy the game contract
- Join an existing game
- Make moves and solve games
- Claim stakes in case of timeouts

## Prerequisites

- MetaMask wallet extension installed in your browser
- Ethereum account with sufficient balance for placing stakes

## Getting Started

1. Connect your MetaMask wallet to the app by clicking on the "Connect MetaMask" button.

2. Once connected, you will see four options:
   - New Game
   - Join Game
   - Solve Game
   - Claim Stakes

### New Game

1. Click on the "New Game" button to start a new game.
2. Enter the address of the player you want to invite.
3. Specify the amount of Ether you want to stake for the game.
4. Choose your move (✊, 🖐️, ✌️, 🖖, 🤏).
5. Click on the "Create Game" button to generate a random salt or input your own, deploy the game contract, and create the game.
6. Share the generated game contract address / url with the invited player.

### Join Game

1. Click on the "Join Game" button to join an existing game.
2. Enter the game contract address provided by the game creator.
3. Choose your move (✊, 🖐️, ✌️, 🖖, 🤏).
4. Click on the "Join Game" button to join the game.

### Solve Game

1. Click on the "Solve Game" button to reveal your move and determine the winner.
2. Enter the game contract address.
3. Provide your move and the corresponding salt used during the game creation.
4. Click on the "Solve Game" button to reveal your move and calculate the winner.
5. The smart contract will distribute the rewards to the winner.

### Claim Stake

1. If either player fails to make a move within the 5 minutes timeout period, the other player can claim the stake.
2. Click on the "Claim Stake" button.
3. Enter the game contract address.
4. Click on the "Claim Stake" button to claim the stake.