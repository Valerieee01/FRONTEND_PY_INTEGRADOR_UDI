import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MuestreoDetritosMadera } from './muestreo-detritos-madera';

describe('MuestreoDetritosMadera', () => {
  let component: MuestreoDetritosMadera;
  let fixture: ComponentFixture<MuestreoDetritosMadera>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MuestreoDetritosMadera]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MuestreoDetritosMadera);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
