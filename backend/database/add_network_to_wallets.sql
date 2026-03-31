-- Add network column to fenix_wallets table
ALTER TABLE fenix_wallets ADD COLUMN IF NOT EXISTS network VARCHAR(50);
ALTER TABLE fenix_wallets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing wallets with default network values
UPDATE fenix_wallets SET network = 'Ethereum' WHERE network IS NULL;

-- Make network NOT NULL after setting default values
ALTER TABLE fenix_wallets ALTER COLUMN network SET NOT NULL;

COMMENT ON COLUMN fenix_wallets.network IS 'Blockchain network (e.g., Ethereum, Polygon, BSC)';