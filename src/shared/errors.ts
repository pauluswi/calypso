export type ErrorCode =
  | "PLAYER_NOT_FOUND"
  | "WALLET_NOT_FOUND"
  | "ASSET_NOT_FOUND"
  | "INVALID_WALLET_ADDRESS"
  | "TRANSACTION_FAILED"
  | "BLOCKCHAIN_UNAVAILABLE"
  | "VALIDATION_ERROR"
  | "INTERNAL_SERVER_ERROR";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;

  constructor(code: ErrorCode, message: string, statusCode: number) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}
