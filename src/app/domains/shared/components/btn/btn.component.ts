import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-btn',
  templateUrl: './btn.component.html',
  imports: [CommonModule],
})
export class BtnComponent implements OnInit {
  
  @Input() typeBtn: 'button' | 'reset' | 'submit' = 'button';
  @Input() color: 'success' | 'primary' | 'danger' | 'light' | 'sky' = 'primary';

  mapColors = {
    success: {
      'bg-success-700': true,
      'hover:bg-green-800': true,
      'focus:ring-success-300': true,
      'text-white': true
    },
    primary: {
      'bg-green-700': true,
      'hover:bg-primary-800': true,
      'focus:ring-primary-300': true,
      'text-white': true
    },
    danger: {
      'bg-danger-700': true,
      'hover:bg-danger-800': true,
      'focus:ring-danger-300': true,
      'text-white': true
    },
    sky: {
      'bg-sky-700': true,
      'hover:bg-sky-800': true,
      'focus:ring-sky-300': true,
      'text-white': true
    },
    light: {
      'bg-gray-200': true,
      'hover:bg-gray-500': true,
      'focus:ring-gray-50': true,
      'text-gray-700': true
    }
  }

  constructor() { }

  ngOnInit(): void {
  }

  get colors() {
    return {
      'bg-success-700': this.color === 'success',
      'hover:bg-success-800': this.color === 'success',
      'focus:ring-success-300': this.color === 'success',
      
      'bg-primary-700': this.color === 'primary',
      'hover:bg-primary-800': this.color === 'primary',
      'focus:ring-primary-300': this.color === 'primary',

      'bg-danger-700': this.color === 'danger',
      'hover:bg-danger-800': this.color === 'danger',
      'focus:ring-danger-300': this.color === 'danger',
    };
  }
}
