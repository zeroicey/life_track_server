FROM oven/bun:latest

WORKDIR /app

COPY bun.lockb . 
COPY package.json . 

RUN bun install

EXPOSE 3000

CMD ["bun", "run", "dev", "--host", "0.0.0.0"]


