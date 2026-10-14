# Peer Advisor Tech Department — all-in-one image
# Serves the built site AND the workspace API from one Node process.
FROM node:22-alpine

# Runtime tools the API shells out to:
#  · git — per-assignment repo hosting (clone/push over smart HTTP)
#  · python3 + lizard — deterministic contribution scoring (score_diff.py)
RUN apk add --no-cache git python3 py3-pip

WORKDIR /app

# Install deps first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Python scoring deps (lizard). --break-system-packages is required on
# Alpine's externally-managed Python; this is a single-purpose container.
COPY server/requirements.txt ./server/requirements.txt
RUN pip3 install --break-system-packages -r server/requirements.txt

# App source, then production build of the front-end
COPY . .
RUN npm run build

ENV NODE_ENV=production
# Scoring runs via system python (the default SCORING_PYTHON is .venv).
ENV SCORING_PYTHON=/usr/bin/python3
# The server listens on API_PORT || PORT || 3200 in production.
EXPOSE 3200

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
  CMD wget -qO- http://127.0.0.1:3200/api/health || exit 1

CMD ["npm", "start"]
