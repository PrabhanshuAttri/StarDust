class Movie {
  constructor(data) {
    this.state = { ...data }
  }

  get(key) {
    return (key in this.state)
      ? this.state[key].length > 0 ? this.state[key] : 'NA'
      : undefined;
  }
}
