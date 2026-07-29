import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalContentPage } from "@/components/legal-content-page";
import { getLegalPage } from "@/data/legal";

const pageData = getLegalPage("politica-de-cookies");

export const metadata: Metadata = {
  title: pageData?.title ?? "Andrea's Mystery",
  description: pageData?.description,
};

export default function Page() {
  if (!pageData) notFound();
  return <LegalContentPage page={pageData} />;
}
