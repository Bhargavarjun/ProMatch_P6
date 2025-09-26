import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./search.css";

export default function ProblemSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [allData, setAllData] = useState([]);
  const [showTags, setShowTags] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/problems");
        const data = await response.json();
        setResults(data);
        setAllData(data);
      } catch (err) {
        console.error("Error fetching problems:", err);
      }
    };
    fetchData();
  }, []);

  const handleSearch = async () => {
    try {
      // If query is empty, fetch vector search results
      if (!query.trim()) {
        const response = await fetch("http://localhost:5000/api/problems/search/vector", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: "" }) // send empty query
        });
        const data = await response.json();
        setResults(data.results || []);
        return;
      }

      // Normal local filter search
      const filtered = allData.filter((p) =>
        (p.title + " " + (p.description || "") + " " + ((p.tags && p.tags.join(" ")) || ""))
          .toLowerCase()
          .includes(query.toLowerCase())
      );

      setResults(filtered);
    } catch (err) {
      console.error("Error fetching search results:", err);
      setResults([]);
    }
  };

  const toggleTags = (index) => {
    setShowTags((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="ps-container">
      <h1 className="ps-title">🔎 Problem Search Robot</h1>

      {/* Search Bar */}
      <div className="ps-search-bar">
        <input
          type="text"
          placeholder="Search by title, description, or tags..."
          className="ps-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button className="ps-button" onClick={handleSearch}>Search</button>
      </div>

      {/* Results Table */}
      <div className="ps-results-box">
        <table className="ps-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Title</th>
              <th>Description</th>
              <th>Difficulty</th>
              <th>Tags</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "1rem" }}>
                  No results found.
                </td>
              </tr>
            ) : (
              results.map((r, index) => (
                <tr key={index} className="ps-row">
                  <td>{index + 1}</td>
                  <td>{r.title}</td>
                  <td>{r.description}</td>
                  <td className={`ps-diff-${r.difficulty.toLowerCase()}`}>{r.difficulty}</td>
                  <td>
                    {Array.isArray(r.tags) && r.tags.length > 0 ? (
                      <>
                        <button className="tag-btn" onClick={() => toggleTags(index)}>
                          {showTags[index] ? "Hide Tags" : "Show Tags"}
                        </button>
                        {showTags[index] && <div className="tag-popup">{r.tags.join(", ")}</div>}
                      </>
                    ) : (
                      <span className="no-tags">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Bottom Back Button */}
      <button className="ps-back-bottom" onClick={() => navigate(-1)}>← Go Back</button>
    </div>
  );
}
