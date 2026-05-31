import type { Metadata } from "next";
import { TopicDashboard } from "@/components/dashboard/topic-dashboard";
import { TOPIC_BY_SLUG, TOPICS } from "@/lib/eurostat/registry";

export function generateStaticParams() {
  return TOPICS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = TOPIC_BY_SLUG.get(slug);
  return {
    title: topic ? topic.title : "Topic",
    description: topic?.description,
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <TopicDashboard slug={slug} />;
}
