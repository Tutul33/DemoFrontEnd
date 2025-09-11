import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Observable } from 'rxjs';
import { GlobalMethods } from '../models/javascriptMethods';
import { ChatMessage, FileMessage } from '../models/FIleMessage';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private hubConnection!: signalR.HubConnection;
  private isConnected = false;
  private url: any = GlobalMethods.ApiHost();
  constructor(private http: HttpClient) {

  }

  startConnection(username: string): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.url + `chathub?username=${username}`)
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => this.isConnected = true)
      .catch(err => console.error('SignalR Connection Error:', err));
  }

  stopConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop()
        .catch(err => console.error('Error stopping SignalR connection:', err));
    }
  }

  
  onMessage(callback: (fromUser: string, message: any) => void) {
    this.hubConnection.on('ReceiveMessage', callback);
  }

  //  New method to receive files
  onFile(callback: (fromUser: string, file: any[]) => void) {
    this.hubConnection.on('ReceiveFile', callback);
  }

  onDeleteMessage(callback: (fromUser: string, file: any) => void) {
    this.hubConnection.on('MessageDeleted', callback);
  }

  onDeleteFile(callback: (fromUser: string, file: any) => void) {
    this.hubConnection.on('FileDeleted', callback);
  }

  onUpdateMessage(callback: (fromUser: string, msg: any) => void) {
    this.hubConnection.on('MessageUpdated', callback);
  }

  onActiveUsers(callback: (users: string[]) => void) {
    this.hubConnection.on('ActiveUsers', callback);
  }

  GetFinanceAndAccountUsers(): Observable<any> {
    const url = this.url + `api/voucher/GetFinanceAndAccountUsers`;
    return this.http.get<any>(
      url
    );
  }

  downloadReport(fileType: string, fileName: string) {
    try {
      return this.http.get(`${this.url}api/chat/download/${fileType}/${fileName}`, {
        responseType: 'blob'
      });
    } catch (error) {
      throw error;
    }
  }

  download(fileType: string, fileName: string) {
    try {
      this.downloadReport(fileType, fileName).subscribe(blob => {
        //this.loadingSvc.hide();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      });
    } catch (error) {
      //this.loadingSvc.hide();
      throw error;
    }
  }

  updateMessage(msg: ChatMessage): Observable<ChatMessage> {
    return this.http.put<ChatMessage>(`${this.url}api/chat/update-message`, msg);
  }

  deleteFile(sender: string, receiver: string, fileId: number): Observable<any> {
    return this.http.delete(`${this.url}api/chat/delete-file/${sender}/${receiver}/${fileId}`);
  }

  uploadChatFiles(sender: string, receiver: string, files: File[], message?: string): Observable<FileMessage[]> {
    const formData = new FormData();
    if (files && files.length > 0)
      files.forEach(f => formData.append('files', f));
    if (message) formData.append('message', message);
    return this.http.post<FileMessage[]>(`${this.url}api/chat/send/${receiver}?sender=${sender}`, formData);
  }
  
  getMessages(user1: string, user2: string, page: number, pageSize: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.url}api/chat/messages/${user1}/${user2}?page=${page}&pageSize=${pageSize}`);
  }
}
