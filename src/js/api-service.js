import axios from "axios";

const BASE_URL = 'https://pixabay.com/api/'
const KEY = '32441986-bc2c785fef47cc04c252076d8';

export class ImagesApiService {
    constructor() {
        this.searchQuery = '';
        this.page = 1;
        this.per_page = 40;
        this.image_type = 'photo';
        this.orientation = 'horizontal';
        this.safesearch = true;
        this.total = 0;
    }

    async fetchImages() {
        const searchParams = new URLSearchParams({
            image_type: this.image_type,
            orientation: this.orientation,
            safesearch: this.safesearch,
            page: this.page,
            per_page: this.per_page,
            total: this.total,
        });

        const url = `${BASE_URL}?key=${KEY}&q=${this.searchQuery}&${searchParams}`;

        const response = await axios.get(url);

        try {
            this.maxPages = response.data.totalHits;
            const images = await response.data.hits;
            this.total = response.data.totalHits;
            this.incrementPage();
            return images;
        } catch (error) {
            throw new Error(response.statusText);
        }
    }
    get query() {
        return this.searchQuery;
    }

    set query(newQuery) {
        this.searchQuery = newQuery;
    }

    incrementPage() {
        this.page += 1;
    }

    resetPage() {
        this.page = 1;
    }
}
