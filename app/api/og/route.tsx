import { NextRequest } from 'next/server';
import { Renderer, type OutputFormat } from '@takumi-rs/core';
import { fromJsx } from '@takumi-rs/helpers/jsx';

export const runtime = 'nodejs';

const renderer = new Renderer({});

// 調試版本 - 添加詳細日志
async function toDataUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = blob.type || 'image/jpeg';

    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Error converting image to data URL:', error);
    throw error;
  }
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
