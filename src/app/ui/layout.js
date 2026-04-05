export const Layout = {
    render: () => `
        <div class="tmli-container min-h-screen bg-[#0F172A] text-slate-200 font-sans">
            <header class="border-b border-slate-800 bg-[#0F172A]/80 backdrop-blur-md sticky top-0 z-50">
                <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">T</div>
                        <h1 class="text-xl font-bold tracking-tight text-white">TMLI <span class="text-slate-400 font-medium">Intelligence Suite</span></h1>
                    </div>
                    <nav class="hidden md:flex items-center space-x-6">
                        <a href="#executive" class="text-sm font-medium hover:text-white transition-colors">Executive Summary</a>
                        <a href="#regional" class="text-sm font-medium hover:text-white transition-colors">Regional Analysis</a>
                        <a href="#branches" class="text-sm font-medium hover:text-white transition-colors">Branch Catchment</a>
                    </nav>
                    <div class="flex items-center space-x-4">
                        <span id="health-indicator" class="flex items-center text-xs text-green-400">
                            <span class="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                            AI ENGINE LIVE
                        </span>
                    </div>
                </div>
            </header>
            
            <main id="app-content" class="max-w-7xl mx-auto px-4 py-8">
                <!-- Dynamic Content -->
                <div id="loading-skeleton" class="animate-pulse space-y-4">
                    <div class="h-8 bg-slate-800 rounded w-1/4"></div>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div class="h-32 bg-slate-800 rounded"></div>
                        <div class="h-32 bg-slate-800 rounded"></div>
                        <div class="h-32 bg-slate-800 rounded"></div>
                        <div class="h-32 bg-slate-800 rounded"></div>
                    </div>
                    <div class="h-64 bg-slate-800 rounded"></div>
                </div>
            </main>
            
            <footer class="border-t border-slate-800 mt-12 py-8 bg-slate-900/50">
                <div class="max-w-7xl mx-auto px-4 text-center">
                    <p class="text-xs text-slate-500 italic">Institutional Grade Labor Intelligence · Powered by official NSO, GISTDA, and BOT Data Sources</p>
                </div>
            </footer>
        </div>
    `
};
