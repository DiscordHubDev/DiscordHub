'use server';
import { reportSchema } from '@/schemas/report-schema';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import {
  ReportInBoxType,
  ReportSeverity,
  ReportStatus,
} from '@/lib/prisma_type';
import { UploadedFile } from '@/lib/types';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

type Params = {
  reportId: string;
  status?: ReportStatus;
};

export async function submitReport(formData: z.infer<typeof reportSchema>) {
  const data = reportSchema.parse(formData);
  const session = await getServerSession(authOptions);
  const userId = session?.discordProfile?.id;

  if (!userId) return;
  const { reportedById, ...reportData } = data;

  await prisma.report.create({
    data: {
      ...reportData,
      attachments: reportData.attachments ?? [],
      reportedBy: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export async function getReports(): Promise<ReportInBoxType[]> {
  const reports = await prisma.report.findMany({
    include: {
      reportedBy: true,
      handledBy: true,
    },
    orderBy: {
      reportedAt: 'desc',
    },
  });

  return reports.map(report => ({
    ...report,
    attachments: (report.attachments ?? []) as UploadedFile[],
  }));
}

export async function updateReport({ reportId, status }: Params) {
  try {
    const updated = await prisma.report.update({
      where: { id: reportId },
      data: {
        ...(status && { status }),
      },
    });

    return { success: true, report: updated };
  } catch (error) {
    console.error('Failed to update report:', error);
    return { success: false };
  }
}

export async function resolveReport({
  reportId,
  status,
  resolutionNote,
}: {
  reportId: string;
  status: ReportStatus;
  resolutionNote: string;
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.discordProfile?.id;

  if (!userId) {
    throw new Error('未登入或無管理權限');
  }

  const updated = await prisma.report.update({
    where: { id: reportId },
    data: {
      status,
      resolutionNote,
      handledBy: {
        connect: {
          id: userId,
        },
      },
      handledAt: new Date(),
    },
  });

  return { success: true, report: updated };
}
