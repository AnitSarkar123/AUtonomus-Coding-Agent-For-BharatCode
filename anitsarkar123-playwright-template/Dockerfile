# =============================================================================
# AnitSarkar123 Multi-Language Test Template - Production Grade (Single-Stage)
# Supports: JavaScript, TypeScript, C, C++, Go, Java, Rust, Python, Playwright
# =============================================================================

FROM node:20-bookworm-slim

# Install system dependencies for all supported languages
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Playwright browser dependencies
    libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libdrm2 libxkbcommon0 libxcomposite1 \
    libxdamage1 libxfixes3 libxrandr2 libgbm1 \
    libasound2 libatspi2.0-0 libwayland-client0 \
    libxshmfence1 libxcb1 libx11-6 libxext6 \
    # Fonts for proper rendering
    fonts-liberation fonts-noto-color-emoji fonts-dejavu-core \
    # Build tools (C/C++, general)
    build-essential cmake pkg-config \
    # C/C++ testing frameworks
    check \
    googletest libgtest-dev \
    # Python
    python3 python3-pip python3-venv python3-dev \
    # Java (bookworm has openjdk-17)
    openjdk-17-jdk-headless maven gradle \
    # Go
    golang-go \
    # Rust (will install via rustup)
    curl ca-certificates \
    # Useful tools
    git wget unzip vim htop jq \
    && rm -rf /var/lib/apt/lists/*

# Node.js / TypeScript / Playwright global packages
RUN npm install -g --no-audit --no-fund \
    @playwright/test@latest \
    playwright@latest \
    typescript@latest \
    tsx@latest \
    vitest@latest \
    @vitest/ui@latest \
    eslint@latest \
    prettier@latest \
    @types/node@latest \
    && npm cache clean --force

# Install Playwright browsers
RUN npx playwright install --with-deps chromium firefox webkit

# Verify browsers work
RUN npx playwright --version && npx playwright-core --version

# Python: Install pytest and common test tools
RUN pip3 install --no-cache-dir --break-system-packages \
    pytest pytest-asyncio pytest-cov pytest-mock \
    hypothesis black isort flake8 mypy

# Rust: Install via rustup (stable toolchain)
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable --profile minimal
ENV PATH="/root/.cargo/bin:${PATH}"
RUN rustup component add rustfmt clippy && \
    cargo install cargo-nextest cargo-watch --locked

# Go: Already installed via apt (golang-go)
# Verify Go installation
RUN go version

# Java: Already installed via apt (openjdk-17-jdk-headless, maven, gradle)
# Verify Java installation
RUN java -version && mvn -version && gradle -version

# C/C++: Build googletest from source (apt version may be old)
RUN cd /usr/src/googletest && cmake . && make && cp lib/*.a /usr/lib/ && cp -r include/gtest /usr/include/

# Create non-root user (E2B standard)
ARG USERNAME=user
ARG USER_UID=1000
ARG USER_GID=1000

RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    && chown -R $USERNAME:$USERNAME /home/$USERNAME \
    && chown -R $USERNAME:$USERNAME /root/.cache/ms-playwright \
    && chown -R $USERNAME:$USERNAME /root/.cargo

# Environment
ENV PLAYWRIGHT_BROWSERS_PATH=/root/.cache/ms-playwright
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NODE_PATH=/usr/local/lib/node_modules
ENV PATH="/root/.cargo/bin:${PATH}"

WORKDIR /home/user

# Switch to non-root user
USER $USERNAME

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD npx playwright --version && python3 -c "import pytest" && cargo --version && go version && java -version && mvn -version && gradle -version || exit 1

# Default command
CMD ["sleep", "infinity"]

# =============================================================================
# Build: e2b template create multi-lang-test -d Dockerfile --cpu-count 2 --memory-mb 1024
# =============================================================================