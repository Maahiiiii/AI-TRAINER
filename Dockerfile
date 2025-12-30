# Pull base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install global dependencies
# expo-cli is deprecated for global install, use npx locally, but we might want useful tools
# Installing sharp-cli might be needed for image processing but optional
RUN npm install -g sharp-cli

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy project files
COPY . .

# Expose ports
# 8081: Metro Bundler
# 19000: Expo
# 19006: Expo Web
EXPOSE 8081 19000 19006

# Start variable to allow different commands
ENV NODE_ENV=development

# Default command
CMD ["npx", "expo", "start", "--lan"]
