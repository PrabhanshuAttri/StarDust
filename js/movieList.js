const ORDER = {
  ASC: 'ASC',
  DESC: 'DESC',
}

const DEFAULTS = {
  SORTBY: 'movie_title',
  ORDER: ORDER.ASC,
}

class MovieList {
  constructor(data, sortby = DEFAULTS.SORTBY, order = DEFAULTS.ORDER, query = '') {
    // handle empty params
    sortby = sortby.length > 0 ? sortby : DEFAULTS.SORTBY;
    order = order.length > 0 ? order : DEFAULTS.ORDER;

    data.sort(this.dynamicSort(sortby, order));
    let movies = data
      .reduce((unique, o) => {
        if(!unique.some(obj => obj.movie_title === o.movie_title && obj.title_year === o.title_year)) {
          unique.push(o);
        }
        return unique;
      },[])
      .reduce(function(obj, item, index){
        obj[index+1] = { id: index + 1, ...item }; 
        return obj;
      }, {});

    let results = query.length > 0 ? this.searchByName(movies, query) : Object.keys(movies);

    this.state = {
      movies,
      results,
      suggestions: data.map((m) => m.movie_title),
      count: data.length,
    };
  }

  updateSearchResults(query) {
    this.state.results = this.searchByName(Object.values(this.state.movies), query);
  }

  getCount() {
    return this.state.count;
  }

  getSuggestions() {
    return this.state.suggestions.slice(0,20);
  }

  getIds() {
    return this.state.results;
  }

  get(id) {
    return (id in this.state.movies) ? new Movie(this.state.movies[id]) : undefined;
  }

  dynamicSort(property, order = ORDER.ASC) {
    let sortOrder = 1;
    if(property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
    }
    if (order === ORDER.ASC) {
      return function (a,b) {
        let result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
      }
    }
    return function (a,b) {
      let result = (a[property] > b[property]) ? -1 : (a[property] < b[property]) ? 1 : 0;
      return result * sortOrder;
    }
  }

  trimString(s) {
    let l=0, r=s.length -1;
    while(l < s.length && s[l] == ' ') l++;
    while(r > l && s[r] == ' ') r-=1;
    return s.substring(l, r+1);
  }

  compareObjects(o1, o2) {
    let k = '';
    for(k in o1) if(o1[k] != o2[k]) return false;
    for(k in o2) if(o1[k] != o2[k]) return false;
    return true;
  }

  itemExists(haystack, needle) {
    for(let i=0; i<haystack.length; i++) if(this.compareObjects(haystack[i], needle)) return true;
    return false;
  }

  search(arr, key, query) {
    let results = [];
    query = this.trimString(query).toLowerCase();
    for(let i = 0; i < arr.length; i++) {
      let title = arr[i][key].toLowerCase();
      let titleWithoutSpecialChars= arr[i][key].replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase();
      if(title.indexOf(query) != -1 || titleWithoutSpecialChars.indexOf(query) != -1) {
        if(!this.itemExists(results, arr[i])) results.push(arr[i]);
      }
    }
    return results;
  }

  searchByName(movies, name) {
    return this.search(Object.values(movies), 'movie_title', name).map((i) => {
      return i.id;
    });
  }
}
