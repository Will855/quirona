'use client';

import React from 'react';
import Image from 'next/image';
import { X, ExternalLink } from 'lucide-react';

export interface AdminReceiptData {
  imageUrl: string;
  orderCode: string;
  clientName: string;
  referenceNumber?: string;
}

interface AdminReceiptModalProps {
  receipt: AdminReceiptData | null;
  onClose: () => void;
}

export default function AdminReceiptModal({ receipt, onClose }: AdminReceiptModalProps) {
  if (!receipt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-quirona-burgundy/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-quirona-cream w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border-3 border-quirona-burgundy retro-shadow-lg p-6 relative my-auto space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-quirona-bg border-2 border-quirona-burgundy text-quirona-burgundy hover:bg-quirona-yellow"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="text-xs font-black uppercase text-quirona-burgundy bg-quirona-yellow px-2.5 py-0.5 rounded border border-quirona-burgundy">
            {receipt.orderCode}
          </span>
          <h3 className="text-lg font-black text-quirona-burgundy mt-1">
            Comprobante de {receipt.clientName}
          </h3>
          {receipt.referenceNumber && (
            <p className="text-xs font-mono font-bold text-quirona-burgundy/80">
              Referencia: #{receipt.referenceNumber}
            </p>
          )}
        </div>

        <div className="relative w-full h-80 rounded-2xl overflow-hidden border-2 border-quirona-burgundy bg-quirona-bg flex items-center justify-center">
          <Image
            src={receipt.imageUrl}
            alt="Comprobante Bancario"
            fill
            sizes="(max-width: 768px) 100vw, 500px"
            className="object-contain p-2"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <a
            href={receipt.imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-quirona-burgundy hover:underline flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Abrir imagen original
          </a>

          <button
            type="button"
            onClick={onClose}
            className="retro-btn bg-quirona-yellow text-quirona-burgundy px-4 py-2 rounded-full font-black text-xs border-2 border-quirona-burgundy"
          >
            Cerrar Visor
          </button>
        </div>
      </div>
    </div>
  );
}
