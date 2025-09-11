import { AfterViewChecked, Component, ElementRef, HostListener, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { SignalRService } from '../../services/signalr-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from "primeng/button";
import { TabsModule } from 'primeng/tabs';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { ImageModule } from 'primeng/image';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../store/auth.selectors';
import { Observable } from 'rxjs';
import { ChatTab, FileMessage, ChatMessage } from '../../models/FIleMessage';
import { EntityState, GlobalMethods } from '../../models/javascriptMethods';
import { InformationService } from '../../services/information-service';
import { DialogModule } from 'primeng/dialog';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { Divider } from "primeng/divider";

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule, Button, TabsModule, FileUploadModule, ImageModule, DialogModule, PickerModule, Divider],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css'],
  providers:[]
})
export class Chat implements AfterViewChecked {
  showEmojiPicker = false;
  loggedUser$: Observable<any | null>;
  loggedBy: string = '';
  chatVisible = false;
  previewVisible = false;
  previewImage: string | null = null;
  activeUsers: any[] = [];
  chatTabs: ChatTab[] = [];
  activeTabIndex = 0;
  tempUserList: any;
  searchUserObj: string = '';
  fileUrl: any = GlobalMethods.FileUrl() + 'ChatFiles/';
  @ViewChild('fileUploader') fileUploader!: FileUpload;
  @ViewChildren('chatMessagesContainer') chatContainers!: QueryList<ElementRef>;
  @ViewChild('emojiButton') emojiButton!: ElementRef;
  @ViewChild('emojiPopover') emojiPopover!: ElementRef;

  constructor(private store: Store, private signalR: SignalRService, private infoSvc: InformationService) {
    this.loggedUser$ = this.store.select(selectCurrentUser);
  }

  ngOnInit() {
    this.getFinanceAndAccountUsers();
    this.setLoggedUserInfo();
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any, tab: ChatTab) {
    tab.newMessage = (tab.newMessage || '') + event.emoji.native;
    this.showEmojiPicker = false; // close picker after selection
  }

  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement: any) {
    if (!this.showEmojiPicker) return;

    const clickedInsideButton = this.emojiButton?.nativeElement.contains(targetElement);
    const clickedInsidePopover = this.emojiPopover?.nativeElement.contains(targetElement);

    if (!clickedInsideButton && !clickedInsidePopover) {
      this.showEmojiPicker = false;
    }
  }

  loadMessages(tab: ChatTab, page: number) {
    this.signalR.getMessages(this.loggedBy, tab.user, page, 20)
      .subscribe((msgs:any) => {
        tab.messages = [...msgs.list, ...tab.messages]; // prepend older messages
      });
  }

  onScroll(event: any, tab: ChatTab) {
    try {
      const element = event.target;
      if (element.scrollTop === 0) {
        tab.page = (tab.page || 1) + 1; // next page
        this.loadMessages(tab, tab.page);
      }
    } catch (error) {
      this.infoSvc.showErrorMsg(error);
    }
  }

  ngAfterViewChecked() {
    // this.scrollToBottom();
  }

  scrollToBottom() {
    try {
      const el = this.chatContainers.toArray()[this.activeTabIndex]?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch (error) {
      this.infoSvc.showErrorMsg(error);
    }
  }

  toggleChat() {
    this.chatVisible = !this.chatVisible;
  }

  getFinanceAndAccountUsers() {
    try {
      this.signalR.GetFinanceAndAccountUsers().subscribe(res => {
        const list = res?.data?.list ?? [];
        this.activeUsers = list.filter(x => x.userName !== this.loggedBy)
          .map(u => ({ userName: u.userName, isOnline: false }));
        this.tempUserList = [...this.activeUsers];
      });
    } catch (error) {
      this.infoSvc.showErrorMsg(error);
    }
  }

  searchUser() {
    this.activeUsers = this.searchUserObj
      ? this.tempUserList.filter(x => x.userName.includes(this.searchUserObj))
      : [...this.tempUserList];
  }

  setLoggedUserInfo() {
    this.loggedUser$.subscribe(user => {
      if (!user) return;
      this.loggedBy = user.userName;
      this.signalR.startConnection(this.loggedBy);

      this.signalR.onUpdateMessage((sender, msg) => {
        debugger
        this.updateMessage(sender, msg)
      });
      this.signalR.onDeleteMessage((sender, msg) => {
        debugger
        this.handleMessageDelete(sender, msg)
      });
      this.signalR.onFile((sender, msg: any) => {
        debugger
        this.handleFile(sender, msg)
      });
      this.signalR.onDeleteFile((sender, msg: any) => {
        debugger
        this.handleFileDelete(sender, msg)
      });
      this.signalR.onActiveUsers(users => {
        const activeUserNames = users.filter(u => u !== this.loggedBy);
        this.activeUsers.forEach(u => u.isOnline = activeUserNames.includes(u.userName));
      });
    });
  }

  openChat(user: string) {
    let tab = this.chatTabs.find(t => t.user === user);
    if (!tab) {
      tab = { user, messages: [], newMessage: '', totalUnread: 0 };
      this.chatTabs.push(tab);
      setTimeout(() => this.activeTabIndex = this.chatTabs.length - 1);
      this.loadMessages(tab, 1);
    } else {
      this.activeTabIndex = this.chatTabs.indexOf(tab);
    }
    tab.totalUnread = 0;
    tab.messages.forEach(m => m.isRead = true);
  }

  handleMessageDelete(sender: string, id: any) {
    debugger
    let tab = this.chatTabs.find(t => t.user === sender);
    if (tab) {
      tab.messages = tab.messages.filter(x => x.id != id);
    }
  }

  updateMessage(sender: string, msg: any) {
    try {
      let tab = this.chatTabs.find(t => t.user === sender);
      if (tab) {
        const msgObj = tab.messages.find(x => x.id == msg.id);
        if (msgObj) {
          msgObj.text = msg.text;
        }
      }
    } catch (error) {

    }
  }

  handleFile(sender: string, msg: any) {
    let tab = this.chatTabs.find(t => t.user === sender);
    if (!tab) {
      tab = { user: sender, messages: [], newMessage: '', totalUnread: 0 };
      this.chatTabs.push(tab);
    }

    tab.messages.push({
      id: msg.id,
      sender,
      receiver: sender,
      text: msg.text,
      isRead: false,
      files: msg.files,
      sentDate: new Date(),
      tag: EntityState.Added
    });
    if (this.chatTabs.indexOf(tab) !== this.activeTabIndex) tab.totalUnread++;
    setTimeout(() => this.scrollToBottom(), 50);
  }

  handleFileDelete(sender: string, id: any) {
    let tab = this.chatTabs.find(t => t.user === sender);
    if (tab) {
      tab.messages.forEach(m => m.files = m.files?.filter(f => f.id !== id));
    }
  }


  send(tab: ChatTab) {
    debugger;
    // Multiple files + message
    if (tab.newMessage?.trim() || tab.pendingFiles?.length > 0) {
      this.signalR.uploadChatFiles(this.loggedBy, tab.user, tab.pendingFiles, tab.newMessage)
        .subscribe({
          next: (res: any) => {
            const fileMessages = res?.data || res;
            const msg: ChatMessage = {
              id: fileMessages.id,
              sender: this.loggedBy,
              receiver: tab.user,
              text: tab.newMessage,
              files: fileMessages?.files,
              isRead: true,
              sentDate: new Date(),
              tag: EntityState.Added
            };
            tab.messages.push(msg);
            tab.pendingFiles = undefined;
            tab.previewFiles = undefined;
            tab.newMessage = '';
            setTimeout(() => this.scrollToBottom(), 50);
          },
          error: err => console.error(err)
        });
    }

  }

  closeTab(tab: ChatTab) {
    this.chatTabs = this.chatTabs.filter(x => x.user != tab.user);
  }

  onTabChange(index: any) {
    this.activeTabIndex = index;
    const tab = this.chatTabs[index];
    if (tab) {
      tab.totalUnread = 0;
      tab.messages.forEach(m => m.isRead = true);
    }
  }

  onFilesSelected(event: any, tab: ChatTab) {
    if (!event || !event.files?.length) return;

    tab.pendingFiles = [...tab?.pendingFiles || []];
    tab.previewFiles = [...tab?.previewFiles || []];
    Array.from(event.files).forEach((file: any) => {
      const reader = new FileReader();
      reader.onload = () => {
        tab.pendingFiles.push(file);
        tab.previewFiles?.push({
          fileName: file.name,
          fileType: file.type,
          fileData: reader.result as string,
          sentDate: new Date(),
          tag: EntityState.Added
        });
      };
      reader.readAsDataURL(file);
    });
    setTimeout(() => this.scrollToBottom(), 50);
  }

  deleteFile(tab: ChatTab, file: FileMessage, m?: any) {
    if (file.id) {
      this.signalR.deleteFile(this.loggedBy, m.receiver, file.id).subscribe(() => {
        tab.messages.forEach(m => m.files = m.files?.filter(f => f.id !== file.id));
      });
    } else {
      tab.previewFiles = tab.previewFiles?.filter(f => f !== file);
      tab.pendingFiles = tab.pendingFiles?.filter(f => f.name !== file.fileName);
    }
  }

  editMessage(tab: ChatTab, msg: ChatMessage) {
    msg.editing = true;
    msg.tag = EntityState.Modified;
  }

  saveMessage(tab: ChatTab, msg: ChatMessage) {
    this.signalR.updateMessage(msg).subscribe({
      next: updated => Object.assign(msg, updated),
      error: err => console.error(err)
    });
    msg.editing = false;
  }

  cancelEdit(msg: ChatMessage) {
    msg.editing = false;
  }

  download(file: FileMessage) {
    try {
      const fileType = file.fileName.split('.').pop() || '';
      this.signalR.download(fileType, file.fileUrl || file.fileName);
    } catch { }
  }

  openPreview(src: string) {
    this.previewImage = src;
    this.previewVisible = true;
  }

  onDialogClose() {
    this.previewVisible = false;
    this.previewImage = null; // optional: clear image
  }
}
