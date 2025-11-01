import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import { mediaModeration, type InsertMediaModeration, type MediaModeration } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export interface CompressedImageResult {
  originalPath: string;
  compressedPath: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  fileName: string;
}

export interface ModerationResult {
  id: string;
  status: 'approved' | 'rejected' | 'flagged';
  notes?: string;
  flaggedReason?: string;
}

export class MediaModerationService {
  private readonly uploadsDir = './uploads';
  private readonly compressedDir = './uploads/compressed';

  constructor() {
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true });
      await fs.mkdir(this.compressedDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directories:', error);
    }
  }

  async compressImage(filePath: string, originalFileName: string): Promise<CompressedImageResult> {
    const fileExtension = path.extname(originalFileName).toLowerCase();
    const fileName = `${uuidv4()}${fileExtension}`;
    const compressedPath = path.join(this.compressedDir, fileName);

    // Get original file size
    const originalStats = await fs.stat(filePath);
    const originalSize = originalStats.size;

    try {
      let compressedBuffer: Buffer;

      // Configure compression based on file type
      const sharpInstance = sharp(filePath)
        .resize(800, 1200, {
          fit: 'inside',
          withoutEnlargement: true
        });
      
      switch (fileExtension) {
        case '.jpg':
        case '.jpeg':
          compressedBuffer = await sharpInstance
            .jpeg({ 
              quality: 85, 
              progressive: true,
              mozjpeg: true 
            })
            .toBuffer();
          break;
        
        case '.png':
          compressedBuffer = await sharpInstance
            .png({ 
              quality: 85,
              compressionLevel: 9,
              progressive: true
            })
            .toBuffer();
          break;
        
        case '.webp':
          compressedBuffer = await sharpInstance
            .webp({ 
              quality: 85,
              effort: 6
            })
            .toBuffer();
          break;
        
        default:
          // For unsupported formats, convert to JPEG
          compressedBuffer = await sharpInstance
            .jpeg({ 
              quality: 85, 
              progressive: true 
            })
            .toBuffer();
          break;
      }

      // Write compressed file
      await fs.writeFile(compressedPath, compressedBuffer);
      
      const compressedSize = compressedBuffer.length;
      const compressionRatio = Math.round(((originalSize - compressedSize) / originalSize) * 100);

      // Keep original file for now (don't delete)

      return {
        originalPath: filePath,
        compressedPath,
        originalSize,
        compressedSize,
        compressionRatio,
        fileName
      };
    } catch (error) {
      console.error('Error compressing image:', error);
      throw new Error('Failed to compress image');
    }
  }

  async submitForModeration(
    userId: string, 
    filePath: string, 
    originalFileName: string, 
    mimeType: string,
    isProfilePhoto: boolean = false
  ): Promise<MediaModeration> {
    const fileType = mimeType.startsWith('image/') ? 'image' : 'video';
    
    let compressedResult: CompressedImageResult | null = null;

    // Compress images only
    if (fileType === 'image') {
      try {
        compressedResult = await this.compressImage(filePath, originalFileName);
      } catch (error) {
        console.error('Compression failed, proceeding with original file:', error);
      }
    }

    // Create moderation record
    const moderationData: InsertMediaModeration = {
      userId,
      fileName: compressedResult?.fileName || path.basename(filePath),
      originalFileName,
      filePath: compressedResult?.compressedPath || filePath,
      compressedPath: compressedResult?.compressedPath,
      fileType,
      mimeType,
      originalSize: compressedResult?.originalSize || (await fs.stat(filePath)).size,
      compressedSize: compressedResult?.compressedSize,
      compressionRatio: compressedResult?.compressionRatio ? compressedResult.compressionRatio.toString() : null,
      moderationStatus: 'pending',
      isProfilePhoto
    };

    const [moderationRecord] = await db
      .insert(mediaModeration)
      .values(moderationData)
      .returning();

    return moderationRecord;
  }

  async getPendingModeration(): Promise<MediaModeration[]> {
    return await db
      .select()
      .from(mediaModeration)
      .where(eq(mediaModeration.moderationStatus, 'pending'))
      .orderBy(mediaModeration.uploadedAt);
  }

  async moderateContent(
    moderationId: string, 
    moderatorId: string, 
    result: ModerationResult
  ): Promise<MediaModeration> {
    const now = new Date();
    
    const [updatedRecord] = await db
      .update(mediaModeration)
      .set({
        moderationStatus: result.status,
        moderatedBy: moderatorId,
        moderationNotes: result.notes,
        flaggedReason: result.flaggedReason,
        moderatedAt: now,
        ...(result.status === 'approved' && { approvedAt: now })
      })
      .where(eq(mediaModeration.id, moderationId))
      .returning();

    // If rejected or flagged, delete the file
    if (result.status === 'rejected' || result.status === 'flagged') {
      try {
        const filePath = updatedRecord.compressedPath || updatedRecord.filePath;
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Error deleting rejected file:', error);
      }
    }

    return updatedRecord;
  }

  async getApprovedUserMedia(userId: string): Promise<MediaModeration[]> {
    return await db
      .select()
      .from(mediaModeration)
      .where(and(
        eq(mediaModeration.userId, userId),
        eq(mediaModeration.moderationStatus, 'approved')
      ))
      .orderBy(mediaModeration.approvedAt);
  }

  async getUserMediaByStatus(userId: string, status: 'pending' | 'approved' | 'rejected' | 'flagged'): Promise<MediaModeration[]> {
    return await db
      .select()
      .from(mediaModeration)
      .where(and(
        eq(mediaModeration.userId, userId),
        eq(mediaModeration.moderationStatus, status)
      ))
      .orderBy(mediaModeration.uploadedAt);
  }

  async deleteMedia(mediaId: string): Promise<boolean> {
    try {
      const [record] = await db
        .select()
        .from(mediaModeration)
        .where(eq(mediaModeration.id, mediaId));

      if (!record) {
        return false;
      }

      // Delete physical file
      const filePath = record.compressedPath || record.filePath;
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Error deleting physical file:', error);
      }

      // Delete database record
      await db
        .delete(mediaModeration)
        .where(eq(mediaModeration.id, mediaId));

      return true;
    } catch (error) {
      console.error('Error deleting media:', error);
      return false;
    }
  }

  async getCompressionStats(): Promise<{
    totalFiles: number;
    totalOriginalSize: number;
    totalCompressedSize: number;
    averageCompressionRatio: number;
    totalSpaceSaved: number;
  }> {
    const records = await db
      .select()
      .from(mediaModeration)
      .where(eq(mediaModeration.fileType, 'image'));

    const totalFiles = records.length;
    const totalOriginalSize = records.reduce((sum, record) => sum + (record.originalSize || 0), 0);
    const totalCompressedSize = records.reduce((sum, record) => sum + (record.compressedSize || record.originalSize || 0), 0);
    const totalSpaceSaved = totalOriginalSize - totalCompressedSize;
    const averageCompressionRatio = totalFiles > 0 
      ? records.reduce((sum, record) => sum + (parseFloat(record.compressionRatio?.toString() || '0')), 0) / totalFiles 
      : 0;

    return {
      totalFiles,
      totalOriginalSize,
      totalCompressedSize,
      averageCompressionRatio: Math.round(averageCompressionRatio * 100) / 100,
      totalSpaceSaved
    };
  }
}

export const mediaModerationService = new MediaModerationService();