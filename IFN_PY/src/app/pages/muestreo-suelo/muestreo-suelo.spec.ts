import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MuestreoSueloComponent } from './muestreo-suelo';

describe('MuestreoSuelo', () => {
  let component: MuestreoSueloComponent;
  let fixture: ComponentFixture<MuestreoSueloComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MuestreoSueloComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MuestreoSueloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
