import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReorderProductComponent } from './reorder-product.component';

describe('ReorderProductComponent', () => {
  let component: ReorderProductComponent;
  let fixture: ComponentFixture<ReorderProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReorderProductComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReorderProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
