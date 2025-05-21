import { BehaviorSubject, of } from 'rxjs';
import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Dialog, DialogRef,DIALOG_DATA } from '@angular/cdk/dialog';

import { DetailComponent } from './detail.component';
import { AuthService } from '@shared/services/auth.service';
import { LikeService } from '@shared/services/like.service';
import { PostService } from '@shared/services/post.service';
import { CommentService } from '@shared/services/comment.service';
import { mockClick,mockLeave,mockLikes,mockPost,mockPagination,mockShortUser,
  createAuthServiceMock,createLikeServiceMock,createpostServiceMock,
  createDialogMock,createMockDialogRef
} from '@shared/mocks/mocks'

let authServiceMock: any;
let likeServiceMock: any;
let postServiceMock: any;
let mockDialogRef: any;
let dialogMock: any;

describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;

  beforeEach(async () => {
    dialogMock = createDialogMock();
    mockDialogRef = createMockDialogRef();
    authServiceMock = createAuthServiceMock();
    likeServiceMock = createLikeServiceMock();
    postServiceMock = createpostServiceMock();

    await TestBed.configureTestingModule({
      imports: [DetailComponent,HttpClientTestingModule],
      providers: [
        // { provide: Dialog, useValue: dialogMock },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: AuthService, useValue: authServiceMock },
        { provide: LikeService, useValue: likeServiceMock },
        { provide: PostService, useValue: postServiceMock },
        { provide: DIALOG_DATA, useValue: { post: mockPost }},
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    spyOn(console, 'log');
    spyOn(console, 'error');
    spyOn(component.postLiked, 'emit');
    spyOn(component.commentCreated, 'emit');

    component.post = mockPost;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the component', () => {
    expect(component.post).toEqual(mockPost);
    expect(component.user).toEqual(mockShortUser);
    expect(component.isAuth).toBe(true);
    expect(component.isOwnerOrTeamEdit).toBe(false);
    expect(component.form).toBeDefined();
  });



});
