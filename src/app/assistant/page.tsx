import PharmaAgent from "@/components/PharmaAgent";

export default function AssistantPage() {
  return <PharmaAgent llmConfigured={Boolean(process.env.OPENAI_API_KEY)} />;
}
