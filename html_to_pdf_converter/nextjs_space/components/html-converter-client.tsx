
"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, Download, Eye, Code2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-monokai";

const defaultHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Professional Report</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="p-8 bg-gradient-to-br from-gray-900 to-black">
    <div class="max-w-4xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-10 border border-lime-500/20">
        <h1 class="text-5xl font-bold bg-gradient-to-r from-lime-400 to-green-500 bg-clip-text text-transparent border-b-2 border-lime-500/30 pb-4 mb-6">
            Professional Business Report
        </h1>
        
        <p class="text-gray-300 mb-4 text-lg leading-relaxed">
            This is a sample document showcasing the powerful HTML to PDF conversion capabilities. 
            You can modify this content in the editor or upload your own HTML file.
        </p>
        
        <div class="bg-lime-500/10 border-l-4 border-lime-500 p-5 my-6 rounded-lg backdrop-blur-sm">
            <p class="font-semibold text-lime-400 mb-2">💡 Pro Tip:</p>
            <p class="text-gray-300">
                All CSS styles and formatting are preserved during conversion. 
                Create beautiful documents with custom styling and modern layouts!
            </p>
        </div>
        
        <h2 class="text-3xl font-bold text-white mt-10 mb-6">
            Key Features:
        </h2>
        
        <ul class="space-y-3 mb-8">
            <li class="flex items-start group">
                <span class="text-lime-400 mr-3 text-xl">✓</span>
                <span class="text-gray-300 group-hover:text-white transition-colors">Fast and reliable conversion</span>
            </li>
            <li class="flex items-start group">
                <span class="text-lime-400 mr-3 text-xl">✓</span>
                <span class="text-gray-300 group-hover:text-white transition-colors">Professional output quality</span>
            </li>
            <li class="flex items-start group">
                <span class="text-lime-400 mr-3 text-xl">✓</span>
                <span class="text-gray-300 group-hover:text-white transition-colors">Preserve all formatting and styles</span>
            </li>
        </ul>
        
        <div class="grid grid-cols-2 gap-6 my-8">
            <div class="bg-gradient-to-br from-lime-500/20 to-green-500/20 p-6 rounded-xl border border-lime-500/30 backdrop-blur-sm hover:scale-105 transition-transform">
                <h3 class="font-bold text-lime-400 mb-2 text-lg">High Quality</h3>
                <p class="text-sm text-gray-400">Crystal clear PDF output</p>
            </div>
            <div class="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-6 rounded-xl border border-emerald-500/30 backdrop-blur-sm hover:scale-105 transition-transform">
                <h3 class="font-bold text-emerald-400 mb-2 text-lg">Instant Results</h3>
                <p class="text-sm text-gray-400">Generate PDFs in seconds</p>
            </div>
        </div>
        
        <div class="mt-10 p-8 bg-gradient-to-r from-lime-600 via-green-600 to-emerald-600 text-white rounded-2xl shadow-xl">
            <h3 class="text-2xl font-bold mb-3">Ready to Convert?</h3>
            <p class="text-lime-100 text-lg">
                Click "Convert to PDF" to download your document in professional A4 format!
            </p>
        </div>
    </div>
</body>
</html>`;

export default function HTMLConverterClient() {
  const [htmlContent, setHtmlContent] = useState(defaultHtml);
  const [isConverting, setIsConverting] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  const [pageFormat, setPageFormat] = useState<"a4" | "single">("a4");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event?.target?.files?.[0];
    if (!file) return;

    if (file?.type !== 'text/html' && !file?.name?.endsWith?.('.html') && !file?.name?.endsWith?.('.htm')) {
      toast({
        title: "Invalid file format",
        description: "Please upload an HTML file (.html or .htm)",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e?.target?.result;
      if (typeof content === 'string') {
        setHtmlContent(content);
        setActiveTab("editor");
        toast({
          title: "File uploaded",
          description: "HTML file successfully loaded into editor"
        });
      }
    };
    reader.readAsText(file);
  };

  const handleConvertToPdf = async () => {
    if (!htmlContent?.trim()) {
      toast({
        title: "No content",
        description: "Please add HTML code before converting",
        variant: "destructive"
      });
      return;
    }

    setIsConverting(true);
    try {
      const response = await fetch('/api/convert-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ htmlContent, pageFormat })
      });

      if (!response?.ok) {
        throw new Error('Conversion error');
      }

      const blob = await response?.blob?.();
      const url = window.URL?.createObjectURL?.(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `document-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click?.();
      window.URL?.revokeObjectURL?.(url);

      toast({
        title: "PDF generated",
        description: "Your PDF has been generated and downloaded successfully"
      });
    } catch (error) {
      console.error('Conversion error:', error);
      toast({
        title: "Error",
        description: "An error occurred during conversion",
        variant: "destructive"
      });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20">
      <Card className="bg-card/50 backdrop-blur-md border border-border shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="text-primary">
              HTML Converter
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted border border-border p-1">
              <TabsTrigger 
                value="editor" 
                onClick={() => setActiveTab("editor")}
                className="flex items-center gap-2 font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:text-foreground"
              >
                <FileText className="h-4 w-4" />
                HTML Editor
              </TabsTrigger>
              <TabsTrigger 
                value="preview" 
                onClick={() => setActiveTab("preview")}
                className="flex items-center gap-2 font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:text-foreground"
              >
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-4">
              <div className="flex gap-3 mb-6">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef?.current?.click?.()}
                  className="flex items-center gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary text-primary"
                >
                  <Upload className="h-4 w-4" />
                  Upload HTML File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".html,.htm"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <div className="border border-border rounded-xl overflow-hidden shadow-2xl">
                <AceEditor
                  mode="html"
                  theme="monokai"
                  onChange={setHtmlContent}
                  value={htmlContent}
                  name="html-editor"
                  editorProps={{ $blockScrolling: true }}
                  width="100%"
                  height="500px"
                  fontSize={15}
                  showPrintMargin={true}
                  showGutter={true}
                  highlightActiveLine={true}
                  setOptions={{
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    enableSnippets: true,
                    showLineNumbers: true,
                    tabSize: 2,
                    useWorker: false
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="preview">
              <Card className="bg-muted/30 border-border">
                <CardHeader>
                  <CardTitle className="text-base text-muted-foreground font-normal">
                    HTML Document Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {htmlContent?.trim() ? (
                    <div className="bg-muted/50 border border-border rounded-xl p-4 min-h-[500px]">
                      <iframe
                        srcDoc={htmlContent}
                        className="w-full h-[500px] border-0 rounded-lg"
                        title="HTML Preview"
                        sandbox="allow-same-origin allow-scripts"
                      />
                    </div>
                  ) : (
                    <Alert className="bg-muted/50 border-border">
                      <AlertCircle className="h-4 w-4 text-primary" />
                      <AlertDescription className="text-muted-foreground">
                        No HTML content to display. Please add code in the editor.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-12 space-y-8">
            <div className="flex flex-col items-center space-y-6">
              <Label className="text-lg font-bold text-foreground">
                PDF Format
              </Label>
              <RadioGroup
                value={pageFormat}
                onValueChange={(value) => setPageFormat(value as "a4" | "single")}
                className="flex flex-col space-y-3"
              >
                <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/30 border border-border hover:border-primary/50 transition-colors">
                  <RadioGroupItem value="a4" id="format-a4" className="border-primary text-primary" />
                  <Label htmlFor="format-a4" className="font-normal cursor-pointer text-foreground">
                    A4 Format (multiple pages)
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/30 border border-border hover:border-primary/50 transition-colors">
                  <RadioGroupItem value="single" id="format-single" className="border-primary text-primary" />
                  <Label htmlFor="format-single" className="font-normal cursor-pointer text-foreground">
                    Single continuous page (no divisions)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleConvertToPdf}
                disabled={isConverting || !htmlContent?.trim()}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-6 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isConverting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground border-t-transparent mr-3" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Download className="h-6 w-6 mr-3" />
                    Convert to PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
