import { NotificationService } from './notifications.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should emit a success notification', (done) => {
    service.show('Success!', 'success');

    service.notification$.subscribe((notif) => {
      if (notif) {
        expect(notif).toEqual({ message: 'Success!', type: 'success' });
        done();
      }
    });
  });

  it('should emit an error notification', (done) => {
    service.show('Error occurred', 'error');

    service.notification$.subscribe((notif) => {
      if (notif) {
        expect(notif).toEqual({ message: 'Error occurred', type: 'error' });
        done();
      }
    });
  });

  
});
