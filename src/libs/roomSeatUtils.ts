export interface ParsedRoomAndSeat {
  roomCode: string;
  seatNumber: string | null;
}

/**
 * Encodes roomCode and optional seatNumber into the User.roomCode column
 * (e.g. "LAB-01|M-01") without requiring a destructive DB migration.
 */
export function formatStoredRoomAndSeat(
  roomCode?: string | null,
  seatNumber?: string | null,
): string {
  const cleanRoom = (roomCode || "LAB-01").split("|")[0]?.trim() || "LAB-01";
  const cleanSeat = (seatNumber || "").trim();
  return cleanSeat ? `${cleanRoom}|${cleanSeat}` : cleanRoom;
}

/**
 * Extracts roomCode and seatNumber from a stored User.roomCode value.
 */
export function parseStoredRoomAndSeat(
  rawRoomCode?: string | null,
  fallbackSeatNumber?: string | null,
): ParsedRoomAndSeat {
  if (!rawRoomCode || !rawRoomCode.trim()) {
    return {
      roomCode: "LAB-01",
      seatNumber: fallbackSeatNumber ?? null,
    };
  }

  const [roomPart, seatPart] = rawRoomCode.split("|");
  return {
    roomCode: roomPart?.trim() || "LAB-01",
    seatNumber: seatPart?.trim() || fallbackSeatNumber || null,
  };
}
