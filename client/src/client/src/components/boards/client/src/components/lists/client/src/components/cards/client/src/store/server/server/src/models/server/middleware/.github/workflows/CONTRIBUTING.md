# Contributing to TaskFlow

We love your input! We want to make contributing to TaskFlow as easy and transparent as possible.

## Development Process

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/task-management-tool.git
cd task-management-tool

# Install dependencies
cd server && npm install
cd ../client && npm install

# Start development servers
# Terminal 1
cd server && npm run dev
# Terminal 2
cd client && npm start
