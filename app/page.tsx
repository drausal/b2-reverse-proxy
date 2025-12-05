export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white overflow-hidden">
      {/* Animated grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />
      
      {/* Glowing orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-zinc-800 backdrop-blur-sm bg-black/50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">
                B2
              </div>
              <span className="text-xl font-bold tracking-tight">Reverse Proxy</span>
            </div>
            <div className="flex gap-4">
              <a href="https://github.com/drausal/b2-reverse-proxy" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg border border-zinc-700 hover:border-cyan-500 transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </header>

        {/* Hero */}
        <main className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-mono">
              ⚡ High-Performance Cloud Storage Gateway
            </div>
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              B2 Reverse Proxy
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-8">
              Serve Backblaze B2 files through your own domain with zero latency overhead.
              Enterprise-grade CDN alternative.
            </p>
            <div className="flex gap-4 justify-center items-center flex-wrap">
              <code className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-lg font-mono text-sm">
                https://yourdomain.com/file/bucket/path
              </code>
              <svg className="w-8 h-8 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <code className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-lg font-mono text-sm">
                B2 Storage
              </code>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm hover:border-cyan-500/50 transition-colors group">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-500/30 transition-colors">
                <svg className="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-zinc-400">Minimal latency overhead with edge caching and optimized routing.</p>
            </div>

            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm hover:border-blue-500/50 transition-colors group">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Secure by Default</h3>
              <p className="text-zinc-400">HTTPS encryption, CORS support, and access control out of the box.</p>
            </div>

            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm hover:border-purple-500/50 transition-colors group">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Simple API</h3>
              <p className="text-zinc-400">Drop-in replacement for B2 URLs. No SDK or configuration required.</p>
            </div>
          </div>

          {/* Code Example */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Usage Example</h3>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
            </div>
            <pre className="bg-black rounded-lg p-6 overflow-x-auto">
              <code className="text-sm font-mono">
                <span className="text-zinc-500"># Original B2 URL</span>{"\n"}
                <span className="text-cyan-400">https://f005.backblazeb2.com</span><span className="text-zinc-400">/file/bucket/image.jpg</span>{"\n\n"}
                <span className="text-zinc-500"># Your Custom Domain</span>{"\n"}
                <span className="text-purple-400">https://cdn.yourdomain.com</span><span className="text-zinc-400">/file/bucket/image.jpg</span>
              </code>
            </pre>
          </div>

          {/* Stats */}
          <div className="mt-16 grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-cyan-400 mb-2">99.9%</div>
              <div className="text-zinc-400">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">&lt;50ms</div>
              <div className="text-zinc-400">Avg Latency</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">∞</div>
              <div className="text-zinc-400">Scalability</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">$0</div>
              <div className="text-zinc-400">Setup Cost</div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-800 mt-20">
          <div className="max-w-7xl mx-auto px-6 py-8 text-center text-zinc-400">
            <p>Built with Next.js · Deployed on Vercel · Powered by Backblaze B2</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
