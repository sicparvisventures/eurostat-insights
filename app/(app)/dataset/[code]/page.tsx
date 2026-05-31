import type { Metadata } from "next";
import { DatasetViewer } from "@/components/dataset/dataset-viewer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return { title: `Dataset ${code.toUpperCase()}` };
}

export default async function DatasetPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <DatasetViewer code={code} />;
}
