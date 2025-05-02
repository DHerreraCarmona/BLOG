import { AuthorPost } from "./author";
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
}

export interface PostDetail {
    id: number;
    author: AuthorPost;
    title: string;
    content: string;
    created_at: string;
    comments: Comment[];
    likes: Like[];
}