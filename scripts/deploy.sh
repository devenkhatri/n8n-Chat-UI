#!/bin/bash

# Deployment script for Chat UI application
# Supports multiple deployment targets: docker, kubernetes, vercel

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
IMAGE_NAME="chat-ui"
REGISTRY="${REGISTRY:-ghcr.io/your-org}"
VERSION="${VERSION:-$(git rev-parse --short HEAD)}"
ENVIRONMENT="${ENVIRONMENT:-production}"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if required commands exist
    command -v docker >/dev/null 2>&1 || error "Docker is required but not installed"
    command -v git >/dev/null 2>&1 || error "Git is required but not installed"
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        error "Not in a git repository"
    fi
    
    # Check for uncommitted changes
    if [[ -n $(git status --porcelain) ]]; then
        warn "You have uncommitted changes. Consider committing them first."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    success "Prerequisites check passed"
}

# Build Docker image
build_image() {
    log "Building Docker image..."
    
    cd "$PROJECT_ROOT"
    
    # Build the image
    docker build \
        --build-arg NEXT_PUBLIC_APP_NAME="${NEXT_PUBLIC_APP_NAME:-n8n Chat UI}" \
        --build-arg NEXT_PUBLIC_PRIMARY_COLOR="${NEXT_PUBLIC_PRIMARY_COLOR:-#3b82f6}" \
        --build-arg NEXT_PUBLIC_SECONDARY_COLOR="${NEXT_PUBLIC_SECONDARY_COLOR:-#64748b}" \
        --build-arg NEXT_PUBLIC_N8N_WEBHOOK_URL="${NEXT_PUBLIC_N8N_WEBHOOK_URL}" \
        --build-arg NEXT_PUBLIC_ANALYTICS_ENDPOINT="${NEXT_PUBLIC_ANALYTICS_ENDPOINT}" \
        --build-arg NEXT_PUBLIC_ANALYTICS_API_KEY="${NEXT_PUBLIC_ANALYTICS_API_KEY}" \
        -t "${IMAGE_NAME}:${VERSION}" \
        -t "${IMAGE_NAME}:latest" \
        .
    
    success "Docker image built successfully"
}

# Push image to registry
push_image() {
    log "Pushing image to registry..."
    
    # Tag for registry
    docker tag "${IMAGE_NAME}:${VERSION}" "${REGISTRY}/${IMAGE_NAME}:${VERSION}"
    docker tag "${IMAGE_NAME}:latest" "${REGISTRY}/${IMAGE_NAME}:latest"
    
    # Push to registry
    docker push "${REGISTRY}/${IMAGE_NAME}:${VERSION}"
    docker push "${REGISTRY}/${IMAGE_NAME}:latest"
    
    success "Image pushed to registry"
}

# Deploy with Docker Compose
deploy_docker() {
    log "Deploying with Docker Compose..."
    
    cd "$PROJECT_ROOT"
    
    # Create environment file if it doesn't exist
    if [[ ! -f .env.local ]]; then
        warn ".env.local not found. Creating from .env.example..."
        cp .env.example .env.local
    fi
    
    # Deploy with docker-compose
    if [[ "$ENVIRONMENT" == "production" ]]; then
        docker-compose -f docker-compose.yml up -d
    else
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    fi
    
    # Wait for health check
    log "Waiting for application to be healthy..."
    timeout=60
    while [[ $timeout -gt 0 ]]; do
        if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
            success "Application is healthy"
            break
        fi
        sleep 2
        ((timeout-=2))
    done
    
    if [[ $timeout -le 0 ]]; then
        error "Application failed to become healthy within 60 seconds"
    fi
    
    success "Docker deployment completed"
}

# Deploy to Kubernetes
deploy_kubernetes() {
    log "Deploying to Kubernetes..."
    
    # Check if kubectl is available
    command -v kubectl >/dev/null 2>&1 || error "kubectl is required for Kubernetes deployment"
    
    cd "$PROJECT_ROOT"
    
    # Apply Kubernetes manifests
    kubectl apply -f k8s/
    
    # Wait for deployment to be ready
    kubectl rollout status deployment/chat-ui --timeout=300s
    
    # Get service URL
    SERVICE_URL=$(kubectl get service chat-ui-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    if [[ -n "$SERVICE_URL" ]]; then
        log "Application deployed at: http://$SERVICE_URL"
    fi
    
    success "Kubernetes deployment completed"
}

# Deploy to Vercel
deploy_vercel() {
    log "Deploying to Vercel..."
    
    # Check if Vercel CLI is available
    command -v vercel >/dev/null 2>&1 || error "Vercel CLI is required. Install with: npm i -g vercel"
    
    cd "$PROJECT_ROOT"
    
    # Deploy to Vercel
    if [[ "$ENVIRONMENT" == "production" ]]; then
        vercel --prod --yes
    else
        vercel --yes
    fi
    
    success "Vercel deployment completed"
}

# Run smoke tests
run_smoke_tests() {
    log "Running smoke tests..."
    
    # Basic health check
    if ! curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
        error "Health check failed"
    fi
    
    # Check if metrics endpoint is working
    if ! curl -f http://localhost:3000/api/metrics >/dev/null 2>&1; then
        warn "Metrics endpoint is not responding"
    fi
    
    success "Smoke tests passed"
}

# Cleanup old images
cleanup() {
    log "Cleaning up old images..."
    
    # Remove old local images (keep last 3)
    docker images "${IMAGE_NAME}" --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | \
        tail -n +4 | \
        awk '{print $1}' | \
        xargs -r docker rmi
    
    success "Cleanup completed"
}

# Show usage
usage() {
    echo "Usage: $0 [OPTIONS] COMMAND"
    echo ""
    echo "Commands:"
    echo "  build       Build Docker image"
    echo "  push        Push image to registry"
    echo "  docker      Deploy with Docker Compose"
    echo "  k8s         Deploy to Kubernetes"
    echo "  vercel      Deploy to Vercel"
    echo "  all         Build, push, and deploy"
    echo "  test        Run smoke tests"
    echo "  cleanup     Clean up old images"
    echo ""
    echo "Options:"
    echo "  -e, --env ENVIRONMENT    Set environment (default: production)"
    echo "  -v, --version VERSION    Set version tag (default: git commit hash)"
    echo "  -r, --registry REGISTRY  Set container registry"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  NEXT_PUBLIC_APP_NAME"
    echo "  NEXT_PUBLIC_N8N_WEBHOOK_URL"
    echo "  NEXT_PUBLIC_ANALYTICS_ENDPOINT"
    echo "  NEXT_PUBLIC_ANALYTICS_API_KEY"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -v|--version)
            VERSION="$2"
            shift 2
            ;;
        -r|--registry)
            REGISTRY="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        build|push|docker|k8s|vercel|all|test|cleanup)
            COMMAND="$1"
            shift
            ;;
        *)
            error "Unknown option: $1"
            ;;
    esac
done

# Check if command is provided
if [[ -z "${COMMAND:-}" ]]; then
    error "No command provided. Use --help for usage information."
fi

# Main execution
log "Starting deployment process..."
log "Environment: $ENVIRONMENT"
log "Version: $VERSION"
log "Registry: $REGISTRY"

check_prerequisites

case $COMMAND in
    build)
        build_image
        ;;
    push)
        build_image
        push_image
        ;;
    docker)
        build_image
        deploy_docker
        run_smoke_tests
        ;;
    k8s)
        build_image
        push_image
        deploy_kubernetes
        ;;
    vercel)
        deploy_vercel
        ;;
    all)
        build_image
        push_image
        deploy_docker
        run_smoke_tests
        ;;
    test)
        run_smoke_tests
        ;;
    cleanup)
        cleanup
        ;;
    *)
        error "Unknown command: $COMMAND"
        ;;
esac

success "Deployment process completed successfully!"