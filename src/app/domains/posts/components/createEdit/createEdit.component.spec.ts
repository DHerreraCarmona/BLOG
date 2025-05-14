import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditComponent } from './createEdit.component';

describe('EditComponent', () => {
  let component: CreateEditComponent;
  let fixture: ComponentFixture<CreateEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
