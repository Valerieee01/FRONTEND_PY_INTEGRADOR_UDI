import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MuestreoSuelo } from './muestreo-suelo';

describe('MuestreoSuelo', () => {
  let component: MuestreoSuelo;
  let fixture: ComponentFixture<MuestreoSuelo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MuestreoSuelo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MuestreoSuelo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
