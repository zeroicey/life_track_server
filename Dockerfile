# docker run -d --name life_track-db -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=admin -e POSTGRES_DB=life_track -v pg-data:/var/lib/postgresql/data -p 5432:5432 postgres:15-alpine
FROM oven/bun:latest

WORKDIR /app

COPY bun.lockb . 
COPY package.json . 

RUN bun install

EXPOSE 3000

CMD ["bun", "run", "dev", "--host", "0.0.0.0"]



