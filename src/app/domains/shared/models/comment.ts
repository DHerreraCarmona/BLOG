import { AuthorShort} from './author'

export interface Comment {
    author: AuthorShort;
    content: string;
    creaatedAt: string;
}

export interface createCommentModel {
    author: AuthorShort;
    content: string;
}