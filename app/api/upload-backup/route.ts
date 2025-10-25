import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';

// Using Node.js runtime instead of edge for better environment variable support
export const runtime = 'nodejs';

export async function POST(request: Request) {
  // Debug: Log environment variable status
  console.log('BLOB_READ_WRITE_TOKEN exists:', !!process.env.BLOB_READ_WRITE_TOKEN);
  console.log('BLOB_READ_WRITE_TOKEN length:', process.env.BLOB_READ_WRITE_TOKEN?.length || 0);
  
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('BLOB_READ_WRITE_TOKEN is missing from environment variables');
    return NextResponse.json(
      { 
        error: 'Storage configuration missing',
        details: 'BLOB_READ_WRITE_TOKEN environment variable is not set'
      },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG and WebP are allowed' },
        { status: 400 }
      );
    }

    try {
      // Generate unique filename with timestamp
      const timestamp = new Date().getTime();
      const extension = file.name.split('.').pop();
      const filename = `${timestamp}-${uuidv4()}.${extension}`;

      console.log('Attempting to upload file:', filename, 'Size:', file.size, 'Type:', file.type);

      // Upload to Vercel Blob with specific options
      const blob = await put(filename, file, {
        access: 'public',
        addRandomSuffix: false,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      console.log('Upload successful:', blob.url);

      return NextResponse.json({
        url: blob.url,
        success: true
      });

    } catch (uploadError) {
      console.error('Blob storage error:', uploadError);
      console.error('Error details:', {
        name: uploadError instanceof Error ? uploadError.name : 'Unknown',
        message: uploadError instanceof Error ? uploadError.message : 'Unknown error',
        stack: uploadError instanceof Error ? uploadError.stack : undefined
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to upload to storage',
          details: uploadError instanceof Error ? uploadError.message : 'Unknown error',
          tokenExists: !!process.env.BLOB_READ_WRITE_TOKEN
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process upload request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
