FROM node:22-slim

WORKDIR /app

# Install dependencies first to keep Docker layer caching effective.
COPY package.json ./
RUN npm install --include=dev

# Copy application source, then build the Vite frontend inside the image.
# Render environment variables prefixed with VITE_ must be configured in the service.
COPY . .
RUN npm run build

ENV NODE_ENV=production

# Render injects PORT at runtime.
EXPOSE 10000

CMD ["npm", "start"]
