import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './components/pages/HomePage';
import DashboardPage from './components/pages/DashboardPage';
import ModelMLPage from './components/pages/ModelMLPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import theme from './components/theme';
import { ThemeProvider, CssBaseline } from '@mui/material';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
    <CssBaseline />
    <Router>
      <Header />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/model-ml" element={<ModelMLPage />} />
      </Routes>

      <Footer />

    </Router>
    </ThemeProvider>
  );
};

export default App;
