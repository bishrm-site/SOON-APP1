FROM oven/bun:1
WORKDIR /app
COPY . .
ENV PORT=10000
EXPOSE 10000
CMD ["bun", "run", "server.js"]
