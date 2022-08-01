class Error {
  type: string;
  description: string;
}

export class ResponseDTO<T> {
  success: boolean;
  data: T[];
  error: Error;
}
