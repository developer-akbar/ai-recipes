import React, { useState } from 'react';
import './App.css';

const KELLOGG_PRODUCTS = [
  'Special K',
  'Corn Flakes',
  'Frosted Flakes',
  'Rice Krispies',
  'Froot Loops',
  'Raisin Bran',
  'Krave',
  'Mini-Wheats'
];

function App() {
  const [product, setProduct] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateRecipe = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRecipe(null);

    const prompt = customInput || `Create a breakfast recipe for ${product}`;

    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, product }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recipe');
      }

      const data = await response.json();
      setRecipe(data.recipe);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>WK Kellogg Recipe Assistant</h1>
        <p>Generate delicious recipes with your favorite Kellogg products</p>
      </header>

      <main>
        <form onSubmit={generateRecipe} className="recipe-form">
          <div className="form-group">
            <label htmlFor="product-select">Select a Product:</label>
            <select 
              id="product-select" 
              value={product} 
              onChange={(e) => {
                setProduct(e.target.value);
                setCustomInput(''); // Clear custom input when product changes
              }}
              required={!customInput}
            >
              <option value="">-- Choose a product --</option>
              {KELLOGG_PRODUCTS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="divider">OR</div>

          <div className="form-group">
            <label htmlFor="custom-input">Custom Recipe Request:</label>
            <input 
              type="text" 
              id="custom-input" 
              placeholder='e.g., "Create breakfast recipe for Special K Cereals"' 
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Recipe'}
          </button>
        </form>

        {error && <div className="error">{error}</div>}

        {recipe && (
          <article className="recipe-card">
            <h2>{recipe.name}</h2>
            <p className="prep-time"><strong>Prep Time:</strong> {recipe.preparation_time}</p>
            
            <section>
              <h3>Ingredients</h3>
              <ul>
                {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
              </ul>
            </section>

            <section>
              <h3>Steps</h3>
              <ol>
                {recipe.steps.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
            </section>

            {recipe.tips && (
              <section className="tips">
                <h3>Tips</h3>
                <p>{recipe.tips}</p>
              </section>
            )}
          </article>
        )}
      </main>
    </div>
  );
}

export default App;
