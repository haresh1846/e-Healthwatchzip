#!/bin/bash
set -e

# Install / update Node dependencies
npm install --legacy-peer-deps

# Nothing else needed: better-sqlite3 tables use IF NOT EXISTS,
# so re-running the app on next start handles any new DB columns safely.
echo "Post-merge setup complete."
