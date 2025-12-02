-- PostgreSQL Database Schema for Provo Student Housing Swap
-- Run this SQL in your PostgreSQL database

-- Users table (Security Table)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    university VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Listings table
CREATE TABLE listings (
    listing_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    rent_price INTEGER NOT NULL,
    gender VARCHAR(20) NOT NULL,
    university_proximity VARCHAR(50) NOT NULL,
    is_private_room BOOLEAN DEFAULT false,
    image_url_1 VARCHAR(500),
    image_url_2 VARCHAR(500),
    image_url_3 VARCHAR(500),
    contract_term VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Amenities table
CREATE TABLE amenities (
    amenity_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Junction table for listing amenities
CREATE TABLE listing_amenities (
    listing_amenity_id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES listings(listing_id) ON DELETE CASCADE,
    amenity_id INTEGER REFERENCES amenities(amenity_id) ON DELETE CASCADE,
    UNIQUE(listing_id, amenity_id)
);

-- Insert default amenities
INSERT INTO amenities (name) VALUES 
    ('Private Room'),
    ('Washer/Dryer in Unit'),
    ('Gym Access'),
    ('Pool Access'),
    ('Furnished'),
    ('Private Bathroom');

-- Create indexes for better query performance
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_university ON listings(university_proximity);
CREATE INDEX idx_listings_gender ON listings(gender);
CREATE INDEX idx_listings_price ON listings(rent_price);
CREATE INDEX idx_listing_amenities_listing_id ON listing_amenities(listing_id);
CREATE INDEX idx_listing_amenities_amenity_id ON listing_amenities(amenity_id);