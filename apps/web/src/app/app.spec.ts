// Eve-arch: 000 — без выделенного паттерна
import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { AppComponent } from './app';
import { RouterTestingModule } from '@angular/router/testing';
import { appRoutes } from './app.routes';
import { ButtonComponent } from '@ui-kit/button';
import { CardComponent } from '@ui-kit/card';
import { DialogComponent } from '@ui-kit/dialog';
import { InputComponent } from '@ui-kit/input';

@Component({
  standalone: true,
  imports: [DialogComponent, ButtonComponent, InputComponent, CardComponent],
  template: `
    <app-dialog mode="confirm" [open]="false" ariaLabel="shell-dialog" />
    <app-button>Shell Button</app-button>
    <app-input placeholder="Shell Input" ariaLabel="shell-input" />
    <app-card title="Shell Card">Card body</app-card>
  `,
})
class UiKitShellHostComponent {}

@Component({
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <app-button ariaLabel="slot-demo">
      <span slot="start">L</span>
      Text
      <span slot="end">R</span>
    </app-button>
  `,
})
class ButtonSlotsHostComponent {}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule.withRoutes(appRoutes)],
    }).compileComponents();
  });

  it('should render ui-kit components on /ui route', async () => {
    const fixture = TestBed.createComponent(UiKitShellHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('app-dialog')).toBeTruthy();
    expect(compiled.querySelector('app-button')).toBeTruthy();
    expect(compiled.querySelector('app-input')).toBeTruthy();
    expect(compiled.querySelector('app-card')).toBeTruthy();
  });

  it('should project start/end button slots', async () => {
    const fixture = TestBed.createComponent(ButtonSlotsHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    const button = compiled.querySelector('button');
    expect(button?.textContent?.replace(/\s+/g, ' ').trim()).toContain('L Text R');
  });
});
