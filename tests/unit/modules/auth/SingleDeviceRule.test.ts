import { describe, expect, it } from "vitest";
import { SingleDeviceRule } from "@/modules/auth/domain/rules/SingleDeviceRule";

describe("SingleDeviceRule (Single-Device Session Binding)", () => {
  const primaryDeviceHash = "device-hash-sha256-laptop-siswa-01";
  const secondaryDeviceHash = "device-hash-sha256-smartphone-siswa-02";

  it("allows binding when no device has been bound previously", () => {
    const result = SingleDeviceRule.evaluate({
      incomingDeviceHash: primaryDeviceHash,
      boundDeviceHash: null,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBe(true);
  });

  it("allows access when incoming device matches the bound device", () => {
    const result = SingleDeviceRule.evaluate({
      incomingDeviceHash: primaryDeviceHash,
      boundDeviceHash: primaryDeviceHash,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBe(true);
  });

  it("blocks double login attempt from a second device with DEVICE_ALREADY_BOUND error", () => {
    const result = SingleDeviceRule.evaluate({
      incomingDeviceHash: secondaryDeviceHash,
      boundDeviceHash: primaryDeviceHash,
      isResetByProctor: false,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe("DEVICE_ALREADY_BOUND");
    expect(result.error.message).toContain(
      "Akun Anda sedang terikat pada perangkat lain",
    );
  });

  it("allows second device to log in when proctor authorizes a device reset", () => {
    const result = SingleDeviceRule.evaluate({
      incomingDeviceHash: secondaryDeviceHash,
      boundDeviceHash: primaryDeviceHash,
      isResetByProctor: true,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBe(true);
  });

  it("rejects access when incoming device hash is missing but attempt is already bound", () => {
    const result = SingleDeviceRule.evaluate({
      incomingDeviceHash: "",
      boundDeviceHash: primaryDeviceHash,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe("DEVICE_HASH_REQUIRED");
  });
});
