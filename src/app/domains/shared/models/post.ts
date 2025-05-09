import { AuthorPost, AuthorShort } from "./author";
import { Comment } from "./comment";
import { Like } from "./like";

export interface Post {
    id: number;
    author: AuthorPost;
    title: string;
    excerpt: string;
    created_at: string;
    countComments: number;
    countLikes: number;
    isLongContent?: boolean;
    isPostOwner?: boolean;
    isLiked?: boolean;
}

export interface PostDetail {
    id: number;
    author: AuthorPost;
    title: string;
    content: string;
    created_at: string;
    countLikes: number;
}

export interface PostEditCreate {
    id: number,
    author: AuthorShort;
    title: string;
    content: string;
    public: number;
    authenticated: number;
    team: number;
    owner:number;
}