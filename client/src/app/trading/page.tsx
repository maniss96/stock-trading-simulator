'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  Info,
} from 'lucide-react';
import { GlassCard, GlassCardHeader, GlassCardTitle } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassInput } from '@/components/ui/GlassInput';
import { useTradingStore, useAuthStore } from '@/lib/store';
import { useQuotes } from '@/hooks/useQuotes';
import { formatCurrency, formatPercent, timeAgo, cn } from '@/lib/utils';

// Tradable universe (live prices overlaid via useQuotes)
const STOCK_META: Record<string, string> = {
  AAPL: 'Apple Inc.',
  GOOGL: 'Alphabet Inc.',
  MSFT: 'Microsoft',
  AMZN: 'Amazon',
  TSLA: 'Tesla Inc.',
  META: 'Meta Platforms',
  NVDA: 'NVIDIA',
  JPM: 'JPMorgan Chase',
};
const TRADE_SYMBOLS = Object.keys(STOCK_META);

export default function TradingPage() {
  const { user } = useAuthStore();
  const {
    selectedSymbol, orderSide, orderType, quantity,
    setSelectedSymbol, setOrderSide, setOrderType, setQuantity,
  } = useTradingStore();
  const [isPlacing, setIsPlacing] = useState(false);
  const { quotes, lastUpdated, provider } = useQuotes(TRADE_SYMBOLS);

  // Build the displayed stock list from live quotes + metadata
  const stocks = TRADE_SYMBOLS.map((symbol) => {
    const q = quotes[symbol];
    return {
      symbol,
      name: STOCK_META[symbol],
      price: q?.price ?? 0,
      change: q?.changePercent ?? 0,
      high: q?.high ?? 0,
      low: q?.low ?? 0,
      hasData: !!q,
    };
  });

  const selectedStock = stocks.find((s) => s.symbol === selectedSymbol) || stocks[0];
  const orderTotal = selectedStock.price * quantity;
  const commission = Math.max(orderTotal * 0.001, 1);

  const handlePlaceOrder = async () => {
    setIsPlacing(true);
    // Simulating API call
    setTimeout(() => setIsPlacing(false), 1500);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Trading</h1>
        <p className="text-gray-400 text-sm mt-1">Buy and sell stocks with virtual funds</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock List */}
        <GlassCard className="lg:col-span-2">
          <GlassCardHeader>
            <GlassCardTitle>Market</GlassCardTitle>
            <span className="text-xs flex items-center gap-1.5 text-gray-400">
              <span className={cn(
                'w-2 h-2 rounded-full',
                provider === 'simulated' ? 'bg-yellow-400' : 'bg-accent-400 animate-pulse'
              )} />
              {provider === 'simulated' ? 'Demo data' : `Live · ${provider}`}
              {lastUpdated && (
                <span className="text-gray-500 hidden sm:inline">· {timeAgo(lastUpdated)}</span>
              )}
            </span>
          </GlassCardHeader>
          <div className="overflow-x-auto">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Change</th>
                  <th className="hidden sm:table-cell">High/Low</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => (
                  <tr
                    key={stock.symbol}
                    className={cn(
                      'cursor-pointer transition-all',
                      selectedSymbol === stock.symbol && 'bg-primary-600/10'
                    )}
                    onClick={() => setSelectedSymbol(stock.symbol)}
                  >
                    <td>
                      <div>
                        <p className="font-semibold text-white">{stock.symbol}</p>
                        <p className="text-xs text-gray-400">{stock.name}</p>
                      </div>
                    </td>
                    <td className="font-mono text-white">
                      {stock.hasData ? formatCurrency(stock.price) : (
                        <span className="inline-block w-16 h-4 glass-skeleton rounded" />
                      )}
                    </td>
                    <td>
                      {stock.hasData ? (
                        <span className={cn(
                          'inline-flex items-center gap-1 text-xs font-medium',
                          stock.change >= 0 ? 'text-accent-400' : 'text-danger-400'
                        )}>
                          {stock.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {formatPercent(stock.change)}
                        </span>
                      ) : (
                        <span className="inline-block w-12 h-4 glass-skeleton rounded" />
                      )}
                    </td>
                    <td className="text-xs text-gray-400 hidden sm:table-cell">
                      {stock.hasData ? (
                        <>
                          <span className="text-accent-400">{formatCurrency(stock.high)}</span>
                          {' / '}
                          <span className="text-danger-400">{formatCurrency(stock.low)}</span>
                        </>
                      ) : '—'}
                    </td>
                    <td>
                      <GlassButton
                        variant="success"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSymbol(stock.symbol);
                          setOrderSide('BUY');
                        }}
                      >
                        Trade
                      </GlassButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Order Panel */}
        <GlassCard glow="primary">
          <GlassCardHeader>
            <GlassCardTitle>Place Order</GlassCardTitle>
            <ShoppingCart className="w-4 h-4 text-primary-400" />
          </GlassCardHeader>

          {/* Selected Stock Info */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-white">{selectedStock.symbol}</p>
                <p className="text-xs text-gray-400">{selectedStock.name}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg text-white">{formatCurrency(selectedStock.price)}</p>
                <p className={cn(
                  'text-xs',
                  selectedStock.change >= 0 ? 'text-accent-400' : 'text-danger-400'
                )}>
                  {formatPercent(selectedStock.change)}
                </p>
              </div>
            </div>
          </div>

          {/* Buy/Sell Toggle */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => setOrderSide('BUY')}
              className={cn(
                'py-2.5 rounded-xl text-sm font-semibold transition-all',
                orderSide === 'BUY'
                  ? 'bg-accent-500/20 text-accent-400 border border-accent-500/40 shadow-neon-green'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              )}
            >
              <TrendingUp className="w-4 h-4 inline mr-1" /> Buy
            </button>
            <button
              onClick={() => setOrderSide('SELL')}
              className={cn(
                'py-2.5 rounded-xl text-sm font-semibold transition-all',
                orderSide === 'SELL'
                  ? 'bg-danger-500/20 text-danger-400 border border-danger-500/40 shadow-neon-red'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              )}
            >
              <TrendingDown className="w-4 h-4 inline mr-1" /> Sell
            </button>
          </div>

          {/* Order Type */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-1.5 block">Order Type</label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              className="glass-select"
            >
              <option value="MARKET">Market Order</option>
              <option value="LIMIT">Limit Order</option>
              <option value="STOP_LOSS">Stop Loss</option>
              <option value="STOP_LIMIT">Stop Limit</option>
            </select>
          </div>

          {/* Quantity */}
          <div className="mb-4">
            <GlassInput
              label="Quantity (shares)"
              type="number"
              min={1}
              max={100000}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            />
          </div>

          {/* Order Summary */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Market Price</span>
              <span className="text-white font-mono">{formatCurrency(selectedStock.price)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Quantity</span>
              <span className="text-white">{quantity} shares</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Commission</span>
              <span className="text-white font-mono">{formatCurrency(commission)}</span>
            </div>
            <div className="border-t border-white/10 pt-2 flex justify-between">
              <span className="text-gray-300 font-medium">Total</span>
              <span className="text-white font-bold font-mono">{formatCurrency(orderTotal + commission)}</span>
            </div>
          </div>

          {/* Balance Info */}
          <div className="flex items-center gap-2 mb-4 text-xs text-gray-400">
            <Info className="w-3 h-3" />
            <span>Available: {formatCurrency(user?.balance || 100000)}</span>
          </div>

          {/* Place Order Button */}
          <GlassButton
            variant={orderSide === 'BUY' ? 'success' : 'danger'}
            className="w-full"
            size="lg"
            loading={isPlacing}
            onClick={handlePlaceOrder}
            disabled={quantity <= 0}
          >
            {orderSide === 'BUY' ? 'Buy' : 'Sell'} {selectedStock.symbol}
          </GlassButton>
        </GlassCard>
      </div>
    </div>
  );
}
