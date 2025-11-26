export class AppError extends Error {
  name: string;
  constructor(message: string, public status: number) {
    super(message);
    this.name = "App Error";
  }
}

export class ValidationError extends AppError {
  details: Required<Array<string>>;
  constructor(message: string, public status: number, details: Array<string>) {
    super(message, status);
    this.details = details;
  }
}
