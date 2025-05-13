import { Component } from '@angular/core';
import { MatFormField, MatInputModule, MatLabel } from '@angular/material/input';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import { MarkdownComponent } from 'ngx-markdown';
import { CommonModule, NgForOf } from '@angular/common';

import { ChatListComponent, ChatSummary } from '../chat-list/chat-list.component';
import { Subscription } from 'rxjs'; // Adjust path if you placed it elsewhere


// Define a type for the detailed chat response
interface ChatDetail {
  id: string;
  messages: string[]; // Assuming the API returns an array of strings for the conversation

}

const imports = [
  CommonModule,
  MatFormField,
  MatLabel,
  ReactiveFormsModule,
  FormsModule,
  MatFormFieldModule,
  MatInputModule,
  MatButton,
  MarkdownComponent,
  ChatListComponent
]

@Component({
  selector: 'app-chat',
  imports: [
    imports,
    NgForOf
  ],
  providers: [HttpClient],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  message = new FormControl('');
  responses: string[] = [];
  recentChats: ChatSummary[] = [];

  private subscriptions = new Subscription();
  private readonly apiBaseUrl = 'http://localhost:3000'; // Configure your API base URL

  constructor(private http: HttpClient) {
    this.loadResponsesFromLocalStorage();
  }

  ngOnInit(): void {
    this.loadRecentChats();
  }

  private saveResponsesToLocalStorage(): void {
    try {
      localStorage.setItem('responses', JSON.stringify({responses: this.responses}));
    } catch (e) {
      console.error('Error saving responses to localStorage:', e);
    }
  }

  loadRecentChats(): void {
    const sub = this.http.get<ChatSummary[]>(`${this.apiBaseUrl}/recent-chats`).subscribe({
      next: (chats) => {
        // Assuming the API returns chats sorted newest first.
        // If not, you might need to sort them here:
        // this.recentChats = chats.sort((a, b) => /* your sorting logic, e.g., by date */);
        this.recentChats = chats;
      },
      error: (err) => {
        console.error('Error fetching recent chats:', err);
        this.recentChats = []; // Clear or handle error appropriately
      }
    });
    this.subscriptions.add(sub);
  }

  private loadResponsesFromLocalStorage(): void {
    try {
      const storedResponsesItem = localStorage.getItem('responses');
      if (storedResponsesItem) {
        const parsed = JSON.parse(storedResponsesItem);
        if (parsed && Array.isArray(parsed.responses)) {
          this.responses = parsed.responses;
        } else {
          this.responses = [];
        }
      } else {
        this.responses = [];
      }
    } catch (e) {
      console.error('Error loading responses from localStorage:', e);
      this.responses = [];
    }
  }

  onTextareaEnter(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey && this.message.value?.trim()) { // Submit on Enter (not Shift+Enter)
      keyboardEvent.preventDefault(); // Prevent adding a newline character
      this.onSubmit();
    }
  }

  onSubmit(): void {
    const currentMessage = this.message.value;
    if (currentMessage && currentMessage.trim() !== '') {
      // Optional: Display user's message immediately
      // this.responses = [...this.responses, `You: ${currentMessage.trim()}`];

      const sub = this.http.post<{
        choices: { message: { content: string } }[]
      }>(`${this.apiBaseUrl}/promt`, {promt: currentMessage.trim()})
        .subscribe({
          next: (response) => {
            const botResponse = response.choices[0]?.message?.content;
            if (botResponse) {
              this.responses = [...this.responses, botResponse];
              this.saveResponsesToLocalStorage();
            }
            this.message.setValue('');
            // Optionally, refresh recent chats if submitting a prompt creates/updates a chat entry
            // this.loadRecentChats();
          },
          error: (err) => {
            console.error('Error submitting prompt:', err);
            // Potentially add error message to responses:
            // this.responses = [...this.responses, "Error: Could not get a response."];
          }
        });
      this.subscriptions.add(sub);
    }
  }

  onChatSelected(chatId: string): void {
    const sub = this.http.get<ChatDetail>(`${this.apiBaseUrl}/recent-chats/${chatId}`).subscribe({
      next: (chatDetail) => {
        // Assuming chatDetail.messages contains the full conversation history as an array of strings.
        // Adjust this if the structure of your chat messages is different.
        this.responses = [...chatDetail.messages];
        this.saveResponsesToLocalStorage(); // Save the loaded chat as the current "session"
        this.message.setValue(''); // Clear the input field
        // Consider scrolling the chat view to the latest message or top
      },
      error: (err) => {
        console.error(`Error fetching chat ${chatId}:`, err);
        // Handle error, e.g., show a notification or message in chat
      }
    });
    this.subscriptions.add(sub);
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); // Clean up all subscriptions
  }
}
