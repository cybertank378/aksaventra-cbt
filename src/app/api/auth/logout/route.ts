import { authController } from "../_factory";

export async function POST() {
  return await authController.logout();
}
