FROM oven/bun:1
WORKDIR /app
COPY . .
RUN mkdir -p public && mv index.html app.js sw.js manifest.webmanifest icon.svg icon-192.png icon-512.png logo.svg public/ 2>/dev/null || true
ENV PORT=10000
EXPOSE 10000
CMD ["bun", "run", "server.js"]
