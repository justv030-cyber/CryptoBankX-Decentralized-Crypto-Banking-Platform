# CryptoBankX – Decentralized Crypto Banking Platform

CryptoBankX is a decentralized banking platform built with Solidity and Hardhat. The project allows users to deposit collateral, borrow assets, repay loans with interest, and supports oracle-based collateral valuation and liquidation of unsafe positions.

---

## 🚀 Features

### ✅ ERC20 Bank Token

* Custom ERC20 token used throughout the platform.
* Used as collateral and borrowed asset.

### ✅ Lending Pool

* Deposit ERC20 tokens as collateral.
* Borrow tokens against collateral.
* Repay borrowed amount.
* Tracks:

  * Collateral
  * Debt
  * Borrow timestamp

### ✅ Interest Rate Model

* Calculates interest based on:

  * Principal amount
  * Annual interest rate
  * Time elapsed
* Dynamic interest calculation.

### ✅ Price Oracle

* Stores token price.
* Owner can update token price.
* LendingPool uses oracle price to calculate collateral value.

### ✅ Oracle-Based Borrowing

Borrowing limit is calculated from collateral value.

Example:

* Token Price = $2
* Collateral = 100 Tokens
* Collateral Value = $200
* Maximum Borrow = $100 (50% LTV)

### ✅ Loan Repayment

Repayment includes:

* Principal
* Accrued Interest

### ✅ Position Information

Users can view:

* Collateral
* Debt
* Total Debt (including interest)
* Safety status

### ✅ Liquidation System

LiquidationManager monitors unhealthy positions.

If collateral value falls below the required collateral ratio:

* Position becomes unsafe.
* Liquidator repays borrower debt.
* Borrower's collateral is seized.
* Borrower position is reset.

---

# Smart Contracts

contracts/

* BankToken.sol
* LendingPool.sol
* InterestRateModel.sol
* PriceOracle.sol
* LiquidationManager.sol

---

# Project Structure

```
contracts/
├── BankToken.sol
├── InterestRateModel.sol
├── LendingPool.sol
├── PriceOracle.sol
└── LiquidationManager.sol

scripts/
├── deployBankToken.js
├── deployInterestRateModel.js
├── deployPriceOracle.js
├── deployLendingPool.js
├── deployLiquidationManager.js
├── testBankToken.js
├── testInterest.js
├── testLendingPool.js
├── testPriceOracle.js
└── testLiquidation.js
```

---

# Technologies Used

* Solidity ^0.8.28
* Hardhat 3
* OpenZeppelin Contracts
* Ethers.js v6
* JavaScript
* Node.js

---

# Installation

```bash
git clone <repository-url>

cd CryptoBankX-Decentralized-Crypto-Banking-Platform

npm install
```

---

# Compile

```bash
npx hardhat compile
```

---

# Run Local Hardhat Node

```bash
npx hardhat node
```

---

# Run Tests (Scripts)

Interest Model

```bash
npx hardhat run scripts/testInterest.js --network localhost
```

Lending Pool

```bash
npx hardhat run scripts/testLendingPool.js --network localhost
```

Price Oracle

```bash
npx hardhat run scripts/testPriceOracle.js --network localhost
```

Liquidation

```bash
npx hardhat run scripts/testLiquidation.js --network localhost
```

---

# Deployment

Deploy contracts individually.

Example:

```bash
npx hardhat run scripts/deployBankToken.js --network hoodi

npx hardhat run scripts/deployInterestRateModel.js --network hoodi

npx hardhat run scripts/deployPriceOracle.js --network hoodi

npx hardhat run scripts/deployLendingPool.js --network hoodi

npx hardhat run scripts/deployLiquidationManager.js --network hoodi
```

---

# Current Workflow

1. Deploy ERC20 Bank Token.
2. Deploy Interest Rate Model.
3. Deploy Price Oracle.
4. Deploy Lending Pool.
5. Link Price Oracle with Lending Pool.
6. Deposit collateral.
7. Borrow tokens.
8. Interest accrues over time.
9. Repay loan with interest.
10. Monitor collateral health using Price Oracle.
11. Liquidate unsafe positions using LiquidationManager.

---

# Future Improvements

* Multi-token collateral support
* Chainlink Price Feeds
* Stablecoin lending
* Partial liquidation
* Flash loans
* Staking rewards
* Governance token
* DAO governance
* Reward distribution
* Frontend dashboard (React / Next.js)
* WalletConnect integration
* Multi-chain deployment

---

# License

MIT
