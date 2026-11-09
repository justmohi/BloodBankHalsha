FROM node:22-slim

WORKDIR /app

# Install runtime and TypeScript runner dependencies. The app starts server.ts via tsx.
COPY package.json ./
RUN npm install --include=dev

# The Vite production bundle is built locally before building this image.
# This keeps public VITE_* configuration in the compiled frontend and out of the image build logs.
COPY server.ts tsconfig.json ./
COPY dist ./dist

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["npm", "start"]
