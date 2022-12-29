import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';
import { ImagesApiService } from './js/api-service';
import renderGallery from './js/markup';
import getRefs from './js/get-refs';


const refs = getRefs();


Notify.init({
  width: '500px',
  position: 'center-top',
  distance: '50px',
  timeout: 5000,
  fontSize: '16px',
  clickToClose: true,
});

const imagesApiService = new ImagesApiService();
let lightbox = null;
refs.searchForm.addEventListener('submit', onSearch);

async function onSearch(e) {
  e.preventDefault();
  clearGallery();

  imagesApiService.query = e.currentTarget.searchQuery.value;
  if (imagesApiService.query === '') {
    return Notify.failure(
      'Sorry, there are no images matching your search query. Please try again. Click here to close'
    );
  }
  imagesApiService.resetPage();

  await imagesApiService
    .fetchImages()
    .then(appendGalleryMarkup)
    .then((lightbox = new SimpleLightbox('.gallery a', {})))
    .catch(error => console.log(error));

  if (imagesApiService.maxPages === 0) {
    return Notify.failure(
      'Sorry, there are no images matching your search query. Please try again. Click here to close'
    );
  }

  lightbox.refresh();

  Notify.success(`Hooray! We found ${imagesApiService.maxPages} images.`);

  refs.loadMoreDiv.classList.remove('is-hidden');

  if (
    (imagesApiService.page - 1) * imagesApiService.per_page >
    imagesApiService.maxPages
  ) {
    refs.loadMoreDiv.classList.remove('is-hidden');

    return Notify.warning(
      "We're sorry, but you've reached the end of search results. Click here to close"
    );
  }
}

function appendGalleryMarkup(images) {
  refs.gallery.insertAdjacentHTML('beforeend', renderGallery(images));
}

function clearGallery() {
  refs.gallery.innerHTML = '';
}

window.addEventListener('scroll', debounce(throttle(onScroll, 10000), 3000));

async function onScroll() {
  if (
    (imagesApiService.page - 1) * imagesApiService.per_page >
    imagesApiService.maxPages
  ) {
    
    refs.loadMoreDiv.classList.add('is-hidden');

    imagesApiService
      .fetchImages()
      .then(appendGalleryMarkup)
      .then((lightbox = new SimpleLightbox('.gallery a', {})))
      .then(
        throttle(
          Notify.warning(
            "We're sorry, but you've reached the end of search results."
          )
        ),
        3000
      )
      .catch(error => console.log(error));
    return;
  }

  const galleryRect = refs.gallery.getBoundingClientRect();

  if (galleryRect.bottom < document.documentElement.clientHeight + 350) {
    await imagesApiService.fetchImages().then(appendGalleryMarkup);
    lightbox.refresh();
  }
}