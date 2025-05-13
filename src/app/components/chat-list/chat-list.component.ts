import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common'; // Import NgForOf and NgIf

// Define an interface for the chat summary objects
export interface ChatSummary {
  id: string;
  title?: string; // A title or name for the chat
  preview?: string; // A short preview of the chat content
  // Add any other properties your /recent-chats endpoint returns for each chat summary
}

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [NgForOf, NgIf],
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css']
})
export class ChatListComponent implements OnChanges {
  @Input() chats: ChatSummary[] = [];
  @Output() chatSelected = new EventEmitter<string>();

  displayChats: ChatSummary[] = [];
  showAll = false;
  readonly displayLimit = 5;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chats']) {
      // Ensure chats are sorted newest first if not already.
      // For this example, we assume the 'chats' Input is already sorted newest first.
      this.updateDisplayChats();
    }
  }

  private updateDisplayChats(): void {
    if (!this.chats) {
      this.displayChats = [];
      return;
    }
    if (this.showAll || this.chats.length <= this.displayLimit) {
      this.displayChats = [...this.chats];
    } else {
      // Assuming chats are sorted newest first, take the first 5.
      this.displayChats = this.chats.slice(0, this.displayLimit);
    }
  }

  onChatClick(chatId: string): void {
    this.chatSelected.emit(chatId);
  }

  toggleShowAll(): void {
    this.showAll = !this.showAll;
    this.updateDisplayChats();
  }

  get remainingChatsCount(): number {
    if (!this.chats) return 0;
    return Math.max(0, this.chats.length - this.displayLimit);
  }
}
