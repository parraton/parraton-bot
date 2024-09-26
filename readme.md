# Parroton Restaker

Parroton is a decentralized, permission-less, open-source yield optimization protocol on TON blockchain. Visit [parroton.org](https://parroton.org) for more information.

Parroton consists of these components:

**[Contract](https://github.com/KStasi/parroton-core)**: The smart contract code that is running on-chain.

**[Webapp](https://github.com/Digberi/parroton-web)**: The web application that helps users with deposits and withdrawals.

**Restaker**: The off-chain bot that restakes rewards to generate more yield for depositors. The code is available here on this repository.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Bot](#running-the-bot)
- [Scripts](#scripts)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)

## Overview

Parroton Bot handles the automation of reward distributions and other operational tasks for the Parroton platform. It integrates with several services, including DeDust and the TON blockchain, to perform its functions.

## Getting Started

### Prerequisites

Ensure you have the following installed on your local development machine:

- Node.js (>= 14.0.0)
- pnpm (>= 6.0.0)

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/digberi/parroton-bot.git
   ```

2. Navigate to the project directory:

   ```sh
   cd parroton-bot
   ```

3. Install the dependencies:
   ```sh
   pnpm install
   ```

### Configuration

1. Create a `.env` file in the root directory of the project.
2. Add the necessary environment variables to the `.env` file. Refer to the `.env.example` file for the required variables.

### Running the Bot

To start the bot, run:

```sh
pnpm start
```

## Scripts

- **`start`**: Runs the bot using `ts-node`.

## Dependencies

Parroton Bot uses a variety of dependencies to integrate with DeDust, TON blockchain, and other services. Key dependencies include:

- DeDust SDK
- TON blockchain libraries
- Pinata SDK for IPFS
- Node-cron for task scheduling
- TypeScript for type safety

## Contributing

Contributions are welcome! Please follow the established code style and conventions. For major changes, open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT license.

See [LICENSE](LICENSE) for more information.
