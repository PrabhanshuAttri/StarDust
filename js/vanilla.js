'use strict'

class StarDust {
  constructor() {
    this.state = {
      moviesArray: [],
      moviesList: new MovieList([]),
      order: 'ASC',
      sortby: '',
      searchQuery: '',
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

  renderMoviesList(moviesList) {
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
    let movieSuggestions = allMovies.filter((m) => (m.toLowerCase().includes(query.toLowerCase())));
    movieSuggestions = movieSuggestions.slice(0,20);
    
    let fragment = document.createDocumentFragment();

    for(let movie of movieSuggestions) {
      let sugg = document.createElement('div');
      sugg.className = 'sugg';
      sugg.innerHTML = movie.trim();
      fragment.appendChild(sugg);
    }

    return fragment;
  }

  updateUI() {
    const moviesListElement = document.getElementById('moviesGrid');
    moviesListElement.innerHTML = "";
    moviesListElement.appendChild(this.renderMoviesList(this.state.moviesList));
  }

  setUI() {
    const { moviesArray, sortby, order, searchQuery } = this.state;
    this.state.moviesList = new MovieList(moviesArray, sortby, order, searchQuery);
    this.updateUI();
    
    const moviesListElement = document.getElementById('moviesGrid');
    moviesListElement.classList.add('show');
    document.getElementById('searchForm').style.display = 'flex';
    document.getElementById('progress').style.display = 'none';
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
    .then(function(jsonData) {
      const movies = jsonData;//.slice(0,100);
      stardust.setMoviesArray(movies);
      stardust.setUI();
    })
    .catch((error) => {
      console.log(error)
    });
})();
