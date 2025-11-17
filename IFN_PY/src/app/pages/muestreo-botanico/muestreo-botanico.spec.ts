import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MuestreoBotanico } from './muestreo-botanico';

describe('MuestreoBotanico', () => {
  let component: MuestreoBotanico;
  let fixture: ComponentFixture<MuestreoBotanico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MuestreoBotanico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MuestreoBotanico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
