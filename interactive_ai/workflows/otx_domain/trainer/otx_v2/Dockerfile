FROM python:3.10-slim-bookworm AS base

# step 1: get cuda dependencies
FROM base AS cuda
ENV TORCH_EXTENSIONS_DIR=/.torch
ENV LIBRARY_PATH=/usr/local/cuda/lib64/stubs
ENV NCCL_VERSION=2.17.1
ENV CUDA_VERSION=12.1.1
ENV NV_CUDNN_VERSION=8.9.0.131-1
ENV NVIDIA_REQUIRE_CUDA=cuda>=12.1 brand=tesla,driver>=470,driver<471 brand=unknown,driver>=470,driver<471 brand=nvidia,driver>=470,driver<471 brand=nvidiartx,driver>=470,driver<471 brand=geforce,driver>=470,driver<471 brand=geforcertx,driver>=470,driver<471 brand=quadro,driver>=470,driver<471 brand=quadrortx,driver>=470,driver<471 brand=titan,driver>=470,driver<471 brand=titanrtx,driver>=470,driver<471 brand=tesla,driver>=525,driver<526 brand=unknown,driver>=525,driver<526 brand=nvidia,driver>=525,driver<526 brand=nvidiartx,driver>=525,driver<526 brand=geforce,driver>=525,driver<526 brand=geforcertx,driver>=525,driver<526 brand=quadro,driver>=525,driver<526 brand=quadrortx,driver>=525,driver<526 brand=titan,driver>=525,driver<526 brand=titanrtx,driver>=525,driver<526
ENV NVIDIA_DRIVER_CAPABILITIES=compute,utility
ENV NVIDIA_VISIBLE_DEVICES=all
ENV LD_LIBRARY_PATH=/usr/local/nvidia/lib:/usr/local/nvidia/lib64:/usr/local/lib
ENV PATH=/usr/local/nvidia/bin:/usr/local/cuda/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ENV TORCH_CUDA_ARCH_LIST="6.0;6.1;6.2;7.0;7.2;7.5;8.0;8.6"
ENV TORCH_DONT_CHECK_COMPILER_ABI=1

RUN apt update \
	&& apt install -y wget --no-install-recommends

RUN wget https://developer.download.nvidia.com/compute/cuda/repos/debian12/x86_64/cuda-keyring_1.1-1_all.deb \
    && dpkg -i cuda-keyring_1.1-1_all.deb \
    && rm -rf cuda-keyring_1.1-1_all.deb

RUN apt update \
	&& apt install -y --no-install-recommends \
    cuda-libraries-12-6 \
    cuda-compiler-12-6 \
    && apt clean all \
    && rm -rf /var/cache/apt/* \
	&& echo "/usr/local/nvidia/lib" >> /etc/ld.so.conf.d/nvidia.conf \
	&& echo "/usr/local/nvidia/lib64" >> /etc/ld.so.conf.d/nvidia.conf

# step 2: get python dependencies
FROM base AS build

ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# Disable Python downloads, because we want to use the system interpreter across both images.
ENV UV_PYTHON_DOWNLOADS=0

# Copy the service dependencies
WORKDIR /builder
COPY --link --from=libs . libs

WORKDIR /builder/interactive_ai/workflows/otx_domain/trainer/otx_v2

COPY --link --from=ghcr.io/astral-sh/uv:0.6.12 /uv /bin/uv

COPY --link scripts/ scripts
COPY --link run run
COPY --link download_pretrained_weights.py download_pretrained_weights.py

RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv venv --relocatable && \
    uv sync --frozen --no-dev --no-editable

# step 3: build final runtime image
FROM base AS runtime

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libgl1=1.6.0-1 \
    libglib2.0-0=2.74.6-2+deb12u5 \
    curl && \
    rm -rf /var/lib/apt/lists/* && \
    useradd -l -u 10001 non-root && \
	pip3 uninstall -y setuptools pip wheel && \
    rm -rf /root/.cache/pip

# copy python dependencies
COPY --link --from=build --chown=10001 /builder/interactive_ai/workflows/otx_domain/trainer/otx_v2/.venv/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY --link --from=build --chown=10001 /builder/interactive_ai/workflows/otx_domain/trainer/otx_v2 /otx_v2
COPY --link --from=cuda --chown=10001 /usr/local /usr/local

ENV PATH="/otx_v2:$PATH"
ENV PYTHONPATH="/otx_v2/scripts"
ENV HF_HUB_OFFLINE=1

USER non-root
WORKDIR /home/non-root
WORKDIR /otx_v2