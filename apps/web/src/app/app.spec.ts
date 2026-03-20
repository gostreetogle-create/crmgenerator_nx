import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app';
import { RouterTestingModule } from '@angular/router/testing';
import { appRoutes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule.withRoutes(appRoutes)],
    }).compileComponents();
  });

  it('should render test buttons', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    // UI-каталог в хедере всегда закрыт: в DOM должен быть только один app-button ("UI").
    expect(compiled.querySelectorAll('app-button').length).toBe(1);

    // Открываем каталог (клик по внутренней кнопке ButtonComponent).
    const uiCatalogButton = compiled.querySelector('app-ui-catalog app-button button');
    uiCatalogButton?.click();

    fixture.detectChanges();
    await fixture.whenStable();

    // В каталоге: 5 кнопок из группы Buttons + 1 "Открыть confirm" + 1 "Закрыть".
    // Плюс исходный app-button в хедере ("UI") остаётся в DOM.
    expect(compiled.querySelectorAll('app-button').length).toBe(8);
  });
});
