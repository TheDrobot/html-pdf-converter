
import { FileText, Download, Eye, Upload, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const HTMLConverterClient = dynamic(() => import("@/components/html-converter-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground text-lg">Loading...</p>
      </div>
    </div>
  )
});

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <FileText className="h-8 w-8 text-primary" />
                <div className="absolute inset-0 blur-xl bg-primary/30"></div>
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                HTML to PDF
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Logo />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center relative overflow-hidden flex-shrink-0">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"></div>
        
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Transform your content into orbit</span>
          </div>
          
          <h2 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            Convert HTML to PDF
            <br />
            <span className="text-primary">
              at Warp Speed
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Upload your HTML files or write code directly, preview in real-time, and download professional PDFs in A4 format with a single click.
          </p>
          
          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="group bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border hover:border-primary/50 transition-all duration-300 hover:scale-105">
              <div className="relative mb-6">
                <Upload className="h-14 w-14 text-primary mx-auto relative z-10" />
                <div className="absolute inset-0 blur-2xl bg-primary/20 group-hover:bg-primary/30 transition-all"></div>
              </div>
              <h3 className="font-bold text-xl text-foreground mb-3">Upload or Write</h3>
              <p className="text-muted-foreground">
                Upload HTML files from your computer or write code directly in our powerful editor
              </p>
            </div>
            
            <div className="group bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border hover:border-primary/50 transition-all duration-300 hover:scale-105">
              <div className="relative mb-6">
                <Eye className="h-14 w-14 text-primary mx-auto relative z-10" />
                <div className="absolute inset-0 blur-2xl bg-primary/20 group-hover:bg-primary/30 transition-all"></div>
              </div>
              <h3 className="font-bold text-xl text-foreground mb-3">Live Preview</h3>
              <p className="text-muted-foreground">
                See exactly how your HTML will look before conversion with real-time preview
              </p>
            </div>
            
            <div className="group bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border hover:border-primary/50 transition-all duration-300 hover:scale-105">
              <div className="relative mb-6">
                <Download className="h-14 w-14 text-primary mx-auto relative z-10" />
                <div className="absolute inset-0 blur-2xl bg-primary/20 group-hover:bg-primary/30 transition-all"></div>
              </div>
              <h3 className="font-bold text-xl text-foreground mb-3">Instant Download</h3>
              <p className="text-muted-foreground">
                Generate and download professional PDFs in A4 format instantly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Converter */}
      <div className="flex-grow">
        <HTMLConverterClient />
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Copyright © 2025 The Drobot. All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
