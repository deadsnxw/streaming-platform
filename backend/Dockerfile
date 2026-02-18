FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache postgresql-client ffmpeg

COPY package*.json ./
RUN npm install

COPY . .

RUN npx nodemon --version || npm install -g nodemon

EXPOSE 5000

CMD ["sh", "-c", "until pg_isready -h postgres -p 5432; do echo 'Waiting for postgres...'; sleep 2; done; npm run migrate:up && npm run dev"]