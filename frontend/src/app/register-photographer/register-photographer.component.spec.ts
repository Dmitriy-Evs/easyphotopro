import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterPhotographerComponent } from './register-photographer.component';

describe('RegisterPhotographerComponent', () => {
  let component: RegisterPhotographerComponent;
  let fixture: ComponentFixture<RegisterPhotographerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterPhotographerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterPhotographerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
