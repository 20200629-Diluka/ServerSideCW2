const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

/**
 * @route   GET /api/countries
 * @desc    Get all countries
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,flags,currencies,cca2');
        const countries = await response.json();
        
        // Format countries for easier consumption
        const formattedCountries = countries.map(country => {
            const currencies = country.currencies ? Object.values(country.currencies).map(currency => ({
                name: currency.name,
                symbol: currency.symbol
            })) : [];

            return {
                name: country.name.common,
                officialName: country.name.official,
                capital: country.capital ? country.capital[0] : 'N/A',
                flag: country.flags.png,
                flagAlt: country.flags.alt || `Flag of ${country.name.common}`,
                currencies,
                code: country.cca2
            };
        });

        // Sort alphabetically
        formattedCountries.sort((a, b) => a.name.localeCompare(b.name));

        res.json({
            success: true,
            countries: formattedCountries
        });
    } catch (err) {
        console.error('Error fetching countries:', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching countries data'
        });
    }
});

/**
 * @route   GET /api/countries/:code
 * @desc    Get country by code
 * @access  Public
 */
router.get('/:code', async (req, res) => {
    try {
        const response = await fetch(`https://restcountries.com/v3.1/alpha/${req.params.code}?fields=name,capital,flags,currencies`);
        
        if (!response.ok) {
            return res.status(404).json({
                success: false,
                message: 'Country not found'
            });
        }

        const countryData = await response.json();
        
        // Format country data
        const currencies = countryData.currencies ? Object.values(countryData.currencies).map(currency => ({
            name: currency.name,
            symbol: currency.symbol
        })) : [];
        
        const languages = countryData.languages ? Object.values(countryData.languages) : [];

        const country = {
            name: countryData.name.common,
            officialName: countryData.name.official,
            capital: countryData.capital ? countryData.capital[0] : 'N/A',
            flag: countryData.flags.png,
            flagAlt: countryData.flags.alt || `Flag of ${countryData.name.common}`,
            currencies
        };

        res.json({
            success: true,
            country
        });
    } catch (err) {
        console.error('Error fetching country:', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching country data'
        });
    }
});

/**
 * @route   GET /api/countries/name/:name
 * @desc    Search countries by name
 * @access  Public
 */
router.get('/name/:name', async (req, res) => {
    try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${req.params.name}?fields=name,capital,flags,currencies,cca2`);
        
        if (!response.ok) {
            return res.status(404).json({
                success: false,
                message: 'No countries found'
            });
        }

        const countries = await response.json();
        
        // Format countries
        const formattedCountries = countries.map(country => {
            const currencies = country.currencies ? Object.values(country.currencies).map(currency => ({
                name: currency.name,
                symbol: currency.symbol
            })) : [];

            return {
                name: country.name.common,
                officialName: country.name.official,
                capital: country.capital ? country.capital[0] : 'N/A',
                flag: country.flags.png,
                flagAlt: country.flags.alt || `Flag of ${country.name.common}`,
                currencies,
                code: country.cca2
            };
        });

        res.json({
            success: true,
            countries: formattedCountries
        });
    } catch (err) {
        console.error('Error searching countries:', err);
        res.status(500).json({
            success: false,
            message: 'Error searching countries'
        });
    }
});

module.exports = router; 