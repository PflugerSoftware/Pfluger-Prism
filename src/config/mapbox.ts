/**
 * Mapbox GL JS Configuration
 *
 * This file contains the Mapbox access token and configuration.
 * The token is used to authenticate with Mapbox's mapping services.
 *
 * Free tier: 50,000 map loads per month
 * Features: 3D buildings, terrain, custom markers, day/night themes
 */

// Read Mapbox token from environment variable
// Token is for the pflugerarchitects Mapbox account
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

// Validate token is present
if (!MAPBOX_TOKEN) {
  console.error('VITE_MAPBOX_TOKEN is not defined in environment variables');
  console.error('Please add VITE_MAPBOX_TOKEN to your .env.local file');
}

/**
 * Mapbox style URLs for different themes
 * Standard Day style is used for Prism - has built-in 3D buildings
 */
export const MAPBOX_STYLES = {
  standardDay: 'mapbox://styles/mapbox/standard',
  standardNight: 'mapbox://styles/mapbox/standard',
  dark: 'mapbox://styles/mapbox/dark-v11',
  light: 'mapbox://styles/mapbox/light-v11',
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12'
};

/**
 * Default map configuration for Liberty Hill ISD
 */
export const MAP_CONFIG = {
  center: [-97.9156, 30.6627] as [number, number], // Liberty Hill, Texas
  zoom: 12,
  pitch: 45, // 3D perspective angle - optimal for 3D buildings
  bearing: 0, // Map rotation
  minZoom: 3,
  maxZoom: 18
};
