import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SignInForm from "@/components/SignInForm";

export default async function Page() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return <SignInForm />;
}
