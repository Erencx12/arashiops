import { verifyOwnerSession } from "@/lib/dal";
import { getTestCases } from "@/lib/queries";
import { TestingView } from "./TestingView";

export const metadata = { title: "Testing — Arashi OPS" };

export default async function TestingPage() {
  await verifyOwnerSession();
  const testCases = await getTestCases();
  return <TestingView testCases={testCases} />;
}
