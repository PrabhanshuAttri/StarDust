'use strict'

const ORDER = {
  ASC: 'ASC',
  DESC: 'DESC',
}

const DEFAULTS = {
  SORTBY: 'movie_title',
  ORDER: ORDER.ASC,
}

class StarDust {
  constructor(sortby = DEFAULTS.SORTBY, order = DEFAULTS.ORDER,) {
    this.state = {
      order,
      sortby,
      searchQuery: '',
      moviesArray: [],
      moviesList: new MovieList([], sortby, order),
    }
  }

  setMoviesArray(value) {
    this.state.moviesArray = value;
  }

  setOrder(value) {
    this.state.order = value;
  }

  setSortBy(value) {
    this.state.sortby = value;
  }

  setSearchQuery(value) {
    this.state.searchQuery = value;
    this.state.moviesList.updateSearchResults(value);
    this.updateUI();
  }

  getMovieElement(movie) {
    const movieCardConfig = {
      director_name: 'Director Name',
      actor_1_name: 'Actor',
      actor_2_name: 'Actor',
      genres: 'Genres',
      language: 'Language',
      country: 'Country',
      content_rating: 'Rating',
      budget: 'Budget',
      title_year: 'Year',
      plot_keywords: 'Plot Keywords',
    };

    let movieElement = document.createElement('a');
    movieElement.href = movie.get('movie_imdb_link');
    movieElement.title = movie.get('movie_title');
    movieElement.target = '_blank';
      
    let movieDiv = document.createElement('div');
    movieDiv.className = 'movie_title';
    movieDiv.innerHTML = movie.get('movie_title');
    movieElement.appendChild(movieDiv);

    let table = document.createElement('table');
    let tableBody = document.createElement('tbody');
    for (let i in movieCardConfig) {
      let text = movieCardConfig[i].length > 0
        ? '<b>' + movieCardConfig[i] + '</b>: '
        : '';
      let tr = document.createElement('tr');
      tr.className = i;

      let tdKey = document.createElement('td');
      tdKey.innerHTML = text;
      tr.appendChild(tdKey);

      let tdValue = document.createElement('td');
      tdValue.innerHTML = movie.get(i).split('|').join(', ');
      tr.appendChild(tdValue);

      tableBody.appendChild(tr);
    }
    table.appendChild(tableBody);

    movieElement.appendChild(table);
    return movieElement;
  }

  getMoviesList(moviesList) {
    let fragment = document.createDocumentFragment();
    const ids = moviesList.getIds();
    for(let id of ids) {
      let movie = moviesList.get(id);
      fragment.appendChild(this.getMovieElement(movie));
    }
    return fragment;
  }

  getSuggestionElements(query) {
    const allMovies = this.state.moviesList.getSuggestions();
    let movieSuggestions = allMovies
      .filter((m) => (
        m.toLowerCase().includes(query.toLowerCase())
        || m.replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase().indexOf(query) != -1
      ))
      .slice(0,20);

    let fragment = document.createDocumentFragment();

    for(let movie of movieSuggestions) {
      let sugg = document.createElement('div');
      sugg.className = 'sugg';
      sugg.innerHTML = movie.trim();
      fragment.appendChild(sugg);
    }

    return fragment;
  }

  getSortElements() {
    const sortByItems = this.state.moviesList.getSortByItems();

    const buttonClick = (e) => {
      const element = e.target;
      const sort = element.getAttribute('sort');
      const order = element.getAttribute('order');

      if(sort && order) {
        const sortActive = 'sort-active';
        document.querySelectorAll('.' + sortActive).forEach((el) => {
          el.classList.remove(sortActive)
        });
        element.classList.add(sortActive);
        this.setSortBy(sort);
        this.setOrder(order);
        this.updateUI();
      }
    };

    const fragment = document.createDocumentFragment();

    const { sortby, order } = this.state;
    Object.keys(sortByItems).forEach((s) => {
      const incClassName = `btn btn-outline-primary ${(sortby === s && order === ORDER.ASC)
        ? 'sort-active' : ''}`;
      const descClassName = `btn btn-outline-primary ${(sortby === s && order === ORDER.DESC)
        ? 'sort-active' : ''}`;
      
      const btnInc = document.createElement('button');
      btnInc.className = incClassName;
      btnInc.type = 'button';
      btnInc.setAttribute('sort', s);
      btnInc.setAttribute('order', ORDER.ASC);
      btnInc.addEventListener('click', buttonClick);
      btnInc.innerHTML = `${sortByItems[s]} <i class="fas fa-sort-amount-up"></i>`;
      fragment.appendChild(btnInc);

      const btnDec = document.createElement('button');
      btnDec.className = descClassName;
      btnDec.type = 'button';
      btnDec.setAttribute('sort', s);
      btnDec.setAttribute('order', ORDER.DESC);
      btnDec.addEventListener('click', buttonClick);
      btnDec.innerHTML = `${sortByItems[s]} <i class="fas fa-sort-amount-down"></i>`;
      fragment.appendChild(btnDec);
    });
    return fragment;
  }

  updateSortElements() {
    const sort = document.getElementById('sort');
    sort.innerHTML = '';
    sort.appendChild(this.getSortElements());
  }

  updateUI() {
    const moviesListElement = document.getElementById('moviesGrid');
    Promise.resolve()
      .then(() => {
        moviesListElement.innerHTML = "";
        const progressElement = document.createElement('section');
        progressElement.id = 'progress';
        progressElement.className = 'class';
        progressElement.innerHTML = '<div></div>';
        progressElement.style.display = 'flex';
        moviesListElement.appendChild(progressElement);
      })
      .then(() => {
        const { moviesArray, sortby, order, searchQuery } = this.state;
        this.state.moviesList = new MovieList(moviesArray, sortby, order, searchQuery);
        moviesListElement.innerHTML = "";
        moviesListElement.appendChild(this.getMoviesList(this.state.moviesList));
      });
  }

  setUI() {
    this.updateUI();
    this.updateSortElements();
    
    const moviesListElement = document.getElementById('moviesGrid');
    moviesListElement.classList.add('show');
    document.getElementById('searchForm').style.display = 'flex';
    document.getElementById('progress').style.display = 'none';

    //console.log(this.state.moviesList.getLanguages());
  }
}


(function() {
  const apiEndpoint = 'http://starlord.hackerearth.com/movieslisting';
  const stardust = new StarDust();
  
  document.getElementById('searchInput').oninput = (e) => {
    const val = e.target.value;
    const dropdownClass = 'suggestion-dropdown';
    if (val.length > 0) {
      e.target.parentNode.parentNode.classList.add(dropdownClass);
    } else {
      e.target.parentNode.parentNode.classList.remove(dropdownClass);
    }
    const suggestions = document.getElementById('movieSuggestions');
    suggestions.innerHTML = '';
    suggestions.appendChild(stardust.getSuggestionElements(val));
  };

  document.addEventListener("click", function (e) {
    if (e.target.id !== 'searchInput') {
      if (e.target.classList.toString() == 'sugg') {
        const input = document.getElementById('searchInput');
        input.value = e.target.innerHTML;
        input.focus();

      }
      document.getElementById('searchInput').parentNode.parentNode.classList.remove('suggestion-dropdown');
    } else if (e.target.value > 0) {
      document.getElementById('searchInput').parentNode.parentNode.classList.add('suggestion-dropdown');
    }
  });

  document.getElementById("searchForm").addEventListener('submit', (e) => {
    e.preventDefault();
    const val = document.getElementById('searchInput').value;
    stardust.setSearchQuery(val);
  });

  fetch(apiEndpoint)
    .then(function(response) {
      return response.json();
    })
    .then(function(movies) {
      stardust.setMoviesArray(movies);
      stardust.setUI();
    })
    .catch((error) => {
      console.log(error)
    });
})();
