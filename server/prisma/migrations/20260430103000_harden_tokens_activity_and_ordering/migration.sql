DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'refresh_tokens' AND column_name = 'token'
  ) THEN
    ALTER TABLE "refresh_tokens" RENAME COLUMN "token" TO "token_hash";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE indexname = 'refresh_tokens_token_key'
  ) THEN
    ALTER INDEX "refresh_tokens_token_key" RENAME TO "refresh_tokens_token_hash_key";
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'activities_projectId_fkey'
  ) THEN
    ALTER TABLE "activities"
    ADD CONSTRAINT "activities_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "projects"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'columns_projectId_order_key'
  ) THEN
    ALTER TABLE "columns"
    ADD CONSTRAINT "columns_projectId_order_key" UNIQUE ("projectId", "order");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cards_columnId_order_key'
  ) THEN
    ALTER TABLE "cards"
    ADD CONSTRAINT "cards_columnId_order_key" UNIQUE ("columnId", "order");
  END IF;
END $$;
