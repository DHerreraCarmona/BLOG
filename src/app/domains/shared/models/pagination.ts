import { AuthorPost, AuthorShort } from "./author";
import { Comment } from "./comment";
import { Like } from "./like";

export interface Pagination {
    total_count: number;
    total_pages: number;
    current_page: number;
    first_elem: number;
    last_elem: number;
}

