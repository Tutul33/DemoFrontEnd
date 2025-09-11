# Stage 1: Build Angular app
FROM node:22 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
#RUN npm run build -- SolApp --configuration production
RUN npm run build -- SolApp --configuration production --base-href /
# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist/SolApp/browser/. /usr/share/nginx/html

# Optional: remove default nginx.conf if you have your own routing
COPY default.conf /etc/nginx/conf.d/default.conf 

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
