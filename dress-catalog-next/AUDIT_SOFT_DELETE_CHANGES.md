# Audit / Soft Delete / Image Library changes

This update keeps the existing catalog and hero UI intact and changes only deletion, audit, image-management, cleanup, and related backup metadata.

## Deletion behavior
- Admin Delete uses the existing `ADMIN_SECURITY_PIN` and soft-deletes the Dress.
- Soft delete sets `isActive=false`, `deletedAt`, and `deletedBy`.
- DressImage database rows and Cloudinary assets are retained.
- Restore is PIN protected.
- Permanent database deletion is available from Admin > Cleanup and is PIN protected.

## Image behavior
- Removing/replacing a DressImage no longer deletes the Cloudinary asset.
- `DressImage.publicId` is stored for reliable Cloudinary management.
- Admin > Image Library lists Cloudinary images under `dress-catalog`.
- Existing unreferenced images can be reused on an active Dress without re-uploading.
- Permanent Cloudinary deletion is PIN protected and blocked while an image is referenced.

## Audit logs
- Admin actions are stored in `AdminAuditLog` in PostgreSQL/Neon.
- Recent logs are visible at Admin > Audit Logs.
- Deletion, restoration, image add/remove/replace/reuse, main-image changes, create/update actions are logged.

## Backup / sync
- Database JSON backup now includes `AdminAuditLog` records.
- `export:data` includes `DressImage.publicId` and soft-delete metadata.
- `sync` preserves the existing non-destructive behavior: dresses omitted from local-data are not deleted automatically.
