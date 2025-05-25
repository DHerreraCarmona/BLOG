import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationComponent } from './notifications.component';
import { NotificationService } from './notifications.service';
import { of } from 'rxjs';

describe('NotificationComponent', () => {
  let component: NotificationComponent;
  let fixture: ComponentFixture<NotificationComponent>;
  let mockService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('NotificationService', [], {
      notification$: of({ message: 'Test message', type: 'success' }),
    });

    await TestBed.configureTestingModule({
      imports: [NotificationComponent],
      providers: [{ provide: NotificationService, useValue: mockService }],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the notification component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the message and class correctly', () => {
    const element = fixture.nativeElement.querySelector('div');
    expect(element.textContent).toContain('Test message');
    expect(element.classList).toContain('bg-green-600');
  });
});
