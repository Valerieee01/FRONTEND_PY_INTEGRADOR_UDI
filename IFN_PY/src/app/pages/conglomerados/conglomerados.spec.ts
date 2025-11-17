import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Conglomerados } from './conglomerados';

describe('Conglomerados', () => {
  let component: Conglomerados;
  let fixture: ComponentFixture<Conglomerados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Conglomerados]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Conglomerados);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
