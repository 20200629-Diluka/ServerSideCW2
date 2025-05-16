import axios from 'axios';

// Set default base URL for API requests
// axios.defaults.baseURL = 'http://localhost:5000/api';

// Configure axios to send the authentication token with every request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Country API
export const countryAPI = {
  // Get all countries
  getAllCountries: async () => {
    try {
      const res = await axios.get('/api/countries');
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  // Get country by code
  getCountryByCode: async (code) => {
    try {
      const res = await axios.get(`/api/countries/${code}`);
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  // Search countries by name
  searchCountriesByName: async (name) => {
    try {
      const res = await axios.get(`/api/countries/name/${name}`);
      return res.data;
    } catch (err) {
      throw err;
    }
  }
};

// Blog API
export const blogAPI = {
  // Get all blogs
  getAllBlogs: async (page = 1, limit = 10, sort = 'newest') => {
    try {
      const res = await axios.get(`/api/blogs?page=${page}&limit=${limit}&sort=${sort}`);
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  // Get blog by ID
  getBlogById: async (id) => {
    try {
      const res = await axios.get(`/api/blogs/${id}`);
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  // Create blog
  createBlog: async (blogData) => {
    try {
      const res = await axios.post('/api/blogs', blogData);
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  // Update blog
  updateBlog: async (id, blogData) => {
    try {
      const res = await axios.put(`/api/blogs/${id}`, blogData);
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  // Delete blog
  deleteBlog: async (id) => {
    try {
      const res = await axios.delete(`/api/blogs/${id}`);
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  // Get blogs by user ID
  getBlogsByUserId: async (userId, page = 1, limit = 10) => {
    try {
      const res = await axios.get(`/api/blogs/user/${userId}?page=${page}&limit=${limit}`);
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  // Get blogs by country name
  getBlogsByCountry: async (countryName, page = 1, limit = 10) => {
    try {
      const res = await axios.get(`/api/blogs/country/${countryName}?page=${page}&limit=${limit}`);
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  // Get following feed
  getFollowingFeed: async (page = 1, limit = 10) => {
    try {
      const res = await axios.get(`/api/blogs/feed/following?page=${page}&limit=${limit}`);
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  // Like/dislike blog
  likeBlog: async (blogId, isLike) => {
    try {
      const res = await axios.post(`/api/blogs/${blogId}/like`, { is_like: isLike });
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  // Remove like/dislike
  removeLike: async (blogId) => {
    try {
      const res = await axios.delete(`/api/blogs/${blogId}/like`);
      return res.data;
    } catch (err) {
      throw err;
    }
  }
};

// User API
export const userAPI = {
  // Get user profile
  getUserProfile: async (userId) => {
    try {
      const res = await axios.get(`/api/users/${userId}`);
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  // Follow user
  followUser: async (userId) => {
    try {
      const res = await axios.post(`/api/users/follow/${userId}`);
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  // Unfollow user
  unfollowUser: async (userId) => {
    try {
      const res = await axios.delete(`/api/users/unfollow/${userId}`);
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  // Get user followers
  getUserFollowers: async (userId) => {
    try {
      const res = await axios.get(`/api/users/${userId}/followers`);
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  // Get user following
  getUserFollowing: async (userId) => {
    try {
      const res = await axios.get(`/api/users/${userId}/following`);
      return res.data;
    } catch (err) {
      throw err;
    }
  }
};

// Comment API
export const commentAPI = {
  // Get comments for a blog
  getBlogComments: async (blogId) => {
    try {
      const res = await axios.get(`/api/comments/blog/${blogId}`);
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  // Add comment
  addComment: async (blogId, content) => {
    try {
      const res = await axios.post('/api/comments', { blog_id: blogId, content });
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  // Delete comment
  deleteComment: async (commentId) => {
    try {
      const res = await axios.delete(`/api/comments/${commentId}`);
      return res.data;
    } catch (err) {
      throw err;
    }
  }
}; 