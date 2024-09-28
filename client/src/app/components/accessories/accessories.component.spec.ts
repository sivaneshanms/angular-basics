import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessoriesListComponent } from './accessories.component';

describe('AccessoriesListComponent', () => {
  let component: AccessoriesListComponent;
  let fixture: ComponentFixture<AccessoriesListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccessoriesListComponent]
    });
    fixture = TestBed.createComponent(AccessoriesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
