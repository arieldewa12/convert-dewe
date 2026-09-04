export interface Converter {
  id: string;
  from: string;
  to: string;
  label: string;
  convert(input: Buffer): Promise<Buffer>;
}
