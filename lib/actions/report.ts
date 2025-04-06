"use server";
import { reportSchema } from "@/schemas/report-schema";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { ReportInBoxType } from "@/lib/prisma_type";
import { UploadedFile } from "@/lib/types";

export async function submitReport(formData: z.infer<typeof reportSchema>) {
  const data = reportSchema.parse(formData);

  await prisma.report.create({
    data: {
      ...data,
      attachments: data.attachments ?? [],
    },
  });
}

export async function getReports(): Promise<ReportInBoxType[]> {
  const reports = await prisma.report.findMany({
    include: {
      reportedBy: true,
    },
    orderBy: {
      reportedAt: "desc",
    },
  });

  return reports.map((report) => ({
    ...report,
    attachments: (report.attachments ?? []) as UploadedFile[], // 👈 這裡手動 cast
  }));
}
