import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Subparcelas } from './subparcelas';

describe('Subparcelas', () => {
  let component: Subparcelas;
  let fixture: ComponentFixture<Subparcelas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Subparcelas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Subparcelas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
