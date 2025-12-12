import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

const API_BASE_URL = 'https://bebe-nonlicking-britni.ngrok-free.dev';

const CURRENCIES = [
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'PHP', name: 'Philippine Peso' },
  { code: 'VND', name: 'Vietnamese Dong' },
  { code: 'IDR', name: 'Indonesian Rupiah' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'SGD', name: 'Singapore Dollar' },
];

const getFlagUrl = (code) => {
  return `https://wise.com/web-art/assets/flags/${code.toLowerCase()}.svg`;
};

const CurrencyDropdown = ({ value, onChange, currencies, className, isInsideInput = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current && menuRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const menuHeight = 280; // max-h-[280px]
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      
      // Nếu không đủ chỗ ở dưới nhưng đủ chỗ ở trên, mở lên trên
      if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
  }, [isOpen]);

  const selectedCurrency = currencies.find(c => c.code === value);

  if (isInsideInput) {
    return (
      <div className={cn('absolute right-0 top-0 bottom-0 flex items-center border-l border-slate-200', className)} ref={dropdownRef}>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="h-full flex items-center gap-2 px-3 text-slate-900 font-medium cursor-pointer hover:bg-slate-50 rounded-r-lg transition-all"
        >
          {selectedCurrency && (
            <img
              src={getFlagUrl(selectedCurrency.code)}
              alt={selectedCurrency.code}
              className="w-5 h-5 rounded-full object-cover"
            />
          )}
          <span className="text-sm">{selectedCurrency?.code}</span>
          <svg
            className={cn(
              "w-4 h-4 text-slate-500 transition-transform",
              isOpen && "rotate-180"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <div
            ref={menuRef}
            className={cn(
              "absolute right-0 bg-white border-2 border-slate-200 rounded-lg shadow-lg z-[9999] max-h-[280px] overflow-y-auto min-w-[140px]",
              openUpward ? "bottom-full mb-1" : "top-full mt-1"
            )}
          >
            {currencies.map((currency) => (
              <button
                key={currency.code}
                type="button"
                onClick={() => {
                  onChange(currency.code);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-50 transition-colors",
                  value === currency.code && "bg-cyan-50"
                )}
              >
                <img
                  src={getFlagUrl(currency.code)}
                  alt={currency.code}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="font-medium text-slate-900">{currency.code}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 pl-3 pr-4 bg-white border-2 border-slate-200 rounded-lg text-slate-900 font-medium cursor-pointer hover:border-cyan-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all min-w-[120px] flex items-center justify-between gap-3"
      >
        <span className="flex items-center gap-2">
          {selectedCurrency && (
            <img
              src={getFlagUrl(selectedCurrency.code)}
              alt={selectedCurrency.code}
              className="w-5 h-5 rounded-full object-cover"
            />
          )}
          <span>{selectedCurrency?.code}</span>
        </span>
        <svg
          className={cn(
            "w-4 h-4 text-slate-500 transition-transform",
            isOpen && "rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className={cn(
            "absolute left-0 right-0 bg-white border-2 border-slate-200 rounded-lg shadow-lg z-[9999] max-h-[280px] overflow-y-auto",
            openUpward ? "bottom-full mb-1" : "top-full mt-1"
          )}
        >
          {currencies.map((currency) => (
            <button
              key={currency.code}
              type="button"
              onClick={() => {
                onChange(currency.code);
                setIsOpen(false);
              }}
              className={cn(
                "w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-50 transition-colors",
                value === currency.code && "bg-cyan-50"
              )}
            >
              <img
                src={getFlagUrl(currency.code)}
                alt={currency.code}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="font-medium text-slate-900">{currency.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const HistorySection = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Lấy userId hiện tại để so sánh
  const currentUserId = localStorage.getItem('userId');

  const formatCurrency = (value) => {
    if (!value || value === '--') return value;
    const num = parseFloat(value);
    // Làm tròn xuống và bỏ phần thập phân
    const floored = Math.floor(num);
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(floored);
  };

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/history/public?limit=50`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      } else {
        console.error('Failed to fetch history:', response.status);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // Expose refresh function globally
    window.refreshHistory = fetchHistory;
    return () => {
      delete window.refreshHistory;
    };
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="mt-6 bg-white rounded-xl shadow-lg p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Lịch sử đổi tiền</h3>
      {isLoading ? (
        <div className="text-center py-4 text-slate-500 text-sm">Đang tải...</div>
      ) : history.length === 0 ? (
        <div className="text-center py-4 text-slate-500 text-sm">Chưa có lịch sử</div>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {history.map((item, index) => (
            <div
              key={item.id || index}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center gap-2">
                  <img
                    src={getFlagUrl(item.from_currency)}
                    alt={item.from_currency}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-slate-900">
                    {item.from_currency}
                  </span>
                </div>
                <span className="text-slate-400">→</span>
                <div className="flex items-center gap-2">
                  <img
                    src={getFlagUrl(item.to_currency)}
                    alt={item.to_currency}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-slate-900">
                    {item.to_currency}
                  </span>
                </div>
                <span className="text-xs text-slate-600 font-medium">
                  {formatCurrency(item.rate)}
                </span>
              </div>
              <div className="text-right min-w-[120px]">
                {item.user_id === currentUserId ? (
                  <div className="text-xs text-cyan-600 font-medium mb-1">Tôi</div>
                ) : item.user_name ? (
                  <div className="text-xs text-slate-700 font-medium mb-1">{item.user_name}</div>
                ) : (
                  <div className="text-xs text-slate-400 mb-1">Anonymous</div>
                )}
                <div className="text-xs text-slate-400">
                  {formatDate(item.created_at)}
                </div>
                {item.note && (
                  <div className="text-xs text-slate-500 mt-1 italic">"{item.note}"</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CurrencyConverter = ({ className }) => {
  const [fromCurrency, setFromCurrency] = useState('JPY');
  const [toCurrency, setToCurrency] = useState('VND');
  const [amount, setAmount] = useState('');
  const [convertedAmount, setConvertedAmount] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [note, setNote] = useState('');
  const debounceTimerRef = useRef(null);

  // Tự động tạo và lưu userId khi component mount
  useEffect(() => {
    const getOrCreateUserId = () => {
      let userId = localStorage.getItem('userId');
      if (!userId) {
        // Tạo userId mới với format: user-{timestamp}
        userId = `user-${Date.now()}`;
        localStorage.setItem('userId', userId);
      }
      // Lấy user_name từ localStorage nếu có
      const savedUserName = localStorage.getItem('userName');
      if (savedUserName) {
        setUserName(savedUserName);
      }
      return userId;
    };

    getOrCreateUserId();
  }, []);

  const handleSwap = () => {
    const tempCurrency = fromCurrency;
    const tempAmount = amount;
    setFromCurrency(toCurrency);
    setToCurrency(tempCurrency);
    setAmount(convertedAmount);
    setConvertedAmount(tempAmount);
  };

  const saveHistory = async (from, to, rate, userNameValue, noteValue) => {
    try {
      // Lấy userId từ localStorage (đã được tạo khi component mount)
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('UserId not found in localStorage');
        return;
      }

      // Lưu user_name vào localStorage nếu có
      if (userNameValue) {
        localStorage.setItem('userName', userNameValue);
        setUserName(userNameValue);
      }

      await fetch(`${API_BASE_URL}/api/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          from: from,
          to: to,
          rate: rate,
          userId: userId,
          userName: userNameValue || null,
          note: noteValue || null,
        }),
      });
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  // Lấy tỷ giá khi currency thay đổi
  const fetchExchangeRate = async () => {
    setIsConverting(true);
    
    try {
      const rateResponse = await fetch(
        `${API_BASE_URL}/api/rate?from=${fromCurrency}&to=${toCurrency}`,
        {
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        }
      );
      
      if (!rateResponse.ok) {
        const errorText = await rateResponse.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to fetch exchange rate: ${rateResponse.status}`);
      }
      
      const rateData = await rateResponse.json();
      console.log('Rate data received:', rateData);
      
      if (!rateData || typeof rateData.rate !== 'number') {
        throw new Error('Invalid rate data received');
      }
      
      const rate = rateData.rate;
      
      // Cập nhật rate
      setExchangeRate(rate);
      
      // Tính lại số tiền nếu đã có amount
      if (amount && parseFloat(amount) > 0) {
        const converted = parseFloat(amount) * rate;
        setConvertedAmount(converted.toString());
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      setExchangeRate(null);
      setConvertedAmount('--');
    } finally {
      setIsConverting(false);
    }
  };

  // Tính toán số tiền trên frontend dựa trên rate
  const calculateConvertedAmount = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setConvertedAmount('--');
      return;
    }

    if (!exchangeRate) {
      setConvertedAmount('--');
      return;
    }

    // Tính toán ngay trên frontend
    const converted = parseFloat(amount) * exchangeRate;
    setConvertedAmount(converted.toString());
  };

  // Lấy tỷ giá khi currency thay đổi
  useEffect(() => {
    fetchExchangeRate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromCurrency, toCurrency]);

  // Tính toán số tiền khi amount thay đổi (debounce)
  useEffect(() => {
    // Clear timer cũ nếu có
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Nếu amount rỗng, reset
    if (!amount || parseFloat(amount) <= 0) {
      setConvertedAmount('--');
      return;
    }

    // Nếu chưa có rate, đợi rate được fetch
    if (!exchangeRate) {
      return;
    }

    // Set timer mới với debounce 300ms
    debounceTimerRef.current = setTimeout(() => {
      calculateConvertedAmount();
    }, 300);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [amount, exchangeRate]);

  const handleSave = () => {
    if (!amount || parseFloat(amount) <= 0 || !exchangeRate) {
      return;
    }
    
    // Mở modal để nhập tên và note
    setIsModalOpen(true);
  };

  const handleModalSave = async () => {
    setIsSaving(true);
    
    try {
      // Lưu vào lịch sử với user_name và note
      await saveHistory(fromCurrency, toCurrency, exchangeRate, userName, note);
      
      // Đóng modal và reset note
      setIsModalOpen(false);
      setNote('');
      
      // Refresh lịch sử public
      if (window.refreshHistory) {
        window.refreshHistory();
      }
    } catch (error) {
      console.error('Error saving history:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value || value === '--') return value;
    const num = parseFloat(value);
    // Làm tròn xuống và bỏ phần thập phân
    const floored = Math.floor(num);
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(floored);
  };

  const formatNumber = (value) => {
    if (!value) return '';
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const getCurrencyByCode = (code) => CURRENCIES.find(c => c.code === code);

  const fromCurrencyData = getCurrencyByCode(fromCurrency);
  const toCurrencyData = getCurrencyByCode(toCurrency);

  return (
    <div className={cn('w-full max-w-sm mx-auto', className)}>
      <div className="bg-white rounded-xl shadow-lg">
        {/* Header with Exchange Rate */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-3 border-b border-slate-200 rounded-t-xl overflow-hidden">
          <div className="flex items-center gap-1.5 mb-1.5">
            <h3 className="text-xs font-semibold text-slate-700">Tỷ giá chuyển đổi thực</h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          {isConverting ? (
            <p className="text-xs text-slate-600 flex items-center gap-1.5">
              {fromCurrencyData && (
                <img
                  src={getFlagUrl(fromCurrencyData.code)}
                  alt={fromCurrencyData.code}
                  className="w-4 h-4 rounded-full object-cover"
                />
              )}
              <span>Đang tải tỷ giá...</span>
            </p>
          ) : exchangeRate ? (
            <p className="text-xs text-slate-600 flex items-center gap-1.5">
              {fromCurrencyData && (
                <img
                  src={getFlagUrl(fromCurrencyData.code)}
                  alt={fromCurrencyData.code}
                  className="w-4 h-4 rounded-full object-cover"
                />
              )}
              <span>1 {fromCurrency} = {formatCurrency(exchangeRate)} {toCurrency}</span>
            </p>
          ) : (
            <p className="text-xs text-slate-600 flex items-center gap-1.5">
              {fromCurrencyData && (
                <img
                  src={getFlagUrl(fromCurrencyData.code)}
                  alt={fromCurrencyData.code}
                  className="w-4 h-4 rounded-full object-cover"
                />
              )}
              <span>1 {fromCurrency} = -- {toCurrency}</span>
            </p>
          )}
        </div>

        <div className="p-5 overflow-visible flex flex-col justify-between h-[350px]">
          {/* From Currency */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700">Số tiền</label>
            <div className="relative">
              <input
                type="text"
                value={formatNumber(amount)}
                onChange={(e) => {
                  const value = e.target.value.replace(/\./g, '');
                  if (/^\d*$/.test(value)) {
                    setAmount(value);
                  }
                }}
                placeholder="0"
                className="w-full h-12 pl-4 pr-32 bg-white border-2 border-slate-200 rounded-lg text-slate-900 text-base font-medium placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
              <CurrencyDropdown
                value={fromCurrency}
                onChange={setFromCurrency}
                currencies={CURRENCIES}
                isInsideInput={true}
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center my-2">
            <button
              onClick={handleSwap}
              className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border-2 border-slate-200 hover:border-cyan-400 text-slate-700 hover:text-cyan-600 transition-all"
              aria-label="Swap currencies"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
            </button>
          </div>

          {/* To Currency */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700">Chuyển đổi thành</label>
            <div className="relative">
              <div className="w-full h-12 pl-4 pr-32 bg-slate-50 border-2 border-slate-200 rounded-lg flex items-center">
                <span className={cn(
                  "text-base font-medium text-slate-900",
                  (!convertedAmount || convertedAmount === '--') && "text-slate-400"
                )}>
                  {isConverting ? 'Converting...' : (convertedAmount ? formatCurrency(convertedAmount) : '--')}
                </span>
              </div>
              <CurrencyDropdown
                value={toCurrency}
                onChange={setToCurrency}
                currencies={CURRENCIES}
                isInsideInput={true}
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!amount || parseFloat(amount) <= 0 || !exchangeRate || isSaving}
            className="w-full h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold text-sm rounded-lg hover:from-cyan-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            {isSaving ? 'Saving...' : 'Save exchange rate'}
          </button>
        </div>
      </div>

      {/* Save Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Lưu tỷ giá</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tên của bạn
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Nhập tên (tùy chọn)"
                  className="w-full h-11 px-4 bg-white border-2 border-slate-200 rounded-lg text-slate-900 text-base placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Nhập ghi chú (tùy chọn)"
                  rows={3}
                  className="w-full px-4 py-2 bg-white border-2 border-slate-200 rounded-lg text-slate-900 text-base placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setNote('');
                }}
                className="flex-1 h-11 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleModalSave}
                disabled={isSaving}
                className="flex-1 h-11 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSaving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* History Section */}
      <HistorySection />
    </div>
  );
};

export default CurrencyConverter;
