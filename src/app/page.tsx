"use client";

import { useState, useRef } from "react";
import QRCode from 'qrcode';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [text, setText] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const qrCodeRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const generateQrCode = async () => {
    try {
      const response = await QRCode.toDataURL(text, {
        width: 400,
        color: {
          dark: "#000",
          light: "#FFF",
        },
      });
      setQrCode(response);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDownload = async (format: string) => {
    if (!qrCodeRef.current) {
      return;
    }

    const canvas = qrCodeRef.current;
    let link: string | null = null;

    if (format === "PNG") {
      link = canvas.toDataURL("image/png");
    } else if (format === "SVG") {
      try {
        link = await QRCode.toString(text, { type: 'svg' });
      } catch (error) {
        console.error("Error generating SVG QR code:", error);
        toast({
          title: "Error!",
          description: "Failed to generate SVG QR code.",
          variant: "destructive",
        });
        return;
      }
      const svgData = new Blob([link], { type: 'image/svg+xml' });
      link = URL.createObjectURL(svgData);
    }

    if (!link) {
      return;
    }

    const downloadLink = document.createElement("a");
    downloadLink.href = link;
    downloadLink.download = `qr_code.${format.toLowerCase()}`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(link); // Free up memory
  };

  const handleCopy = () => {
    if (!qrCodeRef.current) {
      return;
    }
    qrCodeRef.current.toBlob((blob) => {
      if (!blob) {
        toast({
          title: "Error!",
          description: "QR Code is not available",
          variant: "destructive",
        });
        return;
      }
      const item = new ClipboardItem({ "image/png": blob });
      navigator.clipboard.write([item]);
      toast({
        title: "Success!",
        description: "Copied QR Code to clipboard!",
      });
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-2xl font-bold mb-4">QRGenius</h1>
      <div className="flex flex-col items-center justify-center w-full max-w-md">
        <Input
          type="text"
          placeholder="Enter text to generate QR code"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-md shadow-sm focus:ring focus:ring-primary focus:outline-none mb-4"
        />
        <Button onClick={generateQrCode} className="bg-primary text-primary-foreground hover:bg-primary/80 rounded-md shadow-sm w-full">
          Generate QR Code
        </Button>

        {qrCode && (
          <Card className="w-full mt-6 rounded-md shadow-sm">
            <CardContent className="flex flex-col items-center justify-center p-4">
              <canvas ref={qrCodeRef} style={{ height: "auto", maxWidth: "100%", width: "100%" }} src={qrCode} />
              <div className="flex justify-around w-full mt-4">
                <Button onClick={() => handleDownload("PNG")} className="bg-green-500 text-white hover:bg-green-700 rounded-md shadow-sm">
                  <Download className="mr-2 h-4 w-4" />
                  PNG
                </Button>
                <Button onClick={() => handleDownload("SVG")} className="bg-green-500 text-white hover:bg-green-700 rounded-md shadow-sm">
                  <Download className="mr-2 h-4 w-4" />
                  SVG
                </Button>
                <Button onClick={handleCopy} className="bg-green-500 text-white hover:bg-green-700 rounded-md shadow-sm">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
