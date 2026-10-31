import { Router } from 'express';
import {
  GUJARAT_CITIES,
  GUJARAT_AREAS_AND_LANDMARKS,
  searchGujaratLocations
} from '../data/gujaratGeoData.js';
import { successResponse } from '../utils/apiResponse.js';

const router = Router();

/**
 * GET /api/locations/cities
 * Returns all Gujarat cities with coordinates
 */
router.get('/cities', (req, res) => {
  return successResponse(res, 200, 'Gujarat cities retrieved successfully', {
    cities: GUJARAT_CITIES
  });
});

/**
 * GET /api/locations/areas
 * Returns all Gujarat areas and landmarks, optionally filtered by city
 */
router.get('/areas', (req, res) => {
  const { city, type } = req.query;
  let list = GUJARAT_AREAS_AND_LANDMARKS;

  if (city) {
    list = list.filter((a) => a.city.toLowerCase() === city.toLowerCase());
  }

  if (type) {
    list = list.filter((a) => a.type === type);
  }

  return successResponse(res, 200, 'Gujarat areas retrieved successfully', {
    total: list.length,
    areas: list
  });
});

/**
 * GET /api/locations/search
 * Fast query autocomplete for cities, streets, areas, and landmarks
 */
router.get('/search', (req, res) => {
  const { q, limit } = req.query;
  const max = limit ? parseInt(limit, 10) : 10;
  const matches = searchGujaratLocations(q || '', max);

  return successResponse(res, 200, 'Location search results', {
    query: q || '',
    count: matches.length,
    results: matches
  });
});

export default router;
