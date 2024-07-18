const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 5000;

app.use(cors());

app.get('/', (req, res) => res.send('Server is running'));

const fetchAndRespond = async (url, res, sortOrder, top) => {
  try {
    const response = await axios.get(url);
    let products = response.data;

    if (sortOrder) {
      const sortMap = {
        priceAsc: (a, b) => a.price - b.price,
        priceDesc: (a, b) => b.price - a.price,
        nameAsc: (a, b) => a.productName.localeCompare(b.productName),
        nameDesc: (a, b) => b.productName.localeCompare(a.productName),
      };
      products.sort(sortMap[sortOrder]);
    }

    if (top) products = products.slice(0, top);

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data' });
  }
};

const buildUrl = (baseUrl, query) => {
  const params = ['minPrice', 'maxPrice', 'availability']
    .filter(key => query[key])
    .map(key => `${key === 'minPrice' ? 'price_gte' : key === 'maxPrice' ? 'price_lte' : key}=${query[key]}`);
  return params.length ? `${baseUrl}?${params.join('&')}` : baseUrl;
};

const proxyRequest = (path, req, res) => {
  const baseUrl = `https://json-server.bytexl.app${path}`;
  const url = buildUrl(baseUrl, req.query);
  fetchAndRespond(url, res, req.query.sortOrder, req.query.top);
};

app.get('/categories', (req, res) => proxyRequest('/categories', req, res));

app.get('/companies', (req, res) => proxyRequest('/companies', req, res));

app.get('/products', (req, res) => proxyRequest('/products', req, res));

app.get('/companies/:companyName/categories/:categoryName/products', (req, res) => {
  const { companyName, categoryName } = req.params;
  proxyRequest(`/companies/${companyName}/categories/${categoryName}/products`, req, res);
});

app.get('/companies/:companyName/products', (req, res) => {
  const { companyName } = req.params;
  proxyRequest(`/companies/${companyName}/products`, req, res);
});

app.get('/categories/:categoryName/products', (req, res) => {
  const { categoryName } = req.params;
  proxyRequest(`/categories/${categoryName}/products`, req, res);
});

app.use((req, res) => res.status(404).send('Route not found'));

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));