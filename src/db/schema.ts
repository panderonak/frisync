import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

/**
 * File System Entries Table
 *
 * Stores both files and folders in a hierarchical structure.
 * Supports soft deletion, starring/favoriting, and maintains
 * complete audit trail with timestamps.
 */
export const file_system_entries = pgTable('file_system_entries', {
  // Primary identifier - UUID for distributed systems compatibility
  id: uuid('id').defaultRandom().primaryKey(),

  // Display name of the file/folder (e.g., "My Document.pdf", "Photos")
  name: text('name').notNull(),

  // Full path from root (e.g., "/user123/documents/reports/")
  // Used for quick lookups and breadcrumb navigation
  path: text('path').notNull(),

  // File size in bytes - 0 for folders
  // Useful for storage quotas and display
  size_bytes: integer('size_bytes').notNull(),

  // MIME type (e.g., "image/png", "application/pdf", "folder")
  // Used for file type detection, icons, and processing
  mime_type: text('mime_type').notNull(),

  // URL to the actual file storage location
  // Could be S3 URL, CDN link, or local file path
  storage_url: text('storage_url').notNull(),

  // ID of the user who owns this file/folder
  // Links to your user authentication system
  owner_id: text('owner_id').notNull(),

  // Parent folder ID for hierarchical structure
  // NULL for root-level items
  parent_id: uuid('parent_id'),

  // Boolean flags for file/folder properties
  // Determines if this entry is a folder (true) or file (false)
  is_folder: boolean('is_folder').default(false).notNull(),

  // User-favorited items for quick access
  // Enables "starred" or "favorites" functionality
  is_starred: boolean('is_starred').default(false).notNull(),

  // Soft delete flag - allows recovery of "deleted" items
  // Items marked as deleted can be restored or permanently purged later
  is_deleted: boolean('is_deleted').default(false).notNull(),

  // Audit trail timestamps
  // When the file/folder was first created
  created_at: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),

  // When the file/folder was last modified
  // Automatically updates on any change to the record
  updated_at: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});

/**
 * File System Entries Relations
 *
 * Defines self-referential relationships for the file_system_entries table
 * to create a hierarchical folder/file structure. This enables:
 * - Parent-child relationships between folders and their contents
 * - Tree traversal (upward and downward navigation)
 * - Breadcrumb generation and folder structure queries
 */
export const fileSystemEntriesRelations = relations(
  file_system_entries,
  ({ one, many }) => ({
    /**
     * Parent Folder Relation (One-to-One)
     *
     * Links a file or folder to its parent folder.
     * - Uses parent_id to reference the parent's id
     * - NULL parent_id indicates root-level items
     * - Enables upward navigation (e.g., "Go to parent folder")
     * - Used for building breadcrumb trails
     *
     * Example: /Documents/Reports/Q1Report.pdf
     * - Q1Report.pdf has parent_id pointing to Reports folder
     * - Reports folder has parent_id pointing to Documents folder
     * - Documents folder has parent_id = NULL (root level)
     */
    parent: one(file_system_entries, {
      fields: [file_system_entries.parent_id],
      references: [file_system_entries.id],
      relationName: 'parent_child', // Explicit relation name for clarity
    }),

    /**
     * Children Collection Relation (One-to-Many)
     *
     * Links a folder to all its direct children (files and subfolders).
     * - Automatically resolved by Drizzle using the parent_id foreign key
     * - Only meaningful for folders (is_folder = true)
     * - Enables downward navigation (e.g., "Show folder contents")
     * - Used for displaying folder contents and file listings
     *
     * Example Query Usage:
     * - Get folder with all its children for file explorer view
     * - Count number of items in a folder
     * - Implement folder size calculations (recursive)
     */
    children: many(file_system_entries, {
      relationName: 'parent_child', // Must match the parent relation name
    }),
  })
);

/**
 * TypeScript Type Definitions for File System Entries
 *
 * These types are automatically inferred from the Drizzle schema definition
 * and provide type safety throughout the application for database operations.
 */

/**
 * FileSystemEntry Type (Select)
 *
 * Represents a complete file system entry as returned from database queries.
 * This type includes all columns with their actual values, including:
 * - Auto-generated fields (id, created_at, updated_at)
 * - Default values (is_folder, is_starred, is_deleted)
 * - All required and optional fields
 *
 * Use this type for:
 * - Function return types that fetch existing records
 * - Component props that display file/folder data
 * - API response types
 * - State management (Redux, Zustand, etc.)
 *
 * Example usage:
 * ```
 * const getFileById = async (id: string): Promise<FileSystemEntry | null> => {
 *   return await db.query.file_system_entries.findFirst({ where: eq(file_system_entries.id, id) });
 * };
 * ```
 */
export type FileSystemEntry = typeof file_system_entries.$inferSelect;

/**
 * NewFileSystemEntry Type (Insert)
 *
 * Represents the shape of data required to create a new file system entry.
 * This type automatically handles:
 * - Required fields (must be provided)
 * - Optional fields (can be omitted)
 * - Auto-generated fields (excluded - handled by database)
 * - Default values (can be omitted - database will use defaults)
 *
 * Use this type for:
 * - Function parameters when creating new records
 * - Form validation schemas
 * - API request body types
 * - Insert operation parameters
 *
 * Example usage:
 * ```
 * const createFile = async (fileData: NewFileSystemEntry): Promise<FileSystemEntry> => {
 *   const [newFile] = await db.insert(file_system_entries).values(fileData).returning();
 *   return newFile;
 * };
 * ```
 */
export type NewFileSystemEntry = typeof file_system_entries.$inferInsert;
