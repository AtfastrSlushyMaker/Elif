import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShelterRequestsComponent } from './shelter-requests.component';

describe('ShelterRequestsComponent', () => {
  let component: ShelterRequestsComponent;
  let fixture: ComponentFixture<ShelterRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShelterRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShelterRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
