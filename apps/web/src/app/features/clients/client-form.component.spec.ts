// Eve-arch: 000 — без выделенного паттерна
import { By } from '@angular/platform-browser';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientFormComponent } from './client-form.component';

describe('ClientFormComponent', () => {
  let fixture: ComponentFixture<ClientFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientFormComponent);
    fixture.detectChanges();
  });

  it('should render inputs', () => {
    expect(fixture.debugElement.query(By.css('app-input'))).toBeTruthy();
  });
});
