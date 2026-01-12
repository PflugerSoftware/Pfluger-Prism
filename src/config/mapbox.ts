/**
 * Mapbox GL JS Configuration
 *
 * This file contains the Mapbox access token and configuration.
 * The token is used to authenticate with Mapbox's mapping services.
 *
 * Free tier: 50,000 map loads per month
 * Features: 3D buildings, terrain, custom markers, day/night themes
 */

export const MAPBOX_TOKEN = 'pk.eyJ1IjoiYXBwc3BmbHVnZXIiLCJhIjoiY21od2t0NTZwMDBvNjJqcTFoYmV3bzFwYyJ9.7bIyUK74swnmvzPfVBkKmw';

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
