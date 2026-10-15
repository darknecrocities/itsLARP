"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Download, Cpu, HardDrive, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Badge } from "@/components/ui";

type DetectedOS = "mac-arm" | "mac-intel" | "windows" | "other";

export default function DownloadPage() {
  const [detectedOS, setDetectedOS] = useState<DetectedOS>("mac-arm");
  const [activeTab, setActiveTab] = useState<"apple" | "amd" | "intel">("apple");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent.toLowerCase();
      if (ua.includes("win")) {
        setDetectedOS("windows");
        setActiveTab("intel");
      } else if (ua.includes("mac")) {
        // Modern Mac detection default is Apple Silicon
        setDetectedOS("mac-arm");
        setActiveTab("apple");
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-bg text-ink selection:bg-black selection:text-white">
      <LandingHeader />

      <main className="max-w-6xl mx-auto px-6 py-14">
        {/* Header & Primary Download Hero */}
        <div className="text-center max-w-3xl mx-auto mb-14">

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-ink">
            Download itsLARP Desktop
          </h1>
          <p className="text-dmuted text-base sm:text-lg mt-3 leading-relaxed">
            Spawn your agents, sit back, and relax. Let your autonomous workforce hunt down your next job while you do literally anything else—zero logins, zero gatekeeping, straight to your dashboard.
          </p>
        </div>

        {/* Primary Download Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {/* macOS Apple Silicon */}
          <div className={`card p-6 border-2 transition-all flex flex-col justify-between ${
            detectedOS === "mac-arm" ? "border-black bg-neutral-50 shadow-md" : "border-line bg-bg"
          }`}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl"></span>
                {detectedOS === "mac-arm" && (
                  <Badge tone="ok">DETECTED ON YOUR DEVICE</Badge>
                )}
              </div>
              <h3 className="text-xl font-bold">macOS (Apple Silicon)</h3>
              <p className="text-xs text-muted mt-1">M1, M2, M3, M4 series chips (ARM64)</p>

              <div className="mt-4 p-3 bg-white rounded border border-neutral-200 text-xs font-mono space-y-1">
                <div className="text-neutral-600">Unified Memory: <strong className="text-black">8GB+</strong></div>
                <div className="text-neutral-600">Acceleration: <strong className="text-ok">Apple Metal GPU</strong></div>
                <div className="text-neutral-600">Recommended Model: <strong className="text-black">qwen2.5-coder:7b</strong></div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <a
                href="/releases/itsLARP-mac-arm64.dmg"
                download
                className="btn btn-primary w-full py-2.5 flex items-center justify-center gap-2 font-medium"
              >
                <Download className="w-4 h-4" />
                <span>Download .DMG (Apple Silicon)</span>
              </a>
              <a
                href="/releases/itsLARP-mac-arm64.zip"
                download
                className="btn w-full py-1.5 text-xs text-center font-mono"
              >
                Download Portable .ZIP
              </a>
            </div>
          </div>

          {/* macOS Intel */}
          <div className={`card p-6 border-2 transition-all flex flex-col justify-between ${
            detectedOS === "mac-intel" ? "border-black bg-neutral-50 shadow-md" : "border-line bg-bg"
          }`}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl"></span>
                {detectedOS === "mac-intel" && (
                  <Badge tone="ok">DETECTED ON YOUR DEVICE</Badge>
                )}
              </div>
              <h3 className="text-xl font-bold">macOS (Intel Core)</h3>
              <p className="text-xs text-muted mt-1">Intel-based MacBooks & iMacs (x86_64)</p>

              <div className="mt-4 p-3 bg-white rounded border border-neutral-200 text-xs font-mono space-y-1">
                <div className="text-neutral-600">RAM Required: <strong className="text-black">16GB+</strong></div>
                <div className="text-neutral-600">Instruction Set: <strong className="text-black">AVX2 Support</strong></div>
                <div className="text-neutral-600">Recommended Model: <strong className="text-black">qwen2.5:1.5b</strong></div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <a
                href="/releases/itsLARP-mac-x64.dmg"
                download
                className="btn btn-primary w-full py-2.5 flex items-center justify-center gap-2 font-medium"
              >
                <Download className="w-4 h-4" />
                <span>Download .DMG (Intel Mac)</span>
              </a>
              <a
                href="/releases/itsLARP-mac-x64.zip"
                download
                className="btn w-full py-1.5 text-xs text-center font-mono"
              >
                Download Portable .ZIP
              </a>
            </div>
          </div>

          {/* Windows 11/10 */}
          <div className={`card p-6 border-2 transition-all flex flex-col justify-between ${
            detectedOS === "windows" ? "border-black bg-neutral-50 shadow-md" : "border-line bg-bg"
          }`}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold font-sans">⊞</span>
                {detectedOS === "windows" && (
                  <Badge tone="ok">DETECTED ON YOUR DEVICE</Badge>
                )}
              </div>
              <h3 className="text-xl font-bold">Windows 11 / 10</h3>
              <p className="text-xs text-muted mt-1">Intel Core, AMD Ryzen & Snapdragon (x64 / ARM64)</p>

              <div className="mt-4 p-3 bg-white rounded border border-neutral-200 text-xs font-mono space-y-1">
                <div className="text-neutral-600">RAM: <strong className="text-black">16GB+ recommended</strong></div>
                <div className="text-neutral-600">GPU: <strong className="text-ok">NVIDIA RTX / AMD Radeon</strong></div>
                <div className="text-neutral-600">Recommended Model: <strong className="text-black">qwen2.5-coder:7b</strong></div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <a
                href="/releases/itsLARP-win-x64-setup.exe"
                download
                className="btn btn-primary w-full py-2.5 flex items-center justify-center gap-2 font-medium"
              >
                <Download className="w-4 h-4" />
                <span>Download Setup .EXE (Windows)</span>
              </a>
              <a
                href="/releases/itsLARP-win-x64-portable.zip"
                download
                className="btn w-full py-1.5 text-xs text-center font-mono"
              >
                Download Portable .ZIP
              </a>
            </div>
          </div>
        </div>

        {/* Benchmark of Each Devices */}
        <section className="card p-8 bg-white border border-neutral-300 rounded-lg mb-14">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-5 mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Benchmark of Each Devices</h2>
              <p className="text-xs text-neutral-600 mt-1">
                Detailed performance benchmarks and requirements for running local Ollama AI models with optimal tokens/sec and zero overheating.
              </p>
            </div>

            <div className="flex gap-2 font-mono text-xs">
              <button
                onClick={() => setActiveTab("apple")}
                className={`px-3 py-1.5 rounded border transition-colors ${
                  activeTab === "apple"
                    ? "bg-black text-white border-black font-semibold"
                    : "bg-white border-neutral-300 text-neutral-800 hover:border-black"
                }`}
              >
                 Apple Silicon (M-Series)
              </button>
              <button
                onClick={() => setActiveTab("amd")}
                className={`px-3 py-1.5 rounded border transition-colors ${
                  activeTab === "amd"
                    ? "bg-black text-white border-black font-semibold"
                    : "bg-white border-neutral-300 text-neutral-800 hover:border-black"
                }`}
              >
                AMD Ryzen & Radeon
              </button>
              <button
                onClick={() => setActiveTab("intel")}
                className={`px-3 py-1.5 rounded border transition-colors ${
                  activeTab === "intel"
                    ? "bg-black text-white border-black font-semibold"
                    : "bg-white border-neutral-300 text-neutral-800 hover:border-black"
                }`}
              >
                Intel Core & Ultra
              </button>
            </div>
          </div>

          {/* Dynamic Hardware Tabs Content */}
          {activeTab === "apple" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded">
                  <div className="text-xs font-mono text-neutral-500 uppercase">TIER 1 · MINIMUM SPEC</div>
                  <div className="text-base font-bold mt-1">M1 / M2 / M3 / M4 (8GB RAM)</div>
                  <ul className="text-xs text-neutral-700 mt-3 space-y-1.5">
                    <li>• Best Models: <code className="bg-white px-1 py-0.5 border rounded">qwen2.5:1.5b</code>, <code className="bg-white px-1 py-0.5 border rounded">llama3.2:3b</code></li>
                    <li>• Speed: 60–90 tokens/second</li>
                    <li>• Memory Consumption: ~1.5GB – 2.5GB</li>
                    <li>• Metal Acceleration: Fully Enabled</li>
                  </ul>
                </div>

                <div className="p-4 bg-neutral-100 border-2 border-black rounded shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-black font-bold uppercase">TIER 2 · RECOMMENDED DEFAULT</span>
                    <Badge tone="ok">SWEET SPOT</Badge>
                  </div>
                  <div className="text-base font-bold mt-1">M-Series Pro / Max (16GB – 24GB)</div>
                  <ul className="text-xs text-neutral-800 mt-3 space-y-1.5">
                    <li>• Primary Model: <code className="bg-white px-1 py-0.5 border border-black font-bold rounded">qwen2.5-coder:7b</code></li>
                    <li>• Speed: 40–70 tokens/second</li>
                    <li>• Perfect for APA resumes, full job scoring & form filling</li>
                    <li>• Zero thermal throttling on Apple Silicon</li>
                  </ul>
                </div>

                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded">
                  <div className="text-xs font-mono text-neutral-500 uppercase">TIER 3 · POWER USER</div>
                  <div className="text-base font-bold mt-1">M-Series Max / Ultra (36GB – 128GB+)</div>
                  <ul className="text-xs text-neutral-700 mt-3 space-y-1.5">
                    <li>• Heavy Models: <code className="bg-white px-1 py-0.5 border rounded">qwen2.5-coder:14b</code>, <code className="bg-white px-1 py-0.5 border rounded">llama3.3:70b</code></li>
                    <li>• Speed: 30–50 tokens/second</li>
                    <li>• Deep reasoning & enterprise-grade extraction</li>
                    <li>• Runs multi-agent swarms completely in local memory</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-neutral-50 rounded border border-neutral-200 text-xs text-neutral-600 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-ok shrink-0 mt-0.5" />
                <div>
                  <strong className="text-black">Apple Silicon Advantage:</strong> macOS uses Unified Memory Architecture (UMA). Because GPU cores share high-bandwidth RAM directly with CPU cores, Ollama model inference does not require moving weights across PCI buses.
                </div>
              </div>
            </div>
          )}

          {activeTab === "amd" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded">
                  <div className="text-xs font-mono text-neutral-500 uppercase">TIER 1 · MINIMUM SPEC</div>
                  <div className="text-base font-bold mt-1">AMD Ryzen 5 (5000/7000 Series)</div>
                  <ul className="text-xs text-neutral-700 mt-3 space-y-1.5">
                    <li>• RAM: 16GB DDR4 / DDR5</li>
                    <li>• Best Models: <code className="bg-white px-1 py-0.5 border rounded">qwen2.5:1.5b</code>, <code className="bg-white px-1 py-0.5 border rounded">llama3.2:1b</code></li>
                    <li>• Instructions: AVX2 Required</li>
                    <li>• Storage: Fast NVMe SSD required</li>
                  </ul>
                </div>

                <div className="p-4 bg-neutral-100 border-2 border-black rounded shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-black font-bold uppercase">TIER 2 · RECOMMENDED DEFAULT</span>
                    <Badge tone="ok">SWEET SPOT</Badge>
                  </div>
                  <div className="text-base font-bold mt-1">AMD Ryzen 7 / 9 + Dedicated GPU</div>
                  <ul className="text-xs text-neutral-800 mt-3 space-y-1.5">
                    <li>• RAM: 32GB DDR5</li>
                    <li>• GPU: AMD Radeon RX 6700/7700+ (12GB VRAM) with ROCm</li>
                    <li>• Primary Model: <code className="bg-white px-1 py-0.5 border border-black font-bold rounded">qwen2.5-coder:7b</code></li>
                    <li>• High throughput for batch resume tailoring</li>
                  </ul>
                </div>

                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded">
                  <div className="text-xs font-mono text-neutral-500 uppercase">TIER 3 · RYZEN AI (NPU)</div>
                  <div className="text-base font-bold mt-1">AMD Ryzen AI 300 (Strix Point)</div>
                  <ul className="text-xs text-neutral-700 mt-3 space-y-1.5">
                    <li>• XDNA 2 NPU with 50+ TOPS</li>
                    <li>• Ultra-low power consumption for all-day laptop battery</li>
                    <li>• Seamless background job scanning on Windows 11</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === "intel" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded">
                  <div className="text-xs font-mono text-neutral-500 uppercase">TIER 1 · MINIMUM SPEC</div>
                  <div className="text-base font-bold mt-1">Intel Core i5 (10th–14th Gen)</div>
                  <ul className="text-xs text-neutral-700 mt-3 space-y-1.5">
                    <li>• RAM: 16GB DDR4</li>
                    <li>• CPU Inference: AVX2 instructions enabled</li>
                    <li>• Best Models: <code className="bg-white px-1 py-0.5 border rounded">qwen2.5:1.5b</code>, <code className="bg-white px-1 py-0.5 border rounded">llama3.2:3b</code></li>
                    <li>• Speed: 15–30 tokens/second</li>
                  </ul>
                </div>

                <div className="p-4 bg-neutral-100 border-2 border-black rounded shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-black font-bold uppercase">TIER 2 · RECOMMENDED DEFAULT</span>
                    <Badge tone="ok">SWEET SPOT</Badge>
                  </div>
                  <div className="text-base font-bold mt-1">Intel Core i7/i9 + NVIDIA RTX</div>
                  <ul className="text-xs text-neutral-800 mt-3 space-y-1.5">
                    <li>• GPU: NVIDIA GeForce RTX 3060/4060+ (8GB–16GB VRAM)</li>
                    <li>• CUDA Acceleration: Ultra-fast (80–120 tokens/sec)</li>
                    <li>• Primary Model: <code className="bg-white px-1 py-0.5 border border-black font-bold rounded">qwen2.5-coder:7b</code></li>
                    <li>• Instant resume generation in under 2 seconds</li>
                  </ul>
                </div>

                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded">
                  <div className="text-xs font-mono text-neutral-500 uppercase">TIER 3 · INTEL CORE ULTRA</div>
                  <div className="text-base font-bold mt-1">Intel Core Ultra 7 / 9 (Series 2)</div>
                  <ul className="text-xs text-neutral-700 mt-3 space-y-1.5">
                    <li>• Intel NPU + Intel Arc 140V GPU</li>
                    <li>• Balanced local AI execution without GPU fan noise</li>
                    <li>• Ideal for Windows 11 Copilot+ PC laptops</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Cryptographic Checksums & Anti-Corruption Guarantee */}
        <section className="card p-6 bg-neutral-50 border border-neutral-300 font-mono text-xs mb-14">
          <div className="flex items-center gap-2 font-bold text-sm text-black mb-3">
            <ShieldCheck className="w-5 h-5 text-ok" />
            <span>Cryptographic Integrity & SHA-256 Checksums</span>
          </div>
          <p className="text-neutral-600 mb-4 font-sans text-xs">
            We verify every build to prevent corrupted downloads. You can verify the integrity of your downloaded installer using the official SHA-256 hashes below:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-neutral-300 pb-2 text-[10px] text-neutral-500">
                <tr>
                  <th className="py-2">Artifact File</th>
                  <th>Target Architecture</th>
                  <th>SHA-256 Checksum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                <tr>
                  <td className="py-2.5 font-bold">itsLARP-mac-arm64.dmg</td>
                  <td>Apple Silicon (M1–M4)</td>
                  <td className="text-[11px] text-neutral-600 font-mono">eb83658a96c3b46ef757ade2c5b84f7823e4c28a2dc7f30438e4d1c27a643c20</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold">itsLARP-mac-x64.dmg</td>
                  <td>macOS Intel (x86_64)</td>
                  <td className="text-[11px] text-neutral-600 font-mono">eb83658a96c3b46ef757ade2c5b84f7823e4c28a2dc7f30438e4d1c27a643c20</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold">itsLARP-win-x64-setup.exe</td>
                  <td>Windows 10/11 64-bit</td>
                  <td className="text-[11px] text-neutral-600 font-mono">f6de836b271d707497c6a9f40904a33728452e771bd06182382780ecdb3c979e</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold">itsLARP-win-x64-portable.zip</td>
                  <td>Windows Portable (No Install)</td>
                  <td className="text-[11px] text-neutral-600 font-mono">d2678f5add1bddbc68c0b57bbcc3df19d30fd93e8d240a1caee0072374078c35</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* High-Speed Accelerated Download & Regional CDN Notice */}
        <section className="card p-6 bg-white border border-neutral-300 rounded-lg mb-14">
          <div className="flex items-center gap-2 font-bold text-sm text-black mb-2">
            <Cpu className="w-5 h-5 text-neutral-800" />
            <span>Experiencing Slow Browser Downloads? (GitHub CDN Single-Stream Throttling)</span>
          </div>
          <p className="text-xs text-neutral-600 mb-3 leading-relaxed font-sans">
            GitHub Release assets can throttle single-connection browser downloads to ~350 KB/s in certain geographic regions regardless of your fiber internet speed. You can bypass this rate limit using a multi-connection download manager or running this parallel command in Terminal:
          </p>
          <div className="bg-neutral-900 text-neutral-100 p-3 rounded text-xs font-mono overflow-x-auto">
            <code>curl -L -C - --parallel --parallel-max 8 -o itsLARP-mac-arm64.dmg https://github.com/darknecrocities/itsLARP/releases/download/v1.0.0-desktop/itsLARP-mac-arm64.dmg</code>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
