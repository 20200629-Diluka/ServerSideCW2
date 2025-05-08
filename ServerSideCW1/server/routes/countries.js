const express = require('express');
const axios = require('axios');
const { verifyApiKey } = require('../middleware/auth');

const router = express.Router();

// Base URL for RestCountries API
const REST_COUNTRIES_API = 'https://restcountries.com/v3.1';

// Helper function to transform country data to our format
const transformCountryData = (country) => {
    return {
        name: {
            common: country.name.common,
            official: country.name.official
        },
        currencies: country.currencies || {},
        capital: country.capital || [],
        languages: country.languages || {},
        flags: {
            png: country.flags?.png || '',
            svg: country.flags?.svg || '',
            alt: country.flags?.alt || ''
        }
    };
};

// Get country by name
router.get('/name/:name', verifyApiKey, async (req, res) => {
    try {
        const { name } = req.params;
        const response = await axios.get(`${REST_COUNTRIES_API}/name/${name}`);
        const filteredData = response.data.map(transformCountryData);

        return res.status(200).json({
            success: true,
            count: filteredData.length,
            data: filteredData
        });
    } catch (error) {
        // Handle 404 errors from the RestCountries API
        if (error.response && error.response.status === 404) {
            return res.status(404).json({
                success: false,
                message: 'Country not found'
            });
        }

        console.error('Error fetching country by name:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching country data',
            error: error.message
        });
    }
});

module.exports = router; 