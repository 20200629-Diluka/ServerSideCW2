import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';

// Components
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BlogDetail from './pages/BlogDetail';
import CreateBlog from './pages/CreateBlog';
import EditBlog from './pages/EditBlog';
import Profile from './pages/Profile';
import CountryBlogs from './pages/CountryBlogs';
import UserBlogs from './pages/UserBlogs';
import FollowingFeed from './pages/FollowingFeed';
import Search from './pages/Search';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <>
      <Navigation />
      <main className="page-container">
        <Container>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/blogs/:id" element={<BlogDetail />} />
            <Route path="/country/:name" element={<CountryBlogs />} />
            <Route path="/user/:id/blogs" element={<UserBlogs />} />
            <Route path="/search" element={<Search />} />
            
            {/* Protected Routes */}
            <Route path="/create-blog" element={
              <ProtectedRoute>
                <CreateBlog />
              </ProtectedRoute>
            } />
            <Route path="/edit-blog/:id" element={
              <ProtectedRoute>
                <EditBlog />
              </ProtectedRoute>
            } />
            <Route path="/profile/:id" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/following" element={
              <ProtectedRoute>
                <FollowingFeed />
              </ProtectedRoute>
            } />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Container>
      </main>
      <Footer />
    </>
  );
};

export default App; 