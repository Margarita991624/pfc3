export class ErrorDominio extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
    this.name = "ErrorDominio";
  }
}
