# n8n Chat UI - Modern & Production-Ready

A comprehensive, production-ready chat UI built with Next.js 15 and modern web technologies. Features a complete design system, accessibility compliance, performance optimization, and enterprise-grade monitoring capabilities.

## 🚀 Features

### Core Chat Functionality
- **Modern Chat Interface** with real-time messaging
- **Markdown Support** with syntax highlighting and code blocks
- **Message Actions** (copy, regenerate, feedback)
- **Conversation Management** (history, export/import, clear)
- **Message Limits** with upgrade prompts and analytics
- **Typing Indicators** and loading states
- **Error Handling** with retry mechanisms

### Design System & UI/UX
- **Comprehensive Design System** with consistent tokens and variants
- **Dark/Light Theme Support** with system preference detection
- **Responsive Design** optimized for mobile and desktop
- **Accessibility Compliant** (WCAG 2.1 AA standards)
- **Custom Branding** support with environment-based configuration
- **Smooth Animations** with reduced motion support
- **Progressive Web App** capabilities

### Performance & Optimization
- **Lazy Loading** for components and routes
- **Image Optimization** with WebP/AVIF support
- **Bundle Optimization** with code splitting
- **Service Worker** for offline capabilities
- **Performance Monitoring** with Core Web Vitals tracking
- **Asset Optimization** and caching strategies

### Analytics & Monitoring
- **Real-time Analytics** with user interaction tracking
- **Performance Metrics** (LCP, FID, CLS, TTFB)
- **Business Metrics** (messages, sessions, feature usage)
- **Error Tracking** and reporting
- **Health Checks** and monitoring endpoints
- **Prometheus Integration** for metrics collection

### Testing & Quality
- **Comprehensive Test Suite** (unit, integration, accessibility, performance)
- **Automated Testing** with Jest and React Testing Library
- **Accessibility Testing** with axe-core integration
- **Performance Testing** with Lighthouse CI
- **Code Quality** with ESLint and TypeScript

### Deployment & DevOps
- **Docker Support** with multi-stage builds
- **Kubernetes Deployment** with auto-scaling
- **CI/CD Pipeline** with GitHub Actions
- **Multiple Deployment Targets** (Docker, K8s, Vercel)
- **Environment Management** with type-safe configuration
- **Security Headers** and CSP implementation

## 📋 Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Docker** (optional, for containerized deployment)
- **kubectl** (optional, for Kubernetes deployment)

## 🛠️ Installation & Setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd n8n-chat-ui
npm install
```

### 2. Environment Configuration
Copy the example environment file and configure your settings:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Core Configuration
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
NEXT_PUBLIC_APP_NAME="My Custom Chat App"

# Branding
NEXT_PUBLIC_PRIMARY_COLOR="#3b82f6"
NEXT_PUBLIC_SECONDARY_COLOR="#64748b"
NEXT_PUBLIC_FONT_FAMILY="Inter"
NEXT_PUBLIC_LOGO_URL="/logo.png"

# Features
NEXT_PUBLIC_ENABLE_SOUND="false"
NEXT_PUBLIC_ENABLE_ANIMATIONS="true"
NEXT_PUBLIC_ENABLE_MESSAGE_GROUPING="true"

# Analytics (Optional)
NEXT_PUBLIC_ANALYTICS_ENDPOINT="https://your-analytics-endpoint.com/events"
NEXT_PUBLIC_ANALYTICS_API_KEY="your-analytics-api-key"
NEXT_PUBLIC_ANALYTICS_SAMPLE_RATE="1.0"
```

### 3. Development
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing

### Run All Tests
```bash
npm run test:all
```

### Individual Test Suites
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Accessibility tests
npm run test:accessibility

# Performance tests
npm run test:performance

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Custom Test Runner
```bash
# Run comprehensive test suite with reporting
node scripts/test-runner.js

# Run specific test types
node scripts/test-runner.js --unit
node scripts/test-runner.js --accessibility
node scripts/test-runner.js --performance

# Skip linting and type checking
node scripts/test-runner.js --skip-lint --skip-types
```

## 🚢 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
./scripts/deploy.sh docker

# Development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Production environment
docker-compose up -d
```

### Kubernetes Deployment
```bash
# Deploy to Kubernetes
./scripts/deploy.sh k8s

# Or manually apply manifests
kubectl apply -f k8s/
```

### Vercel Deployment
```bash
# Deploy to Vercel
./scripts/deploy.sh vercel

# Or use Vercel CLI directly
vercel --prod
```

### Manual Build
```bash
npm run build
npm start
```

## 📊 Monitoring & Analytics

### Health Checks
- **Health Endpoint**: `GET /api/health`
- **Readiness Check**: `HEAD /api/health`

### Metrics Collection
- **Metrics Endpoint**: `GET /api/metrics`
- **Prometheus Format**: `GET /api/metrics?format=prometheus`

### Analytics Dashboard
Access the built-in analytics dashboard at `/analytics` (when analytics are enabled).

### Monitoring Stack
The application includes a complete monitoring stack:
- **Prometheus** for metrics collection
- **Grafana** for visualization
- **Alert Manager** for alerting (configured but not deployed by default)

Enable monitoring with:
```bash
docker-compose --profile monitoring up -d
```

## 🎨 Customization

### Branding
Customize the application appearance through environment variables:
- Colors, fonts, and logos
- Custom CSS injection
- Feature toggles

### Components
The design system is fully modular. See `docs/COMPONENTS.md` for component documentation.

### Themes
Built-in support for light/dark themes with system preference detection.

## 🔧 Configuration

### Environment-Based Config
The application uses a centralized configuration system in `lib/config/index.ts` that supports:
- Environment-specific overrides
- Type-safe configuration
- Runtime validation
- Development helpers

### Feature Flags
Enable/disable features through environment variables:
- Sound notifications
- Animations
- Message grouping
- Analytics tracking
- Performance monitoring

## 📚 Documentation

- **Components**: `docs/COMPONENTS.md`
- **Style Guide**: `docs/STYLE_GUIDE.md`
- **Design System**: `lib/design-system/README.md`

## 🔒 Security

### Security Features
- **Content Security Policy** (CSP)
- **HTTP Strict Transport Security** (HSTS)
- **XSS Protection**
- **CSRF Protection**
- **Secure Headers**

### Security Scanning
The CI/CD pipeline includes:
- **Dependency scanning** with npm audit
- **Container scanning** with Trivy
- **Code analysis** with CodeQL

## 🚀 Performance

### Core Web Vitals
The application is optimized for excellent Core Web Vitals scores:
- **LCP** (Largest Contentful Paint) < 2.5s
- **FID** (First Input Delay) < 100ms
- **CLS** (Cumulative Layout Shift) < 0.1

### Optimization Features
- **Image optimization** with WebP/AVIF
- **Code splitting** and lazy loading
- **Service worker** for caching
- **Bundle analysis** and optimization
- **Performance monitoring** and alerting

## 🌐 API Integration

### n8n Webhook Integration
The application sends messages to your n8n webhook in this format:

```json
{
  "message": "User message content",
  "history": [
    {
      "id": "message-uuid",
      "role": "user|assistant",
      "content": "Message content",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Expected Response Format
Your n8n workflow should respond with:

```json
{
  "reply": "**Markdown formatted response**\n\n```javascript\nconsole.log('Code blocks supported');\n```"
}
```

Or plain text for simple responses.

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Run tests** to ensure quality
4. **Submit** a pull request

### Development Workflow
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm run test:all

# Build for production
npm run build

# Lint and format
npm run lint
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Troubleshooting
- Check the health endpoint: `/api/health`
- Review application logs
- Verify environment configuration
- Test n8n webhook connectivity

### Common Issues
1. **n8n webhook not responding**: Verify the webhook URL and network connectivity
2. **Analytics not working**: Check analytics configuration and endpoint availability
3. **Performance issues**: Review bundle size and enable performance monitoring
4. **Accessibility issues**: Run accessibility tests and check WCAG compliance

### Getting Help
- Review the documentation in the `docs/` directory
- Check the component examples and tests
- Use the built-in analytics dashboard for insights
- Monitor application health and metrics

---

Built with ❤️ using Next.js 15, TypeScript, Tailwind CSS, and modern web technologies.
