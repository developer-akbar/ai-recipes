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
  const [inputMode, setInputMode] = useState('product'); // 'product' or 'custom'
  const [product, setProduct] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateRecipe = async (e) => {
    e.preventDefault();
    
    // Validation
    if (inputMode === 'product' && !product) {
      setError('Please select a Kellogg product.');
      return;
    }
    if (inputMode === 'custom' && customInput.trim().length < 5) {
      setError('Please enter a valid recipe request (at least 5 characters).');
      return;
    }

    setLoading(true);
    setError('');
    setRecipe(null);

    const prompt = inputMode === 'custom' ? customInput : `Create a breakfast recipe for ${product}`;

    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, mode: inputMode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate recipe');
      }

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
          <div className="mode-selector">
            <label className={`radio-label ${inputMode === 'product' ? 'active' : ''}`}>
              <input 
                type="radio" 
                name="mode" 
                value="product" 
                checked={inputMode === 'product'} 
                onChange={() => setInputMode('product')} 
              />
              Select Product
            </label>
            <label className={`radio-label ${inputMode === 'custom' ? 'active' : ''}`}>
              <input 
                type="radio" 
                name="mode" 
                value="custom" 
                checked={inputMode === 'custom'} 
                onChange={() => setInputMode('custom')} 
              />
              Custom Request
            </label>
          </div>

          {inputMode === 'product' ? (
            <div className="form-group fade-in">
              <label htmlFor="product-select">Choose a Kellogg Product:</label>
              <select 
                id="product-select" 
                value={product} 
                onChange={(e) => setProduct(e.target.value)}
              >
                <option value="">-- Choose a product --</option>
                {KELLOGG_PRODUCTS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="form-group fade-in">
              <label htmlFor="custom-input">What would you like to make?</label>
              <input 
                type="text" 
                id="custom-input" 
                placeholder='e.g., "Breakfast muffins with Special K"' 
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
              />
              <small className="hint">Must be related to food or Kellogg products.</small>
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Validating & Generating...' : 'Generate Recipe'}
          </button>
        </form>

        {error && <div className="error">{error}</div>}

        {recipe && (
          <article className="recipe-card">
            <h2>{recipe.name}</h2>
            <div className="prep-time">
              <span>⏱️ {recipe.preparation_time}</span>
            </div>
            
            <section>
              <h3>Ingredients</h3>
              <ul className="ingredients-list">
                {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
              </ul>
            </section>

            <section>
              <h3>Instructions</h3>
              <ol className="steps-list">
                {recipe.steps.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
            </section>

            {recipe.tips && (
              <section className="tips-box">
                <h3>Pro Tips</h3>
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
