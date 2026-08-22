ALTER TABLE "Dress" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Dress" ADD COLUMN "deletedBy" TEXT;
CREATE INDEX "Dress_isActive_idx" ON "Dress"("isActive");
CREATE INDEX "Dress_deletedAt_idx" ON "Dress"("deletedAt");
ALTER TABLE "DressImage" ADD COLUMN "publicId" TEXT;
CREATE INDEX "DressImage_publicId_idx" ON "DressImage"("publicId");
CREATE TABLE "AdminAuditLog" (
    "id" SERIAL NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" INTEGER,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AdminAuditLog_adminEmail_idx" ON "AdminAuditLog"("adminEmail");
CREATE INDEX "AdminAuditLog_action_idx" ON "AdminAuditLog"("action");
CREATE INDEX "AdminAuditLog_entity_idx" ON "AdminAuditLog"("entity");
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");
