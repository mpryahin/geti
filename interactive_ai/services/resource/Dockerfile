FROM python:3.10-slim-bookworm AS base

FROM base AS build

# Install Git and clone the OTX at the specified tag
ARG OTX_RELEASE_TAG=2.4.2

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    git

RUN git clone --branch $OTX_RELEASE_TAG --single-branch https://github.com/open-edge-platform/training_extensions.git

ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# Disable Python downloads, because we want to use the system interpreter across both images.
ENV UV_PYTHON_DOWNLOADS=0

# Copy the service dependencies
WORKDIR /builder
COPY --link --from=libs . libs
COPY --link --from=iai_core . interactive_ai/libs/iai_core_py
COPY --link --from=media_utils . interactive_ai/libs/media_utils
COPY --link --from=grpc_interfaces . grpc_interfaces

WORKDIR /builder/interactive_ai/services/resource

COPY --link --from=ghcr.io/astral-sh/uv:0.6.12 /uv /bin/uv

COPY --link app/ .

RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv venv --relocatable && \
    uv sync --frozen --no-dev --no-editable

FROM base AS runtime

# Install ffmpeg
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg=7:5.1.6-0+deb12u1 && \
    rm -rf /var/lib/apt/lists/* && \
    useradd -l -u 10001 non-root && \
	pip3 uninstall -y setuptools pip wheel && \
    rm -rf /root/.cache/pip

# Copy the application from the builder
COPY --link --from=build --chown=10001 /builder/interactive_ai/services/resource /app
COPY --link --from=build --chown=10001 /training_extensions/src/otx/tools/templates /model_templates
COPY --link --from=schemas . /api

# Place executables in the environment at the front of the path
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONPATH="/app"

USER non-root
WORKDIR /app/communication
CMD ["python", "main.py"]
