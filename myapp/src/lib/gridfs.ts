import mongoose from 'mongoose';
import { Readable } from 'stream';

export interface GridFSFileInfo {
  _id: mongoose.Types.ObjectId;
  filename: string;
  contentType?: string;
  length: number;
  uploadDate: Date;
  metadata?: any;
}

/**
 * Upload a file buffer to GridFS
 */
export async function uploadToGridFS(
  conn: mongoose.Connection,
  bucket: mongoose.mongo.GridFSBucket,
  buffer: Buffer,
  filename: string,
  contentType?: string,
  metadata?: any
): Promise<mongoose.Types.ObjectId> {
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      contentType,
      metadata: {
        ...metadata,
        uploadedAt: new Date(),
        originalSize: buffer.length
      }
    });

    const readableStream = Readable.from(buffer);
    readableStream.pipe(uploadStream);

    uploadStream.on('error', reject);
    uploadStream.on('finish', () => resolve(uploadStream.id));
  });
}

/**
 * Download a file from GridFS as buffer
 */
export async function downloadFromGridFS(
  bucket: mongoose.mongo.GridFSBucket,
  fileId: mongoose.Types.ObjectId
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const downloadStream = bucket.openDownloadStream(fileId);

    downloadStream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    downloadStream.on('error', reject);
    downloadStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });
}

/**
 * Download a file from GridFS as readable stream
 */
export function downloadFromGridFSStream(
  bucket: mongoose.mongo.GridFSBucket,
  fileId: mongoose.Types.ObjectId
): Readable {
  return bucket.openDownloadStream(fileId);
}

/**
 * Find files in GridFS by filename pattern
 */
export async function findFilesInGridFS(
  bucket: mongoose.mongo.GridFSBucket,
  filename?: string,
  metadata?: any
): Promise<GridFSFileInfo[]> {
  const files = bucket.find({
    ...(filename && { filename: { $regex: filename, $options: 'i' } }),
    ...(metadata && { metadata })
  });

  return new Promise((resolve, reject) => {
    const results: GridFSFileInfo[] = [];
    files.forEach(
      (file) => results.push(file as GridFSFileInfo),
      (err) => {
        if (err) reject(err);
        else resolve(results);
      }
    );
  });
}

/**
 * Delete a file from GridFS
 */
export async function deleteFromGridFS(
  bucket: mongoose.mongo.GridFSBucket,
  fileId: mongoose.Types.ObjectId
): Promise<void> {
  return new Promise((resolve, reject) => {
    bucket.delete(fileId, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

/**
 * Get file information from GridFS
 */
export async function getFileInfo(
  bucket: mongoose.mongo.GridFSBucket,
  fileId: mongoose.Types.ObjectId
): Promise<GridFSFileInfo | null> {
  return new Promise((resolve, reject) => {
    bucket.find({ _id: fileId }).next((error, file) => {
      if (error) reject(error);
      else resolve(file as GridFSFileInfo || null);
    });
  });
}

/**
 * Initialize GridFS bucket
 */
export function createGridFSBucket(
  conn: mongoose.Connection,
  bucketName: string = 'medical_uploads'
): mongoose.mongo.GridFSBucket | null {
  if (!conn.db) return null;
  return new mongoose.mongo.GridFSBucket(conn.db, { bucketName });
}

/**
 * Check if GridFS is available
 */
export function isGridFSAvailable(bucket: mongoose.mongo.GridFSBucket | null): boolean {
  return bucket !== null;
}
