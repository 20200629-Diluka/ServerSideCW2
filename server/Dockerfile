FROM node:18-bullseye

WORKDIR /app

# Install required build tools for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Rebuild native modules for the target platform
RUN npm rebuild --build-from-source

EXPOSE 5001

CMD ["npm", "run", "dev"] 