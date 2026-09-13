-- Add an internal purchase rate for each dress size.
-- Existing records receive 0 until an admin enters their actual purchase rate.
ALTER TABLE "DressSize"
ADD COLUMN "purchasePrice" INTEGER NOT NULL DEFAULT 0;
