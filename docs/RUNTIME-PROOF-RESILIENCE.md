# Runtime proof resilience

This hotfix keeps the public judge runtime fail-closed while removing two presentation-layer false negatives discovered during live QA.

- `/api/runtime` now recognizes the strongly consistent `TENDER_OPERATOR_DO` binding when reporting operator runtime configuration.
- `/api/chain-proof` verifies the canonical Base Sepolia USDC transfer through a configurable RPC first, then the official Base Sepolia endpoint, then the PublicNode Base Sepolia fallback.
- Each RPC may retry once on rate-limit/server/network failure.
- `verified: true` is returned only after the canonical transaction hash, successful receipt, USDC contract, recipient, Transfer topic, and exact base-unit amount all match.
- A real chain mismatch fails closed and is never converted into a successful fallback result.
- The canonical KeeperHub payment and proof artifact remain untouched.

The optional `BASE_SEPOLIA_RPC_URL` binding can be supplied later for a dedicated RPC provider without code changes.
