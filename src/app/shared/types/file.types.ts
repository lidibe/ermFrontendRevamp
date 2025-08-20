import { SafeUrl } from "@angular/platform-browser";

export type FileItem = {
    name: string;
    url: string;
  }
  export class DocumentDTO {
    public name?: string;
    public code?: string;
    public type?: string;
    public size?: number;
    previewUrl?: SafeUrl;
    file?: File
    url?: string;
  
    constructor(name?: string, code?: string, type?: string, size?: number) {
      this.name = name;
      this.code = code;
      this.type = type;
      this.size = size;
    }
  }
  export interface DocumentUrlResponse {
    url: string;
}
export interface DocumentPayload {
  doc_code?: string;
  doc_name?: string;
  doc_type?: string; 
}