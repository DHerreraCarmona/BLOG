import { AuthorShort} from './author'

export interface Like {
    post: {"id": number,"title": string}
    author: {"username": AuthorShort};
}
