import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { SignalRService } from '../../services/signalr-service';
import { InformationService } from '../../services/information-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-chat-bot',
  imports: [CommonModule, FormsModule,Button],
  templateUrl: './chat-bot.html',
  styleUrl: './chat-bot.css'
})
export class ChatBot {
botChatVisible = false;
  messages: { text: string; isUser: boolean; time: Date }[] = [];
  newMessage = '';

  constructor(private store: Store, private signalR: SignalRService, private infoSvc: InformationService) {}

  toggleBotChat() {
    this.botChatVisible = !this.botChatVisible;
  }

  async sendMessage() {
    if (!this.newMessage.trim()) return;

    // Push user message
    this.messages.push({ text: this.newMessage, isUser: true, time: new Date() });

    const userMessage = this.newMessage;
    this.newMessage = '';
    let msgObj={
      message:userMessage
    }
    // Call backend API for bot response
    this.signalR.chatWithBot(msgObj).subscribe({
      next:(res:any)=>{
        debugger
           this.messages.push({ text: res.data.message, isUser: false, time: new Date() });
      },
      error:(err:any)=>{
         this.infoSvc.showErrorMsg(err);
      },
    });

    // Push bot reply
    
  }
}
