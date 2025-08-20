import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

type CredentialsResponse = { code: string, url: string };

const baseUrl = 'ms/api/v1/document';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private _s3Client: HttpClient;

  constructor(
    httpBackend: HttpBackend,
    private _http: HttpClient,
  ) {
    // Create new client to bypass HTTP auth interceptors
    this._s3Client = new HttpClient(httpBackend);
  }

  get(documentCode: string): Observable<string> {
    return this._http.get<CredentialsResponse>(`${baseUrl}/retrieve/${documentCode}`)
      .pipe(
        map(response => response.url),
      );
  }

  upload(file: File): Observable<string> {
    return this.initiateUpload(file)
      .pipe(
        mergeMap(credentials => this.putFile(file, credentials)),
        mergeMap(pair => this.confirmUpload(pair))
      );
  }

  private initiateUpload(file: File): Observable<CredentialsResponse> {
    return this._http.post<CredentialsResponse>(`${baseUrl}/get-upload-credentials`, {
      name: file.name,
      filename: file.name,
      type: file.type,
      size: file.size,
    });
  }

  private putFile(
    file: File,
    credentials: CredentialsResponse,
  ): Observable<[File, CredentialsResponse]> {
    return this._s3Client.put<void>(credentials.url, file).pipe(map(() => [file, credentials]));
  }

  private confirmUpload(pair: [File, CredentialsResponse]): Observable<string> {
    const documentCode = pair[1].code;
    return this._http.post<void>(`${baseUrl}/confirm/${documentCode}`, null)
      .pipe(map(() => documentCode));
  }

  deleteDocument(documentCode: string): Observable<any> {
    return this._http.delete<any>(`${baseUrl}/delete/${documentCode}`)
  }
}
