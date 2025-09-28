# Public APIs for Agent Learning

This document provides a comprehensive list of public APIs that your Clear-AI agent can learn from to understand relationships, authentication patterns, and various API interactions. These APIs are perfect for training your agent to recognize patterns, handle different authentication methods, and execute complex workflows.

## Table of Contents

- [Authentication APIs](#authentication-apis)
- [Weather APIs](#weather-apis)
- [Data & Analytics APIs](#data--analytics-apis)
- [Social Media APIs](#social-media-apis)
- [E-commerce APIs](#e-commerce-apis)
- [Financial APIs](#financial-apis)
- [News & Content APIs](#news--content-apis)
- [Developer Tools APIs](#developer-tools-apis)
- [Government & Open Data APIs](#government--open-data-apis)
- [AI & Machine Learning APIs](#ai--machine-learning-apis)
- [Testing & Development APIs](#testing--development-apis)

---

## Authentication APIs

### 1. Auth0 Management API
- **Base URL**: `https://YOUR_DOMAIN.auth0.com/api/v2/`
- **Authentication**: Bearer Token (JWT)
- **Purpose**: User management, authentication flows
- **Key Endpoints**:
  - `GET /users` - List users
  - `POST /users` - Create user
  - `PATCH /users/{id}` - Update user
  - `DELETE /users/{id}` - Delete user
- **Learning Value**: OAuth 2.0, JWT tokens, user lifecycle management

### 2. Firebase Authentication
- **Base URL**: `https://identitytoolkit.googleapis.com/v1/`
- **Authentication**: API Key + OAuth 2.0
- **Purpose**: Google's authentication service
- **Key Endpoints**:
  - `POST /accounts:signUp` - User registration
  - `POST /accounts:signInWithPassword` - Sign in
  - `POST /accounts:sendOobCode` - Password reset
- **Learning Value**: Google OAuth, Firebase ecosystem integration

### 3. Okta API
- **Base URL**: `https://YOUR_DOMAIN.okta.com/api/v1/`
- **Authentication**: SSWS Token
- **Purpose**: Enterprise identity management
- **Key Endpoints**:
  - `GET /users` - List users
  - `POST /users` - Create user
  - `GET /apps` - List applications
- **Learning Value**: Enterprise SSO, complex user management

---

## Weather APIs

### 1. OpenWeatherMap API
- **Base URL**: `https://api.openweathermap.org/data/2.5/`
- **Authentication**: API Key (query parameter)
- **Rate Limit**: 1000 calls/day (free tier)
- **Key Endpoints**:
  - `GET /weather?q={city}&appid={key}` - Current weather
  - `GET /forecast?q={city}&appid={key}` - 5-day forecast
  - `GET /onecall?lat={lat}&lon={lon}&appid={key}` - Detailed weather
- **Learning Value**: Simple API key auth, geolocation, data relationships

### 2. WeatherAPI
- **Base URL**: `https://api.weatherapi.com/v1/`
- **Authentication**: API Key (query parameter)
- **Rate Limit**: 1M calls/month (free tier)
- **Key Endpoints**:
  - `GET /current.json?key={key}&q={location}` - Current weather
  - `GET /forecast.json?key={key}&q={location}&days=7` - Forecast
  - `GET /history.json?key={key}&q={location}&dt={date}` - Historical data
- **Learning Value**: RESTful patterns, date handling, location services

### 3. AccuWeather API
- **Base URL**: `https://dataservice.accuweather.com/`
- **Authentication**: API Key (query parameter)
- **Rate Limit**: 50 calls/day (free tier)
- **Key Endpoints**:
  - `GET /locations/v1/cities/search?apikey={key}&q={city}` - Location search
  - `GET /currentconditions/v1/{locationKey}?apikey={key}` - Current conditions
  - `GET /forecasts/v1/daily/5day/{locationKey}?apikey={key}` - 5-day forecast
- **Learning Value**: Multi-step workflows, location key relationships

---

## Data & Analytics APIs

### 1. Google Analytics Reporting API
- **Base URL**: `https://analyticsreporting.googleapis.com/v4/`
- **Authentication**: OAuth 2.0 + Service Account
- **Purpose**: Website analytics data
- **Key Endpoints**:
  - `POST /reports:batchGet` - Get analytics reports
- **Learning Value**: Complex OAuth flows, data aggregation, reporting

### 2. Mixpanel API
- **Base URL**: `https://mixpanel.com/api/2.0/`
- **Authentication**: Basic Auth (project secret)
- **Purpose**: Event tracking and analytics
- **Key Endpoints**:
  - `GET /events` - Get events
  - `GET /funnels` - Get funnel data
  - `GET /retention` - Get retention data
- **Learning Value**: Event-based analytics, funnel analysis

### 3. Segment API
- **Base URL**: `https://api.segment.io/v1/`
- **Authentication**: Basic Auth (write key)
- **Purpose**: Customer data platform
- **Key Endpoints**:
  - `POST /track` - Track events
  - `POST /identify` - Identify users
  - `POST /page` - Track page views
- **Learning Value**: Event tracking, user identification, data pipelines

---

## Social Media APIs

### 1. Twitter API v2
- **Base URL**: `https://api.twitter.com/2/`
- **Authentication**: Bearer Token (OAuth 2.0)
- **Rate Limit**: Varies by endpoint
- **Key Endpoints**:
  - `GET /tweets` - Get tweets
  - `POST /tweets` - Create tweet
  - `GET /users/by/username/{username}` - Get user by username
  - `GET /users/{id}/tweets` - Get user tweets
- **Learning Value**: OAuth 2.0, rate limiting, social media patterns

### 2. GitHub API
- **Base URL**: `https://api.github.com/`
- **Authentication**: Personal Access Token or OAuth
- **Rate Limit**: 5000 requests/hour (authenticated)
- **Key Endpoints**:
  - `GET /user` - Get authenticated user
  - `GET /user/repos` - Get user repositories
  - `POST /repos/{owner}/{repo}/issues` - Create issue
  - `GET /repos/{owner}/{repo}/commits` - Get commits
- **Learning Value**: RESTful design, pagination, webhook patterns

### 3. LinkedIn API
- **Base URL**: `https://api.linkedin.com/v2/`
- **Authentication**: OAuth 2.0
- **Purpose**: Professional networking data
- **Key Endpoints**:
  - `GET /me` - Get current user
  - `GET /people/{id}` - Get person profile
  - `POST /shares` - Share content
- **Learning Value**: Professional data, content sharing, OAuth scopes

---

## E-commerce APIs

### 1. Stripe API
- **Base URL**: `https://api.stripe.com/v1/`
- **Authentication**: Secret Key (Bearer Token)
- **Purpose**: Payment processing
- **Key Endpoints**:
  - `POST /customers` - Create customer
  - `POST /payment_intents` - Create payment intent
  - `GET /charges` - List charges
  - `POST /refunds` - Create refund
- **Learning Value**: Payment flows, webhook handling, error handling

### 2. Shopify API
- **Base URL**: `https://{shop}.myshopify.com/admin/api/2023-10/`
- **Authentication**: Access Token (Bearer)
- **Purpose**: E-commerce platform
- **Key Endpoints**:
  - `GET /products.json` - Get products
  - `POST /products.json` - Create product
  - `GET /orders.json` - Get orders
  - `POST /orders.json` - Create order
- **Learning Value**: E-commerce patterns, inventory management, order processing

### 3. WooCommerce API
- **Base URL**: `https://yourstore.com/wp-json/wc/v3/`
- **Authentication**: Consumer Key + Consumer Secret (Basic Auth)
- **Purpose**: WordPress e-commerce
- **Key Endpoints**:
  - `GET /products` - Get products
  - `POST /products` - Create product
  - `GET /orders` - Get orders
  - `POST /orders` - Create order
- **Learning Value**: WordPress integration, REST API patterns

---

## Financial APIs

### 1. Alpha Vantage API
- **Base URL**: `https://www.alphavantage.co/query`
- **Authentication**: API Key (query parameter)
- **Rate Limit**: 5 calls/minute, 500 calls/day (free tier)
- **Key Endpoints**:
  - `?function=TIME_SERIES_INTRADAY&symbol=IBM&apikey={key}` - Intraday data
  - `?function=GLOBAL_QUOTE&symbol=IBM&apikey={key}` - Real-time quote
  - `?function=NEWS_SENTIMENT&tickers=AAPL&apikey={key}` - News sentiment
- **Learning Value**: Financial data, time series, market analysis

### 2. Yahoo Finance API (Unofficial)
- **Base URL**: `https://query1.finance.yahoo.com/v8/finance/chart/`
- **Authentication**: None (rate limited by IP)
- **Purpose**: Stock market data
- **Key Endpoints**:
  - `GET /{symbol}` - Get stock data
  - `GET /{symbol}?range=1d&interval=1m` - Intraday data
- **Learning Value**: Financial data patterns, time series analysis

### 3. CoinGecko API
- **Base URL**: `https://api.coingecko.com/api/v3/`
- **Authentication**: API Key (optional, for higher limits)
- **Rate Limit**: 10-50 calls/minute (free tier)
- **Key Endpoints**:
  - `GET /coins/markets` - Get cryptocurrency markets
  - `GET /coins/{id}` - Get coin details
  - `GET /coins/{id}/history` - Get historical data
- **Learning Value**: Cryptocurrency data, market analysis

---

## News & Content APIs

### 1. NewsAPI
- **Base URL**: `https://newsapi.org/v2/`
- **Authentication**: API Key (query parameter)
- **Rate Limit**: 1000 requests/day (free tier)
- **Key Endpoints**:
  - `GET /everything?q=bitcoin&apiKey={key}` - Search articles
  - `GET /top-headlines?country=us&apiKey={key}` - Top headlines
  - `GET /sources?apiKey={key}` - Get news sources
- **Learning Value**: Content search, filtering, news aggregation

### 2. Reddit API
- **Base URL**: `https://oauth.reddit.com/` (authenticated) or `https://www.reddit.com/`
- **Authentication**: OAuth 2.0 or None (limited)
- **Rate Limit**: 60 requests/minute (OAuth)
- **Key Endpoints**:
  - `GET /r/{subreddit}/hot` - Get hot posts
  - `GET /r/{subreddit}/comments/{article}` - Get comments
  - `POST /api/submit` - Submit post
- **Learning Value**: Social content, comment threads, community data

### 3. Hacker News API
- **Base URL**: `https://hacker-news.firebaseio.com/v0/`
- **Authentication**: None
- **Rate Limit**: None (but be respectful)
- **Key Endpoints**:
  - `GET /topstories.json` - Top stories
  - `GET /item/{id}.json` - Get item details
  - `GET /user/{username}.json` - Get user profile
- **Learning Value**: Simple REST API, nested data structures

---

## Developer Tools APIs

### 1. GitHub API (Detailed)
- **Base URL**: `https://api.github.com/`
- **Authentication**: Personal Access Token
- **Rate Limit**: 5000 requests/hour (authenticated)
- **Key Endpoints**:
  - `GET /repos/{owner}/{repo}/issues` - Get issues
  - `POST /repos/{owner}/{repo}/issues` - Create issue
  - `GET /repos/{owner}/{repo}/pulls` - Get pull requests
  - `POST /repos/{owner}/{repo}/pulls` - Create pull request
  - `GET /repos/{owner}/{repo}/commits` - Get commits
  - `GET /repos/{owner}/{repo}/releases` - Get releases
- **Learning Value**: Complex workflows, version control, collaboration patterns

### 2. GitLab API
- **Base URL**: `https://gitlab.com/api/v4/`
- **Authentication**: Personal Access Token
- **Rate Limit**: 2000 requests/hour (free tier)
- **Key Endpoints**:
  - `GET /projects` - Get projects
  - `POST /projects` - Create project
  - `GET /projects/{id}/issues` - Get issues
  - `POST /projects/{id}/issues` - Create issue
- **Learning Value**: Alternative to GitHub, similar patterns

### 3. Docker Hub API
- **Base URL**: `https://hub.docker.com/v2/`
- **Authentication**: JWT Token
- **Purpose**: Container registry
- **Key Endpoints**:
  - `GET /repositories/{namespace}/{name}/` - Get repository
  - `GET /repositories/{namespace}/{name}/tags/` - Get tags
  - `POST /repositories/{namespace}/{name}/build/` - Trigger build
- **Learning Value**: Container management, CI/CD patterns

---

## Government & Open Data APIs

### 1. NASA API
- **Base URL**: `https://api.nasa.gov/`
- **Authentication**: API Key (query parameter)
- **Rate Limit**: 1000 requests/hour (free tier)
- **Key Endpoints**:
  - `GET /planetary/apod?api_key={key}` - Astronomy Picture of the Day
  - `GET /neo/rest/v1/feed?api_key={key}` - Near Earth Objects
  - `GET /mars-photos/api/v1/rovers/{rover}/photos?api_key={key}` - Mars photos
- **Learning Value**: Scientific data, image handling, space exploration

### 2. OpenWeatherMap Historical Data
- **Base URL**: `https://api.openweathermap.org/data/2.5/`
- **Authentication**: API Key
- **Key Endpoints**:
  - `GET /onecall/timemachine?lat={lat}&lon={lon}&dt={timestamp}&appid={key}` - Historical weather
- **Learning Value**: Time-based data, historical analysis

### 3. REST Countries API
- **Base URL**: `https://restcountries.com/v3.1/`
- **Authentication**: None
- **Rate Limit**: None
- **Key Endpoints**:
  - `GET /all` - Get all countries
  - `GET /name/{name}` - Get country by name
  - `GET /capital/{capital}` - Get country by capital
- **Learning Value**: Geographic data, country information, simple REST patterns

---

## AI & Machine Learning APIs

### 1. OpenAI API
- **Base URL**: `https://api.openai.com/v1/`
- **Authentication**: Bearer Token (API Key)
- **Rate Limit**: Varies by model and tier
- **Key Endpoints**:
  - `POST /chat/completions` - Chat completions
  - `POST /completions` - Text completions
  - `POST /embeddings` - Create embeddings
  - `POST /images/generations` - Generate images
- **Learning Value**: AI integration, token management, streaming responses

### 2. Hugging Face API
- **Base URL**: `https://api-inference.huggingface.co/`
- **Authentication**: Bearer Token (API Key)
- **Purpose**: Machine learning models
- **Key Endpoints**:
  - `POST /models/{model}` - Run inference
  - `GET /models` - List models
- **Learning Value**: ML model integration, inference patterns

### 3. Google Cloud AI APIs
- **Base URL**: `https://language.googleapis.com/v1/` (Natural Language)
- **Authentication**: Service Account Key (OAuth 2.0)
- **Purpose**: Various AI services
- **Key Endpoints**:
  - `POST /documents:analyzeSentiment` - Sentiment analysis
  - `POST /documents:analyzeEntities` - Entity analysis
  - `POST /documents:analyzeSyntax` - Syntax analysis
- **Learning Value**: Enterprise AI services, complex authentication

---

## Testing & Development APIs

### 1. JSONPlaceholder
- **Base URL**: `https://jsonplaceholder.typicode.com/`
- **Authentication**: None
- **Rate Limit**: None
- **Purpose**: Testing and prototyping
- **Key Endpoints**:
  - `GET /posts` - Get posts
  - `POST /posts` - Create post
  - `PUT /posts/{id}` - Update post
  - `DELETE /posts/{id}` - Delete post
  - `GET /users` - Get users
  - `GET /comments` - Get comments
- **Learning Value**: CRUD operations, RESTful patterns, testing

### 2. HTTPBin
- **Base URL**: `https://httpbin.org/`
- **Authentication**: None
- **Purpose**: HTTP testing and debugging
- **Key Endpoints**:
  - `GET /get` - GET request testing
  - `POST /post` - POST request testing
  - `PUT /put` - PUT request testing
  - `DELETE /delete` - DELETE request testing
  - `GET /status/{code}` - Return specific status code
  - `GET /delay/{seconds}` - Delay response
- **Learning Value**: HTTP methods, status codes, request/response testing

### 3. ReqRes
- **Base URL**: `https://reqres.in/api/`
- **Authentication**: None
- **Purpose**: REST API testing
- **Key Endpoints**:
  - `GET /users` - List users
  - `GET /users/{id}` - Get user
  - `POST /users` - Create user
  - `PUT /users/{id}` - Update user
  - `DELETE /users/{id}` - Delete user
  - `POST /register` - User registration
  - `POST /login` - User login
- **Learning Value**: User management, authentication simulation, pagination

---

## API Learning Patterns for Your Agent

### 1. Authentication Patterns
- **API Key**: Simple query parameter or header
- **Bearer Token**: JWT tokens in Authorization header
- **OAuth 2.0**: Complex flow with client credentials, authorization codes
- **Basic Auth**: Username/password in Authorization header
- **Service Account**: Google Cloud style with JSON keys

### 2. Request/Response Patterns
- **RESTful**: Standard HTTP methods (GET, POST, PUT, DELETE)
- **GraphQL**: Single endpoint with query language
- **RPC**: Function-like calls (often POST with method names)
- **WebSocket**: Real-time bidirectional communication

### 3. Data Relationships
- **One-to-Many**: User has many posts
- **Many-to-Many**: Users can follow multiple users
- **Hierarchical**: Comments have replies
- **Temporal**: Time-series data with timestamps

### 4. Error Handling Patterns
- **HTTP Status Codes**: 200, 201, 400, 401, 403, 404, 500
- **Error Objects**: Structured error responses with codes and messages
- **Rate Limiting**: 429 status with retry-after headers
- **Validation Errors**: 422 with field-specific error details

### 5. Pagination Patterns
- **Offset/Limit**: `?page=1&limit=20`
- **Cursor-based**: `?cursor=abc123&limit=20`
- **Link Headers**: `Link: <next-url>; rel="next"`
- **Total Count**: Metadata about total available items

---

## Getting Started with API Testing

### 1. Choose Your Testing Tool
- **Postman**: GUI-based API testing
- **curl**: Command-line testing
- **Insomnia**: Alternative to Postman
- **HTTPie**: User-friendly curl alternative

### 2. Start with Simple APIs
1. Begin with JSONPlaceholder (no auth required)
2. Move to OpenWeatherMap (simple API key)
3. Try GitHub API (token-based auth)
4. Experiment with OAuth flows

### 3. Build Complex Workflows
1. **User Registration Flow**: Create user → Verify email → Login
2. **E-commerce Flow**: Browse products → Add to cart → Checkout → Payment
3. **Content Management**: Create post → Add tags → Publish → Share
4. **Analytics Flow**: Track event → Generate report → Send notification

### 4. Learn from API Documentation
- **OpenAPI/Swagger**: Machine-readable API specs
- **Postman Collections**: Pre-built API examples
- **GitHub Examples**: Real-world API usage
- **API Changelogs**: Version updates and breaking changes

---

## Recommended Learning Path

### Week 1: Basic APIs
- JSONPlaceholder (CRUD operations)
- HTTPBin (HTTP testing)
- REST Countries (simple data)

### Week 2: Authentication
- OpenWeatherMap (API key)
- GitHub API (token auth)
- Auth0 (OAuth 2.0)

### Week 3: Complex Workflows
- Stripe API (payment flows)
- Twitter API (social media)
- Google Analytics (data analysis)

### Week 4: Advanced Patterns
- OpenAI API (AI integration)
- Docker Hub API (container management)
- WebSocket APIs (real-time data)

---

## Tools for API Learning

### 1. API Testing Tools
- **Postman**: Complete API development environment
- **Insomnia**: Clean, simple API client
- **curl**: Command-line HTTP client
- **HTTPie**: User-friendly command-line client

### 2. Documentation Tools
- **Swagger UI**: Interactive API documentation
- **Redoc**: Clean API documentation
- **Postman**: Generate documentation from collections

### 3. Monitoring & Debugging
- **Charles Proxy**: HTTP debugging proxy
- **Wireshark**: Network protocol analyzer
- **Browser DevTools**: Network tab for debugging

### 4. Code Generation
- **OpenAPI Generator**: Generate client libraries
- **Postman Codegen**: Generate code snippets
- **Swagger Codegen**: Generate server stubs

---

This comprehensive list provides your Clear-AI agent with a rich variety of APIs to learn from, covering different authentication methods, data patterns, and use cases. Start with the simpler APIs and gradually work your way up to more complex authentication and workflow patterns.
