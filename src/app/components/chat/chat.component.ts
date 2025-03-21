import {Component} from '@angular/core';
import {MatFormField, MatInputModule, MatLabel} from '@angular/material/input';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButton} from '@angular/material/button';
import {MarkdownComponent} from 'ngx-markdown';
import {NgForOf} from '@angular/common';

const imports = [
  MatFormField,
  MatLabel,
  ReactiveFormsModule,
  FormsModule,
  MatFormFieldModule,
  MatInputModule,
  MatButton,
  MarkdownComponent
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
  constructor(private http: HttpClient) {
    try {
      this.responses = JSON.parse(<string>localStorage.getItem('responses')).responses;
    } catch (e) {

    }
  }

  message = new FormControl('');
  responses: string[] = [];

  onSubmit() {

    console.log(this.message)
    this.http.post('http://localhost:3000/promt', {promt: this.message.value}).subscribe((response: any) => {
      this.responses.push(response.choices[0]?.message?.content)
      localStorage.setItem('responses', JSON.stringify({responses: this.responses}) );
      this.message.setValue('');
    })
  }
}
