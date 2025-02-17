import React, { useState } from 'react';
import { Button } from "./ui/button";
import { useTranslation } from 'react-i18next';

export function Calculator({ isOpen, onClose }) {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [newNumber, setNewNumber] = useState(true);
  const [isShift, setIsShift] = useState(false);
  const [isAlpha, setIsAlpha] = useState(false);
  const { t } = useTranslation();

  const handleNumber = (num) => {
    if (newNumber) {
      setDisplay(num.toString());
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? num.toString() : display + num);
    }
  };

  const handleDecimal = () => {
    if (newNumber) {
      setDisplay('0.');
      setNewNumber(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperation = (op) => {
    const current = parseFloat(display);
    if (previousValue === null) {
      setPreviousValue(current);
    } else if (operation) {
      const result = calculate(previousValue, current, operation);
      setPreviousValue(result);
      setDisplay(result.toString());
    }
    setOperation(op);
    setNewNumber(true);
  };

  const calculate = (a, b, op) => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 'Error';
      default: return b;
    }
  };

  const handleEquals = () => {
    const current = parseFloat(display);
    if (previousValue !== null && operation) {
      const result = calculate(previousValue, current, operation);
      setDisplay(result.toString());
      setPreviousValue(null);
      setOperation(null);
      setNewNumber(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleScientific = (func) => {
    const current = parseFloat(display);
    let result;
    
    switch (func) {
      case 'sin':
        result = isShift ? Math.asin(current) : Math.sin(current * Math.PI / 180);
        break;
      case 'cos':
        result = isShift ? Math.acos(current) : Math.cos(current * Math.PI / 180);
        break;
      case 'tan':
        result = isShift ? Math.atan(current) : Math.tan(current * Math.PI / 180);
        break;
      case 'log':
        result = isShift ? Math.pow(10, current) : Math.log10(current);
        break;
      case 'ln':
        result = isShift ? Math.exp(current) : Math.log(current);
        break;
      case 'sqrt':
        result = isShift ? current * current : Math.sqrt(current);
        break;
      case 'square':
        result = Math.pow(current, 2);
        break;
      case 'cube':
        result = Math.pow(current, 3);
        break;
      case 'exp':
        result = current * Math.pow(10, previousValue || 0);
        break;
      case 'negate':
        result = -current;
        break;
      case 'ans':
        // Store the last result for Ans functionality
        if (previousValue !== null) {
          result = previousValue;
        } else {
          return;
        }
        break;
      case 'recall':
        // RCL functionality - for now just recall last value
        if (previousValue !== null) {
          result = previousValue;
        } else {
          return;
        }
        break;
      case 'eng':
        // Engineering notation - shifts decimal point by 3
        const str = current.toString();
        const decimal = str.indexOf('.');
        if (decimal === -1) {
          result = current * 1000;
        } else {
          const shift = 3 - (decimal % 3);
          result = current * Math.pow(10, shift);
        }
        break;
      case 'leftParen':
        // For now, just store the current value and start a new calculation
        setPreviousValue(current);
        setNewNumber(true);
        return;
      default:
        return;
    }

    // Handle invalid results
    if (isNaN(result) || !isFinite(result)) {
      setDisplay('Error');
      setNewNumber(true);
      return;
    }

    // Format the result to avoid floating point precision issues
    const formattedResult = parseFloat(result.toPrecision(12)).toString();
    setDisplay(formattedResult);
    setNewNumber(true);
  };

  if (!isOpen) return null;

  const scientificButton = (label, func, className = "") => (
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => handleScientific(func)}
      className={`bg-gray-800 dark:bg-gray-900 text-white hover:bg-gray-700 dark:hover:bg-gray-800 
        text-xs h-8 border-gray-600 dark:border-gray-700 shadow-sm transition-colors ${className}`}
    >
      {label}
    </Button>
  );

  const operationButton = (label, op, className = "") => (
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => handleOperation(op)}
      className={`bg-orange-500 dark:bg-orange-600 text-white hover:bg-orange-600 dark:hover:bg-orange-700 
        text-sm h-8 border-orange-600 dark:border-orange-700 shadow-sm transition-colors ${className}`}
    >
      {label}
    </Button>
  );

  const numberButton = (num, className = "") => (
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => handleNumber(num)}
      className={`bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 
        text-gray-900 dark:text-white text-sm h-8 border-gray-300 dark:border-gray-600 
        shadow-sm transition-colors ${className}`}
    >
      {num}
    </Button>
  );

  const topButton = (label, onClick, className = "") => (
    <Button 
      variant="outline" 
      size="sm"
      onClick={onClick}
      className={`bg-purple-100 dark:bg-purple-900/50 hover:bg-purple-200 dark:hover:bg-purple-800/50 
        text-purple-900 dark:text-purple-100 text-xs h-8 border-purple-200 dark:border-purple-800 
        shadow-sm transition-colors ${className}`}
    >
      {label}
    </Button>
  );

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 
        rounded-3xl p-6 shadow-[0_0_15px_rgba(0,0,0,0.2)] dark:shadow-[0_0_15px_rgba(0,0,0,0.5)] 
        w-[320px] border border-gray-300 dark:border-gray-700" onClick={e => e.stopPropagation()}>
        
        {/* Calculator Header */}
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 
            text-transparent bg-clip-text"></div>
          <div className="text-xs text-gray-600 dark:text-gray-400"></div>
        </div>

        {/* Solar Panel */}
        <div className="h-2 w-16 bg-gradient-to-r from-gray-700 to-gray-900 rounded mb-2"></div>

        {/* Display */}
        <div className="bg-[#c8d4bc] dark:bg-[#a3ad98] p-3 rounded-lg mb-4 h-20 flex flex-col justify-between 
          border-2 border-gray-400 dark:border-gray-600 shadow-inner">
          <div className="text-xs text-gray-700 dark:text-gray-800 flex items-center gap-2">
            {isShift && <span className="bg-gray-700 dark:bg-gray-800 text-white px-1 rounded text-[10px]">SHIFT</span>}
            {isAlpha && <span className="bg-gray-700 dark:bg-gray-800 text-white px-1 rounded text-[10px]">ALPHA</span>}
            {operation && <span className="font-mono">{operation}</span>}
          </div>
          <div className="text-xl font-mono text-gray-900 dark:text-gray-900 text-right leading-tight tracking-wide">
            {display}
          </div>
        </div>

        {/* Top Buttons */}
        <div className="grid grid-cols-5 gap-1 mb-2">
          <Button variant="outline" size="sm" onClick={() => setIsShift(!isShift)} 
            className={`bg-purple-100 dark:bg-purple-900/50 hover:bg-purple-200 dark:hover:bg-purple-800/50 
            text-purple-900 dark:text-purple-100 text-xs h-8 border-purple-200 dark:border-purple-800 
            shadow-sm transition-colors ${isShift ? 'ring-2 ring-purple-500 dark:ring-purple-400' : ''}`}>
            SHIFT
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsAlpha(!isAlpha)} 
            className={`bg-purple-100 dark:bg-purple-900/50 hover:bg-purple-200 dark:hover:bg-purple-800/50 
            text-purple-900 dark:text-purple-100 text-xs h-8 border-purple-200 dark:border-purple-800 
            shadow-sm transition-colors ${isAlpha ? 'ring-2 ring-purple-500 dark:ring-purple-400' : ''}`}>
            ALPHA
          </Button>
          <Button variant="outline" size="sm" className="bg-purple-100 dark:bg-purple-900/50 hover:bg-purple-200 
            dark:hover:bg-purple-800/50 text-purple-900 dark:text-purple-100 text-xs h-8 border-purple-200 
            dark:border-purple-800 shadow-sm transition-colors">
            MODE
          </Button>
          <Button variant="outline" size="sm" className="bg-purple-100 dark:bg-purple-900/50 hover:bg-purple-200 
            dark:hover:bg-purple-800/50 text-purple-900 dark:text-purple-100 text-xs h-8 border-purple-200 
            dark:border-purple-800 shadow-sm transition-colors">
            SETUP
          </Button>
          <Button variant="outline" size="sm" onClick={onClose} className="bg-purple-100 dark:bg-purple-900/50 
            hover:bg-purple-200 dark:hover:bg-purple-800/50 text-purple-900 dark:text-purple-100 text-xs h-8 
            border-purple-200 dark:border-purple-800 shadow-sm transition-colors">
            ON
          </Button>
        </div>

        {/* Scientific Functions */}
        <div className="grid grid-cols-6 gap-1 mb-2">
          <Button variant="outline" size="sm" onClick={() => handleScientific('sqrt')} 
            className="bg-gray-800 dark:bg-gray-900 text-white hover:bg-gray-700 dark:hover:bg-gray-800 
            text-xs h-8 border-gray-600 dark:border-gray-700 shadow-sm transition-colors">√</Button>
          <Button variant="outline" size="sm" onClick={() => handleScientific('square')} 
            className="bg-gray-800 dark:bg-gray-900 text-white hover:bg-gray-700 dark:hover:bg-gray-800 
            text-xs h-8 border-gray-600 dark:border-gray-700 shadow-sm transition-colors">x²</Button>
          <Button variant="outline" size="sm" onClick={() => handleScientific('cube')} 
            className="bg-gray-800 dark:bg-gray-900 text-white hover:bg-gray-700 dark:hover:bg-gray-800 
            text-xs h-8 border-gray-600 dark:border-gray-700 shadow-sm transition-colors">x³</Button>
          <Button variant="outline" size="sm" onClick={() => handleScientific('log')} 
            className="bg-gray-800 dark:bg-gray-900 text-white hover:bg-gray-700 dark:hover:bg-gray-800 
            text-xs h-8 border-gray-600 dark:border-gray-700 shadow-sm transition-colors">log</Button>
          <Button variant="outline" size="sm" onClick={() => handleScientific('ln')} 
            className="bg-gray-800 dark:bg-gray-900 text-white hover:bg-gray-700 dark:hover:bg-gray-800 
            text-xs h-8 border-gray-600 dark:border-gray-700 shadow-sm transition-colors">ln</Button>
          <Button variant="outline" size="sm" onClick={() => handleScientific('negate')} 
            className="bg-gray-800 dark:bg-gray-900 text-white hover:bg-gray-700 dark:hover:bg-gray-800 
            text-xs h-8 border-gray-600 dark:border-gray-700 shadow-sm transition-colors">(−)</Button>
        </div>

        <div className="grid grid-cols-6 gap-1 mb-2">
          <Button variant="outline" size="sm" onClick={() => handleScientific('sin')} 
            className="bg-gray-800 dark:bg-gray-900 text-white hover:bg-gray-700 dark:hover:bg-gray-800 
            text-xs h-8 border-gray-600 dark:border-gray-700 shadow-sm transition-colors">sin</Button>
          <Button variant="outline" size="sm" onClick={() => handleScientific('cos')} 
            className="bg-gray-800 dark:bg-gray-900 text-white hover:bg-gray-700 dark:hover:bg-gray-800 
            text-xs h-8 border-gray-600 dark:border-gray-700 shadow-sm transition-colors">cos</Button>
          <Button variant="outline" size="sm" onClick={() => handleScientific('tan')} 
            className="bg-gray-800 dark:bg-gray-900 text-white hover:bg-gray-700 dark:hover:bg-gray-800 
            text-xs h-8 border-gray-600 dark:border-gray-700 shadow-sm transition-colors">tan</Button>
          <Button variant="outline" size="sm" onClick={() => handleScientific('recall')} 
            className="bg-gray-800 dark:bg-gray-900 text-white hover:bg-gray-700 dark:hover:bg-gray-800 
            text-xs h-8 border-gray-600 dark:border-gray-700 shadow-sm transition-colors">RCL</Button>
          <Button variant="outline" size="sm" onClick={() => handleScientific('eng')} 
            className="bg-gray-800 dark:bg-gray-900 text-white hover:bg-gray-700 dark:hover:bg-gray-800 
            text-xs h-8 border-gray-600 dark:border-gray-700 shadow-sm transition-colors">ENG</Button>
          <Button variant="outline" size="sm" onClick={() => handleScientific('leftParen')} 
            className="bg-gray-800 dark:bg-gray-900 text-white hover:bg-gray-700 dark:hover:bg-gray-800 
            text-xs h-8 border-gray-600 dark:border-gray-700 shadow-sm transition-colors">(</Button>
        </div>

        {/* Main Keypad */}
        <div className="grid grid-cols-5 gap-1">
          {[7, 8, 9].map(num => (
            <Button key={num} variant="outline" size="sm" onClick={() => handleNumber(num)}
              className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 
              text-gray-900 dark:text-white text-sm h-8 border-gray-300 dark:border-gray-600 
              shadow-sm transition-colors">{num}</Button>
          ))}
          <Button variant="outline" size="sm" onClick={handleClear} 
            className="bg-orange-100 dark:bg-red-900/30 hover:bg-orange-200 dark:hover:bg-red-800/30 
            text-orange-900 dark:text-orange-100 text-sm h-8 border-orange-200 dark:border-red-800/50 
            shadow-sm transition-colors">DEL</Button>
          <Button variant="outline" size="sm" onClick={handleClear} 
            className="bg-orange-100 dark:bg-red-900/30 hover:bg-orange-200 dark:hover:bg-red-800/30 
            text-orange-900 dark:text-orange-100 text-sm h-8 border-orange-200 dark:border-red-800/50 
            shadow-sm transition-colors">AC</Button>

          {[4, 5, 6].map(num => (
            <Button key={num} variant="outline" size="sm" onClick={() => handleNumber(num)}
              className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 
              text-gray-900 dark:text-white text-sm h-8 border-gray-300 dark:border-gray-600 
              shadow-sm transition-colors">{num}</Button>
          ))}
          <Button variant="outline" size="sm" onClick={() => handleOperation('×')} 
            className="bg-orange-500 dark:bg-orange-600 text-white hover:bg-orange-600 dark:hover:bg-orange-700 
            text-sm h-8 border-orange-600 dark:border-orange-700 shadow-sm transition-colors">×</Button>
          <Button variant="outline" size="sm" onClick={() => handleOperation('÷')} 
            className="bg-orange-500 dark:bg-orange-600 text-white hover:bg-orange-600 dark:hover:bg-orange-700 
            text-sm h-8 border-orange-600 dark:border-orange-700 shadow-sm transition-colors">÷</Button>

          {[1, 2, 3].map(num => (
            <Button key={num} variant="outline" size="sm" onClick={() => handleNumber(num)}
              className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 
              text-gray-900 dark:text-white text-sm h-8 border-gray-300 dark:border-gray-600 
              shadow-sm transition-colors">{num}</Button>
          ))}
          <Button variant="outline" size="sm" onClick={() => handleOperation('+')} 
            className="bg-orange-500 dark:bg-orange-600 text-white hover:bg-orange-600 dark:hover:bg-orange-700 
            text-sm h-8 border-orange-600 dark:border-orange-700 shadow-sm transition-colors">+</Button>
          <Button variant="outline" size="sm" onClick={() => handleOperation('-')} 
            className="bg-orange-500 dark:bg-orange-600 text-white hover:bg-orange-600 dark:hover:bg-orange-700 
            text-sm h-8 border-orange-600 dark:border-orange-700 shadow-sm transition-colors">-</Button>

          <Button variant="outline" size="sm" onClick={() => handleNumber(0)} 
            className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 
            text-gray-900 dark:text-white text-sm h-8 border-gray-300 dark:border-gray-600 
            shadow-sm transition-colors">0</Button>
          <Button variant="outline" size="sm" onClick={handleDecimal} 
            className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 
            text-gray-900 dark:text-white text-sm h-8 border-gray-300 dark:border-gray-600 
            shadow-sm transition-colors">.</Button>
          <Button variant="outline" size="sm" onClick={() => handleScientific('exp')} 
            className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 
            text-gray-900 dark:text-white text-sm h-8 border-gray-300 dark:border-gray-600 
            shadow-sm transition-colors">×10ˣ</Button>
          <Button variant="outline" size="sm" onClick={() => handleScientific('ans')} 
            className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 
            text-gray-900 dark:text-white text-sm h-8 border-gray-300 dark:border-gray-600 
            shadow-sm transition-colors">Ans</Button>
          <Button variant="outline" size="sm" onClick={handleEquals} 
            className="bg-orange-500 dark:bg-orange-600 text-white hover:bg-orange-600 dark:hover:bg-orange-700 
            text-sm h-8 border-orange-600 dark:border-orange-700 shadow-sm transition-colors">=</Button>
        </div>
      </div>
    </div>
  );
} 