function SearchBox({ city, setCity, onSearch }) {
  return (
    <div className="search-box">
      <input
        type="text"
        placeholder="Enter city name"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <button onClick={onSearch}>Search</button>
    </div>
  );
}

export default SearchBox;