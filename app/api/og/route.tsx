import { NextRequest } from 'next/server';
import { Renderer, type OutputFormat } from '@takumi-rs/core';
import { fromJsx } from '@takumi-rs/helpers/jsx';
import sharp from 'sharp';

export const runtime = 'nodejs';

const renderer = new Renderer({});

async function smartImageProcessor(url: string): Promise<string> {
  try {
    console.log('Smart processing image:', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    const buffer = await response.arrayBuffer();

    console.log('Image content type:', contentType);

    // 如果是 GIF，使用 Sharp 轉換第一幀為 PNG
    if (contentType.includes('gif')) {
      console.log('Detected GIF, converting to static PNG');

      const staticBuffer = await sharp(Buffer.from(buffer))
        .png()
        .resize(1200, 630, {
          fit: 'inside',
          withoutEnlargement: true,
          background: { r: 255, g: 255, b: 255, alpha: 1 }, // 白色背景
        })
        .toBuffer();

      const base64 = staticBuffer.toString('base64');
      return `data:image/png;base64,${base64}`;
    }
    // 如果是 WebP 或其他現代格式，也轉換為 PNG 確保兼容性
    else if (contentType.includes('webp') || contentType.includes('avif')) {
      console.log('Converting modern format to PNG');

      const processedBuffer = await sharp(Buffer.from(buffer))
        .png()
        .resize(1200, 630, { fit: 'inside', withoutEnlargement: true })
        .toBuffer();

      const base64 = processedBuffer.toString('base64');
      return `data:image/png;base64,${base64}`;
    }
    // 標準格式直接轉換
    else {
      const base64 = Buffer.from(buffer).toString('base64');
      const mimeType = contentType || 'image/jpeg';
      return `data:${mimeType};base64,${base64}`;
    }
  } catch (error) {
    console.error('Smart image processing failed:', error);
    throw error;
  }
}

// 替換原來的 toDataUrl 函數
async function toDataUrl(url: string): Promise<string> {
  return await smartImageProcessor(url);
}

async function OgCard({
  width,
  height,
  img,
}: {
  width?: number;
  height?: number;
  img?: string;
}) {
  let dataUrl: string | undefined;

  if (img) {
    try {
      dataUrl = await toDataUrl(img);
    } catch (error) {
      console.error('Failed to load image:', error);
      // 可以選擇顯示預設圖片或錯誤訊息
      dataUrl = undefined;
    }
  }

  return (
    <div
      style={{
        width: width || 1200,
        height: height || 630,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        backgroundColor: '#f0f0f0', // 添加背景色以便調試
      }}
    >
      {dataUrl ? (
        <img
          src={dataUrl}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
          alt="OG Image"
        />
      ) : (
        // 提供備用內容
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: '#666',
          }}
        >
          No Image Available
        </div>
      )}
    </div>
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const img = searchParams.get('img') ?? undefined;
  const width = parseInt(searchParams.get('width') || '1200', 10);
  const height = parseInt(searchParams.get('height') || '630', 10);

  try {
    const node = await fromJsx(
      <OgCard img={img} width={width} height={height} />,
    );

    const png = await renderer.renderAsync(node, {
      width: width,
      height: height,
      format: 'Png' as OutputFormat.Png,
    });

    return new Response(new Uint8Array(png), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control':
          'public, max-age=300, s-maxage=300, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating OG image:', error);

    // 返回錯誤圖片或預設圖片
    const errorNode = await fromJsx(
      <div
        style={{
          width: width,
          height: height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0f0f0',
          color: '#666',
          fontSize: '24px',
        }}
      >
        Error loading image
      </div>,
    );

    const errorPng = await renderer.renderAsync(errorNode, {
      width: width,
      height: height,
      format: 'Png' as OutputFormat.Png,
    });

    return new Response(new Uint8Array(errorPng), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache',
      },
    });
  }
}
