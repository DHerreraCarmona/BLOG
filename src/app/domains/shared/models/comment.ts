import { AuthorShort} from './author'

export interface Comment {
    author: AuthorShort;
    content: string;
    created_at: string;
}

export interface createCommentModel {
    author: AuthorShort;
    content: string;
}