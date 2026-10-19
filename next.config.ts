import type {NextConfig} from 'next';

/**
 * Exportação estática: a app é gerada como ficheiros HTML/JS em `out/`
 * e alojada no Firebase Hosting (plano Spark, gratuito). Não há servidor.
 */
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
