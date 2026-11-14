import { Result } from "@/core/base/Result";
import { DomainError } from "@/core/errors/DomainError";

export interface SingleDeviceEvaluationInput {
  incomingDeviceHash?: string | null;
  boundDeviceHash?: string | null;
  isResetByProctor?: boolean;
}

export class SingleDeviceRule {
  /**
   * Evaluates if a student session attempt is allowed to log in or continue on the incoming device.
   * Enforces Single-Device Session Binding.
   */
  public static evaluate(
    input: SingleDeviceEvaluationInput,
  ): Result<boolean, DomainError> {
    const {
      incomingDeviceHash,
      boundDeviceHash,
      isResetByProctor = false,
    } = input;

    // If no device has been bound yet, allow binding
    if (!boundDeviceHash || boundDeviceHash.trim() === "") {
      return Result.ok(true);
    }

    // If proctor authorized a reset, allow binding to new device
    if (isResetByProctor) {
      return Result.ok(true);
    }

    // If incoming device hash is missing but account is bound
    if (!incomingDeviceHash || incomingDeviceHash.trim() === "") {
      return Result.fail(
        new DomainError(
          "Perangkat tidak dikenali. Pengikatan perangkat tunggal diperlukan.",
          400,
          "DEVICE_HASH_REQUIRED",
        ),
      );
    }

    // Compare hashes (case-insensitive)
    if (
      incomingDeviceHash.trim().toLowerCase() !==
      boundDeviceHash.trim().toLowerCase()
    ) {
      return Result.fail(
        new DomainError(
          "Akun Anda sedang terikat pada perangkat lain. Silakan hubungi pengawas ruang untuk melakukan Reset Device Binding.",
          409,
          "DEVICE_ALREADY_BOUND",
          {
            boundDeviceHash,
            incomingDeviceHash,
          },
        ),
      );
    }

    return Result.ok(true);
  }
}
