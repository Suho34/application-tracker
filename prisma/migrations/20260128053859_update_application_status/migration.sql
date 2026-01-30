-- 1. Create enum type
CREATE TYPE "ApplicationStatus" AS ENUM (
  'APPLIED',
  'INTERVIEW',
  'REJECTED',
  'OFFER',
  'ACCEPTED'
);

-- 2. Add a temporary enum column (nullable for now)
ALTER TABLE "Application"
ADD COLUMN "status_new" "ApplicationStatus";

-- 3. Migrate existing data
UPDATE "Application"
SET "status_new" =
  (
    CASE LOWER("status")
      WHEN 'applied' THEN 'APPLIED'
      WHEN 'interview' THEN 'INTERVIEW'
      WHEN 'rejected' THEN 'REJECTED'
      WHEN 'offer' THEN 'OFFER'
      WHEN 'accepted' THEN 'ACCEPTED'
      ELSE 'APPLIED'
    END
  )::"ApplicationStatus";

-- 4. Make the new column NOT NULL
ALTER TABLE "Application"
ALTER COLUMN "status_new" SET NOT NULL;

-- 5. Drop the old column
ALTER TABLE "Application"
DROP COLUMN "status";

-- 6. Rename the new column
ALTER TABLE "Application"
RENAME COLUMN "status_new" TO "status";
