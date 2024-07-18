import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Grid, Typography, Card, CardContent, CardMedia, CircularProgress, FormControl, InputLabel, Select, MenuItem, Slider, Button } from '@mui/material';

const App = () => {
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortOrder, setSortOrder] = useState('');
  const [availability, setAvailability] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, companiesResponse, productsResponse] = await Promise.all([
          axios.get('http://localhost:5000/categories'),
          axios.get('http://localhost:5000/companies'),
          axios.get('http://localhost:5000/products')
        ]);
        setCategories(categoriesResponse.data);
        setCompanies(companiesResponse.data);
        setProducts(productsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApplyFilters = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:5000';
      const params = [`minPrice=${priceRange[0]}`, `maxPrice=${priceRange[1]}`];
      if (selectedCompany !== 'all') url += `/companies/${companies.find(c => c.id === selectedCompany)?.name}`;
      if (selectedCategory !== 'all') url += `/categories/${categories.find(c => c.id === selectedCategory)?.name}`;
      if (availability) params.push(`availability=${availability}`);
      const response = await axios.get(`${url}/products?${params.join('&')}`);
      const sortedProducts = response.data.sort((a, b) => {
        if (sortOrder === 'priceAsc') return a.price - b.price;
        if (sortOrder === 'priceDesc') return b.price - a.price;
        if (sortOrder === 'nameAsc') return a.productName.localeCompare(b.productName);
        if (sortOrder === 'nameDesc') return b.productName.localeCompare(a.productName);
        return 0;
      });
      setProducts(sortedProducts);
    } catch (error) {
      console.error('Error fetching filtered data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Container>
      <Typography variant="h2" gutterBottom>Top Products</Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <MenuItem value="all">All</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel>Company</InputLabel>
            <Select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)}>
              <MenuItem value="all">All</MenuItem>
              {companies.map((company) => (
                <MenuItem key={company.id} value={company.id}>{company.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={2}>
          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <MenuItem value="priceAsc">Price Ascending</MenuItem>
              <MenuItem value="priceDesc">Price Descending</MenuItem>
              <MenuItem value="nameAsc">Name Ascending</MenuItem>
              <MenuItem value="nameDesc">Name Descending</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={2}>
          <Typography gutterBottom>Price Range</Typography>
          <Slider value={priceRange} onChange={(e, newValue) => setPriceRange(newValue)} valueLabelDisplay="auto" min={0} max={10000} />
        </Grid>
        <Grid item xs={12} sm={2}>
          <FormControl fullWidth>
            <InputLabel>Availability</InputLabel>
            <Select value={availability} onChange={(e) => setAvailability(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="yes">Available</MenuItem>
              <MenuItem value="no">Not Available</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={2}>
          <Button variant="contained" color="primary" onClick={handleApplyFilters}>Apply</Button>
        </Grid>
      </Grid>
      <Grid container spacing={4} style={{ marginTop: '20px' }}>
        {products.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <Card>
              <CardMedia component="img" height="140" image={product.image} alt={product.productName} />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">{product.productName}</Typography>
                <Typography variant="body2" color="text.secondary">{product.description}</Typography>
                <Typography variant="body1" color="text.primary">${product.price}</Typography>
                <Typography variant="body2" color="text.secondary">Category: {product.category}</Typography>
                <Typography variant="body2" color="text.secondary">Company: {product.company}</Typography>
                <Typography variant="body2" color="text.secondary">ID: {product.id}</Typography>
                <Typography variant="body2" color="text.secondary">Rating: {product.rating}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default App;