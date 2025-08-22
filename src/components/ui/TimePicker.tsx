import React, { useState } from 'react';
import { Clock } from 'lucide-react';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  className?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hour, setHour] = useState(value ? parseInt(value.split(':')[0]) || 0 : 0);
  const [minute, setMinute] = useState(value ? parseInt(value.split(':')[1]) || 0 : 0);

  const handleTimeChange = (newHour: number, newMinute: number) => {
    const timeString = `${String(newHour).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}`;
    onChange(timeString);
  };

  const incrementHour = () => {
    const newHour = (hour + 1) % 24;
    setHour(newHour);
    handleTimeChange(newHour, minute);
  };

  const decrementHour = () => {
    const newHour = hour === 0 ? 23 : hour - 1;
    setHour(newHour);
    handleTimeChange(newHour, minute);
  };

  const incrementMinute = () => {
    let newMinute = minute + 5;
    let newHour = hour;
    if (newMinute >= 60) {
      newMinute = 0;
      newHour = (hour + 1) % 24;
      setHour(newHour);
    }
    setMinute(newMinute);
    handleTimeChange(newHour, newMinute);
  };

  const decrementMinute = () => {
    let newMinute = minute - 5;
    let newHour = hour;
    if (newMinute < 0) {
      newMinute = 55;
      newHour = hour === 0 ? 23 : hour - 1;
      setHour(newHour);
    }
    setMinute(newMinute);
    handleTimeChange(newHour, newMinute);
  };

  return (
    <div className={`relative ${className}`}>
      {/* 入力フィールド */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white cursor-pointer flex items-center"
      >
        <Clock className="h-4 w-4 mr-2 text-gray-500" />
        <input
          type="time"
          value={value}
          onChange={(e) => {
            const [h, m] = e.target.value.split(':');
            setHour(parseInt(h) || 0);
            setMinute(parseInt(m) || 0);
            onChange(e.target.value);
          }}
          className="flex-1 border-none outline-none bg-transparent"
        />
      </div>

      {/* ダイアル式ピッカー */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10">
          <div className="flex items-center justify-center space-x-6">
            {/* 時間調整 */}
            <div className="text-center">
              <button
                onClick={incrementHour}
                className="w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center text-sm"
              >
                ▲
              </button>
              <div className="my-2 text-2xl font-bold w-12 text-center">
                {String(hour).padStart(2, '0')}
              </div>
              <button
                onClick={decrementHour}
                className="w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center text-sm"
              >
                ▼
              </button>
            </div>

            {/* コロン */}
            <div className="text-2xl font-bold">:</div>

            {/* 分調整 */}
            <div className="text-center">
              <button
                onClick={incrementMinute}
                className="w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center text-sm"
              >
                ▲
              </button>
              <div className="my-2 text-2xl font-bold w-12 text-center">
                {String(minute).padStart(2, '0')}
              </div>
              <button
                onClick={decrementMinute}
                className="w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center text-sm"
              >
                ▼
              </button>
            </div>
          </div>

          <div className="text-center mt-4">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors duration-200"
            >
              完了
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimePicker;
