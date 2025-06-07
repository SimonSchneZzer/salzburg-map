# Project Report

## Target User
The target users of this web application are tourists visiting Salzburg. To accommodate an international audience, the interface and all content are presented in English. The goal is to provide visitors with an easy and informative way to discover cultural locations in the city.

## Data Sources
The application uses geospatial data sourced from OpenStreetMap, queried and refined using Overpass Turbo. These open data sources provide detailed and up-to-date information about points of interest such as museums, galleries, memorials, and cultural centers.

## Methodology
The development process involved data extraction, transformation into GeoJSON format, and integration into a Leaflet-based interactive map. The focus was on user-friendly presentation, responsiveness, and accessibility of cultural data.

## Design Choices
To ensure clarity and visual focus, a clean black-and-white base map style was chosen. Colored navigation elements and category-based markers help users quickly identify types of locations. Each cultural site is represented by a simple icon indicating whether it’s a museum, gallery, memorial, cultural center, or other. On-click popups provide users with rich details such as descriptions, opening hours, website links, and information on wheelchair accessibility.

## Analysis
During development, clustering proved to be a technical challenge. Representing densely packed areas without overwhelming the user required experimentation with marker clustering libraries and adjustments to cluster design and behavior.

## Potential Improvements
If more time were available, I would enhance the user experience by adding filters (e.g. by category or accessibility), enabling search functionality, and integrating route planning or public transport options. Improved clustering behavior and visual cues for overlapping markers would also be a priority.

## Critical Reflection
The integration of OpenStreetMap data offered a powerful but occasionally complex experience, especially in terms of data structure and filtering logic. While the UI and basic functionality were successfully implemented, fine-tuning the clustering and enhancing interactivity required extra effort.

## Key Takeaways
This project deepened my understanding of how to work with geospatial data and tools such as OpenStreetMap, Overpass Turbo, and Leaflet. I also improved my ability to design for non-local users and to translate complex data into intuitive, visual experiences.