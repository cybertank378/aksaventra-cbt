import { redirect } from "next/navigation";
import { redirectByRole } from "@/libs/utils";
import { getCurrentUser } from "@/modules/auth/shared/server/serverAuth";

export const instant = false;

export default async function RootPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  redirect(redirectByRole(user.role));
}
