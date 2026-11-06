import { ProctorService } from "@/modules/proctor/application/service/ProctorService";
import { ProctorController } from "@/modules/proctor/infrastructure/ProctorController";
import { ProctorRepository } from "@/modules/proctor/infrastructure/ProctorRepository";

export function createProctorController(): ProctorController {
  const proctorRepo = new ProctorRepository();
  const proctorService = new ProctorService(proctorRepo);
  return new ProctorController(proctorService);
}

export const proctorController = createProctorController();
