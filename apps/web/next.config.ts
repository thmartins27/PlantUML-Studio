import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // As instruções do projeto são mantidas manualmente na raiz.
  agentRules: false,
  transpilePackages: ['@plantuml-studio/shared'],
  experimental: { useTypeScriptCli: false },
};

export default nextConfig;
