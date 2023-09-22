import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversationHistoryComponent } from './conversation-history.component';

describe('ConversationHistoryComponent', () => {
  let component: ConversationHistoryComponent;
  let fixture: ComponentFixture<ConversationHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConversationHistoryComponent]
    });
    fixture = TestBed.createComponent(ConversationHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
