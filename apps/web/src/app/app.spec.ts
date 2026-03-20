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

    // Хедер: 2 навигационные app-button + 1 "UI" у каталога (каталог закрыт).
    expect(compiled.querySelectorAll('app-button').length).toBe(3);

    // Открываем каталог (клик по внутренней кнопке ButtonComponent).
    const uiCatalogButton = compiled.querySelector('app-ui-catalog app-button button');
    uiCatalogButton?.click();

    fixture.detectChanges();
    await fixture.whenStable();

    // В каталоге: 1 "Тёмная/Светлая" + 5 кнопок из группы Buttons + 1 "Открыть confirm" + 1 "Закрыть".
    // Плюс в хедере: 2 навигации + "UI".
    expect(compiled.querySelectorAll('app-button').length).toBe(11);
  });
});
